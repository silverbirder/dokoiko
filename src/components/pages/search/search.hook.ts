import { categoryMapping } from "@/server/api/routers/data";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCallback, useEffect, useState, useMemo } from "react";
import { api } from "@/trpc/react";
import { getDistance } from "geolib";
import type {
  LatLng,
  GoogleData,
  YahooData,
  InitialValues,
  Position,
  GoogleTypeSelection,
  UnifiedSearchResult,
  MarkerData,
} from "@/types/common";

const searchFormSchema = z.object({
  address: z.string().min(1, "住所を入力してください"),
  keyword: z.string().optional(),
  category: z.string().optional(),
  googleTypes: z
    .array(z.string())
    .max(3, "Google検索オプションは最大3つまでです"),
  yahooGenres: z
    .array(z.string())
    .max(3, "Yahoo検索オプションは最大3つまでです"),
  radius: z
    .number()
    .min(100, "最小100mです")
    .max(50000, "最大50kmです")
    .optional(),
});

type SearchFormData = z.infer<typeof searchFormSchema>;

type Props = {
  geocodeResult: LatLng | null;
  yahooData: YahooData | null;
  googleData: GoogleData | null;
  initialValues?: InitialValues;
};

export const useSearchPage = ({
  geocodeResult,
  yahooData: initialYahooData,
  googleData: initialGoogleData,
  initialValues,
}: Props) => {
  const [mapPosition, setMapPosition] = useState<Position | undefined>(
    geocodeResult ? [geocodeResult.lat, geocodeResult.lng] : undefined,
  );
  const [currentMapCenter, setCurrentMapCenter] = useState<
    Position | undefined
  >(geocodeResult ? [geocodeResult.lat, geocodeResult.lng] : undefined);
  const [showResearchButton, setShowResearchButton] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(true);
  const [highlightedCardIndex, setHighlightedCardIndex] = useState<
    number | null
  >(null);
  const [yahooData, setYahooData] = useState(initialYahooData);
  const [page, setPage] = useState(1);
  const [googleData, setGoogleData] = useState(initialGoogleData);
  const [selectedTypes, setSelectedTypes] = useState<GoogleTypeSelection[]>([]);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | undefined>(
    undefined,
  );

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      address: initialValues?.address ?? "",
      keyword: initialValues?.keyword ?? "",
      category: initialValues?.category ?? "",
      googleTypes: initialValues?.googleTypes ?? [],
      yahooGenres: initialValues?.yahooGenres ?? [],
      radius: initialValues?.radius ?? 3000,
    },
  });
  const selectedCategory = form.watch("category");
  const googleTypes = form.watch("googleTypes");
  const yahooGenres = form.watch("yahooGenres");
  const radius = form.watch("radius");
  const keyword = form.watch("keyword");

  const utils = api.useUtils();

  const calculateDistance = useCallback(
    (pos1: Position, pos2: Position): number => {
      return getDistance(
        { latitude: pos1[0], longitude: pos1[1] },
        { latitude: pos2[0], longitude: pos2[1] },
      );
    },
    [],
  );

  const results = useMemo((): UnifiedSearchResult[] => {
    const typedGoogleResults: UnifiedSearchResult[] =
      googleData?.results?.map((item) => ({
        ...item,
        type: "google" as const,
        position:
          item.latitude && item.longitude
            ? ([item.latitude, item.longitude] as Position)
            : undefined,
      })) ?? [];

    const typedYahooResults: UnifiedSearchResult[] =
      yahooData?.results?.map((item) => ({
        ...item,
        type: "yahoo" as const,
        position:
          item.latitude && item.longitude
            ? ([item.latitude, item.longitude] as Position)
            : undefined,
      })) ?? [];

    return [...typedGoogleResults, ...typedYahooResults].sort((a, b) => {
      return a.now - b.now;
    });
  }, [yahooData, googleData]);

  const isMore = useMemo(
    () => yahooData?.hasNextPage ?? selectedTypes.length > 0,
    [yahooData, selectedTypes],
  );

  const markers = useMemo(
    (): MarkerData[] =>
      results
        .filter((item) => item.latitude && item.longitude)
        .map((item) => ({
          position: [item.latitude!, item.longitude!] as Position,
          popupText: item.name ?? item.address ?? "",
        })),
    [results],
  );

  useEffect(() => {
    setMapPosition(
      geocodeResult ? [geocodeResult.lat, geocodeResult.lng] : undefined,
    );
    setCurrentMapCenter(
      geocodeResult ? [geocodeResult.lat, geocodeResult.lng] : undefined,
    );
    setShowResearchButton(false);
  }, [geocodeResult]);

  useEffect(() => {
    if (!selectedCategory) {
      if (googleTypes.length > 0) {
        form.setValue("googleTypes", []);
      }
      if (yahooGenres.length > 0) {
        form.setValue("yahooGenres", []);
      }
      return;
    }

    const categoryConfig =
      categoryMapping[selectedCategory as keyof typeof categoryMapping];
    const availableGoogleTypes = categoryConfig?.google || [];
    const availableYahooTypes = categoryConfig?.yahoo || [];

    const filteredGoogleTypes = googleTypes.filter((type) =>
      availableGoogleTypes.includes(type),
    );

    const filteredYahooGenres = yahooGenres.filter((genre) => {
      return availableYahooTypes.some((categoryCode) =>
        // 先頭の文字列が一致するかどうかをチェック
        genre.startsWith(categoryCode),
      );
    });

    if (filteredGoogleTypes.length !== googleTypes.length) {
      form.setValue("googleTypes", filteredGoogleTypes);
    }

    if (filteredYahooGenres.length !== yahooGenres.length) {
      form.setValue("yahooGenres", filteredYahooGenres);
    }
  }, [selectedCategory, googleTypes, yahooGenres, form]);

  useEffect(() => {
    setYahooData(initialYahooData);
  }, [initialYahooData]);

  useEffect(() => {
    setGoogleData(initialGoogleData);
    setSelectedTypes(
      initialGoogleData?.types.map((item) => ({
        name: item.name,
        pageToken: item.nextPageToken,
      })) ?? [],
    );
  }, [initialGoogleData]);

  const handleGoogleTypesChange = useCallback(
    (types: string[]) => {
      form.setValue("googleTypes", types);
    },
    [form],
  );

  const handleYahooGenresChange = useCallback(
    (genres: string[]) => {
      form.setValue("yahooGenres", genres);
    },
    [form],
  );

  const handleCardClick = useCallback((position: Position, index: number) => {
    setMapPosition(position);
    setSelectedMarkerId(index);
  }, []);

  const handleMarkerClick = useCallback(
    (index: number) => {
      if (!isResultsVisible) {
        setIsResultsVisible(true);
      }
      setHighlightedCardIndex(index);
      setTimeout(() => {
        setHighlightedCardIndex(null);
      }, 5000);

      setTimeout(() => {
        const cardElement = document.querySelector(
          `[data-card-index="${index}"]`,
        );
        if (cardElement) {
          cardElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start",
          });
        }
      }, 100);
    },
    [isResultsVisible],
  );

  const handleToggleResults = useCallback(() => {
    setIsResultsVisible(!isResultsVisible);
  }, [isResultsVisible]);

  const handleMapMove = useCallback(
    (center: Position) => {
      setCurrentMapCenter(center);
      if (geocodeResult) {
        const originalPosition: Position = [
          geocodeResult.lat,
          geocodeResult.lng,
        ];
        const distance = calculateDistance(originalPosition, center);
        const currentRadius = radius ?? 3000;
        if (distance > currentRadius) {
          setShowResearchButton(true);
        } else {
          setShowResearchButton(false);
        }
      }
    },
    [geocodeResult, calculateDistance, radius],
  );

  const handleMoreClick = useCallback(async () => {
    setIsLoadingMore(true);
    try {
      const localGoogleData = await utils.google.searchNearby.fetch({
        lat: geocodeResult?.lat ?? 0,
        lng: geocodeResult?.lng ?? 0,
        selectedTypes: selectedTypes,
        category: selectedCategory,
        keyword: keyword,
        radius: radius ?? 3000,
      });
      const localYahooData = await utils.yahoo.searchLocal.fetch({
        category: initialValues?.category ?? "",
        lat: geocodeResult?.lat ?? 0,
        lng: geocodeResult?.lng ?? 0,
        page: page + 1,
        selectedGenres:
          initialValues?.yahooGenres && initialValues.yahooGenres.length > 0
            ? initialValues.yahooGenres
            : undefined,
        keyword: keyword,
        radius: radius ?? 3000,
      });
      setSelectedTypes(
        localGoogleData.types.map((item) => ({
          name: item.name,
          pageToken: item.nextPageToken,
        })),
      );
      setGoogleData((prev) => {
        if (!prev) return localGoogleData;
        return {
          ...localGoogleData,
          results: [...prev.results, ...localGoogleData.results],
        };
      });
      setPage((prev) => prev + 1);
      setYahooData((prev) => {
        if (!prev) return localYahooData;
        return {
          ...localYahooData,
          results: [...prev.results, ...localYahooData.results],
        };
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    utils,
    page,
    geocodeResult,
    initialValues,
    selectedTypes,
    selectedCategory,
    radius,
    keyword,
  ]);

  return {
    form,
    results,
    markers,
    isMore,
    mapPosition,
    selectedMarkerId,
    selectedCategory,
    googleTypes,
    yahooGenres,
    radius,
    keyword,
    isResultsVisible,
    isSearchSheetOpen,
    showResearchButton,
    currentMapCenter,
    isLoadingMore,
    highlightedCardIndex,
    handleGoogleTypesChange,
    handleYahooGenresChange,
    handleCardClick,
    handleMarkerClick,
    handleToggleResults,
    handleMoreClick,
    handleMapMove,
    setIsSearchSheetOpen,
  };
};

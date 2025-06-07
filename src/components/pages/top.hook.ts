import { categoryMapping } from "@/server/api/routers/data";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCallback, useEffect, useState, useMemo } from "react";
import { api } from "@/trpc/react";
import type { 
  LatLng, 
  GoogleData, 
  YahooData, 
  InitialValues,
  Position,
  GoogleTypeSelection,
  UnifiedSearchResult,
  MarkerData
} from "@/types/common";

const searchFormSchema = z.object({
  address: z.string().min(1, "住所を入力してください"),
  category: z.string().optional(),
  googleTypes: z
    .array(z.string())
    .max(3, "Google検索オプションは最大3つまでです"),
  yahooGenres: z
    .array(z.string())
    .max(3, "Yahoo検索オプションは最大3つまでです"),
});

type SearchFormData = z.infer<typeof searchFormSchema>;

type Props = {
  geocodeResult: LatLng | null;
  yahooData: YahooData | null;
  googleData: GoogleData | null;
  onSubmit?: (formData: FormData) => void;
  initialValues?: InitialValues;
};

export const useTopPage = ({
  geocodeResult,
  yahooData: initialYahooData,
  googleData: initialGoogleData,
  onSubmit,
  initialValues,
}: Props) => {
  const [mapPosition, setMapPosition] = useState<Position | undefined>(
    geocodeResult ? [geocodeResult.lat, geocodeResult.lng] : undefined,
  );
  const [selectedMarkerId, setSelectedMarkerId] = useState<
    number | undefined
  >();
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  const [yahooData, setYahooData] = useState(initialYahooData);
  const [page, setPage] = useState(1);
  const [googleData, setGoogleData] = useState(initialGoogleData);
  const [selectedTypes, setSelectedTypes] = useState<GoogleTypeSelection[]>(
    [],
  );

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      address: initialValues?.address ?? "",
      category: initialValues?.category ?? "",
      googleTypes: initialValues?.googleTypes ?? [],
      yahooGenres: initialValues?.yahooGenres ?? [],
    },
  });
  const selectedCategory = form.watch("category");
  const googleTypes = form.watch("googleTypes");
  const yahooGenres = form.watch("yahooGenres");

  const utils = api.useUtils();

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

  const handleFormSubmit = useCallback(
    (data: SearchFormData) => {
      if (!onSubmit) return;
      const formData = new FormData();
      formData.append("address", data.address);
      if (data.category) {
        formData.append("category", data.category);
      }
      data.googleTypes.forEach((type) => {
        formData.append("googleTypes", type);
      });
      data.yahooGenres.forEach((genre) => {
        formData.append("yahooGenres", genre);
      });
      onSubmit(formData);
    },
    [onSubmit],
  );

  const handleSubmit = form.handleSubmit(handleFormSubmit);

  const handleCardClick = useCallback(
    (position: Position, index: number) => {
      setMapPosition(position);
      setSelectedMarkerId(index);
    },
    [],
  );

  const handleMoreClick = useCallback(async () => {
    const localGoogleData = await utils.google.searchNearby.fetch({
      lat: geocodeResult?.lat ?? 0,
      lng: geocodeResult?.lng ?? 0,
      selectedTypes: selectedTypes,
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
  }, [utils, page, geocodeResult, initialValues, selectedTypes]);

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
    isAdvancedOptionsOpen,
    handleSubmit,
    handleGoogleTypesChange,
    handleYahooGenresChange,
    handleCardClick,
    handleMoreClick,
    setIsAdvancedOptionsOpen,
  };
};

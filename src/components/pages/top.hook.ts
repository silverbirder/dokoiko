import { categoryMapping } from "@/server/api/routers/data";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCallback, useEffect, useState, useMemo } from "react";
import { api } from "@/trpc/react";

const searchFormSchema = z.object({
  address: z.string().min(1, "住所を入力してください"),
  category: z.string().optional(),
  googleTypes: z
    .array(z.string())
    .max(3, "Google検索オプションは最大3つまでです"),
});

type SearchFormData = z.infer<typeof searchFormSchema>;

type Props = {
  geocodeResult: { lat: number; lng: number } | null;
  yahooData: {
    lat: number;
    lng: number;
    results: Array<{
      name: string;
      url?: string;
      image?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      now: number;
    }>;
    hasNextPage: boolean;
  } | null;
  googleData: {
    lat: number;
    lng: number;
    results: Array<{
      name?: string;
      url?: string;
      image?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      type: string;
      now: number;
    }>;
    types: Array<{
      name: string;
      nextPageToken: string;
    }>;
  } | null;
  onSubmit?: (formData: FormData) => void;
  initialValues?: {
    address?: string;
    category?: string;
    googleTypes?: string[];
  };
};

export const useTopPage = ({
  geocodeResult,
  yahooData: initialYahooData,
  googleData: initialGoogleData,
  onSubmit,
  initialValues,
}: Props) => {
  const [mapPosition, setMapPosition] = useState<[number, number] | undefined>(
    geocodeResult ? [geocodeResult.lat, geocodeResult.lng] : undefined,
  );
  const [selectedMarkerId, setSelectedMarkerId] = useState<
    number | undefined
  >();
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);
  const [yahooData, setYahooData] = useState(initialYahooData);
  const [page, setPage] = useState(1);
  const [googleData, setGoogleData] = useState(initialGoogleData);
  const [selectedTypes, setSelectedTypes] = useState<
    { name: string; pageToken: string }[]
  >([]);

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      address: initialValues?.address ?? "",
      category: initialValues?.category ?? "",
      googleTypes: initialValues?.googleTypes ?? [],
    },
  });
  const selectedCategory = form.watch("category");
  const googleTypes = form.watch("googleTypes");

  const utils = api.useUtils();

  const results = useMemo(() => {
    const typedGoogleResults =
      googleData?.results?.map((item) => ({
        ...item,
        type: "google",
        position:
          item.latitude && item.longitude
            ? ([item.latitude, item.longitude] as [number, number])
            : undefined,
      })) ?? [];

    const typedYahooResults =
      yahooData?.results?.map((item) => ({
        ...item,
        type: "yahoo",
        position:
          item.latitude && item.longitude
            ? ([item.latitude, item.longitude] as [number, number])
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
    () =>
      results
        .filter((item) => item.latitude && item.longitude)
        .map((item) => ({
          position: [item.latitude!, item.longitude!] as [number, number],
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
      return;
    }

    const categoryConfig =
      categoryMapping[selectedCategory as keyof typeof categoryMapping];
    const availableTypes = categoryConfig?.google || [];
    const filteredTypes = googleTypes.filter((type) =>
      availableTypes.includes(type),
    );

    if (filteredTypes.length !== googleTypes.length) {
      form.setValue("googleTypes", filteredTypes);
    }
  }, [selectedCategory, googleTypes, form]);

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
      onSubmit(formData);
    },
    [onSubmit],
  );

  const handleSubmit = form.handleSubmit(handleFormSubmit);

  const handleCardClick = useCallback(
    (position: [number, number], index: number) => {
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
    isAdvancedOptionsOpen,
    handleSubmit,
    handleGoogleTypesChange,
    handleCardClick,
    handleMoreClick,
    setIsAdvancedOptionsOpen,
  };
};

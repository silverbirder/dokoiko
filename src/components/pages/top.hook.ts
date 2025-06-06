import { categoryMapping } from "@/server/api/routers/data";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCallback, useEffect, useState, useMemo } from "react";

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
      nextPageToken?: string;
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
  yahooData,
  googleData,
  onSubmit,
  initialValues,
}: Props) => {
  const { results, markers, isMore } = useMemo(() => {
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

    const results = [...typedGoogleResults, ...typedYahooResults];
    const isMore =
      (yahooData?.hasNextPage ?? false) ||
      (googleData?.results.some((item) => item.nextPageToken) ?? false);

    const markers = results
      .filter((item) => item.latitude && item.longitude)
      .map((item) => ({
        position: [item.latitude!, item.longitude!] as [number, number],
        popupText: item.name ?? item.address ?? "",
      }));

    return { results, markers, isMore };
  }, [yahooData, googleData]);

  const [mapPosition, setMapPosition] = useState<[number, number] | undefined>(
    geocodeResult ? [geocodeResult.lat, geocodeResult.lng] : undefined,
  );
  const [selectedMarkerId, setSelectedMarkerId] = useState<
    number | undefined
  >();
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);

  useEffect(() => {
    setMapPosition(
      geocodeResult ? [geocodeResult.lat, geocodeResult.lng] : undefined,
    );
  }, [geocodeResult]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      address: initialValues?.address ?? "",
      category: initialValues?.category ?? "",
      googleTypes: initialValues?.googleTypes ?? [],
    },
  });

  const selectedCategory = watch("category");
  const googleTypes = watch("googleTypes");

  useEffect(() => {
    if (!selectedCategory) {
      if (googleTypes.length > 0) {
        setValue("googleTypes", []);
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
      setValue("googleTypes", filteredTypes);
    }
  }, [selectedCategory, googleTypes, setValue]);

  const handleGoogleTypesChange = useCallback(
    (types: string[]) => {
      setValue("googleTypes", types);
    },
    [setValue],
  );

  const onFormSubmit = useCallback(
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

  const handleCardClick = useCallback(
    (position: [number, number], index: number) => {
      setMapPosition(position);
      setSelectedMarkerId(index);
    },
    [],
  );

  return {
    results,
    markers,
    isMore,
    mapPosition,
    selectedMarkerId,
    control,
    handleSubmit,
    errors,
    selectedCategory,
    googleTypes,
    handleGoogleTypesChange,
    onFormSubmit,
    handleCardClick,
    isAdvancedOptionsOpen,
    setIsAdvancedOptionsOpen,
  };
};

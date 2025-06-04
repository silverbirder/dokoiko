import { categoryMapping } from "@/server/api/routers/data";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCallback, useEffect, useState } from "react";

const searchFormSchema = z.object({
  address: z.string().min(1, "住所を入力してください"),
  category: z.string().optional(),
  googleTypes: z
    .array(z.string())
    .max(3, "Google検索オプションは最大3つまでです"),
});

type SearchFormData = z.infer<typeof searchFormSchema>;

type Props = {
  centerPosition?: [number, number];
  onSubmit?: (formData: FormData) => void;
  initialValues?: {
    address?: string;
    category?: string;
    googleTypes?: string[];
  };
};

export const useTopPage = ({
  centerPosition,
  onSubmit,
  initialValues,
}: Props) => {
  const [mapPosition, setMapPosition] = useState<[number, number] | undefined>(
    centerPosition,
  );
  const [selectedMarkerId, setSelectedMarkerId] = useState<
    number | undefined
  >();
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);

  useEffect(() => {
    setMapPosition(centerPosition);
  }, [centerPosition]);

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

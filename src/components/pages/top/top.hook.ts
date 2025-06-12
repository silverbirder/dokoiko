import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCallback, useState } from "react";
import type { InitialValues } from "@/types/common";

const formSchema = z.object({
  address: z.string().min(1, "住所を入力してください"),
  category: z.string().optional(),
  googleTypes: z
    .array(z.string())
    .max(3, "Google検索オプションは最大3つまでです"),
  yahooGenres: z
    .array(z.string())
    .max(3, "Yahoo検索オプションは最大3つまでです"),
});

type TopFormData = z.infer<typeof formSchema>;

type Props = {
  onSubmit?: (formData: FormData) => void;
  initialValues?: InitialValues;
};

export const useTopPage = ({ onSubmit, initialValues }: Props) => {
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false);

  const form = useForm<TopFormData>({
    resolver: zodResolver(formSchema),
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
    (data: TopFormData) => {
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

  return {
    form,
    selectedCategory,
    googleTypes,
    yahooGenres,
    isAdvancedOptionsOpen,
    handleSubmit,
    handleGoogleTypesChange,
    handleYahooGenresChange,
    setIsAdvancedOptionsOpen,
  };
};

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCallback } from "react";
import type { InitialValues } from "@/types/common";

const formSchema = z.object({
  address: z.string().min(1, "住所を入力してください"),
});

type TopFormData = z.infer<typeof formSchema>;

type Props = {
  onSubmit?: (formData: FormData) => void;
  initialValues?: InitialValues;
};

export const useTopPage = ({ onSubmit, initialValues }: Props) => {
  const form = useForm<TopFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: initialValues?.address ?? "",
    },
  });

  const handleFormSubmit = useCallback(
    (data: TopFormData) => {
      if (!onSubmit) return;
      const formData = new FormData();
      formData.append("address", data.address);
      onSubmit(formData);
    },
    [onSubmit],
  );

  const handleSubmit = form.handleSubmit(handleFormSubmit);

  return {
    form,
    handleSubmit,
  };
};

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { InitialValues } from "@/types/common";

const formSchema = z.object({
  address: z.string().min(1, "住所を入力してください"),
});

type TopFormData = z.infer<typeof formSchema>;

type Props = {
  initialValues?: InitialValues;
};

export const useTopPage = ({ initialValues }: Props) => {
  const form = useForm<TopFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: initialValues?.address ?? "",
    },
  });

  return {
    form,
  };
};

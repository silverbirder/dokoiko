"use client";

import { Button, Input, MapCaller } from "@/components";
import { useTopPage } from "./top.hook";
import { Controller } from "react-hook-form";
import type { InitialValues } from "@/types/common";

type Props = {
  onSubmit?: (formData: FormData) => void;
  initialValues?: InitialValues;
};

export const TopPage = ({ onSubmit, initialValues }: Props) => {
  const {
    form: { control },
    handleSubmit,
  } = useTopPage({
    onSubmit,
    initialValues,
  });

  return (
    <div className="relative flex h-screen w-full items-center justify-center">
      <main className="relative z-10 w-full max-w-xl p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-1">
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="例: 大阪駅"
                  className="bg-background"
                />
              )}
            />
            <Button type="submit">検索</Button>
          </div>
        </form>
      </main>
      <div className="absolute inset-0 z-0">
        <div className="bg-background absolute inset-0 z-10 opacity-60" />
        <MapCaller />
      </div>
    </div>
  );
};

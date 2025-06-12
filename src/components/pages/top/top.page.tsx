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
      <main className="relative z-10 flex w-full max-w-xl flex-col items-center gap-8 p-4">
        <div className="flex w-full flex-col items-center justify-center gap-2">
          <div className="bg-primary grid h-32 w-32 grid-cols-2 rounded-lg text-4xl font-bold">
            <div className="text-primary-foreground flex items-center justify-center">
              ど
            </div>
            <div className="text-primary-foreground flex items-center justify-center">
              こ
            </div>
            <div className="text-primary-foreground flex items-center justify-center">
              い
            </div>
            <div className="text-primary-foreground flex items-center justify-center">
              こ
            </div>
          </div>
          <div className="text-primary-foreground text-center text-xl font-semibold tracking-wide">
            外に出かけたい気分なら、どこいこ！
          </div>
        </div>
        <form onSubmit={handleSubmit} className="w-full">
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

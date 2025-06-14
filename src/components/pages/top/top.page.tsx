"use client";

import { Button, Input, MapCaller } from "@/components";
import { useTopPage } from "./top.hook";
import { Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import type { InitialValues } from "@/types/common";

type Props = {
  onSubmit: (prevState: boolean, formData: FormData) => Promise<boolean>;
  initialValues?: InitialValues;
};

export const TopPage = ({ onSubmit, initialValues }: Props) => {
  const [, action, pending] = useActionState(onSubmit, false);

  const {
    form: { control },
  } = useTopPage({
    initialValues,
  });

  return (
    <div className="relative flex h-screen w-full items-center justify-center">
      <main className="relative z-10 flex w-full max-w-xl flex-col items-center gap-8 p-4">
        <div className="flex w-full flex-col items-center justify-center gap-2">
          <div className="bg-primary grid h-32 w-32 grid-cols-2 rounded-lg text-4xl font-bold">
            <div className="flex items-center justify-center">
              <span
                className="bg-gradient-to-br from-green-400 via-blue-500 to-blue-600 bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, #10b981, #10b981 10px, #3b82f6 10px, #3b82f6 20px)",
                }}
              >
                ど
              </span>
            </div>
            <div className="flex items-center justify-center">
              <span
                className="bg-gradient-to-br from-green-400 via-blue-500 to-blue-600 bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(-45deg, #10b981, #10b981 10px, #3b82f6 10px, #3b82f6 20px)",
                }}
              >
                こ
              </span>
            </div>
            <div className="flex items-center justify-center">
              <span
                className="bg-gradient-to-br from-blue-400 via-green-500 to-green-600 bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, #3b82f6, #3b82f6 10px, #10b981 10px, #10b981 20px)",
                }}
              >
                い
              </span>
            </div>
            <div className="flex items-center justify-center">
              <span
                className="bg-gradient-to-br from-blue-400 via-green-500 to-green-600 bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(-135deg, #3b82f6, #3b82f6 10px, #10b981 10px, #10b981 20px)",
                }}
              >
                こ
              </span>
            </div>
          </div>
          <div className="text-primary-foreground text-center text-xl font-semibold tracking-wide">
            外に出かけたい気分なら、どこいこ！
          </div>
        </div>
        <form action={action} className="w-full">
          <div className="flex gap-1">
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  name="address"
                  type="text"
                  placeholder="例: 大阪駅"
                  className="bg-background"
                  disabled={pending}
                />
              )}
            />
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  検索中...
                </>
              ) : (
                "検索"
              )}
            </Button>
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

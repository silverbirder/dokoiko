"use client";

import { categoryMapping } from "@/server/api/routers/data";
import { ChevronDown } from "lucide-react";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SearchOptionSelector,
  Input,
  MapCaller,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { useTopPage } from "./top.hook";
import { Controller } from "react-hook-form";
import type { InitialValues } from "@/types/common";

type Props = {
  onSubmit?: (formData: FormData) => void;
  initialValues?: InitialValues;
};

export const TopPage = ({ onSubmit, initialValues }: Props) => {
  const {
    form: {
      control,
      formState: { errors },
    },
    selectedCategory,
    googleTypes,
    yahooGenres,
    isAdvancedOptionsOpen,
    handleSubmit,
    handleGoogleTypesChange,
    handleYahooGenresChange,
    setIsAdvancedOptionsOpen,
  } = useTopPage({
    onSubmit,
    initialValues,
  });

  return (
    <div className="relative h-screen w-full">
      <main className="relative z-10 mx-auto max-w-xl p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-1">
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="例: 大阪駅"
                  className="bg-white"
                />
              )}
            />
            <Button type="submit">検索</Button>
          </div>
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address.message}</p>
          )}
          <Collapsible
            open={isAdvancedOptionsOpen}
            onOpenChange={setIsAdvancedOptionsOpen}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-white"
                type="button"
              >
                詳細検索オプション
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isAdvancedOptionsOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? undefined}
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? "" : value)
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="カテゴリを選択してください（任意）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">カテゴリなし</SelectItem>
                      {Object.keys(categoryMapping).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
              <SearchOptionSelector
                selectedGoogleTypes={googleTypes}
                selectedYahooTypes={yahooGenres}
                selectedCategory={selectedCategory ?? ""}
                onSelectedGoogleTypesChange={handleGoogleTypesChange}
                onSelectedYahooTypesChange={handleYahooGenresChange}
              />
              {errors.googleTypes && (
                <p className="text-sm text-red-500">
                  {errors.googleTypes.message}
                </p>
              )}
              {errors.yahooGenres && (
                <p className="text-sm text-red-500">
                  {errors.yahooGenres.message}
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </form>
      </main>
      <div className="absolute inset-0 z-0">
        <MapCaller />
      </div>
    </div>
  );
};

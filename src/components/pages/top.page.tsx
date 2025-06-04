"use client";

import { categoryMapping } from "@/server/api/routers/data";
import { ImageIcon } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  GoogleImage,
  GoogleTypeSelector,
  Input,
  MapCaller,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  YahooCredit,
} from "..";
import Image from "next/image";
import { useTopPage } from "./top.hook";
import { Controller } from "react-hook-form";

type Props = {
  results: Array<{
    name?: string;
    address?: string;
    image?: string;
    type?: string;
    url?: string;
    position?: [number, number];
  }>;
  markers: Array<{
    position: [number, number];
    popupText: string;
  }>;
  centerPosition: [number, number] | undefined;
  onSubmit?: (formData: FormData) => void;
  initialValues?: {
    address?: string;
    category?: string;
    googleTypes?: string[];
  };
};

export const TopPage = ({
  results,
  markers,
  centerPosition,
  onSubmit,
  initialValues,
}: Props) => {
  const {
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
  } = useTopPage({
    centerPosition,
    onSubmit,
    initialValues,
  });

  return (
    <div className="relative h-screen w-full">
      <main className="relative z-10 mx-auto max-w-xl p-4">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3">
          <div className="flex gap-1">
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="例: 東京都千代田区千代田1-1"
                  className="bg-white"
                />
              )}
            />
            <Button type="submit">検索</Button>
          </div>
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address.message}</p>
          )}
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
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
          <GoogleTypeSelector
            selectedTypes={googleTypes}
            selectedCategory={selectedCategory ?? ""}
            onSelectedTypesChange={handleGoogleTypesChange}
          />
          {errors.googleTypes && (
            <p className="text-sm text-red-500">{errors.googleTypes.message}</p>
          )}
        </form>
      </main>
      {results.length > 0 && (
        <div className="absolute right-0 bottom-4 left-0 z-10 overflow-x-auto p-4 whitespace-nowrap">
          <div className="flex gap-4">
            {results.map((item, index) => (
              <Card
                key={index}
                className="inline-block max-w-[350px] min-w-[300px] cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() =>
                  item.position && handleCardClick(item.position, index)
                }
              >
                <CardHeader>
                  {item.name && <CardTitle>{item.name}</CardTitle>}
                  {item.address && (
                    <CardDescription>{item.address}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {item.image && item.type === "google" ? (
                    <GoogleImage
                      photoReference={item.image}
                      altText={item.name ?? "施設画像"}
                    />
                  ) : item.image && item.type === "yahoo" ? (
                    <Image
                      src={item.image}
                      alt={item.name ?? "施設画像"}
                      width={300}
                      height={200}
                      className="h-40 w-full rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center rounded-md bg-gray-100">
                      <div className="text-center text-gray-400">
                        <ImageIcon className="mx-auto mb-2 h-12 w-12" />
                        <p className="text-sm">画像なし</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                {item.type === "yahoo" && <YahooCredit />}
                {item.url ? (
                  <CardFooter className="flex items-center justify-between">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      詳細を見る
                    </a>
                    {item.type && <Badge>{item.type}</Badge>}
                  </CardFooter>
                ) : (
                  item.type && (
                    <CardFooter className="mt-1 flex justify-end">
                      <Badge>{item.type}</Badge>
                    </CardFooter>
                  )
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
      <div className="absolute inset-0 z-0">
        <MapCaller
          markers={markers}
          position={mapPosition}
          selectedMarkerId={selectedMarkerId}
        />
      </div>
    </div>
  );
};

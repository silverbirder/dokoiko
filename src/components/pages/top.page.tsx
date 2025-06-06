"use client";

import { categoryMapping } from "@/server/api/routers/data";
import { ImageIcon, ChevronDown } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
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

export const TopPage = ({
  geocodeResult,
  yahooData,
  googleData,
  onSubmit,
  initialValues,
}: Props) => {
  const {
    form: {
      control,
      formState: { errors },
    },
    results,
    markers,
    isMore,
    mapPosition,
    selectedMarkerId,
    handleSubmit,
    selectedCategory,
    googleTypes,
    handleGoogleTypesChange,
    handleCardClick,
    isAdvancedOptionsOpen,
    setIsAdvancedOptionsOpen,
  } = useTopPage({
    geocodeResult,
    yahooData,
    googleData,
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
              <GoogleTypeSelector
                selectedTypes={googleTypes}
                selectedCategory={selectedCategory ?? ""}
                onSelectedTypesChange={handleGoogleTypesChange}
              />
              {errors.googleTypes && (
                <p className="text-sm text-red-500">
                  {errors.googleTypes.message}
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
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
                <CardHeader className="pb-3">
                  {item.name && (
                    <CardTitle className="text-base leading-tight break-words whitespace-normal">
                      {item.name}
                    </CardTitle>
                  )}
                  {item.address && (
                    <CardDescription className="text-sm leading-relaxed break-words whitespace-normal text-gray-600">
                      {item.address}
                    </CardDescription>
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
                <CardFooter className="flex flex-col gap-3 pt-4">
                  <div className="flex w-full items-center justify-between">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 transition-colors hover:text-blue-800 hover:underline"
                      >
                        詳細を見る
                      </a>
                    ) : (
                      <div></div>
                    )}
                    {item.type && (
                      <Badge variant="secondary" className="text-xs">
                        {item.type}
                      </Badge>
                    )}
                  </div>
                  {item.type === "yahoo" && (
                    <div className="w-full">
                      <YahooCredit />
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
            {isMore && (
              <div className="inline-flex items-center justify-center">
                <Button
                  variant="outline"
                  className="h-full bg-white/90 backdrop-blur-sm"
                >
                  もっと見る(未実装)
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="absolute inset-0 z-0">
        <MapCaller
          markers={markers}
          position={mapPosition}
          addressPosition={
            geocodeResult ? [geocodeResult.lat, geocodeResult.lng] : undefined
          }
          selectedMarkerId={selectedMarkerId}
        />
      </div>
    </div>
  );
};

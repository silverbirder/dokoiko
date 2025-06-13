"use client";

import { categoryMapping } from "@/server/api/routers/data";
import { ImageIcon, ChevronDown, ChevronUp, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
  SearchOptionSelector,
  Input,
  MapCaller,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  YahooCredit,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components";
import Image from "next/image";
import { useSearchPage } from "./search.hook";
import { Controller } from "react-hook-form";
import type {
  LatLng,
  GoogleData,
  YahooData,
  InitialValues,
} from "@/types/common";
import Link from "next/link";

type Props = {
  geocodeResult: LatLng | null;
  yahooData: YahooData | null;
  googleData: GoogleData | null;
  onSubmit?: (formData: FormData) => void;
  initialValues?: InitialValues;
};

export const SearchPage = ({
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
    selectedCategory,
    googleTypes,
    yahooGenres,
    isAdvancedOptionsOpen,
    isResultsVisible,
    isSearchSheetOpen,
    handleSubmit,
    handleGoogleTypesChange,
    handleYahooGenresChange,
    handleCardClick,
    handleMoreClick,
    handleToggleResults,
    setIsAdvancedOptionsOpen,
    setIsSearchSheetOpen,
  } = useSearchPage({
    geocodeResult,
    yahooData,
    googleData,
    onSubmit,
    initialValues,
  });

  return (
    <div className="relative h-screen w-full">
      <div className="absolute top-4 right-4 z-20">
        <Sheet open={isSearchSheetOpen} onOpenChange={setIsSearchSheetOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="bg-white/90 shadow-lg backdrop-blur-sm hover:bg-white"
            >
              <Search className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>検索条件を設定</SheetTitle>
              <SheetDescription>
                検索したい場所とオプションを選択してください。
              </SheetDescription>
            </SheetHeader>
            <div className="px-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    検索場所
                  </label>
                  <div className="flex gap-2">
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
                    <p className="mt-1 text-sm text-red-500">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    カテゴリ（任意）
                  </label>
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
                          <SelectValue placeholder="カテゴリを選択してください" />
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
                    <p className="mt-1 text-sm text-red-500">
                      {errors.category.message}
                    </p>
                  )}
                </div>
                <Collapsible
                  open={isAdvancedOptionsOpen}
                  onOpenChange={setIsAdvancedOptionsOpen}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
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
            </div>
          </SheetContent>
        </Sheet>
      </div>
      {results.length > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: isResultsVisible ? "0%" : "calc(100% - 80px)" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              mass: 0.8,
            }}
            className="bg-primary absolute right-0 bottom-0 left-0 z-10 overflow-hidden rounded-t-lg shadow-2xl"
          >
            <div className="bg-primary-foreground/20 border-primary-foreground/10 flex justify-center border-b py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleResults}
                className="text-primary-foreground hover:bg-primary-foreground/20 flex items-center gap-2 transition-all duration-200"
              >
                {isResultsVisible ? (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    隠す
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    結果を表示 ({results.length}件)
                  </>
                )}
              </Button>
            </div>
            <div className="overflow-x-auto p-4 whitespace-nowrap">
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
                        <CardDescription className="text-sm leading-relaxed break-words whitespace-normal">
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
                        <div className="flex h-40 w-full items-center justify-center rounded-md">
                          <div className="text-center">
                            <ImageIcon className="mx-auto mb-2 h-12 w-12" />
                            <p className="text-sm">画像なし</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 pt-4">
                      <div className="flex w-full items-center justify-between">
                        {item.url ? (
                          <Button asChild variant="outline">
                            <Link
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm"
                            >
                              詳細を見る
                            </Link>
                          </Button>
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
                      onClick={handleMoreClick}
                    >
                      もっと見る
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
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

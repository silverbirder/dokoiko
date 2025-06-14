"use client";

import { categoryMapping } from "@/server/api/routers/data";
import {
  ImageIcon,
  ChevronDown,
  ChevronUp,
  Search,
  MapPin,
  Home,
  Loader2,
  ChevronRight,
} from "lucide-react";
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
  GoogleImage,
  SearchOptionSelector,
  Input,
  MapCaller,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
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
import { useActionState, useCallback, startTransition } from "react";
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
  onSubmit: (prevState: boolean, formData: FormData) => Promise<boolean>;
  initialValues?: InitialValues;
};

export const SearchPage = ({
  geocodeResult,
  yahooData,
  googleData,
  onSubmit,
  initialValues,
}: Props) => {
  const [, action, pending] = useActionState(onSubmit, false);
  const searchPageData = useSearchPage({
    geocodeResult,
    yahooData,
    googleData,
    initialValues,
  });

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
    radius,
    isResultsVisible,
    isSearchSheetOpen,
    showResearchButton,
    currentMapCenter,
    isLoadingMore,
    highlightedCardIndex,
    handleGoogleTypesChange,
    handleYahooGenresChange,
    handleCardClick,
    handleMarkerClick,
    handleMoreClick,
    handleToggleResults,
    handleMapMove,
    setIsSearchSheetOpen,
  } = searchPageData;

  const handleResearchAtCurrentLocation = useCallback(() => {
    if (!currentMapCenter) return;

    const formData = new FormData();
    formData.append("address", `${currentMapCenter[0]},${currentMapCenter[1]}`);
    if (selectedCategory) {
      formData.append("category", selectedCategory);
    }
    googleTypes.forEach((type) => {
      formData.append("googleTypes", type);
    });
    yahooGenres.forEach((genre) => {
      formData.append("yahooGenres", genre);
    });
    formData.append("radius", (radius ?? 3000).toString());

    startTransition(() => {
      action(formData);
    });
  }, [currentMapCenter, selectedCategory, googleTypes, yahooGenres, radius, action]);

  return (
    <div className="relative h-screen w-full">
      <AnimatePresence>
        {showResearchButton && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              mass: 0.8,
            }}
            className="absolute top-4 left-1/2 z-30 -translate-x-1/2"
          >
            <Button
              onClick={handleResearchAtCurrentLocation}
              disabled={pending}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground flex items-center gap-2 shadow-lg"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  検索中...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  この位置で再検索する
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute top-4 left-4 z-20">
        <Button
          asChild
          size="icon"
          className="bg-background hover:bg-background/90 text-background-foreground shadow-lg"
        >
          <Link href="/">
            <Home className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="absolute top-4 right-4 z-20">
        <Sheet open={isSearchSheetOpen} onOpenChange={setIsSearchSheetOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="bg-background hover:bg-background/90 text-background-foreground shadow-lg"
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
              <form action={action} className="space-y-4">
                <input
                  type="hidden"
                  name="category"
                  value={selectedCategory ?? ""}
                />
                {googleTypes.map((type, index) => (
                  <input
                    key={`google-${index}`}
                    type="hidden"
                    name="googleTypes"
                    value={type}
                  />
                ))}
                {yahooGenres.map((genre, index) => (
                  <input
                    key={`yahoo-${index}`}
                    type="hidden"
                    name="yahooGenres"
                    value={genre}
                  />
                ))}
                <input type="hidden" name="radius" value={radius ?? 3000} />
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    検索場所（地名・住所・緯度経度など）
                  </label>
                  <div className="flex gap-2">
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          name="address"
                          type="text"
                          placeholder="例: 大阪駅"
                          className="bg-white"
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
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.address.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    検索範囲（メートル）
                  </label>
                  <Controller
                    name="radius"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{field.value ?? 3000}m</span>
                          <span className="text-xs text-gray-500">
                            100m - 50km
                          </span>
                        </div>
                        <Slider
                          value={[field.value ?? 3000]}
                          onValueChange={(value) => field.onChange(value[0])}
                          min={100}
                          max={50000}
                          step={100}
                          className="w-full"
                        />
                      </div>
                    )}
                  />
                  {errors.radius && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.radius.message}
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
                <div className="space-y-3">
                  <div className="mb-2">
                    <h3 className="text-sm font-medium">詳細検索オプション</h3>
                  </div>
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
                </div>
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
            className="bg-primary/60 absolute right-0 bottom-0 left-0 z-10 overflow-hidden rounded-t-lg shadow-2xl"
          >
            <div className="flex justify-start pt-2 pl-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleResults}
                className="bg-primary-foreground hover:bg-primary-foreground/90 flex items-center gap-2 transition-all duration-200"
              >
                {isResultsVisible ? (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    隠す ({results.length}件)
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
                    data-card-index={index}
                    className={`inline-block max-w-[350px] min-w-[300px] cursor-pointer border-4 transition-all duration-300 hover:shadow-lg ${
                      highlightedCardIndex === index
                        ? "border-secondary"
                        : "border-primary-foreground"
                    }`}
                    onClick={() =>
                      item.position && handleCardClick(item.position, index)
                    }
                  >
                    <CardHeader className="pb-3">
                      {item.name && (
                        <div className="overflow-x-auto overflow-y-hidden">
                          <CardTitle className="min-w-max text-base leading-tight whitespace-nowrap">
                            {item.name}
                          </CardTitle>
                        </div>
                      )}
                      {item.address && (
                        <div className="overflow-x-auto overflow-y-hidden">
                          <CardDescription className="min-w-max text-sm leading-relaxed whitespace-nowrap">
                            {item.address}
                          </CardDescription>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
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
                      {item.type === "google" &&
                        item.types &&
                        item.types.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-600">
                              タイプ:
                            </p>
                            <div className="overflow-x-auto overflow-y-hidden">
                              <div className="flex min-w-max gap-1">
                                {item.types.map((type, typeIndex) => (
                                  <Badge
                                    key={typeIndex}
                                    variant="outline"
                                    className="text-xs whitespace-nowrap"
                                  >
                                    {type.replace(/_/g, " ")}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      {item.type === "yahoo" &&
                        item.genres &&
                        item.genres.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-600">
                              タイプ:
                            </p>
                            <div className="overflow-x-auto overflow-y-hidden">
                              <div className="flex min-w-max gap-1">
                                {item.genres.map((genre, genreIndex) => (
                                  <Badge
                                    key={genreIndex}
                                    variant="outline"
                                    className="text-xs whitespace-nowrap"
                                  >
                                    {genre.Name}
                                  </Badge>
                                ))}
                              </div>
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
                      size="icon"
                      className="bg-primary-foreground hover:bg-primary-foreground/90 h-12 w-12 rounded-full shadow-lg transition-shadow hover:shadow-xl"
                      onClick={handleMoreClick}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
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
          radius={radius ?? 3000}
          onMapMove={handleMapMove}
          onMarkerClick={handleMarkerClick}
        />
      </div>
    </div>
  );
};

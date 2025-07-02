"use client";

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  GoogleImage,
  YahooCredit,
  FavoriteButton,
} from "@/components";
import { useFavorites } from "@/hooks";
import type { FavoriteItem } from "@/lib";
import { ImageIcon, MapPin, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const FavoritesPage = () => {
  const { favorites } = useFavorites();

  const handleViewOnMap = (item: FavoriteItem) => {
    if (!item.position) return;

    const [lat, lng] = item.position;
    const params = new URLSearchParams();
    params.set("address", `${lat},${lng}`);

    window.location.href = `/search?${params.toString()}`;
  };

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto p-4">
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

        <div className="py-12 pt-20 text-center">
          <h1 className="mb-4 text-2xl font-bold">お気に入り</h1>
          <div className="text-muted-foreground mb-8">
            <ImageIcon className="mx-auto mb-4 h-16 w-16" />
            <p className="text-lg">お気に入りに登録した場所はありません</p>
            <p className="text-sm">
              場所を検索してお気に入りに追加してみましょう
            </p>
          </div>
          <Button asChild>
            <Link href="/">場所を検索する</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
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

      <div className="mb-6 pt-16">
        <h1 className="mb-2 text-2xl font-bold">お気に入り</h1>
        <p className="text-muted-foreground">
          {favorites.length}件の場所が登録されています
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {favorites.map((item) => (
          <Card key={item.id} className="relative">
            <div className="absolute top-2 right-2 z-10">
              <FavoriteButton item={item} size="sm" />
            </div>

            <CardHeader className="pb-3">
              {item.name && (
                <CardTitle className="pr-8 text-base leading-tight">
                  {item.name}
                </CardTitle>
              )}
              {item.address && (
                <CardDescription className="text-sm leading-relaxed">
                  {item.address}
                </CardDescription>
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
                <div className="bg-muted flex h-40 w-full items-center justify-center rounded-md">
                  <div className="text-center">
                    <ImageIcon className="text-muted-foreground mx-auto mb-2 h-12 w-12" />
                    <p className="text-muted-foreground text-sm">画像なし</p>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-4">
              <div className="flex w-full items-center justify-between">
                <div className="flex gap-2">
                  {item.url && (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        詳細を見る
                      </Link>
                    </Button>
                  )}
                  {item.position && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOnMap(item)}
                      className="flex items-center gap-1"
                    >
                      <MapPin className="h-3 w-3" />
                      マップで見る
                    </Button>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {item.type}
                </Badge>
              </div>
              {item.type === "yahoo" && (
                <div className="w-full">
                  <YahooCredit />
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <Link href="/">新しい場所を検索する</Link>
        </Button>
      </div>
    </div>
  );
};

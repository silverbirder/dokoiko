"use client";

import type { UnifiedSearchResult } from "@/types/common";

const FAVORITES_COOKIE_KEY = "dokoiko_favorites";
const COOKIE_EXPIRY_DAYS = 365;

// お気に入りアイテムの型定義
export type FavoriteItem = {
  id: string;
  name?: string;
  address?: string;
  position?: [number, number];
  type: "google" | "yahoo";
  url?: string;
  image?: string;
  addedAt: number;
};

// クッキーからお気に入りを取得
export function getFavoritesFromCookie(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  
  try {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${FAVORITES_COOKIE_KEY}=`))
      ?.split("=")[1];
    
    if (!cookieValue) return [];
    
    const decoded = decodeURIComponent(cookieValue);
    return JSON.parse(decoded) as FavoriteItem[];
  } catch (error) {
    console.error("Failed to parse favorites from cookie:", error);
    return [];
  }
}

// クッキーにお気に入りを保存
export function saveFavoritesToCookie(favorites: FavoriteItem[]): void {
  if (typeof window === "undefined") return;
  
  try {
    const encoded = encodeURIComponent(JSON.stringify(favorites));
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + COOKIE_EXPIRY_DAYS);
    
    document.cookie = `${FAVORITES_COOKIE_KEY}=${encoded}; expires=${expiry.toUTCString()}; path=/; SameSite=Lax`;
  } catch (error) {
    console.error("Failed to save favorites to cookie:", error);
  }
}

// 検索結果からお気に入りアイテムを作成
export function createFavoriteItemFromResult(result: UnifiedSearchResult): FavoriteItem {
  const id = `${result.type}_${result.name}_${result.latitude}_${result.longitude}`;
  return {
    id,
    name: result.name,
    address: result.address,
    position: result.position,
    type: result.type,
    url: result.url,
    image: result.image,
    addedAt: Date.now(),
  };
}

// お気に入りに追加
export function addToFavorites(item: FavoriteItem): void {
  const favorites = getFavoritesFromCookie();
  const existingIndex = favorites.findIndex((fav) => fav.id === item.id);
  
  if (existingIndex === -1) {
    favorites.unshift(item); // 新しいものを先頭に追加
    saveFavoritesToCookie(favorites);
  }
}

// お気に入りから削除
export function removeFromFavorites(itemId: string): void {
  const favorites = getFavoritesFromCookie();
  const filtered = favorites.filter((fav) => fav.id !== itemId);
  saveFavoritesToCookie(filtered);
}

// アイテムがお気に入りに登録されているかチェック
export function isFavorite(itemId: string): boolean {
  const favorites = getFavoritesFromCookie();
  return favorites.some((fav) => fav.id === itemId);
}

// お気に入りの件数を取得
export function getFavoritesCount(): number {
  return getFavoritesFromCookie().length;
}

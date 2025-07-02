"use client";

import { useState, useEffect, useCallback } from "react";
import type { FavoriteItem } from "@/lib";
import {
  getFavoritesFromCookie,
  addToFavorites,
  removeFromFavorites,
  isFavorite,
} from "@/lib";

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  // 初期化時にクッキーからお気に入りを読み込み
  useEffect(() => {
    const loadedFavorites = getFavoritesFromCookie();
    setFavorites(loadedFavorites);
    setFavoritesCount(loadedFavorites.length);
    setIsHydrated(true);
  }, []);

  // お気に入りに追加
  const addFavorite = useCallback((item: FavoriteItem) => {
    addToFavorites(item);
    const updatedFavorites = getFavoritesFromCookie();
    setFavorites(updatedFavorites);
    setFavoritesCount(updatedFavorites.length);
  }, []);

  // お気に入りから削除
  const removeFavorite = useCallback((itemId: string) => {
    removeFromFavorites(itemId);
    const updatedFavorites = getFavoritesFromCookie();
    setFavorites(updatedFavorites);
    setFavoritesCount(updatedFavorites.length);
  }, []);

  // お気に入りの切り替え
  const toggleFavorite = useCallback(
    (item: FavoriteItem) => {
      if (isFavorite(item.id)) {
        removeFavorite(item.id);
      } else {
        addFavorite(item);
      }
    },
    [addFavorite, removeFavorite],
  );

  // アイテムがお気に入りかどうかチェック
  const checkIsFavorite = useCallback(
    (itemId: string) => {
      // ハイドレーション完了前は常にfalseを返してSSRとクライアントの不一致を防ぐ
      if (!isHydrated) return false;
      return isFavorite(itemId);
    },
    [isHydrated],
  );

  return {
    favorites,
    favoritesCount,
    isHydrated,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    checkIsFavorite,
  };
}

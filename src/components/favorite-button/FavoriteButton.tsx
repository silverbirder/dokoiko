"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components";
import { useFavorites } from "@/hooks";
import type { FavoriteItem } from "@/lib";
import { cn } from "@/lib";

type Props = {
  item: FavoriteItem;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export const FavoriteButton = ({ item, size = "md", className }: Props) => {
  const { checkIsFavorite, toggleFavorite, isHydrated } = useFavorites();
  const isFavorited = checkIsFavorite(item.id);

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(item);
  };

  // ハイドレーション完了前は非表示にしてSSRとクライアントの不一致を防ぐ
  if (!isHydrated) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          sizeClasses[size],
          "rounded-full transition-all duration-200 hover:scale-110",
          "text-muted-foreground hover:text-primary hover:bg-primary/10",
          className,
        )}
        disabled
      >
        <Heart className={cn(iconSizes[size], "transition-all duration-200")} />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={cn(
        sizeClasses[size],
        "rounded-full transition-all duration-200 hover:scale-110",
        isFavorited
          ? "text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20"
          : "text-muted-foreground hover:text-primary hover:bg-primary/10",
        className,
      )}
      title={isFavorited ? "お気に入りから削除" : "お気に入りに追加"}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-all duration-200",
          isFavorited ? "fill-current" : "",
        )}
      />
    </Button>
  );
};

"use client";

import { api } from "@/trpc/react";
import Image from "next/image";

type GoogleImageProps = {
  photoReference: string;
  altText: string;
};

export function GoogleImage({ photoReference, altText }: GoogleImageProps) {
  const {
    data: photoData,
    isLoading,
    error,
  } = api.google.getPhotoUrlByReference.useQuery({
    photoReference,
  });

  if (isLoading) {
    return (
      <div className="h-40 w-full animate-pulse rounded-md bg-gray-200"></div>
    );
  }

  if (error || !photoData?.imageData) {
    console.error("Failed to load image:", error);
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-md bg-gray-100 text-sm text-gray-500">
        画像なし
      </div>
    );
  }

  return (
    <Image
      src={photoData.imageData}
      alt={altText}
      width={400}
      height={225} // 16:9 aspect ratio, adjust as needed
      className="h-40 w-full rounded-md object-cover"
    />
  );
}

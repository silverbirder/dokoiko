"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type GoogleImageProps = {
  photoReference: string;
  altText: string;
};

type PhotoData = {
  imageData: string;
  contentType: string;
};

export function GoogleImage({ photoReference, altText }: GoogleImageProps) {
  const [photoData, setPhotoData] = useState<PhotoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!photoReference) {
      setIsLoading(false);
      setError(new Error("Photo reference is missing"));
      return;
    }

    const fetchPhoto = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/photo?photoReference=${encodeURIComponent(photoReference)}`,
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to fetch image: ${response.statusText}`,
          );
        }
        const data: PhotoData = await response.json();
        setPhotoData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error("An unknown error occurred"));
        }
        console.error("Failed to load image:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhoto();
  }, [photoReference]);

  if (isLoading) {
    return (
      <div className="h-40 w-full animate-pulse rounded-md bg-gray-200"></div>
    );
  }

  if (error || !photoData?.imageData) {
    console.error("Failed to load image:", error?.message);
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

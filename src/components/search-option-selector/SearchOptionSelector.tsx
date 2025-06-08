"use client";

import { useCallback, useMemo } from "react";
import { Settings } from "lucide-react";
import { googlePlaceTypes } from "@/lib/google-place-types";
import { yahooGenreTypes } from "@/lib/yahoo-genre-types";
import { categoryMapping } from "@/server/api/routers/data";
import { Checkbox, Label } from "@/components";
import type { ComponentPropsBase } from "@/types/common";

type Props = ComponentPropsBase & {
  selectedGoogleTypes: string[];
  selectedYahooTypes: string[];
  selectedCategory: string;
  onSelectedGoogleTypesChange?: (types: string[]) => void;
  onSelectedYahooTypesChange?: (types: string[]) => void;
};

export const SearchOptionSelector = ({
  selectedGoogleTypes,
  selectedYahooTypes,
  selectedCategory,
  onSelectedGoogleTypesChange,
  onSelectedYahooTypesChange,
}: Props) => {
  const availableGoogleTypes = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }
    const categoryConfig =
      categoryMapping[selectedCategory as keyof typeof categoryMapping];
    return categoryConfig?.google || [];
  }, [selectedCategory]);

  const availableYahooTypes = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }
    const categoryConfig =
      categoryMapping[selectedCategory as keyof typeof categoryMapping];
    return categoryConfig?.yahoo || [];
  }, [selectedCategory]);

  const handleGoogleTypeChange = useCallback(
    (type: string, checked: boolean) => {
      if (checked) {
        if (selectedGoogleTypes.length < 3) {
          onSelectedGoogleTypesChange?.([...selectedGoogleTypes, type]);
        }
      } else {
        onSelectedGoogleTypesChange?.(
          selectedGoogleTypes.filter((t) => t !== type),
        );
      }
    },
    [selectedGoogleTypes, onSelectedGoogleTypesChange],
  );

  const handleYahooTypeChange = useCallback(
    (type: string, checked: boolean) => {
      if (checked) {
        if (selectedYahooTypes.length < 3) {
          onSelectedYahooTypesChange?.([...selectedYahooTypes, type]);
        }
      } else {
        onSelectedYahooTypesChange?.(
          selectedYahooTypes.filter((t) => t !== type),
        );
      }
    },
    [selectedYahooTypes, onSelectedYahooTypesChange],
  );

  const filteredGooglePlaceTypes = useMemo(
    () =>
      Object.entries(googlePlaceTypes).filter(([type]) =>
        availableGoogleTypes.includes(type),
      ),
    [availableGoogleTypes],
  );

  const filteredYahooGenreTypes = useMemo(() => {
    const allYahooTypes: Array<[string, string]> = [];
    for (const categoryCode of availableYahooTypes) {
      const detailedGenres = Object.entries(yahooGenreTypes).filter(
        ([genreCode]) => genreCode.startsWith(categoryCode),
      );
      allYahooTypes.push(...detailedGenres);
    }

    return allYahooTypes;
  }, [availableYahooTypes]);

  if (!selectedCategory) {
    return (
      <div className="rounded-md border border-gray-300 bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="text-sm font-medium">
            検索オプション - カテゴリなし
          </span>
        </div>
        <div className="text-center text-sm text-gray-500">
          カテゴリを選択すると、より詳細な検索オプションが利用できます
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Google検索オプション */}
      <div className="rounded-md border border-gray-300 bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="text-sm font-medium">
            Google検索オプション (最大3つ) - {selectedCategory}
          </span>
        </div>
        {filteredGooglePlaceTypes.length > 0 ? (
          <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto">
            {filteredGooglePlaceTypes.map(([type, label]) => {
              return (
                <div key={type} className="flex items-center space-x-2 text-xs">
                  <Checkbox
                    id={`google-${type}`}
                    checked={selectedGoogleTypes.includes(type)}
                    onCheckedChange={(checked) =>
                      handleGoogleTypeChange(type, !!checked)
                    }
                    disabled={
                      !selectedGoogleTypes.includes(type) &&
                      selectedGoogleTypes.length >= 3
                    }
                  />
                  <Label
                    className={`cursor-pointer text-xs ${
                      selectedGoogleTypes.length >= 3 &&
                      !selectedGoogleTypes.includes(type)
                        ? "text-gray-400"
                        : ""
                    }`}
                    htmlFor={`google-${type}`}
                  >
                    {label}
                  </Label>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500">
            このカテゴリにはGoogle検索オプションがありません
          </div>
        )}
      </div>
      <div className="rounded-md border border-gray-300 bg-white p-3">
        <div className="mb-2 flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="text-sm font-medium">
            Yahoo検索オプション (最大3つ) - {selectedCategory}
          </span>
        </div>
        {filteredYahooGenreTypes.length > 0 ? (
          <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto">
            {filteredYahooGenreTypes.map(([genreCode, label]) => (
              <div
                key={genreCode}
                className="flex items-center space-x-2 text-xs"
              >
                <Checkbox
                  id={`yahoo-${genreCode}`}
                  checked={selectedYahooTypes.includes(genreCode)}
                  onCheckedChange={(checked) =>
                    handleYahooTypeChange(genreCode, !!checked)
                  }
                  disabled={
                    !selectedYahooTypes.includes(genreCode) &&
                    selectedYahooTypes.length >= 3
                  }
                />
                <Label
                  className={`cursor-pointer text-xs ${
                    selectedYahooTypes.length >= 3 &&
                    !selectedYahooTypes.includes(genreCode)
                      ? "text-gray-400"
                      : ""
                  }`}
                  htmlFor={`yahoo-${genreCode}`}
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500">
            このカテゴリにはYahoo検索オプションがありません
          </div>
        )}
      </div>
    </div>
  );
};

"use client";

import { useCallback, useMemo } from "react";
import { Settings } from "lucide-react";
import { googlePlaceTypes } from "@/lib/google-place-types";
import { categoryMapping } from "@/server/api/routers/data";
import { Checkbox, Label } from "@/components";

type Props = {
  selectedTypes: string[];
  selectedCategory: string;
  onSelectedTypesChange?: (types: string[]) => void;
};

export const GoogleTypeSelector = ({
  selectedTypes,
  selectedCategory,
  onSelectedTypesChange,
}: Props) => {
  const availableTypes = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }
    const categoryConfig =
      categoryMapping[selectedCategory as keyof typeof categoryMapping];
    return categoryConfig?.google || [];
  }, [selectedCategory]);

  const handleTypeChange = useCallback(
    (type: string, checked: boolean) => {
      if (checked) {
        if (selectedTypes.length < 3) {
          onSelectedTypesChange?.([...selectedTypes, type]);
        }
      } else {
        onSelectedTypesChange?.(selectedTypes.filter((t) => t !== type));
      }
    },
    [selectedTypes, onSelectedTypesChange],
  );

  const filteredGooglePlaceTypes = useMemo(
    () =>
      Object.entries(googlePlaceTypes).filter(([type]) =>
        availableTypes.includes(type),
      ),
    [availableTypes],
  );

  return (
    <div className="rounded-md border border-gray-300 bg-white p-3">
      <div className="mb-2 flex items-center gap-2">
        <Settings className="h-4 w-4" />
        <span className="text-sm font-medium">
          Google検索オプション (最大3つ) {selectedCategory ? `- ${selectedCategory}` : "- カテゴリなし"}
        </span>
      </div>
      {!selectedCategory ? (
        <div className="text-center text-sm text-gray-500">
          カテゴリを選択すると、より詳細な検索オプションが利用できます
        </div>
      ) : (
        <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto">
          {filteredGooglePlaceTypes.map(([type, label]) => (
            <div key={type} className="flex items-center space-x-2 text-xs">
              <Checkbox
                id={type}
                checked={selectedTypes.includes(type)}
                onCheckedChange={(checked) => handleTypeChange(type, !!checked)}
                disabled={
                  !selectedTypes.includes(type) && selectedTypes.length >= 3
                }
              />
              <Label
                className={`cursor-pointer text-xs ${
                  selectedTypes.length >= 3 && !selectedTypes.includes(type)
                    ? "text-gray-400"
                    : ""
                }`}
                htmlFor={type}
              >
                {label}
              </Label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

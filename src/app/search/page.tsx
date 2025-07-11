import { HydrateClient } from "@/trpc/server";
import { SearchPage } from "@/components";
import { redirect } from "next/navigation";
import { getPageHook } from "./page.hook";

type Props = {
  searchParams?: Promise<{
    address?: string;
    category?: string;
    googleTypes?: string;
    yahooGenres?: string;
    radius?: string;
    keyword?: string;
  }>;
};

export default async function Page({ searchParams: _searchParams }: Props) {
  const searchParams = await _searchParams;
  const address = searchParams?.address ?? "";
  const category = searchParams?.category ?? "";
  const googleTypes = searchParams?.googleTypes
    ? searchParams.googleTypes.split(",")
    : [];
  const yahooGenres = searchParams?.yahooGenres
    ? searchParams.yahooGenres.split(",")
    : [];
  const radius = searchParams?.radius
    ? parseInt(searchParams.radius, 10)
    : 3000;
  const keyword = searchParams?.keyword ?? "";
  const { geocodeResult, yahooData, googleData } = await getPageHook({
    address,
    category,
    googleTypes,
    yahooGenres,
    radius,
    keyword,
  });

  async function handleSubmit(
    _: boolean,
    formData: FormData,
  ): Promise<boolean> {
    "use server";
    const address = formData.get("address") as string;
    const category = formData.get("category") as string;
    const googleTypes = formData.getAll("googleTypes") as string[];
    const yahooGenres = formData.getAll("yahooGenres") as string[];
    const radiusStr = formData.get("radius") as string;
    const radius = radiusStr ? parseInt(radiusStr, 10) : 3000;
    const keyword = formData.get("keyword") as string;
    const params = new URLSearchParams();
    if (address) params.set("address", address);
    if (category) params.set("category", category);
    if (googleTypes.length > 0)
      params.set("googleTypes", googleTypes.join(","));
    if (yahooGenres.length > 0)
      params.set("yahooGenres", yahooGenres.join(","));
    if (radius !== 3000) params.set("radius", radius.toString());
    if (keyword) params.set("keyword", keyword);
    redirect(`/search?${params.toString()}`);
  }

  return (
    <HydrateClient>
      <SearchPage
        geocodeResult={geocodeResult}
        yahooData={yahooData}
        googleData={googleData}
        onSubmit={handleSubmit}
        initialValues={{
          address,
          category,
          googleTypes,
          yahooGenres,
          radius,
          keyword: searchParams?.keyword ?? "",
        }}
      />
    </HydrateClient>
  );
}

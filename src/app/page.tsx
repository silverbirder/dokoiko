import { HydrateClient } from "@/trpc/server";
import { getPageHook } from "./page.hook";
import { TopPage } from "@/components";

type Props = {
  searchParams?: Promise<{
    address?: string;
    category?: string;
    googleTypes?: string;
  }>;
};

export default async function Home({ searchParams: _searchParams }: Props) {
  const searchParams = await _searchParams;
  const address = searchParams?.address ?? "";
  const category = searchParams?.category ?? "グルメ・レストラン";
  const googleTypes = searchParams?.googleTypes
    ? searchParams.googleTypes.split(",")
    : [];
  const { results, markers, centerPosition } = await getPageHook({
    address,
    category,
    googleTypes,
  });
  return (
    <HydrateClient>
      <TopPage
        results={results}
        markers={markers}
        centerPosition={centerPosition}
      />
    </HydrateClient>
  );
}

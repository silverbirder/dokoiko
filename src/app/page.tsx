import { HydrateClient } from "@/trpc/server";
import { getPageHook } from "./page.hook";
import { TopPage } from "@/components";
import { redirect } from "next/navigation";

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
  const category = searchParams?.category ?? "";
  const googleTypes = searchParams?.googleTypes
    ? searchParams.googleTypes.split(",")
    : [];
  const { results, markers, centerPosition } = await getPageHook({
    address,
    category,
    googleTypes,
  });

  async function handleSubmit(formData: FormData) {
    "use server";
    const address = formData.get("address") as string;
    const category = formData.get("category") as string;
    const googleTypes = formData.getAll("googleTypes") as string[];
    const params = new URLSearchParams();
    if (address) params.set("address", address);
    if (category) params.set("category", category);
    if (googleTypes.length > 0)
      params.set("googleTypes", googleTypes.join(","));
    redirect(`/?${params.toString()}`);
  }

  return (
    <HydrateClient>
      <TopPage
        results={results}
        markers={markers}
        centerPosition={centerPosition}
        onSubmit={handleSubmit}
        initialValues={{
          address,
          category,
          googleTypes,
        }}
      />
    </HydrateClient>
  );
}

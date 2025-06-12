import { HydrateClient } from "@/trpc/server";
import { TopPage } from "@/components";
import { redirect } from "next/navigation";

type Props = {
  searchParams?: Promise<{
    address?: string;
  }>;
};

export default async function Page({ searchParams: _searchParams }: Props) {
  const searchParams = await _searchParams;
  const address = searchParams?.address ?? "";

  async function handleSubmit(formData: FormData) {
    "use server";
    const address = formData.get("address") as string;
    const params = new URLSearchParams();
    if (address) params.set("address", address);
    redirect(`/search?${params.toString()}`);
  }

  return (
    <HydrateClient>
      <TopPage
        onSubmit={handleSubmit}
        initialValues={{
          address,
        }}
      />
    </HydrateClient>
  );
}

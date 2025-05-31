import { HydrateClient } from "@/trpc/server";
import { Button, Input, MapCaller } from "@/components";
type Props = {
  searchParams?: Promise<{
    address?: string;
  }>;
};

export default async function Home({ searchParams: _searchParams }: Props) {
  const searchParams = await _searchParams;
  const address = searchParams?.address ?? "";
  // const hello = searchParams
  //   ? await api.yahoo.hello({ address }).catch(() => null)
  //   : null;

  return (
    <HydrateClient>
      <div className="relative h-screen w-full">
        <main className="relative z-10 mx-auto max-w-xl p-4">
          <form method="GET">
            <div className="flex gap-1">
              <Input
                type="text"
                name="address"
                defaultValue={address}
                placeholder="例: 東京都千代田区千代田1-1"
                className="bg-white"
              />
              <Button type="submit">検索</Button>
            </div>
          </form>
        </main>
        <div className="absolute z-10 bottom-4 left-4 right-4 bg-white p-4">
          <span>レストラン</span>
        </div>
        <div className="absolute inset-0 z-0">
          <MapCaller />
        </div>
      </div>
    </HydrateClient>
  );
}

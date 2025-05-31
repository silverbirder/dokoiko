import { api, HydrateClient } from "@/trpc/server";
import { MapCaller } from "@/components";
type Props = {
  searchParams?: Promise<{
    address?: string;
  }>;
};

export default async function Home({ searchParams: _searchParams }: Props) {
  const searchParams = await _searchParams;
  const address = searchParams?.address ?? "";
  const hello = searchParams
    ? await api.yahoo.hello({ address }).catch(() => null)
    : null;

  return (
    <HydrateClient>
      <main className="mx-auto max-w-xl p-4">
        <h1 className="mb-4 text-3xl font-bold">お出かけスポット検索</h1>
        <form method="GET" className="mb-6">
          <label htmlFor="address" className="mb-1 block font-semibold">
            住所を入力してください
          </label>
          <div className="flex">
            <input
              type="text"
              name="address"
              id="address"
              defaultValue={address}
              placeholder="例: 東京都千代田区千代田1-1"
              className="flex-1 rounded-l-md border px-3 py-2"
            />
            <button
              type="submit"
              className="rounded-r-md bg-blue-600 px-4 py-2 text-white"
            >
              検索
            </button>
          </div>
        </form>
        {hello ? (
          <>
            <h2 className="mt-4 text-xl font-bold">近くのレストラン:</h2>
            <ul className="mt-2 list-disc pl-6">
              {hello.results.map((result, index) => (
                <li key={index}>{result.name}</li>
              ))}
            </ul>
          </>
        ) : address ? (
          <p className="text-red-500">結果が見つかりませんでした。</p>
        ) : (
          <p>住所を入力して検索してください。</p>
        )}
        <MapCaller />
      </main>
    </HydrateClient>
  );
}

import { HydrateClient } from "@/trpc/server";
import {
  Button,
  Input,
  MapCaller,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  GoogleImage,
  Badge,
} from "@/components";
import { getPageHook } from "@/app/page.hook";

type Props = {
  searchParams?: Promise<{
    address?: string;
  }>;
};

export default async function Home({ searchParams: _searchParams }: Props) {
  const searchParams = await _searchParams;
  const address = searchParams?.address ?? "";

  const { results, markers, initialPosition } = await getPageHook(address);

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
        {results.length > 0 && (
          <div className="absolute right-0 bottom-4 left-0 z-10 overflow-x-auto p-4 whitespace-nowrap">
            <div className="flex gap-4">
              {results.map((item, index) => (
                <Card
                  key={index}
                  className="inline-block max-w-[350px] min-w-[300px]"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      {item.name && <CardTitle>{item.name}</CardTitle>}
                      {item.type && <Badge>{item.type}</Badge>}
                    </div>
                    {item.address && (
                      <CardDescription>{item.address}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {item.image && item.type === "google" ? (
                      <GoogleImage
                        photoReference={item.image}
                        altText={item.name ?? "施設画像"}
                      />
                    ) : item.image && item.type === "yahoo" ? (
                      <img
                        src={item.image}
                        alt={item.name ?? "施設画像"}
                        className="h-40 w-full rounded-md object-cover"
                      />
                    ) : null}
                  </CardContent>
                  {item.url && (
                    <CardFooter>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        詳細を見る
                      </a>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
        <div className="absolute inset-0 z-0">
          <MapCaller markers={markers} position={initialPosition} />
        </div>
      </div>
    </HydrateClient>
  );
}

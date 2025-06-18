import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="text-muted-foreground text-sm">
            Created by silverbirder
          </div>
          <Link
            href="https://sites.google.com/view/silverbirders-services"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm hover:underline"
          >
            More Services
          </Link>
        </div>
      </div>
    </footer>
  );
}

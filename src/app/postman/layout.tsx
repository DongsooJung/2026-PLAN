import { PostmanHeader } from "@/components/postman/postman-header";

export const dynamic = "force-dynamic";

export default function PostmanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <PostmanHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}

import { Header } from "@/components/layout/header";

export const dynamic = "force-dynamic";

export default function ConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}

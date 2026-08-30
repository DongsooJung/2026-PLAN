import { Header } from "@/components/layout/header";

export const dynamic = "force-dynamic";

export default function ConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const privateDataMode = process.env.SUBSCRIPTIONS_JSON !== undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Header privateDataMode={privateDataMode} />
      <main className="flex-1">{children}</main>
    </div>
  );
}

import { PingButton } from "@/components/shared/ping-button";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-semibold tracking-tight">Hello, World</h1>
      <p className="text-muted-foreground">
        SaaSX Admin — Next 16 · React 19 · Base UI (Nova)
      </p>
      <PingButton />
    </main>
  );
}

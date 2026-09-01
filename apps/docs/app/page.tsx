import { Link } from "@repo/ui/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold">YARAPA UI docs</h1>
      <p className="mt-3 text-fg-muted">
        Component documentation and interactive examples live in the Storybook
        workbench for <code className="font-mono text-sm">@repo/ui</code>.
      </p>
      <p className="mt-6">
        <Link href="https://6006.localhost">Open Storybook</Link>
      </p>
    </main>
  );
}

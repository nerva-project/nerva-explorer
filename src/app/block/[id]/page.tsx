import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlockHeaderByHeight, getBlockHeaderByHash } from "@/lib/nerva-api";
import { BlockDetailClient } from "@/components/explorer/detail-client";

type Params = { id: string };

type PageProps = {
  params: Promise<Params>;
};

// Generate a meaningful title for the page header.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const isHeight = /^\d+$/.test(id);
  return {
    title: isHeight
      ? `Block #${id} - Nerva Explorer`
      : `Block ${id.slice(0, 8)}... - Nerva Explorer`,
    description: `Details for Nerva block ${isHeight ? "#" + id : id.slice(0, 12) + "..."}`,
  };
}

export default async function BlockDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Try to fetch by height first if the id is purely numeric, otherwise
  // treat it as a block hash.
  let block;
  try {
    if (/^\d+$/.test(id)) {
      block = await getBlockHeaderByHeight(parseInt(id, 10));
    } else {
      block = await getBlockHeaderByHash(id);
    }
  } catch {
    notFound();
  }

  if (!block) notFound();

  return (
    <main className="min-h-screen flex flex-col">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--clr-accent)" }}
          >
            ← Back to explorer
          </Link>
        </div>
        <div
          className="overflow-hidden rounded-3xl border shadow-2xl"
          style={{
            background: "var(--clr-bg-surface)",
            borderColor: "var(--clr-border)",
          }}
        >
          <div
            className="sticky top-0 z-10 flex items-center justify-between border-b p-5 backdrop-blur-xl"
            style={{
              background: "color-mix(in srgb, var(--clr-bg-surface) 90%, transparent)",
              borderColor: "var(--clr-border)",
            }}
          >
            <div>
              <h1 className="text-lg font-bold" style={{ color: "var(--clr-text)" }}>
                Block #{block.height.toLocaleString()}
              </h1>
              <p className="text-xs" style={{ color: "var(--clr-text-muted)" }}>
                Block details
              </p>
            </div>
          </div>
          <div className="p-5">
            <BlockDetailClient block={block} />
          </div>
        </div>
      </div>
    </main>
  );
}

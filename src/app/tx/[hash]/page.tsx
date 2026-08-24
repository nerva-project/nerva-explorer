import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTransaction } from "@/lib/nerva-api";
import { TxDetailClient } from "@/components/explorer/detail-client";

type Params = { hash: string };

type PageProps = {
  params: Promise<Params>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hash } = await params;
  return {
    title: `Tx ${hash.slice(0, 8)}... - Nerva Explorer`,
    description: `Details for Nerva transaction ${hash.slice(0, 16)}...`,
  };
}

export default async function TxDetailPage({ params }: PageProps) {
  const { hash } = await params;

  let tx;
  try {
    tx = await getTransaction(hash);
  } catch {
    notFound();
  }

  if (!tx) notFound();

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
                Transaction
              </h1>
              <p className="text-xs" style={{ color: "var(--clr-text-muted)" }}>
                Transaction details
              </p>
            </div>
          </div>
          <div className="p-5">
            <TxDetailClient txDetail={tx} />
          </div>
        </div>
      </div>
    </main>
  );
}

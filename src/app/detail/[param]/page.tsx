import { redirect, notFound } from "next/navigation";
import { getBlockHeaderByHash } from "@/lib/nerva-api";

// Backward-compatibility for the old Vue explorer, which served every block and
// transaction under a single /detail/<param> route (param = a block height, a
// block hash, or a tx hash). The rewrite uses /block/<id> and /tx/<hash>, so old
// links that live in wallets, docs, forum posts, etc. would 404 without this
// shim. We map each param to its new canonical URL, mirroring the old parsing:
//   - all digits   -> block height -> /block/<param>
//   - 64 hex chars -> block or tx  -> probe the block endpoint, else treat as tx
//
// A temporary (307) redirect is used so that a transient upstream failure while
// probing a hash cannot get a wrong guess cached permanently by a client or CDN.

type PageProps = { params: Promise<{ param: string }> };

export default async function LegacyDetailRedirect({ params }: PageProps) {
  const { param } = await params;

  // Block height.
  if (/^\d+$/.test(param)) {
    redirect(`/block/${param}`);
  }

  // 64-char hash: could be a block hash or a tx hash. The old explorer tried the
  // block first and fell back to a transaction, so do the same. `redirect` is
  // called outside the try/catch because it works by throwing internally.
  if (/^[0-9a-fA-F]{64}$/.test(param)) {
    let isBlock = false;
    try {
      await getBlockHeaderByHash(param);
      isBlock = true;
    } catch {
      isBlock = false;
    }
    redirect(isBlock ? `/block/${param}` : `/tx/${param}`);
  }

  // Anything else was "Invalid search query" in the old explorer.
  notFound();
}

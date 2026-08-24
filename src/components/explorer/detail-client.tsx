"use client";

import { useState, useCallback } from "react";
import type { BlockHeader, TransactionDetail } from "@/lib/nerva-api";
import {
  BlockDetailContent,
  TxDetailContent,
} from "@/components/explorer/detail-modal";

// Client wrapper that manages the copy-to-clipboard state for the standalone
// block and transaction pages. The shared detail components expect a `copied`
// string and an `onCopy` callback; this wrapper wires them up.

export function BlockDetailClient({ block }: { block: BlockHeader }) {
  const [copied, setCopied] = useState<string | null>(null);

  const onCopy = useCallback((text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  return <BlockDetailContent block={block} copied={copied} onCopy={onCopy} />;
}

export function TxDetailClient({ txDetail }: { txDetail: TransactionDetail }) {
  const [copied, setCopied] = useState<string | null>(null);

  const onCopy = useCallback((text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  return (
    <TxDetailContent
      txDetail={txDetail}
      loading={false}
      copied={copied}
      onCopy={onCopy}
    />
  );
}

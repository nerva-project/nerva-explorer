// Unit tests for the Nerva API client.
//
// Run with: `npm test` (which invokes `node --test --import tsx ...`).
//
// These tests focus on the response-parsing logic that has historically been
// fragile (PHP warning prefixes, bare arrays vs `{"result":[...]}` wrappers,
// plain-number responses, etc.) and on URL encoding of user-supplied hashes.
// They do not hit the network: `fetch` is stubbed per-test.

import { test, describe, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import {
  parseJsonDefensively,
  getInfo,
  getBlockHeaders,
  getTxPool,
  getGeneratedCoins,
  getBlockHeaderByHash,
  getTransaction,
  type NetworkInfo,
  type BlockHeader,
  type TxPoolEntry,
} from "../nerva-api";

// ----- parseJsonDefensively -------------------------------------------------

describe("parseJsonDefensively", () => {
  test("parses a bare JSON array", () => {
    const input = JSON.stringify([
      { id_hash: "abc", fee: 1000 },
      { id_hash: "def", fee: 2000 },
    ]);
    const out = parseJsonDefensively(input);
    assert.ok(Array.isArray(out));
    assert.equal((out as Array<{ id_hash: string }>).length, 2);
    assert.equal((out as Array<{ id_hash: string }>)[0].id_hash, "abc");
  });

  test("parses a JSON object", () => {
    const input = JSON.stringify({ height: 123, difficulty: 456 });
    const out = parseJsonDefensively(input);
    assert.deepEqual(out, { height: 123, difficulty: 456 });
  });

  test("strips PHP warning HTML prefix", () => {
    const input =
      '<br /><b>Warning</b>: Undefined property: stdClass::$block_height in /var/www/index.php on line 42<br />\n{"result":[{"block_height":null,"in_pool":true}]}';
    const out = parseJsonDefensively(input) as { result: Array<{ block_height: null; in_pool: boolean }> };
    assert.ok(typeof out === "object" && out !== null);
    assert.ok(Array.isArray(out.result));
    assert.equal(out.result.length, 1);
    assert.equal(out.result[0].in_pool, true);
    assert.equal(out.result[0].block_height, null);
  });

  test("parses a bare array even with leading whitespace", () => {
    const input = "\n   \n  [{\"a\":1}]";
    const out = parseJsonDefensively(input);
    assert.ok(Array.isArray(out));
  });

  test("throws SyntaxError on truly invalid JSON", () => {
    assert.throws(() => parseJsonDefensively("not json at all"), SyntaxError);
  });
});

// ----- Fetch mock helpers ---------------------------------------------------

type FetchMock = ReturnType<typeof mock.fn<(input: string | URL, init?: unknown) => Promise<unknown>>>;

function mockFetch(
  responder: (url: string) => { status?: number; text: string; contentType?: string },
): FetchMock {
  const fn = async (url: string | URL) => {
    const u = typeof url === "string" ? url : url.toString();
    const r = responder(u);
    return {
      ok: r.status === undefined || (r.status >= 200 && r.status < 300),
      status: r.status ?? 200,
      headers: new Headers({ "content-type": r.contentType ?? "application/json" }),
      text: async () => r.text,
    };
  };
  const m = mock.fn(fn);
  globalThis.fetch = m as unknown as typeof globalThis.fetch;
  return m;
}

function restoreFetch() {
  // Restore the real fetch (Node ships a global fetch).
  // @ts-expect-error - delete to reset to the native implementation.
  delete globalThis.fetch;
}

// ----- getInfo --------------------------------------------------------------

describe("getInfo", () => {
  afterEach(() => {
    restoreFetch();
  });

  test("parses a normal get_info response", async () => {
    const sample: NetworkInfo = {
      height: 123456,
      difficulty: 2587340,
      tx_count: 99,
      tx_pool_size: 3,
      target: 60,
      target_height: 123456,
      top_block_hash: "abc",
      status: "OK",
      incoming_connections_count: 8,
      outgoing_connections_count: 4,
      white_peerlist_size: 100,
      grey_peerlist_size: 200,
      cumulative_difficulty: 999,
      block_size_limit: 100000,
      block_size_median: 50000,
      database_size: 1000000000,
      nettype: "mainnet",
      start_time: 1700000000,
    };
    mockFetch(() => ({ text: JSON.stringify(sample) }));
    const info = await getInfo();
    assert.equal(info.height, 123456);
    assert.equal(info.difficulty, 2587340);
  });

  test("throws on {\"error\":...} shape", async () => {
    mockFetch(() => ({
      text: JSON.stringify({ error: { code: -2, message: "Internal error" } }),
    }));
    await assert.rejects(() => getInfo(), /Internal error/);
  });

  test("strips PHP warning prefix and parses the JSON that follows", async () => {
    const sample: NetworkInfo = {
      height: 1,
      difficulty: 1,
      tx_count: 0,
      tx_pool_size: 0,
      target: 60,
      target_height: 1,
      top_block_hash: "",
      status: "OK",
      incoming_connections_count: 0,
      outgoing_connections_count: 0,
      white_peerlist_size: 0,
      grey_peerlist_size: 0,
      cumulative_difficulty: 0,
      block_size_limit: 0,
      block_size_median: 0,
      database_size: 0,
      nettype: "mainnet",
      start_time: 0,
    };
    const prefixed =
      '<br /><b>Warning</b>: Undefined property: stdClass::$foo in /srv/index.php on line 12<br />\n' +
      JSON.stringify(sample);
    mockFetch(() => ({ text: prefixed }));
    const info = await getInfo();
    assert.equal(info.height, 1);
  });
});

// ----- getBlockHeaders ------------------------------------------------------

describe("getBlockHeaders", () => {
  afterEach(restoreFetch);

  test("parses {\"headers\":[...]} wrapper", async () => {
    const headers: BlockHeader[] = [
      {
        height: 100, hash: "h100", prev_hash: "h099", timestamp: 1700000000,
        difficulty: 1, cumulative_difficulty: 2, reward: 3, block_size: 4,
        block_weight: 4, long_term_weight: 4, num_txes: 0, nonce: 5,
        orphan_status: false, depth: 0, major_version: 1, minor_version: 0,
        miner_tx_hash: "mt",
      },
    ];
    mockFetch(() => ({ text: JSON.stringify({ headers }) }));
    const out = await getBlockHeaders(100, 100);
    assert.equal(out.length, 1);
    assert.equal(out[0].height, 100);
  });

  test("returns empty array when headers key is missing", async () => {
    mockFetch(() => ({ text: JSON.stringify({}) }));
    const out = await getBlockHeaders(100, 100);
    assert.equal(out.length, 0);
  });
});

// ----- getTxPool ------------------------------------------------------------

describe("getTxPool", () => {
  afterEach(restoreFetch);

  test("parses a bare array", async () => {
    const pool: TxPoolEntry[] = [
      {
        id_hash: "tx1", fee: 1000, receive_time: 1700000000, weight: 1,
        blob_size: 100, kept_by_block: false, last_failed_id_hash: "",
        last_failed_height: 0, last_relayed_time: 1700000000,
        max_used_block_height: 0, relayed: true,
        do_not_relay: false, double_spend_seen: false,
      },
    ];
    mockFetch(() => ({ text: JSON.stringify(pool) }));
    const out = await getTxPool();
    assert.equal(out.length, 1);
    assert.equal(out[0].id_hash, "tx1");
    assert.equal(out[0].blob_size, 100);
  });

  test("parses {\"transactions\":[...]} wrapper", async () => {
    const pool: TxPoolEntry[] = [
      {
        id_hash: "tx2", fee: 2000, receive_time: 1700000001, weight: 2,
        blob_size: 200, kept_by_block: false, last_failed_id_hash: "",
        last_failed_height: 0, last_relayed_time: 1700000001,
        max_used_block_height: 0, relayed: true,
        do_not_relay: false, double_spend_seen: false,
      },
    ];
    mockFetch(() => ({ text: JSON.stringify({ transactions: pool }) }));
    const out = await getTxPool();
    assert.equal(out.length, 1);
    assert.equal(out[0].id_hash, "tx2");
  });

  test("tolerates PHP warning prefix on a bare array response", async () => {
    const pool: TxPoolEntry[] = [
      {
        id_hash: "tx3", fee: 3000, receive_time: 0, weight: 3,
        blob_size: 300, kept_by_block: false, last_failed_id_hash: "",
        last_failed_height: 0, last_relayed_time: 0,
        max_used_block_height: 0, relayed: true,
        do_not_relay: false, double_spend_seen: false,
      },
    ];
    const prefixed =
      '<br /><b>Warning</b>: Undefined index: receive_time<br />\n' + JSON.stringify(pool);
    mockFetch(() => ({ text: prefixed }));
    const out = await getTxPool();
    assert.equal(out.length, 1);
    assert.equal(out[0].id_hash, "tx3");
  });
});

// ----- getGeneratedCoins ----------------------------------------------------

describe("getGeneratedCoins", () => {
  afterEach(restoreFetch);

  test("parses a plain number response", async () => {
    mockFetch(() => ({ text: "18450000.123456" }));
    const coins = await getGeneratedCoins(123);
    assert.equal(coins, 18450000.123456);
  });

  test("parses a JSON object {generated_coins:N} response", async () => {
    mockFetch(() => ({ text: JSON.stringify({ generated_coins: 12345 }) }));
    const coins = await getGeneratedCoins(123);
    assert.equal(coins, 12345);
  });

  test("returns 0 on garbage", async () => {
    mockFetch(() => ({ text: "garbage" }));
    const coins = await getGeneratedCoins(123);
    assert.equal(coins, 0);
  });
});

// ----- getBlockHeaderByHash (URL encoding) ---------------------------------

describe("getBlockHeaderByHash URL encoding", () => {
  afterEach(restoreFetch);

  test("URL-encodes # in the hash parameter", async () => {
    let seenUrl = "";
    mockFetch((url) => {
      seenUrl = url;
      return {
        text: JSON.stringify({
          block_header: {
            height: 1, hash: "abc#def", prev_hash: "", timestamp: 0,
            difficulty: 0, cumulative_difficulty: 0, reward: 0, block_size: 0,
            block_weight: 0, long_term_weight: 0, num_txes: 0, nonce: 0,
            orphan_status: false, depth: 0, major_version: 1, minor_version: 0,
            miner_tx_hash: "",
          },
        }),
      };
    });
    await getBlockHeaderByHash("abc#def");
    // The # must be percent-encoded as %23 so it does not truncate the URL.
    assert.ok(seenUrl.includes("hash=abc%23def"), `URL was: ${seenUrl}`);
    assert.ok(!seenUrl.includes("hash=abc#def"), `URL contained unencoded #: ${seenUrl}`);
  });

  test("URL-encodes & in the hash parameter", async () => {
    let seenUrl = "";
    mockFetch((url) => {
      seenUrl = url;
      return {
        text: JSON.stringify({
          block_header: {
            height: 1, hash: "abc&def", prev_hash: "", timestamp: 0,
            difficulty: 0, cumulative_difficulty: 0, reward: 0, block_size: 0,
            block_weight: 0, long_term_weight: 0, num_txes: 0, nonce: 0,
            orphan_status: false, depth: 0, major_version: 1, minor_version: 0,
            miner_tx_hash: "",
          },
        }),
      };
    });
    await getBlockHeaderByHash("abc&def");
    assert.ok(seenUrl.includes("hash=abc%26def"), `URL was: ${seenUrl}`);
  });
});

// ----- getTransaction (URL encoding + shape handling) ----------------------

describe("getTransaction", () => {
  afterEach(restoreFetch);

  test("URL-encodes # in the hash parameter", async () => {
    let seenUrl = "";
    mockFetch((url) => {
      seenUrl = url;
      return { text: JSON.stringify([]) };
    });
    await getTransaction("abc#def");
    assert.ok(seenUrl.includes("hash%5B%5D=abc%23def"), `URL was: ${seenUrl}`);
  });

  test("parses {\"result\":[...]} wrapper and returns first element", async () => {
    mockFetch(() => ({
      text: JSON.stringify({
        result: [
          { tx_hash: "txhash", block_height: 100, in_pool: false },
        ],
      }),
    }));
    const tx = await getTransaction("txhash");
    assert.ok(tx);
    assert.equal(tx?.tx_hash, "txhash");
    assert.equal(tx?.block_height, 100);
  });

  test("parses a bare array (in-pool tx with PHP warning prefix)", async () => {
    const bareArray = [
      {
        tx_hash: "pooltx",
        block_height: null,
        in_pool: true,
        fee: 1000,
      },
    ];
    const prefixed =
      '<br /><b>Warning</b>: Undefined property: stdClass::$block_height in ...<br />\n' +
      JSON.stringify(bareArray);
    mockFetch(() => ({ text: prefixed }));
    const tx = await getTransaction("pooltx");
    assert.ok(tx);
    assert.equal(tx?.in_pool, true);
    assert.equal(tx?.block_height, null);
  });

  test("returns null when the array is empty", async () => {
    mockFetch(() => ({ text: JSON.stringify({ result: [] }) }));
    const tx = await getTransaction("doesnotexist");
    assert.equal(tx, null);
  });

  test("throws on {\"error\":...} shape", async () => {
    mockFetch(() => ({
      text: JSON.stringify({
        error: { code: -2, message: "Block not found" },
      }),
    }));
    await assert.rejects(() => getTransaction("xxx"), /Block not found/);
  });
});

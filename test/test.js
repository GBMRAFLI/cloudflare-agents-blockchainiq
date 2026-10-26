import test from "node:test"; import assert from "node:assert";
import { startMock, stubPayFetch } from "./mock.js";
import { getBrief, probe, resolveAccount } from "../src/client.js";
test("mock: 402 then paid 200 with settlement", async () => {
  const m = await startMock();
  try {
    const p = await probe("brief", m.url); assert.equal(p.status, 402); assert.equal(p.required.accepts[0].amount, "10000");
    const out = await getBrief({ baseUrl: m.url, payFetch: stubPayFetch });
    assert.equal(out.settlement.transaction, "0xmocktx"); assert.ok(out.data.assets);
  } finally { m.close(); }
});
test("no signer configured -> clear error", async () => { await assert.rejects(resolveAccount({}), /No signer/); });
test("live: unpaid brief returns 402 for $0.01 on Base", { skip: process.env.SKIP_LIVE === "1" }, async () => {
  const p = await probe("brief");
  assert.equal(p.status, 402); assert.equal(p.required.accepts[0].network, "eip155:8453"); assert.equal(p.required.accepts[0].amount, "10000");
});
test("real x402 signature with throwaway key, verified by mock (never live)", async () => {
  const { generatePrivateKey, privateKeyToAccount } = await import("viem/accounts");
  const { createPayFetch } = await import("../src/client.js");
  const { seen } = await import("./mock.js");
  const m = await startMock();
  try {
    const acct = privateKeyToAccount(generatePrivateKey());
    const out = await getBrief({ baseUrl: m.url, payFetch: createPayFetch(acct) });
    assert.equal(out.settlement.verified, true); assert.equal(out.settlement.payer.toLowerCase(), acct.address.toLowerCase());
    const s = seen.at(-1); assert.equal(s.value, "10000");
  } finally { m.close(); }
});

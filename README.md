# Cloudflare Agents + Blockchain IQ (x402)

A [Cloudflare Agents](https://developers.cloudflare.com/agents/) example: `MarketBriefAgent` buys a crypto market brief from [Blockchain IQ](https://www.blockchainiq.co) per request using the [x402](https://x402.org) standard. No account or API key; it pays $0.01 in USDC on Base and stores the latest brief and settlement in Agent state.

- `GET /agents/market-brief-agent/default` -> `brief` ($0.01)
- `GET /agents/market-brief-agent/default?resource=event-risk&days=7` -> `event-risk` ($0.05)

## Deploy
```bash
npm install
npx wrangler secret put BIQ_PRIVATE_KEY
npm run deploy
```

## Configuration (env only, never commit keys)
| Variable | Purpose |
|---|---|
| `BIQ_PRIVATE_KEY` | Hex private key of a Base wallet holding a little USDC |
| `BIQ_SIGNER_MODULE` | Alternative: path to an ES module exporting a viem `account` (or async factory), e.g. a remote/KMS signer |
| `BIQ_MAX_USD` | Per-call spend cap in dollars (default 0.06) |
| `BIQ_BASE_URL` | Override API base (default `https://www.blockchainiq.co/api/x402/v1`) |

## Make one paid call ($0.01)
```bash
npm install
npm run probe                               # unpaid: shows the 402 price, no signing
BIQ_PRIVATE_KEY=0x... BIQ_CONFIRM_PAID=yes npm run paid-call
```
Prints the brief and the settlement (payer, network, transaction hash) from the `PAYMENT-RESPONSE` header.

## Tests
`npm test` runs against a local mock x402 server plus an unpaid live 402 check (`SKIP_LIVE=1` to skip). No payment is made.

## License
MIT

## Local dev
`npm run mock` starts a mock x402 server on :8799. Put `BIQ_BASE_URL=http://127.0.0.1:8799` and a throwaway key in `.dev.vars`, run `npx wrangler dev`, then `curl localhost:8787/agents/market-brief-agent/default`. Add `?probe=1` for an unpaid price check against the live API.

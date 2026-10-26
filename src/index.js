// Cloudflare Agents example: an Agent that fetches a paid Blockchain IQ brief via x402.
import { Agent, routeAgentRequest } from "agents";
import { getBrief, getEventRisk, probe, DEFAULT_BASE_URL } from "./client.js";

export class MarketBriefAgent extends Agent {
  async onRequest(request) {
    const url = new URL(request.url);
    // Secrets (BIQ_PRIVATE_KEY) come from `wrangler secret put`, never from code.
    if (url.searchParams.get("probe")) {
      // Unpaid: report the price quoted by the API, no signing.
      return Response.json(await probe(url.searchParams.get("resource") || "brief", this.env.BIQ_PROBE_URL || this.env.BIQ_BASE_URL || DEFAULT_BASE_URL));
    }
    const opts = { env: this.env };
    const out = url.searchParams.get("resource") === "event-risk"
      ? await getEventRisk(Number(url.searchParams.get("days") ?? 7), opts)
      : await getBrief(opts);
    this.setState({ lastBrief: out.data, lastSettlement: out.settlement, at: Date.now() });
    return Response.json(out);
  }
}

export default {
  async fetch(request, env) {
    return (await routeAgentRequest(request, env)) ?? new Response("Try /agents/market-brief-agent/default", { status: 404 });
  },
};

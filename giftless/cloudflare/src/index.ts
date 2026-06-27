// PortalJS — Giftless LFS host on Cloudflare Containers (staging).
//
// Giftless is a long-running uwsgi/WSGI service (NOT a Worker). We run the
// giftless/ Docker image as a Cloudflare Container and put this thin Worker in
// front of it for TLS, hostname routing, and edge entry. The Worker does NOT
// implement any LFS logic — it forwards every request to the container, which
// brokers LFS metadata and signs presigned R2 URLs (file bytes go client<->R2
// directly, so this stays a light, low-bandwidth workload).
//
// Why a singleton container: Giftless is stateless (it holds no per-request
// state; R2 is the store), so one warm instance serves all repos. getByName with
// a fixed id pins every request to that single Durable-Object-backed instance,
// which scales to zero after `sleepAfter` and wakes on the next request.

import { Container, getContainer } from "@cloudflare/containers";

export interface Env {
  GIFTLESS: DurableObjectNamespace<GiftlessContainer>;
  // Secrets (wrangler secret put ...) — never committed. See cloudflare/README.md.
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  // RS256 prod keypair (po-g9y.11): public verifies all tokens, private signs
  // Giftless's own verify callbacks. See giftless.yaml + cloudflare/README.
  GIFTLESS_JWT_PUBLIC_KEY: string;
  GIFTLESS_JWT_PRIVATE_KEY: string;
  // Plain vars (wrangler.jsonc [vars]).
  R2_ENDPOINT: string;
  R2_REGION: string;
}

export class GiftlessContainer extends Container<Env> {
  // The image's uwsgi listens on :5000 (plain HTTP; edge terminates TLS).
  defaultPort = 5000;
  requiredPorts = [5000];

  // Scale to zero when idle. Giftless only brokers metadata + signs URLs, so a
  // cold wake is cheap; 10m is a fine staging tradeoff between cost and the
  // cold-start hit on the first request after idle (see bead CAVEAT / README).
  sleepAfter = "10m";

  // Giftless boto3 client needs outbound HTTPS to the R2 S3 endpoint.
  enableInternet = true;

  constructor(ctx: DurableObjectState<{}>, env: Env) {
    super(ctx, env);
    // Inject R2 creds + the JWT keypair into the container process. boto3 reads
    // the R2 token as the standard AWS_* names; the entrypoint writes the two
    // GIFTLESS_JWT_*_KEY PEMs to /etc/giftless/. Sourced from Worker secrets/vars,
    // never baked in.
    this.envVars = {
      AWS_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
      R2_ENDPOINT: env.R2_ENDPOINT,
      R2_REGION: env.R2_REGION || "auto",
      GIFTLESS_JWT_PUBLIC_KEY: env.GIFTLESS_JWT_PUBLIC_KEY,
      GIFTLESS_JWT_PRIVATE_KEY: env.GIFTLESS_JWT_PRIVATE_KEY,
    };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Single warm instance fronts all repos (Giftless is stateless — see above).
    const container = getContainer(env.GIFTLESS, "giftless");
    return container.fetch(request);
  },
};

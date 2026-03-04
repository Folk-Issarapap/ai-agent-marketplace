import { buildProxyAgentTargetUrl, getProxyAgentById } from "@/lib/proxy-agent-registry";

export const maxDuration = 60;

const log = (msg: string, ...args: unknown[]) => {
  const time = new Date().toISOString();
  console.log(`[${time}] [Admin Agent Proxy] ${msg}`, ...args);
};

function detectUpstreamErrorKind(text: string): "rate_limit" | "generic" {
  const t = text.toLowerCase();
  if (
    t.includes("rate_limit_exceeded") ||
    t.includes("request too large") ||
    t.includes("too large for model") ||
    t.includes("tokens per minute") ||
    t.includes("tpm")
  ) {
    return "rate_limit";
  }
  return "generic";
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agent = getProxyAgentById(id);

  if (!agent) {
    return new Response(
      JSON.stringify({
        error: "Agent not found",
      }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const targetUrl = buildProxyAgentTargetUrl(agent);
  log(
    "Forwarding POST /api/agents/%s/chat -> %s (transport=%s)",
    id,
    targetUrl,
    agent.chatTransport
  );
  const body = await req.text();
  const accept = req.headers.get("accept");
  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accept ? { Accept: accept } : {}),
      },
      body,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach upstream agent";
    log("Upstream fetch failed:", message);
    return new Response(
      JSON.stringify({
        error: "Agent service unavailable",
        message,
        targetUrl,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!upstream.ok) {
    const errorText = await upstream.text();
    log("Upstream error:", upstream.status, upstream.statusText);
    const kind = detectUpstreamErrorKind(errorText);
    const retryAfter = upstream.headers.get("retry-after");

    if (kind === "rate_limit") {
      return new Response(
        JSON.stringify({
          error: "Agent request limit reached",
          code: "RATE_LIMIT",
          message:
            "คำขอนี้ยาวเกินขีดจำกัดชั่วคราวของโมเดล กรุณาลดความยาวข้อความหรือเริ่มแชทใหม่",
          retryAfterSeconds: retryAfter ? Number(retryAfter) : undefined,
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(errorText, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  }

  log("Upstream response OK (streaming)");
  return new Response(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });
}

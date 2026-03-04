import { createAgentUIStreamResponse, type Agent } from 'ai';
import { financeAgent } from './agent/finance-agent';
import { fitnessAgent } from './agent/fitness-agent';
import { studyAgent } from './agent/study-agent';
import { travelAgent } from './agent/travel-agent';
import { weatherAgent } from './agent/weather-agent';

const PORT = 3010;

const AGENTS = {
  finance: { agent: financeAgent, name: 'Personal Finance Advisor' },
  fitness: { agent: fitnessAgent, name: 'Fitness Coach' },
  study: { agent: studyAgent, name: 'Study Coach' },
  travel: { agent: travelAgent, name: 'Travel Planner' },
  weather: { agent: weatherAgent, name: 'Weather Assistant' },
} as const;

type AgentKey = keyof typeof AGENTS;

const AGENT_KEYS: AgentKey[] = ['finance', 'fitness', 'study', 'travel', 'weather'];

function isAgentKey(name: string): name is AgentKey {
  return AGENT_KEYS.includes(name as AgentKey);
}

const log = (msg: string, ...args: unknown[]) => {
  const time = new Date().toISOString();
  console.log(`[${time}] [Agents Server] ${msg}`, ...args);
};

const server = Bun.serve({
  port: PORT,
  async fetch(req): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
      log('GET', url.pathname);
      return new Response(
        JSON.stringify({
          server: 'Bun.serve',
          project: 'agents-server',
          ok: true,
          port: PORT,
          agents: AGENT_KEYS.map((key) => ({
            id: key,
            name: AGENTS[key].name,
            chatEndpoint: `POST /api/chat/agent/${key}`,
          })),
          endpointPattern: 'POST /api/chat/agent/:agent',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const chatMatch = url.pathname.match(/^\/api\/chat\/agent\/([^/]+)\/?$/);
    if (req.method === 'POST' && chatMatch) {
      const agentName = chatMatch[1];
      if (!isAgentKey(agentName)) {
        return new Response(
          JSON.stringify({
            error: 'Unknown agent',
            agent: agentName,
            available: AGENT_KEYS,
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      log('Incoming request:', req.method, url.pathname, 'agent:', agentName);

      let body: { messages?: unknown[] };
      try {
        body = (await req.json()) as { messages?: unknown[] };
      } catch (e) {
        log('Invalid JSON body', e);
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const messages = body.messages ?? [];
      log('POST /api/chat/agent/' + agentName, '— messages count:', messages.length);

      try {
        const { agent } = AGENTS[agentName];
        log('Starting agent stream:', agentName);
        const response = await createAgentUIStreamResponse({
          agent: agent as unknown as Agent,
          uiMessages: messages,
        });
        log('Agent stream created, returning response');
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error ? err.stack : undefined;
        log('Agent error:', agentName, message);
        if (stack) console.error(stack);
        return new Response(
          JSON.stringify({ error: message, details: stack?.split('\n').slice(0, 5) }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response('Not Found', { status: 404 });
  },
});

log('Server listening on http://localhost:' + server.port);
log('Agents:', AGENT_KEYS.join(', '));
log('Chat: POST /api/chat/agent/:agent  (e.g. /api/chat/agent/finance)');
log('Ensure GROQ_API_KEY is set in .env (or in each ai-agent-* folder if needed)');

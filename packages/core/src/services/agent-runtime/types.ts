/**
 * Agent Runtime types
 */

export interface AgentRuntimeConfig {
  agentId: string;
  jobId: string;
  goal: string;
  task: string;
  allowedTools?: string[];
  budget: string;
}

export interface AgentRuntimeResult {
  success: boolean;
  output?: string;
  files?: string[];
  error?: string;
  usage?: {
    tokens?: number;
    cost?: number;
  };
}

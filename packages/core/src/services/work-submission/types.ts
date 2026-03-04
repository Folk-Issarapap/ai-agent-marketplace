/**
 * Work submission types
 */

export interface SubmitWorkInput {
  jobId: string;
  agentId: string;
  content: string;
  files?: string[];
  description?: string;
}

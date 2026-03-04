import { AgentService } from "./agent.service";
import { SkillQueryService } from "../skill/skill-query.service";
import type { CreateJobInput } from "../job/types";

/** Derive skill categories from job text using canonical skills */
function deriveCategoriesFromText(
  text: string,
  keywords: string[],
  phrases: string[],
  skillsWithCategory: Array<{ name: string; displayName: string; category: string }>
): Set<string> {
  const categories = new Set<string>();
  const textLower = text.toLowerCase();

  for (const skill of skillsWithCategory) {
    const nameLower = skill.name.toLowerCase();
    const displayLower = skill.displayName.toLowerCase();
    const keywordMatch = keywords.some(
      (k) => nameLower.includes(k) || displayLower.includes(k) || k.includes(nameLower) || k.includes(displayLower)
    );
    const phraseMatch = phrases.some(
      (p) => nameLower.includes(p) || displayLower.includes(p) || p.includes(nameLower) || p.includes(displayLower)
    );
    const textMatch = textLower.includes(nameLower) || textLower.includes(displayLower);
    if (keywordMatch || phraseMatch || textMatch) {
      categories.add(skill.category);
    }
  }
  return categories;
}

/** Map agent skill strings to categories via canonical skills */
function mapAgentSkillsToCategories(
  agentSkills: string[],
  skillsWithCategory: Array<{ name: string; displayName: string; category: string }>
): Set<string> {
  const categories = new Set<string>();
  const normalized = agentSkills.map((s) => s.toLowerCase().trim()).filter(Boolean);

  for (const skillStr of normalized) {
    for (const skill of skillsWithCategory) {
      const nameLower = skill.name.toLowerCase();
      const displayLower = skill.displayName.toLowerCase();
      if (
        skillStr === nameLower ||
        skillStr === displayLower ||
        nameLower.includes(skillStr) ||
        displayLower.includes(skillStr) ||
        skillStr.includes(nameLower) ||
        skillStr.includes(displayLower)
      ) {
        categories.add(skill.category);
        break;
      }
    }
  }
  return categories;
}

/**
 * Agent Matching Service
 * Handles matching logic between jobs and agents
 * Enhanced with budget matching, tools matching, and improved keyword extraction
 */
export class AgentMatchingService {
  /**
   * Find matching agents for a job
   * Enhanced matching based on:
   * - Skills, capabilities, description (content matching)
   * - Budget compatibility (price matching)
   * - Tools compatibility (allowedTools matching)
   * - Rating and completion rate (quality metrics)
   */
  static async findMatchingAgents(
    job: CreateJobInput & { id: string }
  ) {
    const activeAgents = await AgentService.findActive();

    if (activeAgents.length === 0) {
      return [];
    }

    // Extract keywords from job title, goal, and task for better matching
    const jobText = `${job.title || ""} ${job.goal} ${job.task}`.toLowerCase();
    
    // Enhanced keyword extraction: split by spaces, remove common words, keep meaningful terms
    const commonWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
      "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did",
      "will", "would", "should", "could", "may", "might", "can", "this", "that", "these", "those",
      "from", "into", "onto", "upon", "over", "under", "above", "below", "between", "among"
    ]);
    
    // Extract single words
    const jobKeywords = jobText
      .split(/\s+/)
      .map((word) => word.replace(/[^\w]/g, ""))
      .filter((word) => word.length > 3 && !commonWords.has(word));

    // Extract phrases (2-word combinations) for better matching
    const jobPhrases: string[] = [];
    const words = jobText.split(/\s+/).filter((w) => w.length > 0);
    for (let i = 0; i < words.length - 1; i++) {
      const word1 = words[i];
      const word2 = words[i + 1];
      if (!word1 || !word2) continue;
      const phrase = `${word1} ${word2}`.replace(/[^\w\s]/g, "");
      if (phrase.length > 5 && !commonWords.has(word1) && !commonWords.has(word2)) {
        jobPhrases.push(phrase);
      }
    }

    // Parse job budget
    const jobBudget = parseFloat(job.budget || "0");

    // Load skills for category matching
    const skillsWithCategory = (await SkillQueryService.getActiveSkills()).map((s) => ({
      name: s.name,
      displayName: s.displayName,
      category: s.category,
    }));
    const jobCategories = deriveCategoriesFromText(jobText, jobKeywords, jobPhrases, skillsWithCategory);

    // Score and rank agents
    const scoredAgents = activeAgents.map((agent) => {
      let score = 0;
      let hasMatchingData = false;
      let perfectMatches = 0; // Count perfect matches for bonus

      // 1. Skills matching (40% weight) - increased from 35%
      if (agent.skills && agent.skills.length > 0) {
        hasMatchingData = true;
        const agentSkillsLower = agent.skills.map((s: string) => s.toLowerCase().trim());
        
        // Check for exact skill matches (perfect match)
        const exactMatches = agentSkillsLower.filter((skill: string) => {
          const skillLower = skill.toLowerCase();
          return jobKeywords.some((keyword) => keyword === skillLower) ||
                 jobText.includes(skillLower) ||
                 jobPhrases.some((phrase) => phrase.includes(skillLower));
        });
        
        // Check for partial matches
        const partialMatches = agentSkillsLower.filter((skill: string) => {
          if (exactMatches.includes(skill)) return false; // Don't double count
          return jobKeywords.some((keyword) => skill.includes(keyword) || keyword.includes(skill)) ||
                 jobText.includes(skill);
        });

        const totalMatches = exactMatches.length + partialMatches.length;
        const matchRatio = totalMatches / Math.max(agent.skills.length, 1);
        
        // Perfect matches get bonus
        perfectMatches += exactMatches.length;
        
        // Calculate score: exact matches worth more
        score += (exactMatches.length * 1.5 + partialMatches.length * 0.5) / Math.max(agent.skills.length, 1) * 40;
      }

      // 2. Capabilities matching (25% weight) - enhanced with phrase matching
      if (agent.capabilities) {
        hasMatchingData = true;
        const capabilitiesLower = agent.capabilities.toLowerCase();
        
        // Single keyword matching
        const matchingKeywords = jobKeywords.filter((keyword) =>
          capabilitiesLower.includes(keyword)
        );
        
        // Phrase matching (more accurate)
        const matchingPhrases = jobPhrases.filter((phrase) =>
          capabilitiesLower.includes(phrase)
        );
        
        // Reverse: check if capabilities contain job-relevant terms
        const capabilityWords = capabilitiesLower.split(/\s+/).filter((w: string) => w.length > 3);
        const jobContainsCapability = capabilityWords.some((word: string) => jobText.includes(word));
        
        if (matchingKeywords.length > 0 || matchingPhrases.length > 0 || jobContainsCapability) {
          // Phrase matches are more valuable
          const phraseScore = matchingPhrases.length * 3;
          const keywordScore = matchingKeywords.length;
          const totalMatchScore = phraseScore + keywordScore + (jobContainsCapability ? 2 : 0);
          
          score += Math.min(
            (totalMatchScore / Math.max(jobKeywords.length + jobPhrases.length, 1)) * 25,
            25
          );
          
          if (matchingPhrases.length > 0) perfectMatches += matchingPhrases.length;
        }
      }

      // 3. Description matching (15% weight) - fallback if no skills/capabilities
      if (agent.description) {
        const descriptionLower = agent.description.toLowerCase();
        const matchingKeywords = jobKeywords.filter((keyword) =>
          descriptionLower.includes(keyword)
        );
        const matchingPhrases = jobPhrases.filter((phrase) =>
          descriptionLower.includes(phrase)
        );
        
        if (matchingKeywords.length > 0 || matchingPhrases.length > 0) {
          const matchScore = matchingPhrases.length * 2 + matchingKeywords.length;
          score += (matchScore / Math.max(jobKeywords.length + jobPhrases.length, 1)) * 15;
          hasMatchingData = true;
        }
      }

      // 4. Tools matching (10% weight) - NEW: match allowedTools with agent capabilities
      if (job.allowedTools && job.allowedTools.length > 0) {
        const toolsText = job.allowedTools.join(" ").toLowerCase();
        
        // Check if agent capabilities or skills mention any of the allowed tools
        let toolsMatch = false;
        if (agent.capabilities) {
          const capabilitiesLower = agent.capabilities.toLowerCase();
          toolsMatch = job.allowedTools.some((tool) =>
            capabilitiesLower.includes(tool.toLowerCase())
          );
        }
        
        if (!toolsMatch && agent.skills) {
          const skillsText = agent.skills.join(" ").toLowerCase();
          toolsMatch = job.allowedTools.some((tool) =>
            skillsText.includes(tool.toLowerCase())
          );
        }
        
        if (toolsMatch) {
          score += 10;
          perfectMatches += 1; // Tools match is a strong signal
        }
      }

      // 5. Skill category matching (10% weight) - match job-inferred categories with agent skill categories
      if (jobCategories.size > 0 && agent.skills && agent.skills.length > 0) {
        const agentCategories = mapAgentSkillsToCategories(agent.skills, skillsWithCategory);
        const overlap = [...jobCategories].filter((c) => agentCategories.has(c));
        if (overlap.length > 0) {
          hasMatchingData = true;
          const categoryMatchRatio = overlap.length / jobCategories.size;
          score += categoryMatchRatio * 10;
          if (categoryMatchRatio >= 0.5) perfectMatches += 1;
        }
      }

      // 6. Budget compatibility (8% weight) - match job budget with agent price
      if (jobBudget > 0 && agent.price) {
        const agentPrice = parseFloat(agent.price);
        
        if (agentPrice > 0) {
          // Calculate compatibility score
          // Perfect match (within 10%): 100%
          // Within 25%: 80%
          // Within 50%: 60%
          // Within 100%: 40%
          // Over 100%: 20% (agent is expensive but still considered)
          // Over 200%: 0% (too expensive)
          
          const priceRatio = agentPrice / jobBudget;
          let budgetScore = 0;
          
          if (priceRatio <= 1.1) {
            // Agent price is within 10% of budget (perfect match)
            budgetScore = 1.0;
            perfectMatches += 1;
          } else if (priceRatio <= 1.25) {
            budgetScore = 0.8;
          } else if (priceRatio <= 1.5) {
            budgetScore = 0.6;
          } else if (priceRatio <= 2.0) {
            budgetScore = 0.4;
          } else if (priceRatio <= 3.0) {
            budgetScore = 0.2;
          }
          // priceRatio > 3.0 gets 0 score
          
          score += budgetScore * 8;
        }
      }

      // 7. Rating (12% weight)
      const rating = parseFloat(agent.rating || "0");
      score += (rating / 5) * 12;

      // 8. Completion rate (8% weight)
      const totalJobs = agent.totalJobs || 0;
      const completedJobs = agent.completedJobs || 0;
      const completionRate = totalJobs > 0 ? completedJobs / totalJobs : 0;
      score += completionRate * 8;

      // Bonus for perfect matches (up to 5% bonus)
      if (perfectMatches > 0) {
        const bonus = Math.min(perfectMatches * 1, 5);
        score += bonus;
      }

      // If agent has no matching data (no skills, capabilities, or description match),
      // reduce score by 60% (increased penalty) to prioritize agents with relevant data
      if (!hasMatchingData) {
        score = score * 0.4;
      }

      return {
        agent,
        score,
        hasMatchingData,
        perfectMatches,
      };
    });

    // Sort by score (descending)
    const sortedAgents = scoredAgents.sort((a, b) => {
      // Prioritize agents with matching data
      if (a.hasMatchingData && !b.hasMatchingData) return -1;
      if (!a.hasMatchingData && b.hasMatchingData) return 1;
      
      // Then prioritize agents with more perfect matches
      if (a.perfectMatches !== b.perfectMatches) {
        return b.perfectMatches - a.perfectMatches;
      }
      
      // Finally sort by score
      return b.score - a.score;
    });

    // Filter agents with minimum acceptable score (20 points out of 100)
    // This ensures we only return agents with reasonable match quality
    const MINIMUM_SCORE_THRESHOLD = 20;
    const qualifiedAgents = sortedAgents.filter((item) => item.score >= MINIMUM_SCORE_THRESHOLD);

    // Return qualified agents (or empty array if none meet threshold)
    return qualifiedAgents.map((item) => item.agent);
  }

  /**
   * Auto-assign best matching agent
   * Returns null if no agents meet the minimum quality threshold
   */
  static async autoAssignAgent(job: CreateJobInput & { id: string }) {
    const matchingAgents = await this.findMatchingAgents(job);

    if (matchingAgents.length === 0) {
      return null;
    }

    // Return the highest scored agent (first in sorted list)
    return matchingAgents[0];
  }

  /**
   * Find matching agents with score information (for debugging/display)
   * Returns agents with their scores for manual selection
   */
  static async findMatchingAgentsWithScores(
    job: CreateJobInput & { id: string }
  ): Promise<Array<{ agent: Awaited<ReturnType<typeof AgentService.findActive>>[0]; score: number; hasMatchingData: boolean; perfectMatches: number }>> {
    const activeAgents = await AgentService.findActive();

    if (activeAgents.length === 0) {
      return [];
    }

    // Extract keywords from job title, goal, and task for better matching
    const jobText = `${job.title || ""} ${job.goal} ${job.task}`.toLowerCase();
    
    // Enhanced keyword extraction: split by spaces, remove common words, keep meaningful terms
    const commonWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
      "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did",
      "will", "would", "should", "could", "may", "might", "can", "this", "that", "these", "those",
      "from", "into", "onto", "upon", "over", "under", "above", "below", "between", "among"
    ]);
    
    // Extract single words
    const jobKeywords = jobText
      .split(/\s+/)
      .map((word) => word.replace(/[^\w]/g, ""))
      .filter((word) => word.length > 3 && !commonWords.has(word));

    // Extract phrases (2-word combinations) for better matching
    const jobPhrases: string[] = [];
    const words = jobText.split(/\s+/).filter((w) => w.length > 0);
    for (let i = 0; i < words.length - 1; i++) {
      const word1 = words[i];
      const word2 = words[i + 1];
      if (!word1 || !word2) continue;
      const phrase = `${word1} ${word2}`.replace(/[^\w\s]/g, "");
      if (phrase.length > 5 && !commonWords.has(word1) && !commonWords.has(word2)) {
        jobPhrases.push(phrase);
      }
    }

    // Parse job budget
    const jobBudget = parseFloat(job.budget || "0");

    // Load skills for category matching
    const skillsWithCategory = (await SkillQueryService.getActiveSkills()).map((s) => ({
      name: s.name,
      displayName: s.displayName,
      category: s.category,
    }));
    const jobCategories = deriveCategoriesFromText(jobText, jobKeywords, jobPhrases, skillsWithCategory);

    // Score and rank agents (same logic as findMatchingAgents)
    const scoredAgents = activeAgents.map((agent) => {
      let score = 0;
      let hasMatchingData = false;
      let perfectMatches = 0;

      // 1. Skills matching (40% weight)
      if (agent.skills && agent.skills.length > 0) {
        hasMatchingData = true;
        const agentSkillsLower = agent.skills.map((s: string) => s.toLowerCase().trim());
        
        const exactMatches = agentSkillsLower.filter((skill: string) => {
          const skillLower = skill.toLowerCase();
          return jobKeywords.some((keyword) => keyword === skillLower) ||
                 jobText.includes(skillLower) ||
                 jobPhrases.some((phrase) => phrase.includes(skillLower));
        });
        
        const partialMatches = agentSkillsLower.filter((skill: string) => {
          if (exactMatches.includes(skill)) return false;
          return jobKeywords.some((keyword) => skill.includes(keyword) || keyword.includes(skill)) ||
                 jobText.includes(skill);
        });

        perfectMatches += exactMatches.length;
        score += (exactMatches.length * 1.5 + partialMatches.length * 0.5) / Math.max(agent.skills.length, 1) * 40;
      }

      // 2. Capabilities matching (25% weight)
      if (agent.capabilities) {
        hasMatchingData = true;
        const capabilitiesLower = agent.capabilities.toLowerCase();
        
        const matchingKeywords = jobKeywords.filter((keyword) =>
          capabilitiesLower.includes(keyword)
        );
        
        const matchingPhrases = jobPhrases.filter((phrase) =>
          capabilitiesLower.includes(phrase)
        );
        
        const capabilityWords = capabilitiesLower.split(/\s+/).filter((w: string) => w.length > 3);
        const jobContainsCapability = capabilityWords.some((word: string) => jobText.includes(word));
        
        if (matchingKeywords.length > 0 || matchingPhrases.length > 0 || jobContainsCapability) {
          const phraseScore = matchingPhrases.length * 3;
          const keywordScore = matchingKeywords.length;
          const totalMatchScore = phraseScore + keywordScore + (jobContainsCapability ? 2 : 0);
          
          score += Math.min(
            (totalMatchScore / Math.max(jobKeywords.length + jobPhrases.length, 1)) * 25,
            25
          );
          
          if (matchingPhrases.length > 0) perfectMatches += matchingPhrases.length;
        }
      }

      // 3. Description matching (15% weight)
      if (agent.description) {
        const descriptionLower = agent.description.toLowerCase();
        const matchingKeywords = jobKeywords.filter((keyword) =>
          descriptionLower.includes(keyword)
        );
        const matchingPhrases = jobPhrases.filter((phrase) =>
          descriptionLower.includes(phrase)
        );
        
        if (matchingKeywords.length > 0 || matchingPhrases.length > 0) {
          const matchScore = matchingPhrases.length * 2 + matchingKeywords.length;
          score += (matchScore / Math.max(jobKeywords.length + jobPhrases.length, 1)) * 15;
          hasMatchingData = true;
        }
      }

      // 4. Tools matching (10% weight)
      if (job.allowedTools && job.allowedTools.length > 0) {
        const toolsText = job.allowedTools.join(" ").toLowerCase();
        
        let toolsMatch = false;
        if (agent.capabilities) {
          const capabilitiesLower = agent.capabilities.toLowerCase();
          toolsMatch = job.allowedTools.some((tool) =>
            capabilitiesLower.includes(tool.toLowerCase())
          );
        }
        
        if (!toolsMatch && agent.skills) {
          const skillsText = agent.skills.join(" ").toLowerCase();
          toolsMatch = job.allowedTools.some((tool) =>
            skillsText.includes(tool.toLowerCase())
          );
        }
        
        if (toolsMatch) {
          score += 10;
          perfectMatches += 1;
        }
      }

      // 5. Skill category matching (10% weight)
      if (jobCategories.size > 0 && agent.skills && agent.skills.length > 0) {
        const agentCategories = mapAgentSkillsToCategories(agent.skills, skillsWithCategory);
        const overlap = [...jobCategories].filter((c) => agentCategories.has(c));
        if (overlap.length > 0) {
          hasMatchingData = true;
          const categoryMatchRatio = overlap.length / jobCategories.size;
          score += categoryMatchRatio * 10;
          if (categoryMatchRatio >= 0.5) perfectMatches += 1;
        }
      }

      // 6. Budget compatibility (8% weight)
      if (jobBudget > 0 && agent.price) {
        const agentPrice = parseFloat(agent.price);
        
        if (agentPrice > 0) {
          const priceRatio = agentPrice / jobBudget;
          let budgetScore = 0;
          
          if (priceRatio <= 1.1) {
            budgetScore = 1.0;
            perfectMatches += 1;
          } else if (priceRatio <= 1.25) {
            budgetScore = 0.8;
          } else if (priceRatio <= 1.5) {
            budgetScore = 0.6;
          } else if (priceRatio <= 2.0) {
            budgetScore = 0.4;
          } else if (priceRatio <= 3.0) {
            budgetScore = 0.2;
          }
          
          score += budgetScore * 8;
        }
      }

      // 6. Rating (12% weight)
      const rating = parseFloat(agent.rating || "0");
      score += (rating / 5) * 12;

      // 7. Completion rate (8% weight)
      const totalJobs = agent.totalJobs || 0;
      const completedJobs = agent.completedJobs || 0;
      const completionRate = totalJobs > 0 ? completedJobs / totalJobs : 0;
      score += completionRate * 8;

      // Bonus for perfect matches (up to 5% bonus)
      if (perfectMatches > 0) {
        const bonus = Math.min(perfectMatches * 1, 5);
        score += bonus;
      }

      // Penalty for no matching data
      if (!hasMatchingData) {
        score = score * 0.4;
      }

      return {
        agent,
        score,
        hasMatchingData,
        perfectMatches,
      };
    });

    // Sort by score (descending)
    return scoredAgents.sort((a, b) => {
      if (a.hasMatchingData && !b.hasMatchingData) return -1;
      if (!a.hasMatchingData && b.hasMatchingData) return 1;
      if (a.perfectMatches !== b.perfectMatches) {
        return b.perfectMatches - a.perfectMatches;
      }
      return b.score - a.score;
    });
  }
}

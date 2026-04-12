/**
 * Context Builder Service
 *
 * Builds the system prompt for Claude by combining user profile data,
 * conversation context, and the base system prompt template.
 */

import { getSystemPrompt } from '../utils/systemPrompt';

/**
 * Build a complete system prompt from user and conversation data.
 * Handles missing/undefined fields gracefully with sensible defaults.
 */
export function buildSystemPrompt(user: any, conversation?: any): string {
  const userName = user?.fullName || '';
  const state = user?.state || '';
  const district = user?.district || '';
  const language = user?.preferredLanguage || 'en';
  const problemType = user?.primaryProblemType || '';
  const problemDescription = user?.problemDescription || '';

  const profile = {
    age: user?.profile?.age,
    gender: user?.profile?.gender,
    occupation: user?.profile?.occupation,
    incomeCategory: user?.profile?.incomeCategory,
    hasExistingLawyer: user?.profile?.hasExistingLawyer || false,
    urgencyLevel: user?.profile?.urgencyLevel,
    opposingPartyType: user?.profile?.opposingPartyType,
  };

  const conversationContext = conversation?.extractedContext
    ? {
        sections: conversation.extractedContext.sections || [],
        acts: conversation.extractedContext.acts || [],
        keyFacts: conversation.extractedContext.keyFacts || [],
      }
    : undefined;

  return getSystemPrompt({
    userName,
    state,
    district,
    language,
    problemType,
    problemDescription,
    profile,
    conversationContext,
  });
}

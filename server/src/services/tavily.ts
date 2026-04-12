/**
 * Tavily Search Service
 *
 * Searches for recent legal information using the Tavily API.
 * Focuses on Indian legal sources for up-to-date case law,
 * amendments, and notifications.
 */

import { env } from '../config/env';

export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

/**
 * Search for legal information relevant to the user's query.
 * Returns an empty array on failure so the chat flow is never blocked
 * by Tavily downtime.
 */
export async function searchLegalInfo(
  query: string,
  state?: string
): Promise<SearchResult[]> {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: env.tavilyApiKey,
        query: `Indian law ${state || ''} ${query}`.trim(),
        search_depth: 'advanced',
        include_domains: [
          'indiankanoon.org',
          'indiacode.nic.in',
          'legislative.gov.in',
          'vakeel360.com',
          'livelaw.in',
          'barandbench.com',
          'scconline.com',
        ],
        max_results: 5,
      }),
    });

    if (!response.ok) {
      console.error(`Tavily API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = (await response.json()) as { results?: Array<{ title?: string; url?: string; content?: string }> };

    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((r) => ({
      title: r.title || '',
      url: r.url || '',
      content: r.content || '',
    }));
  } catch (error) {
    console.error('Tavily search failed:', error);
    return [];
  }
}

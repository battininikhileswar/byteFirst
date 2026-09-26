/**
 * DigitalID Agent Client Service
 * Communicates with /api/agent (Gemini powered serverless backend)
 */

import { getAgentRuleBasedResponse } from '../../../api/agent.js';

const TIMEOUT_MS = 10000;

export async function sendAgentQuery(messages = [], safeContext = {}) {
  // Truncate message history to last 5 messages to preserve tokens and privacy
  const recentMessages = messages.slice(-5).map(m => ({
    sender: m.sender,
    text: m.text
  }));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: recentMessages,
        context: safeContext
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Agent server returned status ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      message: data.message,
      actionStatuses: data.actionStatuses || [],
      actions: data.actions || [],
      suggestedFollowups: data.suggestedFollowups || []
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[DigitalID Agent] Upstream call failed, activating local reasoning fallback:', err.message);

    const lastMsg = recentMessages.filter(m => m.sender === 'user').pop();
    const query = lastMsg ? lastMsg.text : '';

    const fallback = getAgentRuleBasedResponse(query, safeContext);
    return {
      success: true,
      message: fallback.message,
      actionStatuses: fallback.actionStatuses || [],
      actions: fallback.actions || [],
      suggestedFollowups: fallback.suggestedFollowups || []
    };
  }
}

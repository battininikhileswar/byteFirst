/**
 * AI Provider Service Abstraction
 * Decouples frontend UI from specific AI providers.
 * Communicates with the secure serverless backend at /api/chat.
 */

import { getRuleBasedResponse } from '../../../api/chat.js';

const TIMEOUT_MS = 9000;

export async function sendChatMessage(messages = [], safeContext = {}) {
  // Truncate message history to last 5 messages to preserve bandwidth and privacy
  const recentMessages = messages.slice(-5).map(m => ({
    sender: m.sender,
    text: m.text
  }));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch('/api/chat', {
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
      throw new Error(`Server returned status ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      message: data.message,
      actions: data.actions || []
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[DigitalID Assistant] API call failed or timed out, activating intelligent client-side fallback:', err.message);

    // Get query from last message
    const lastMsg = recentMessages.filter(m => m.sender === 'user').pop();
    const query = lastMsg ? lastMsg.text : '';

    try {
      const fallback = getRuleBasedResponse(query, safeContext);
      return {
        success: true,
        message: fallback.message,
        actions: fallback.actions || []
      };
    } catch (_) {
      return {
        success: false,
        message: "DigitalID Assistant is temporarily unavailable.",
        actions: [
          { label: "How to Create an ID", type: "navigate_to_create" },
          { label: "Download Help", type: "show_download_help" },
          { label: "Print Help", type: "show_print_help" },
          { label: "Form Help", type: "scroll_to_form" }
        ]
      };
    }
  }
}

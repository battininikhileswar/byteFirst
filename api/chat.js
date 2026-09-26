/**
 * Secure Serverless API Endpoint: /api/chat
 * Vercel Serverless Function & Vite dev middleware compatible.
 *
 * IMPORTANT SECURITY:
 * Never exposes AI_API_KEY on the client.
 * Does not receive or log sensitive student data (phone, address, passwords, etc.).
 */

const SYSTEM_INSTRUCTION = `You are AuntyID, a friendly AI identity assistant for students.
Your job is to help students create, customize, and manage their digital college IDs, troubleshoot issues, and navigate the application.

Core Rules & Persona:
1. Be concise, friendly, student-focused, and technically accurate.
2. Only provide information supported by the application's actual functionality.
3. Never invent college policies, verification systems, or fake administrative regulations. If you do not have information about a college's specific rules, state that clearly.
4. Never request passwords, API keys, or private credentials.
5. Do not modify student data without explicit user interaction. Provide helpful guidance on which field to fill or update.
6. When a navigation action is appropriate, suggest it using action syntax: [action:navigate_to_create] or [action:scroll_to_features] or [action:scroll_to_how_it_works] or [action:scroll_to_security] or [action:show_download_help] or [action:show_print_help].

Specific Knowledge:
- Creating an ID: Student enters details, uploads photo, reviews real-time live preview, selects theme & orientation, and clicks "Generate ID Card".
- Roll Number: Official roll or enrollment number provided by their college/university.
- Required Fields: Full Name, Roll Number, College Name, Branch, Year, and Section.
- Photo Upload: Supports PNG, JPG, or WEBP (up to 5MB). Photo can be cropped or replaced anytime.
- Themes: Includes Modern Sky, Classic University, Minimalist Slate, Crimson Maroon, Emerald Tech, Royal Violet, and Midnight Dark.
- Orientations: Both Vertical (standard portrait ID) and Horizontal (landscape badge) are supported.
- QR Code: Encodes the student's unique identity record (DID number and verification link) for quick validation.
- Download PNG: Generates a high-resolution, unmirrored, print-ready PNG image of the ID card.
- Two-Sided Printing: Clicking "Print ID" generates a clean, standard 2-page print document with Front on Page 1 and Back on Page 2, ready for physical duplex printing.`;

// Intelligent knowledge base for instant, deterministic, and offline fallback responses
export function getRuleBasedResponse(userQuery, safeContext = {}) {
  const query = (userQuery || '').toLowerCase().trim();
  const page = safeContext.page || '/';

  // Navigation to create
  if (query.includes('how do i create') || query.includes('where can i create') || query.includes('create an id') || query.includes('start creating') || query.includes('make an id')) {
    if (page === '/create') {
      return {
        message: "You're already on the Create ID page! Enter your student details in the form on the left, upload your photo, check the live preview on the right, pick your favorite theme, and click **Generate ID Card**.",
        actions: [{ label: "Scroll to Form", type: "scroll_to_form" }]
      };
    }
    return {
      message: "You can create your professional digital college ID in seconds! Enter your student details, upload your photo, customize your card theme, and download or print it.",
      actions: [{ label: "Create My ID", type: "navigate_to_create" }]
    };
  }

  // Roll Number Guidance
  if (query.includes('roll number') || query.includes('roll no') || query.includes('enrollment number')) {
    return {
      message: "Enter the official roll or enrollment number issued by your college (e.g., `21B91A0582` or `CS-2026-042`). This appears prominently on your card front and back barcode.",
      actions: page !== '/create' ? [{ label: "Go to Create ID", type: "navigate_to_create" }] : []
    };
  }

  // Required Fields
  if (query.includes('required') || query.includes('mandatory') || query.includes('what information do i need') || query.includes('fields')) {
    const completed = safeContext.requiredFieldsCompleted !== undefined ? safeContext.requiredFieldsCompleted : null;
    const total = safeContext.totalRequiredFields || 6;
    let progressNote = "";
    if (completed !== null && page === '/create') {
      progressNote = `\n\n*Current Progress:* You have completed **${completed}/${total}** required fields.`;
    }
    return {
      message: "The required fields are **Full Name**, **Roll / ID Number**, **College / Institution Name**, **Branch / Major**, **Current Academic Year**, and **Section**." + progressNote,
      actions: page !== '/create' ? [{ label: "Open ID Generator", type: "navigate_to_create" }] : [{ label: "Review Form Fields", type: "scroll_to_form" }]
    };
  }

  // Photo Upload Help
  if (query.includes('photo') || query.includes('picture') || query.includes('image') || query.includes('avatar') || query.includes('upload')) {
    const photoStatus = safeContext.photoUploaded ? "You currently have a photo uploaded." : "You haven't uploaded a photo yet.";
    return {
      message: `Make sure you are uploading a supported image format (**PNG, JPG, or WEBP**) under 5MB. ${photoStatus} Click the upload box in the form to select or drag and drop a clear headshot.`,
      actions: page === '/create' ? [{ label: "Upload Photo", type: "scroll_to_form" }] : [{ label: "Go to Create ID", type: "navigate_to_create" }]
    };
  }

  // Themes & Customization
  if (query.includes('theme') || query.includes('color') || query.includes('design') || query.includes('orientation') || query.includes('horizontal') || query.includes('vertical')) {
    const currentTheme = safeContext.selectedTheme ? `Your current theme is **${safeContext.selectedTheme}**.` : "";
    return {
      message: `Yes! You can choose between **Vertical** and **Horizontal** card layouts, and select from 7 professional color themes (Modern Sky, Classic University, Minimalist Slate, Crimson Maroon, Emerald Tech, Royal Violet, and Midnight Dark). ${currentTheme}`,
      actions: page === '/create' ? [{ label: "Customize Theme", type: "scroll_to_form" }] : [{ label: "Explore Studio", type: "navigate_to_create" }]
    };
  }

  // QR Code
  if (query.includes('qr') || query.includes('barcode') || query.includes('scan') || query.includes('verification')) {
    return {
      message: "The QR code on the front and barcode on the back encode your unique digital student identifier (`DID-2026-001`). When scanned, it provides a quick way to access and verify your student credential record.",
      actions: []
    };
  }

  // Download Help
  if (query.includes('download') || query.includes('png') || query.includes('save') || query.includes('export')) {
    return {
      message: "To download your ID: fill out your details, click **Generate ID Card**, and then click **Download Card (PNG)**. It will export a high-resolution, unmirrored image of your card directly to your device.",
      actions: [{ label: "Download Guide", type: "show_download_help" }]
    };
  }

  // Printing Help
  if (query.includes('print') || query.includes('both sides') || query.includes('double-sided') || query.includes('duplex') || query.includes('paper') || query.includes('pdf')) {
    return {
      message: "To print your ID: click **Print ID** in the toolbar. It generates a print-ready document containing **Page 1 (Front Side)** and **Page 2 (Back Side)**. For a physical double-sided plastic or paper card, enable **Two-Sided / Duplex Printing** in your browser's print dialog.",
      actions: [{ label: "Print Guide", type: "show_print_help" }]
    };
  }

  // Something isn't working / Troubleshooting
  if (query.includes('troubleshoot') || query.includes('not working') || query.includes('error') || query.includes('help') || query.includes('issue') || query.includes('bug')) {
    return {
      message: "Here are quick troubleshooting steps:\n1. **Validation Errors**: Check for highlighted red fields in the form.\n2. **Photo Issue**: Ensure image is under 5MB (PNG/JPG).\n3. **Download**: Ensure you clicked 'Generate ID Card' first.\n4. **Print**: Use Chrome, Edge, or Safari for the best two-page print layout.",
      actions: [{ label: "How to Create an ID", type: "navigate_to_create" }, { label: "Form Help", type: "scroll_to_form" }]
    };
  }

  // Features / Overview
  if (query.includes('feature') || query.includes('what is auntyid') || query.includes('what is digitalid') || query.includes('about')) {
    return {
      message: "AuntyID is a friendly AI-powered student identity platform that helps you create, customize, generate, and download professional digital college identity cards in seconds.",
      actions: [{ label: "Create Your ID", type: "navigate_to_create" }, { label: "View Features", type: "scroll_to_features" }]
    };
  }

  // Default context-aware response
  if (page === '/create') {
    return {
      message: "I'm here to help with your student ID! You can ask about required fields, roll number formats, photo upload requirements, themes, or how to download and print both sides of your card.",
      actions: [
        { label: "What fields are required?", type: "ask_required_fields" },
        { label: "How do I print both sides?", type: "show_print_help" }
      ]
    };
  }

  return {
    message: "Hi! I'm AuntyID 👋 Tell me what you need and I'll help you get it done.",
    actions: [
      { label: "How do I create an ID?", type: "navigate_to_create" },
      { label: "What information do I need?", type: "ask_required_fields" }
    ]
  };
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Only POST is supported.' });
    return;
  }

  try {
    const { messages = [], context = {} } = req.body || {};
    const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
    const query = lastUserMessage ? lastUserMessage.text : '';

    // Check for configured server-side AI provider key
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        // If Gemini API Key is configured:
        if (process.env.GEMINI_API_KEY || process.env.AI_API_KEY?.startsWith('AIza')) {
          const key = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
          const safeContextDesc = `Current UI Context: Page=${context.page || '/'}; RequiredCompleted=${context.requiredFieldsCompleted || 0}/${context.totalRequiredFields || 6}; PhotoUploaded=${!!context.photoUploaded}; SelectedTheme=${context.selectedTheme || 'classic'}.`;

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${safeContextDesc}\n\nUser Question: ${query}` }]
                }
              ],
              generationConfig: {
                maxOutputTokens: 250,
                temperature: 0.3
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const actions = [];
              if (text.includes('[action:navigate_to_create]')) actions.push({ label: 'Create My ID', type: 'navigate_to_create' });
              if (text.includes('[action:scroll_to_features]')) actions.push({ label: 'View Features', type: 'scroll_to_features' });
              if (text.includes('[action:show_download_help]')) actions.push({ label: 'Download Help', type: 'show_download_help' });
              if (text.includes('[action:show_print_help]')) actions.push({ label: 'Print Help', type: 'show_print_help' });
              if (text.includes('[action:scroll_to_form]')) actions.push({ label: 'Go to Form', type: 'scroll_to_form' });

              const cleanText = text.replace(/\[action:[a-z_]+\]/g, '').trim();

              res.status(200).json({
                success: true,
                message: cleanText,
                actions: actions.length > 0 ? actions : (getRuleBasedResponse(query, context).actions || [])
              });
              return;
            }
          }
        }
      } catch (upstreamErr) {
        console.warn('Upstream AI call failed, falling back to local knowledge engine:', upstreamErr.message);
      }
    }

    // Default fast, secure, accurate rule-based response
    const fallback = getRuleBasedResponse(query, context);
    res.status(200).json({
      success: true,
      message: fallback.message,
      actions: fallback.actions || []
    });
  } catch (err) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({
      success: false,
      error: 'DigitalID Assistant is temporarily unavailable.',
      fallbackActions: [
        { label: 'How to Create an ID', type: 'navigate_to_create' },
        { label: 'Download Help', type: 'show_download_help' },
        { label: 'Print Help', type: 'show_print_help' },
        { label: 'Form Help', type: 'scroll_to_form' }
      ]
    });
  }
}

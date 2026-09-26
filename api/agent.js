/**
 * DigitalID Task-Oriented AI Agent API Endpoint: /api/agent
 * Powered by Google Gemini API
 *
 * Server-side Vercel serverless function & Vite dev middleware.
 * NEVER exposes GEMINI_API_KEY to the client.
 */

const AGENT_SYSTEM_PROMPT = `You are AuntyID, a friendly AI-powered digital identity assistant for students.

You help students create, customize, generate, download and print their digital college IDs.

You are not just a chatbot. You are a task-oriented assistant capable of using the application's supported tools.

Your personality is warm, helpful, patient and slightly playful, like a helpful college aunty who knows how to get things done.

Be concise and practical.

When a student asks you to perform a supported action, use the appropriate application tool.

Never claim an action succeeded unless the application confirms success.

Never invent college policies or unsupported application capabilities.

Never request passwords, API keys or unnecessary sensitive information.

When required information is missing, ask only for the missing information.

Use the application's existing state and functions rather than manipulating the DOM directly.

Your goal is to make creating a student ID simple and stress-free.

Available Action Types:
1. fill_student_form:
   data: {
     fullName?: string,
     rollNumber?: string,
     collegeName?: string,
     branch?: string,
     year?: string,
     section?: string,
     email?: string,
     phone?: string,
     bloodGroup?: string,
     address?: string
   }
   Use whenever the user provides details to fill or create their ID.
   Standardize branch (e.g., 'CSE' -> 'Computer Science & Engineering', 'ECE' -> 'Electronics & Communication Engineering', 'MECH' -> 'Mechanical Engineering').
   Standardize year (e.g., '3rd year' -> '3rd Year (Junior)', '4th year' -> '4th Year (Senior)', '1st year' -> '1st Year (Freshman)', '2nd year' -> '2nd Year (Sophomore)').

2. set_id_theme:
   data: { themeName: 'modern' | 'classic' | 'minimal' | 'dark' | 'emerald' | 'crimson' | 'violet' | 'amber' }
   Use when user asks to change theme or design (e.g., 'modern theme' -> 'modern', 'dark theme' -> 'dark', 'classic' -> 'classic', 'sunset' or 'amber' -> 'amber').

3. flip_id_card:
   data: {}
   Use when user asks to 'show me the back', 'flip the card', 'view front', 'see backside'.

4. toggle_auto_rotate:
   data: { enabled: boolean }
   Use when user asks to 'start auto rotate', 'rotate the card', 'stop rotating', 'turn off auto rotate'.

5. generate_id:
   data: {}
   Use when user asks to 'generate my ID', 'create card', 'finalize ID', or in multi-step 'create and download'.

6. download_id:
   data: {}
   Use when user explicitly asks to 'download my ID', 'download it', 'save PNG', 'export ID'.

7. print_id:
   data: {}
   Use when user asks to 'print it', 'print ID', 'print both sides'.

8. navigate_to_create:
   data: {}
   Use when user wants to create an ID or go to the editor, especially when currently on the landing page ('/').

9. reset_form:
   data: {}
   Use when user asks to 'reset form', 'clear all fields', 'start over'.

CRITICAL INSTRUCTIONS:
- You must always respond with a valid JSON object matching this schema:
{
  "message": "Conversational reply in AuntyID's warm, helpful, slightly playful style",
  "actionStatuses": ["Action step 1 description", "Action step 2 description"],
  "actions": [
    { "type": "action_name", "data": { ... } }
  ],
  "suggestedFollowups": ["Suggested next command 1", "Suggested next command 2"]
}

Speaking style:
- "Sure! Let's get your ID ready. Give me your name, roll number, branch and year."
- "Almost done! 😊 You're missing your roll number."
- "Done! Your ID is ready to download. 🎉"
- "Want me to take care of that too?"
- Keep responses short, natural, warm, and professional.
`;

// Client-compatible deterministic reasoning fallback engine
export function getAgentRuleBasedResponse(userQuery = '', context = {}) {
  const query = userQuery.toLowerCase().trim();
  const page = context.page || '/';

  // 1. Fill student details / Create ID with details
  const hasNameMatch = userQuery.match(/(?:my name is|name is|for)\s+([A-Za-z\s]+?)(?:\.|\,|$|\sand\s|roll)/i);
  const hasRollMatch = userQuery.match(/(?:roll number is|roll number|roll no\.?|roll)\s*(?:is|\:)?\s*([A-Za-z0-9]+)/i);
  const hasBranchMatch = userQuery.match(/(?:in\s+)?(computer science(?: and engineering)?|cse|ece|mechanical|civil|it|electrical)/i);
  const hasYearMatch = userQuery.match(/([1-4](?:st|nd|rd|th)?\s*year)/i);
  const hasSectionMatch = userQuery.match(/section\s*([A-Za-z0-9]+)/i);
  const hasEmailMatch = userQuery.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);

  if (hasNameMatch || hasRollMatch || hasBranchMatch || query.includes('my name is') || query.includes('roll number') || query.includes('fill my details')) {
    const studentData = {};
    const statuses = ["Okay, let me fill that in for you... 👀"];

    if (hasNameMatch) {
      studentData.fullName = hasNameMatch[1].trim();
      statuses.push(`Filled Full Name: ${studentData.fullName}`);
    }
    if (hasRollMatch) {
      studentData.rollNumber = hasRollMatch[1].trim().toUpperCase();
      statuses.push(`Filled Roll Number: ${studentData.rollNumber}`);
    }
    if (hasBranchMatch) {
      const b = hasBranchMatch[1].toLowerCase();
      studentData.branch = b.includes('cse') || b.includes('computer') ? 'Computer Science & Engineering' : hasBranchMatch[1].trim();
      statuses.push(`Filled Branch: ${studentData.branch}`);
    }
    if (hasYearMatch) {
      const yr = hasYearMatch[1].toLowerCase();
      if (yr.includes('1')) studentData.year = '1st Year (Freshman)';
      else if (yr.includes('2')) studentData.year = '2nd Year (Sophomore)';
      else if (yr.includes('3')) studentData.year = '3rd Year (Junior)';
      else if (yr.includes('4')) studentData.year = '4th Year (Senior)';
      else studentData.year = hasYearMatch[1];
      statuses.push(`Filled Year: ${studentData.year}`);
    }
    if (hasSectionMatch) {
      studentData.section = hasSectionMatch[1].toUpperCase();
      statuses.push(`Filled Section: ${studentData.section}`);
    }
    if (hasEmailMatch) {
      studentData.email = hasEmailMatch[1].toLowerCase();
      statuses.push(`Filled Email: ${studentData.email}`);
    }

    const actions = [];
    if (page !== '/create') {
      actions.push({ type: 'navigate_to_create', data: {} });
    }
    if (Object.keys(studentData).length > 0) {
      actions.push({ type: 'fill_student_form', data: studentData });
    }

    const missing = [];
    if (!studentData.fullName && !context.fullName) missing.push('full name');
    if (!studentData.rollNumber && !context.rollNumber) missing.push('roll number');
    if (!studentData.collegeName && !context.collegeName) missing.push('college name');

    let msg = `Sure! Let's get your ID ready. I've filled in your details.`;
    if (missing.length > 0) {
      msg = `Almost done! 😊 You're missing your ${missing.join(', ')}. Want me to take care of that too?`;
    } else {
      msg = `Everything looks good! ✓ All details are set. Want me to generate your ID card now?`;
    }

    return {
      message: msg,
      actionStatuses: statuses,
      actions,
      suggestedFollowups: ["Generate my ID", "Use the modern theme", "Show me the back"]
    };
  }

  // 2. Set Theme
  if (query.includes('theme') || query.includes('modern theme') || query.includes('dark theme') || query.includes('classic theme') || query.includes('minimal')) {
    let themeName = 'modern';
    if (query.includes('dark') || query.includes('midnight')) themeName = 'dark';
    else if (query.includes('classic') || query.includes('university')) themeName = 'classic';
    else if (query.includes('minimal') || query.includes('slate')) themeName = 'minimal';
    else if (query.includes('emerald') || query.includes('green')) themeName = 'emerald';
    else if (query.includes('crimson') || query.includes('maroon')) themeName = 'crimson';
    else if (query.includes('violet') || query.includes('purple')) themeName = 'violet';
    else if (query.includes('amber') || query.includes('sunset') || query.includes('gold') || query.includes('orange')) themeName = 'amber';

    return {
      message: `Done! I've switched your theme to **${themeName.toUpperCase()}** — looking sharp! ✨`,
      actionStatuses: [`Applied theme: ${themeName}`],
      actions: [{ type: 'set_id_theme', data: { themeName } }],
      suggestedFollowups: ["Show me the back", "Generate my ID", "Download ID"]
    };
  }

  // 3. Flip Card
  if (query.includes('show me the back') || query.includes('flip') || query.includes('back side') || query.includes('front side') || query.includes('flip card')) {
    return {
      message: "Here's the other side of your card! You can inspect the institutional details and barcode. 👀",
      actionStatuses: ["Flipped card preview"],
      actions: [{ type: 'flip_id_card', data: {} }],
      suggestedFollowups: ["Generate my ID", "Download ID", "Print ID"]
    };
  }

  // 4. Auto Rotate
  if (query.includes('auto rotate') || query.includes('rotating') || query.includes('spin')) {
    const enable = !query.includes('stop') && !query.includes('turn off') && !query.includes('disable');
    return {
      message: enable
        ? "Look at it spin! 💫 Continuous 3D rotation is ON."
        : "Card held steady for you at its current orientation.",
      actionStatuses: [enable ? "Enabled continuous 360° rotation" : "Paused card rotation"],
      actions: [{ type: 'toggle_auto_rotate', data: { enabled: enable } }],
      suggestedFollowups: enable ? ["Stop rotating", "Create my ID"] : ["Start rotating", "Create my ID"]
    };
  }

  // 5. Generate ID
  if (query.includes('generate') || query.includes('finalize') || query.includes('make my id')) {
    return {
      message: "Generating your ID now... Everything looks good! ✓",
      actionStatuses: ["Checking your details...", "Generating your ID...", "Done! Your ID is ready. 🎉"],
      actions: [{ type: 'generate_id', data: {} }],
      suggestedFollowups: ["Download my ID", "Print my ID", "Show me the back"]
    };
  }

  // 6. Download ID
  if (query.includes('download') || query.includes('png') || query.includes('save card')) {
    return {
      message: "Done! Your ID is ready to download. 🎉",
      actionStatuses: ["Preparing high-resolution PNG", "Done! Your ID is ready. 🎉"],
      actions: [{ type: 'download_id', data: {} }],
      suggestedFollowups: ["Print my ID", "Show me the back"]
    };
  }

  // 7. Print ID
  if (query.includes('print')) {
    return {
      message: "Printing it now... Your two-page front and back document is ready! 🖨️",
      actionStatuses: ["Printing it now..."],
      actions: [{ type: 'print_id', data: {} }],
      suggestedFollowups: ["Download my ID", "Customize ID"]
    };
  }

  // 8. Navigation to create
  if (query.includes('create an id') || query.includes('create my id') || query.includes('start') || query.includes('make an id')) {
    return {
      message: "Sure! Let's get your ID ready. Give me your name, roll number, branch and year.",
      actionStatuses: ["Opened ID Creator Studio"],
      actions: [{ type: 'navigate_to_create', data: {} }],
      suggestedFollowups: ["Fill My Details", "Customize ID"]
    };
  }

  // 9. Reset Form
  if (query.includes('reset') || query.includes('clear')) {
    return {
      message: "All cleared! We can start fresh anytime.",
      actionStatuses: ["Cleared form inputs"],
      actions: [{ type: 'reset_form', data: {} }],
      suggestedFollowups: ["Create My ID", "Fill My Details"]
    };
  }

  // Default response
  return {
    message: "Hi! I'm AuntyID 👋 Tell me what you need and I'll help you get it done.",
    actionStatuses: [],
    actions: [],
    suggestedFollowups: ["Create My ID", "Fill My Details", "Customize My ID", "Download My ID", "Print My ID"]
  };
}

export default async function handler(req, res) {
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

  const { messages = [], context = {} } = req.body || {};
  const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
  const query = lastUserMessage ? lastUserMessage.text : '';

  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  if (apiKey) {
    try {
      const promptContent = `${AGENT_SYSTEM_PROMPT}

Current Safe UI Context:
- Active Route: ${context.page || '/'}
- Required Fields Completed: ${context.requiredFieldsCompleted || 0}/${context.totalRequiredFields || 6}
- Photo Uploaded: ${!!context.photoUploaded}
- Selected Theme: ${context.selectedTheme || 'classic'}
- Card Orientation: ${context.cardOrientation || 'vertical'}
- Is ID Generated: ${!!context.isGenerated}

User Request: "${query}"

Respond strictly with valid JSON.`;

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptContent }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 600
          }
        })
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          if (parsed.message && Array.isArray(parsed.actions)) {
            res.status(200).json({
              success: true,
              message: parsed.message,
              actionStatuses: parsed.actionStatuses || [],
              actions: parsed.actions,
              suggestedFollowups: parsed.suggestedFollowups || []
            });
            return;
          }
        }
      } else {
        const errText = await geminiRes.text();
        console.warn('Gemini API call returned non-200:', geminiRes.status, errText);
      }
    } catch (err) {
      console.warn('Gemini upstream call failed, using rule-based reasoning engine:', err.message);
    }
  }

  // Deterministic rule-based fallback
  const fallback = getAgentRuleBasedResponse(query, context);
  res.status(200).json({
    success: true,
    message: fallback.message,
    actionStatuses: fallback.actionStatuses || [],
    actions: fallback.actions || [],
    suggestedFollowups: fallback.suggestedFollowups || []
  });
}

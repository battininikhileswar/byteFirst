/**
 * Server-side Groq AI ID Card Design Handler
 * This executes purely on the Node.js server to ensure GROQ_API_KEY is never exposed to the client.
 */

export async function handleAiDesignRequest(req, res, apiKey) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'GROQ_API_KEY is not configured on the server.' }));
    return;
  }

  // Parse incoming JSON body
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const parsedBody = JSON.parse(body || '{}');
      const { prompt, currentDesign, chatHistory = [], imageMeta } = parsedBody;

      if (!prompt || typeof prompt !== 'string') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'A prompt string is required.' }));
        return;
      }

      // Compact representation of current design state to save tokens & provide precise spatial context
      const cardInfo = {
        width: currentDesign?.card?.orientation === 'horizontal' ? 600 : 380,
        height: currentDesign?.card?.orientation === 'horizontal' ? 380 : 600,
        orientation: currentDesign?.card?.orientation || 'horizontal',
        background: currentDesign?.card?.background,
        headerBg: currentDesign?.card?.headerBg,
        borderColor: currentDesign?.card?.borderColor,
        accentColor: currentDesign?.card?.accentColor,
        themeId: currentDesign?.card?.themeId
      };

      const elementsSummary = {};
      if (currentDesign?.elements) {
        Object.entries(currentDesign.elements).forEach(([key, el]) => {
          elementsSummary[key] = {
            x: Math.round(el.x),
            y: Math.round(el.y),
            width: Math.round(el.width),
            height: Math.round(el.height),
            fontSize: el.fontSize,
            color: el.color,
            visible: el.visible,
            rotation: el.rotation || 0
          };
        });
      }

      const systemPrompt = `You are "ID Design AI", an expert ID card graphic design and layout assistant.
Your job is to manipulate a digital ID card design canvas by generating structured design actions and optional student data updates in response to user requests.

CANVAS SPECIFICATIONS:
- Canvas dimensions: width=${cardInfo.width}, height=${cardInfo.height} (Orientation: ${cardInfo.orientation}).
- Coordinate system: (0,0) is top-left, (${cardInfo.width}, ${cardInfo.height}) is bottom-right.
- Current Center: X=${Math.round(cardInfo.width / 2)}, Y=${Math.round(cardInfo.height / 2)}.

CURRENT DESIGN STATE:
${JSON.stringify({ card: cardInfo, elements: elementsSummary }, null, 2)}

VALID ELEMENT KEYS:
- collegeEmblem: College logo/crest icon
- collegeName: Institution name text
- collegeTagline: Autonomous / accredited tagline
- smartChip: Gold electronic chip badge
- idRibbon: "STUDENT IDENTITY CARD" ribbon badge
- studentPhoto: Student portrait photograph
- studentName: Student full name
- rollNumber: Roll number / Student ID badge
- branch: Department / Academic Major
- yearSection: Year & Section
- email: Student email
- phone: Student phone number
- dob: Date of birth
- bloodGroup: Medical blood group indicator
- address: Campus/home address
- qrCode: Verification QR Code
- signature: Authorized signatory line
- barcode: Institutional barcode

${imageMeta?.hasImage ? `IMAGE ATTACHMENT CONTEXT:
The user attached an image to this message (Role: "${imageMeta.role || 'photo'}").
${imageMeta.palette ? `Extracted Dominant Colors: Primary=${imageMeta.palette.primary}, Accent=${imageMeta.palette.accent}, Recommended Header Gradient="${imageMeta.palette.headerGradient}".` : ''}
Guidelines for this attached image:
- If role is "photo": Ensure studentPhoto is visible and well-aligned. Theme the card harmoniously with the photo's extracted palette.
- If role is "logo": Ensure collegeEmblem is visible. If user wants a background watermark, set { "type": "reorder", "element": "collegeEmblem", "direction": "sendToBack", "zIndex": 2 } and { "type": "style", "element": "collegeEmblem", "opacity": 0.2 }.
- If role is "reference": Use the extracted colors to generate a matching card theme (headerBg, accentColor, borderColor).
` : ''}
STUDENT CREDENTIAL EXTRACTION:
If the user's prompt provides personal or institutional details (e.g. "Create an ID for Rahul Sharma, 21B91A0582, CSE at Stanford University"):
Include a "studentUpdates" object with any recognized fields:
- fullName: student's full name
- rollNumber: student ID / roll number
- collegeName: institution name
- branch: department / major
- year: e.g. "3rd Year"
- bloodGroup: e.g. "O+", "A+", "B+"
- email: e.g. "name@college.edu"

RULES & OUTPUT FORMAT:
1. You MUST respond with a valid JSON object only. No markdown fences around the JSON, just raw JSON.
2. Structure:
{
  "message": "Short, enthusiastic description of the visual and student changes made (1-2 sentences).",
  "actions": [
    // Array of actions. Supported types:
    // { "type": "move", "element": "studentName", "x": 300, "y": 140 },
    // { "type": "resize", "element": "studentPhoto", "width": 110, "height": 130 },
    // { "type": "style", "element": "studentName", "fontSize": 26, "fontWeight": 700, "color": "#FFFFFF" },
    // { "type": "style", "element": "card", "background": "#0F172A", "headerBg": "linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)", "borderColor": "#38BDF8", "accentColor": "#38BDF8" },
    // { "type": "visibility", "element": "phone", "visible": false },
    // { "type": "rotate", "element": "collegeEmblem", "rotation": 15 },
    // { "type": "reorder", "element": "collegeEmblem", "direction": "sendToBack", "zIndex": 2 }
  ],
  "studentUpdates": {
    // Optional student info parsed from prompt (only if user provided info)
    // "fullName": "Rahul Sharma",
    // "rollNumber": "21B91A0582",
    // "collegeName": "Stanford University",
    // "branch": "Computer Science"
  }
}
3. IMPORTANT BEHAVIOR:
- Keep elements inside bounds: 0 <= x <= ${cardInfo.width - 40}, 0 <= y <= ${cardInfo.height - 30}.
- Always only return properties relevant to the user request.`;

      // Call Groq API with openai/gpt-oss-120b (or fallback to openai/gpt-oss-20b)
      let groqResponse;
      try {
        groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [
              { role: 'system', content: systemPrompt },
              ...chatHistory.slice(-4),
              { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
            max_tokens: 1500
          })
        });
      } catch (fetchErr) {
        throw new Error('Network error reaching Groq API: ' + fetchErr.message);
      }

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error('Groq API error:', groqResponse.status, errorText);
        res.statusCode = groqResponse.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: `Groq AI Error (${groqResponse.status})`, details: errorText }));
        return;
      }

      const groqData = await groqResponse.json();
      const content = groqData.choices?.[0]?.message?.content;

      let resultJson;
      try {
        resultJson = JSON.parse(content);
      } catch (err) {
        console.error('Failed to parse Groq JSON output:', content);
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'AI produced invalid JSON output. Please try again.' }));
        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(resultJson));
    } catch (err) {
      console.error('Internal server error in handleAiDesignRequest:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
    }
  });
}

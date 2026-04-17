import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { recipeTitle, ingredients, preferences } = await request.json();

    if (!recipeTitle || !ingredients || !preferences) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite-preview",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `You are a strict nutritionist AI. 
Analyze the following recipe titled "${recipeTitle}" with these ingredients:
${ingredients.map((i: any) => i.original).join('\n')}

The user has the following dietary profile:
- Primary Goal: ${preferences.goal || 'None'}
- Diet: ${preferences.diet || 'None'}
- Allergies/Restrictions: ${preferences.allergies?.join(', ') || 'None'}

Determine if the recipe violates any of the user's dietary preferences, allergies, or goals.
Return the result strictly as a JSON object with these properties:
- "status": exactly one of "Good", "Caution", or "Avoid".
- "reason": A short 1-2 sentence explanation of your ruling.
- "swaps": An array of swap objects for any violating ingredients. Each swap object must have:
  - "from": the exact problematic ingredient as it appears in the recipe
  - "to": a safe, diet-compliant replacement suggestion
  If status is "Good", "swaps" must be an empty array [].

Example output:
{"status":"Caution","reason":"This recipe uses heavy cream which conflicts with your Dairy-Free restriction.","swaps":[{"from":"1 cup heavy cream","to":"1 cup coconut cream"},{"from":"2 tbsp butter","to":"2 tbsp olive oil"}]}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let parsedData = null;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        parsedData = JSON.parse(match[1]);
      } else {
        parsedData = JSON.parse(responseText);
      }
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

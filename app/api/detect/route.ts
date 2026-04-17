import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Make sure to set GEMINI_API_KEY in your environment variables (.env.local)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // The image should be a base64 string, typically starting with "data:image/jpeg;base64,"
    // We need to extract just the base64 part
    const base64Data = image.split(',')[1];
    if (!base64Data) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite-preview",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `Extract food items from the image. Follow these strict rules:
1. Identify each distinct food item visible. If there are multiple different foods, generate an entry for each one.
2. Remove any brand names. Instead of "Morton Salt", just write "Salt". Provide the generic product name.
3. For quantity, estimate the amount but ONLY use standardized numbers as strings (e.g. "1", "2"). Do not include units like "g", "items", or "pieces". If it's a single box/container, write "1".
4. Provide an approximate expiry date if common sense applies (e.g. fresh produce 1 week), otherwise leave empty.
Return the result strictly as a JSON array of objects. Each object must have exactly these string properties: 'name', 'quantity', and 'expiry'. Example: [{"name": "Salt", "quantity": "1", "expiry": ""}]`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const responseText = result.response.text();
    
    // We try to parse the JSON output from the text
    // The response might be wrapped in ```json ... ``` blocks
    let parsedData = [];
    try {
      const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        parsedData = JSON.parse(match[1]);
      } else {
        parsedData = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini output:", responseText);
      return NextResponse.json({ error: 'Failed to process image data', raw: responseText }, { status: 500 });
    }

    return NextResponse.json({ items: parsedData });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

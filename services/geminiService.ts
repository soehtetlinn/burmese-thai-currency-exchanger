import { GoogleGenAI, Type } from "@google/genai";
import { ExchangeRate } from '../types';

function localHeuristicParse(text: string): Omit<ExchangeRate, 'id'> {
  const source = String(text || '');
  const dateMatch = source.match(/\b(\d{1,2}[-\s](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-\s]\d{4})\b/i);
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0,10);
  const paymentMethod = /bank\s*transfer/i.test(source) ? 'Bank Transfer' : (/kpay|wave/i.test(source) ? 'Mobile Wallet' : 'Unknown');
  const sellingBlock = source.match(/Selling[\s\S]*?(?=Buying|$)/i)?.[0] || '';
  const buyingBlock = source.match(/Buying[\s\S]*?(?=$)/i)?.[0] || '';
  const num = (s: string) => { const m = s.match(/(\d{3,4})(?:\/(\d{3,4}))?/); return m ? parseInt(m[2]||m[1],10) : undefined; };
  const belowSell = num(sellingBlock.match(/အောက်[\s\S]*?(\d{3,4}(?:\/\d{3,4})?)/i)?.[1] || sellingBlock);
  const aboveSell = num(sellingBlock.match(/အထက်[\s\S]*?(\d{3,4}(?:\/\d{3,4})?)/i)?.[1] || sellingBlock);
  const baseBuy = num(buyingBlock) || undefined;
  const aboveBuy = num(buyingBlock.match(/အထက်[\s\S]*?(\d{3,4}(?:\/\d{3,4})?)/i)?.[1] || buyingBlock);
  const special = source.match(/100\s*[-–—]\s*500[^\n]*?(\d{3,4})\s*[\/\-]\s*(\d{3,4})/i);
  const notes: string[] = (source.split('\n').map(s=>s.trim()).filter(Boolean).slice(-3)) as string[];
  return {
    date,
    paymentMethod,
    sellingRates: {
      below1M_MMK: belowSell || 0,
      above1M_MMK: aboveSell || belowSell || 0,
      special_100_500: special ? `${special[1]}/${special[2]}` : undefined,
    },
    buyingRates: {
      base: baseBuy || 0,
      above1M_MMK: aboveBuy || baseBuy || 0,
    },
    notes,
  };
}

export async function parseExchangeText(text: string): Promise<Omit<ExchangeRate, 'id'>> {
  const apiKey = (process.env.API_KEY as unknown as string) || (globalThis as any).GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback to local heuristic parser so the page works without API key
    return localHeuristicParse(text);
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert financial data extraction tool. Your task is to parse the following Burmese currency exchange text message and convert it into a structured JSON object.

    Rules:
    1.  The text describes rates for exchanging Myanmar Kyat (MMK) and Thai Baht (THB).
    2.  "Selling (အရောင်း)" means the exchanger is selling THB. Rates are quoted in THB per 100,000 MMK.
    3.  "Buying (အဝယ်)" means the exchanger is buying THB. Rates are quoted in THB per 100,000 MMK.
    4.  "10သိန်း" means 1,000,000 MMK.
    5.  "အထက်" means "above".
    6.  "အောက်" means "below".
    7.  Extract the date, payment method, all rates, and any additional notes.
    8.  If a rate is given as a range like "802/803", represent it as a string.

    Text to parse:
    ---
    ${text}
    ---

    Provide the output in the specified JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Fix: Refined response schema to remove non-standard 'nullable' and add 'required' fields for better type enforcement.
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "The date of the rates, e.g., '16-Oct-2025'." },
            paymentMethod: { type: Type.STRING, description: "The method of payment, e.g., 'Bank Transfer'." },
            sellingRates: {
              type: Type.OBJECT,
              description: "Rates for when the exchanger sells THB (user buys THB).",
              properties: {
                below1M_MMK: { type: Type.NUMBER, description: "Rate for transactions below 1,000,000 MMK." },
                above1M_MMK: { type: Type.NUMBER, description: "Rate for transactions above 1,000,000 MMK." },
                special_100_500: { type: Type.STRING, description: "Special rates, often quoted as a range like '802/803'." }
              },
              required: ['below1M_MMK', 'above1M_MMK'],
            },
            buyingRates: {
              type: Type.OBJECT,
              description: "Rates for when the exchanger buys THB (user sells THB).",
              properties: {
                base: { type: Type.NUMBER, description: "The base buying rate, typically for amounts under 1,000,000 MMK." },
                above1M_MMK: { type: Type.NUMBER, description: "The buying rate for transactions with an MMK equivalent over 1,000,000 MMK." }
              },
              required: ['base', 'above1M_MMK'],
            },
            notes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Any other relevant notes or messages from the text."
            }
          },
          required: ['date', 'paymentMethod', 'sellingRates', 'buyingRates', 'notes'],
        }
      }
    });

    const jsonString = response.text.trim();
    const parsedData = JSON.parse(jsonString);
    return parsedData as Omit<ExchangeRate, 'id'>;

  } catch (error) {
    console.error("Error parsing exchange text with Gemini:", error);
    throw new Error("Failed to parse the provided text. Please check the format and try again.");
  }
}
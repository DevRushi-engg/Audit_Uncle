import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 45; // Support up to 45 seconds for vision analysis

interface ExtractedTransaction {
  date?: string;
  amount: number;
  type?: "sale" | "expense";
  category?: string;
  paymentMode?: "cash" | "upi" | "card" | "other";
}

const VISION_MODELS = [
  "qwen/qwen3.8-27b:free",
  "google/gemma-4-26b-a4b-it:free",
  "google/gemma-4-31b-it:free",
];

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image provided. Please capture or upload a clear photo of your bill or khata." },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ||
      "";

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured in .env.local" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are Audit Uncle's Vision Document Ingestion engine.
Your task is to transcribe photos of Indian retail registers, handwritten Bahi-Khata notebooks, inventory sheets, cashbooks, invoices, and receipts into structured ledger records.

INSTRUCTIONS:
1. Examine the image carefully. The image may be:
   - A handwritten table with columns such as: Item/Particulars, Price/Rate, Sales/Quantity, Cost Price, etc.
   - An itemized customer bill or GST invoice.
   - A single receipt with a total amount.
2. For each row or item found in the table:
   - "date": string in YYYY-MM-DD format (if no date is in the photo, use today's date "2024-10-04").
   - "amount": calculate the total rupee value. For example, if Price is 400 and Sales quantity is 70, total sales amount is 400 * 70 = 28000; or if Sales is the rupee amount, use that amount. Always ensure amount is a positive number.
   - "type": "sale" for sales revenue / items sold, or "expense" for cost price / purchases. If both Price/Sales and Cost Price are present, you may generate both a "sale" transaction and an "expense" transaction for each item.
   - "category": the Item name (e.g. "Milk", "Soap", "Wire", "Butter", "Bread", "Cloth", "Shoes", "Cap", "Groceries").
   - "paymentMode": "cash" | "upi" | "card" | "other" (default "cash").
3. Output strictly valid JSON matching this schema:
   {
     "transactions": [
       { "date": "2024-10-04", "amount": 28000, "type": "sale", "category": "Milk", "paymentMode": "cash" },
       { "date": "2024-10-04", "amount": 21000, "type": "expense", "category": "Milk (Cost)", "paymentMode": "cash" }
     ],
     "notes": "Extracted items from handwritten shop register"
   }
Output pure JSON only.`;

    let content = "";
    let lastError = "";

    // Try vision models in fallback order
    for (const model of VISION_MODELS) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://audituncle.app",
            "X-Title": "Audit Uncle Vision Ingestion",
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Please extract all financial transactions from this register/bill image into the requested JSON schema.",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: imageBase64,
                    },
                  },
                ],
              },
            ],
            temperature: 0.1,
            max_tokens: 1500,
            response_format: { type: "json_object" },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          content = data.choices?.[0]?.message?.content || "";
          if (content) break;
        } else {
          lastError = await response.text();
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    if (!content) {
      return NextResponse.json(
        {
          error:
            "Vision AI could not read the image clearly. Please ensure good lighting and clear text, or try uploading a CSV directly.",
          details: lastError,
        },
        { status: 502 }
      );
    }

    // Parse JSON from model output
    let parsed: { transactions?: ExtractedTransaction[]; notes?: string } = {};
    try {
      // Clean up markdown fences or surrounding conversational text if model included it
      let cleaned = content.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        cleaned = match[0];
      }
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Could not parse structured transactions from document photo." },
        { status: 422 }
      );
    }

    const txs = parsed.transactions || [];
    if (!Array.isArray(txs) || txs.length === 0) {
      return NextResponse.json(
        { error: "No transactions could be detected in this photo. Please take a clearer picture." },
        { status: 422 }
      );
    }

    // Convert transactions to standardized CSV text
    const csvRows = [
      "Date,Amount,Type,Category,PaymentMode",
      ...txs.map((t) => {
        const d = t.date || new Date().toISOString().split("T")[0];
        const a = Math.abs(Number(t.amount) || 0);
        const typ = t.type === "expense" ? "expense" : "sale";
        const cat = (t.category || "General").replace(/[",\n]/g, " ").trim();
        const mode = t.paymentMode || "cash";
        return `${d},${a},${typ},${cat},${mode}`;
      }),
    ];

    const generatedCsv = csvRows.join("\n");

    return NextResponse.json({
      success: true,
      rowCount: txs.length,
      csvData: generatedCsv,
      transactions: txs,
      notes: parsed.notes || `Successfully parsed ${txs.length} transactions from image`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

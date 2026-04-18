import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    const baseUrl = process.env.BASE_URL
    const authToken = process.env.AUTH_TOKEN
    const model = process.env.MODEL

    if (!baseUrl || !authToken || !model) {
      return NextResponse.json({ error: "LLM API not configured" }, { status: 500 })
    }

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 512,
        messages: [
          {
            role: "system",
            content:
              "You are an academic feedback assistant. Rephrase rough instructor notes into clear, professional, and constructive academic feedback for students. Be concise and actionable. Return only the rephrased text, nothing else.",
          },
          {
            role: "user",
            content: text,
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("LLM API error:", err)
      return NextResponse.json({ error: "LLM request failed" }, { status: 502 })
    }

    const data = await response.json()
    const rephrased = data.choices?.[0]?.message?.content ?? text
    return NextResponse.json({ rephrased })
  } catch (err) {
    console.error("Rephrase error:", err)
    return NextResponse.json({ error: "Failed to rephrase" }, { status: 500 })
  }
}

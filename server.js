import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Invalid or missing message" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: `You are Fathr Wellness Coach, a friendly AI for fertility wellness education.

RULES:
- Provide ONLY general lifestyle tips (nutrition, exercise, sleep, stress management).
- Help with cycle tracking, ovulation education, and motivation.
- NEVER diagnose, treat, or give medical advice.
- NEVER interpret symptoms, recommend tests, medications, or supplements.
- If the user mentions symptoms, pregnancy, pain, or health concerns, respond ONLY with:
  "I'm not a doctor. This is general wellness info only. Please consult a healthcare professional for personalized advice."
- Keep replies positive, empathetic, and under 180 words.
- ALWAYS end with: "How else can I support your wellness journey?"`
          },
          { role: "user", content: message }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return res.status(500).json({ 
        reply: "I'm having trouble connecting right now. Please try again soon." 
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(500).json({ 
        reply: "I didn't get a clear response. How else can I support your wellness journey?" 
      });
    }

    res.json({ reply });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ 
      reply: "Sorry, something went wrong. How else can I support your wellness journey?" 
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Fathr AI Coach running safely on port ${port}`);
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

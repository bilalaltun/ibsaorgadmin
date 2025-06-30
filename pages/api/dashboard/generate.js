/**
 * @swagger
 * /api/gpt/generate:
 *   post:
 *     summary: ChatGPT API ile içerik üretir
 *     tags:
 *       - GPT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "Ahşap mobilya bakımı hakkında kısa bir yazı yazar mısın?"
 *     responses:
 *       200:
 *         description: Üretilen içerik
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   example: "Ahşap mobilyaların uzun ömürlü olması için..."
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sadece POST desteklenir." });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || prompt.length > 200) {
    return res.status(400).json({ error: "Geçerli bir prompt girin (max 200 karakter)." });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer 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`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!openaiRes.ok) {
      throw new Error("OpenAI yanıt vermedi.");
    }

    const json = await openaiRes.json();
    const content = json.choices?.[0]?.message?.content?.trim() || "";

    res.status(200).json({ content });
  } catch (err) {
    console.error("GPT API hatası:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}


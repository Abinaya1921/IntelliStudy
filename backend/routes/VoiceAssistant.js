// backend/routes/voiceassistant.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Configuration, OpenAIApi } from "openai";

const router = express.Router();
router.use(cors());
router.use(bodyParser.json());

// Load OpenAI API key from environment variable
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// POST /api/voice-assistant
router.post("/", async (req, res) => {
  const { question, language } = req.body;

  if (!question || question.trim() === "") {
    return res.status(400).json({ error: "Question text is required." });
  }

  try {
    const prompt = `You are an assistant answering in ${
      language === "ta-IN" ? "Tamil" : "English"
    }. Answer clearly:\n\n${question}`;

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 150,
      temperature: 0.7,
    });

    const answer = completion.data.choices[0].text.trim();
    res.json({ answer });
  } catch (error) {
    console.error("OpenAI voice assistant error:", error.message);
    res.status(500).json({ error: "Failed to get answer from AI." });
  }
});

export default router;

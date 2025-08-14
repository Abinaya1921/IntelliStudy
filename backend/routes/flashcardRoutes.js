import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

function generateFlashcardsFromText(text) {
  const sentences = text.split(/[.?!]/).map(s => s.trim()).filter(Boolean);
  const flashcards = [];

  for (let i = 0; i < sentences.length; i += 3) {
    flashcards.push({
      subtopic: sentences[i] || `Topic ${i/3 + 1}`,
      details: sentences.slice(i, i + 3),
    });
  }

  return flashcards;
}

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    let extractedText = "";

    if (req.file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } 
    else if (req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const data = await mammoth.extractRawText({ path: req.file.path });
      extractedText = data.value;
    } 
    else if (req.file.mimetype === "text/plain") {
      extractedText = fs.readFileSync(req.file.path, "utf-8");
    } 
    else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    fs.unlinkSync(req.file.path); // delete temp file

    const flashcards = generateFlashcardsFromText(extractedText);
    res.json({ flashcards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process file" });
  }
});

export default router;

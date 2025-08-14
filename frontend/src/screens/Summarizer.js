// src/pages/Summarizer.js
import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import axios from "axios";
import "./Summarizer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function Summarizer() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(false);

  const extractTextFromPDF = async (pdfFile) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      const pdf = await pdfjs.getDocument(typedArray).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      setText(fullText);
    };
    reader.readAsArrayBuffer(pdfFile);
  };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    extractTextFromPDF(selectedFile);
    setSummary(""); // Clear previous summary
  };

  const summarizeText = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/summarize", { text });
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      setSummary("Failed to generate summary.");
    }
    setLoading(false);
  };

  // For typing animation effect on summary text:
  const [typedSummary, setTypedSummary] = useState("");
  useEffect(() => {
    if (!summary) {
      setTypedSummary("");
      return;
    }
    let i = 0;
    setTypedSummary("");
    const interval = setInterval(() => {
      setTypedSummary(summary.substring(0, i));
      i++;
      if (i > summary.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [summary]);

  return (
    <div className="summarizer-container">
      <h2 className="text-2xl font-bold mb-4">📄 Text & PDF Summarizer</h2>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="mb-4"
        aria-label="Upload PDF for summarization"
      />
      <textarea
        placeholder="Or paste your text here..."
        className="summarizer-textarea"
        rows="6"
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      <button
        onClick={summarizeText}
        className="summarize-button"
        disabled={loading || !text.trim()}
      >
        {loading ? "Summarizing..." : "Summarize"}
      </button>

      {summary && (
        <div className="summary-output" aria-live="polite">
          <h3 className="font-bold">Summary:</h3>
          <p className="summary-typed">{typedSummary}</p>
        </div>
      )}

      {file && (
        <div className="mt-6">
          <Document file={file} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            {Array.from(new Array(numPages), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ))}
          </Document>
        </div>
      )}
    </div>
  );
}

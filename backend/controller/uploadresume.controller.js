import pdf from "pdf-parse";
import mammoth from "mammoth";

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let extractedText = "";

    if (req.file.size === 0) {
      return res.status(400).json({ error: "Uploaded file is empty." });
    }

    if (req.file.mimetype === "application/pdf") {
      try {
        // ✅ Read PDF from buffer
        const pdfData = await pdf(req.file.buffer);
        extractedText = pdfData.text || "No text extracted.";
      } catch (pdfError) {
        console.error("PDF Parsing Error:", pdfError);
        return res.status(500).json({ error: "Failed to parse PDF file." });
      }
    } else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      try {
        // ✅ Read DOCX from buffer
        const docxData = await mammoth.extractRawText({
          buffer: req.file.buffer,
        });
        extractedText = docxData.value || "No text extracted.";
      } catch (docxError) {
        console.error("DOCX Parsing Error:", docxError);
        return res.status(500).json({ error: "Failed to parse DOCX file." });
      }
    } else {
      return res.status(400).json({
        error: "Unsupported file type. Please upload a PDF or DOCX file.",
      });
    }

    res.json({
      success: true,
      fileName: req.file.originalname,
      text: extractedText,
    });
  } catch (error) {
    console.error("Error in ResumeUpload:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};
export default uploadResume;

import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';

/**
 * Extract text from a PDF file
 * Returns extracted text or null if no extractable text found
 */
export async function extractTextFromPDF(filePath: string): Promise<string | null> {
  try {
    console.log(`[PDF] File received: ${filePath}`);

    // Check if file exists
    await fs.access(filePath);

    // Get file stats for logging
    const stats = await fs.stat(filePath);
    console.log(`[PDF] File size: ${stats.size} bytes`);

    // Read PDF file
    console.log(`[PDF] Extraction started`);
    const dataBuffer = await fs.readFile(filePath);

    // Parse PDF using pdf-parse with data as Uint8Array
    const pdfParser = new PDFParse({ data: new Uint8Array(dataBuffer) });
    const textResult = await pdfParser.getText();
    const pdf = { text: textResult.text, numpages: textResult.pages.length };

    console.log(`[PDF] PDF loaded successfully. Pages: ${pdf.numpages}`);

    let extractedText = pdf.text || '';

    // Clean up extracted text
    extractedText = extractedText.trim();

    // Return null if no text found
    if (!extractedText || extractedText.length === 0) {
      console.log('[PDF] No extractable text found in PDF');
      return null;
    }

    console.log(`[PDF] Extraction successful. Extracted text length: ${extractedText.length} characters`);
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw {
      status: 400,
      message: 'Failed to extract text from PDF. The file may be corrupted or encrypted.',
    };
  }
}

/**
 * Validate PDF file structure
 * Returns true if PDF is valid and contains text
 */
export async function validatePDF(filePath: string): Promise<{ valid: boolean; hasText: boolean }> {
  try {
    // Check if file exists
    await fs.access(filePath);

    // Read PDF file
    const dataBuffer = await fs.readFile(filePath);

    // Try to parse PDF using pdf-parse with data as Uint8Array
    const pdfParser = new PDFParse({ data: new Uint8Array(dataBuffer) });
    const textResult = await pdfParser.getText();
    const pdf = { text: textResult.text, numpages: textResult.pages.length };

    // Check if PDF has pages
    if (pdf.numpages === 0) {
      return { valid: false, hasText: false };
    }

    // Check if PDF has extractable text
    const hasText = Boolean(pdf.text && pdf.text.trim().length > 0);
    return { valid: true, hasText };
  } catch (error) {
    console.error('Error validating PDF:', error);
    return { valid: false, hasText: false };
  }
}

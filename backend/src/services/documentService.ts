import fs from 'fs/promises';

let pdfParse: any;

// Dynamic import of pdf-parse
async function getPdfParser() {
  if (!pdfParse) {
    const module = await import('pdf-parse');
    pdfParse = module.default;
  }
  return pdfParse;
}

/**
 * Extract text from a PDF file
 * Returns extracted text or null if no extractable text found
 */
export async function extractTextFromPDF(filePath: string): Promise<string | null> {
  try {
    console.log(`Extracting text from PDF: ${filePath}`);

    // Check if file exists
    await fs.access(filePath);

    // Get PDF parser
    const parser = await getPdfParser();

    // Read PDF file
    const dataBuffer = await fs.readFile(filePath);

    // Parse PDF
    const pdf = await parser(dataBuffer);

    console.log(`PDF loaded. Pages: ${pdf.numpages}`);

    let extractedText = pdf.text || '';

    // Clean up extracted text
    extractedText = extractedText.trim();

    // Return null if no text found
    if (!extractedText || extractedText.length === 0) {
      console.log('No extractable text found in PDF');
      return null;
    }

    console.log(`Extracted ${extractedText.length} characters from PDF`);
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

    // Get PDF parser
    const parser = await getPdfParser();

    // Read PDF file
    const dataBuffer = await fs.readFile(filePath);

    // Try to parse PDF
    const pdf = await parser(dataBuffer);

    // Check if PDF has pages
    if (pdf.numpages === 0) {
      return { valid: false, hasText: false };
    }

    // Check if PDF has extractable text
    const hasText = pdf.text && pdf.text.trim().length > 0;
    return { valid: true, hasText };
  } catch (error) {
    console.error('Error validating PDF:', error);
    return { valid: false, hasText: false };
  }
}

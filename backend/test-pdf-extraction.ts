import { extractTextFromPDF } from './src/services/documentService.js';
import path from 'path';

async function testPDFExtraction() {
  const pdfPath = path.join(process.cwd(), 'uploads/contracts/1787817317990-Acme_Supplier_Contract_2026.pdf');
  
  console.log('\n========================================');
  console.log('PDF EXTRACTION TEST');
  console.log('========================================\n');
  
  try {
    console.log(`Testing PDF extraction for: ${pdfPath}\n`);
    
    const extractedText = await extractTextFromPDF(pdfPath);
    
    if (extractedText) {
      console.log('\n✅ PDF TEXT EXTRACTION SUCCESSFUL\n');
      console.log('--- EXTRACTED TEXT ---');
      console.log(extractedText.substring(0, 500)); // First 500 chars
      console.log('\n--- VERIFICATION ---');
      
      // Check for expected content
      const checks = [
        { name: 'Acme Corporation', found: extractedText.includes('Acme Corporation') },
        { name: 'ProcureAI Technologies Pvt. Ltd.', found: extractedText.includes('ProcureAI Technologies Pvt. Ltd.') },
        { name: '1 September 2026', found: extractedText.includes('1 September 2026') || extractedText.includes('September 2026') },
        { name: '31 August 2027', found: extractedText.includes('31 August 2027') || extractedText.includes('August 2027') },
        { name: 'INR 18,00,000', found: extractedText.includes('INR') && extractedText.includes('18') },
        { name: 'Net 30', found: extractedText.includes('Net 30') },
      ];
      
      checks.forEach(check => {
        console.log(`${check.found ? '✅' : '❌'} ${check.name}`);
      });
      
      console.log(`\nTotal extracted characters: ${extractedText.length}`);
      console.log('\n========================================\n');
    } else {
      console.log('❌ No text extracted from PDF');
    }
  } catch (error) {
    console.error('❌ PDF EXTRACTION FAILED:');
    console.error(error);
  }
}

testPDFExtraction().catch(console.error);

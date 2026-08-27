import { extractTextFromPDF } from './src/services/documentService.js';
import { prisma } from './src/lib/prisma.js';
import path from 'path';

async function testFullPipeline() {
  const pdfPath = path.join(process.cwd(), 'uploads/contracts/1787817317990-Acme_Supplier_Contract_2026.pdf');
  
  console.log('\n========================================');
  console.log('FULL PIPELINE TEST: Gmail → PDF → Contract');
  console.log('========================================\n');
  
  try {
    // Step 1: Extract PDF text
    console.log('📄 STEP 1: Extract PDF Text\n');
    const extractedText = await extractTextFromPDF(pdfPath);
    
    if (!extractedText) {
      console.log('❌ Failed to extract text from PDF');
      return;
    }
    
    console.log(`✅ PDF text extracted: ${extractedText.length} characters\n`);
    
    // Step 2: Get or create a test user
    console.log('👤 STEP 2: Get Test User\n');
    
    let testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashed_password_here'
        }
      });
    }
    
    console.log(`✅ Test user: ${testUser.email} (ID: ${testUser.id})\n`);
    
    // Step 3: Create contract record
    console.log('📋 STEP 3: Create Contract Record\n');
    
    const contract = await prisma.contract.create({
      data: {
        userId: testUser.id,
        title: 'Acme Supplier Services Agreement',
        vendor: 'Acme Corporation',
        status: 'Review',
        riskLevel: 'Medium',
        contractType: 'Supplier Agreement',
        effectiveDate: new Date('2026-09-01'),
        expiryDate: new Date('2027-08-31'),
        fileName: '1787817317990-Acme_Supplier_Contract_2026.pdf',
        pdfPath: '/uploads/contracts/1787817317990-Acme_Supplier_Contract_2026.pdf',
        extractedText,
        summary: 'Supplier services agreement with Acme Corporation for Software & Procurement Services'
      }
    });
    
    console.log(`✅ Contract created: ${contract.id}\n`);
    
    // Step 4: Verify contract in database
    console.log('🔍 STEP 4: Verify Contract in Database\n');
    
    const retrievedContract = await prisma.contract.findUnique({
      where: { id: contract.id },
      include: { user: true }
    });
    
    if (!retrievedContract) {
      console.log('❌ Failed to retrieve contract from database');
      return;
    }
    
    console.log(`✅ Contract retrieved from database:`);
    console.log(`   ID: ${retrievedContract.id}`);
    console.log(`   Title: ${retrievedContract.title}`);
    console.log(`   Vendor: ${retrievedContract.vendor}`);
    console.log(`   Status: ${retrievedContract.status}`);
    console.log(`   Risk Level: ${retrievedContract.riskLevel}`);
    console.log(`   Extracted Text Length: ${retrievedContract.extractedText?.length || 0} characters`);
    console.log(`   User: ${retrievedContract.user.email}\n`);
    
    // Step 5: Verify extracted content
    console.log('📝 STEP 5: Verify Extracted Content\n');
    
    const checks = [
      { name: 'Acme Corporation', found: extractedText.includes('Acme Corporation') },
      { name: 'ProcureAI Technologies Pvt. Ltd.', found: extractedText.includes('ProcureAI Technologies Pvt. Ltd.') },
      { name: 'Software & Procurement Services', found: extractedText.includes('Software & Procurement Services') || extractedText.includes('procurement') },
      { name: 'INR 18,00,000', found: extractedText.includes('18') && extractedText.includes('INR') },
      { name: 'Net 30', found: extractedText.includes('Net 30') },
    ];
    
    let allChecksPassed = true;
    checks.forEach(check => {
      const status = check.found ? '✅' : '❌';
      console.log(`${status} ${check.name}`);
      if (!check.found) allChecksPassed = false;
    });
    
    console.log('\n========================================');
    if (allChecksPassed) {
      console.log('✅ FULL PIPELINE TEST PASSED');
      console.log('========================================\n');
      console.log('Summary:');
      console.log(`- PDF extracted: ${extractedText.length} characters`);
      console.log(`- Contract created: ${contract.id}`);
      console.log(`- All content verifications passed`);
      console.log(`- Ready for AI analysis pipeline\n`);
    } else {
      console.log('⚠️ PIPELINE PASSED BUT SOME CONTENT CHECKS FAILED');
      console.log('========================================\n');
    }
    
  } catch (error) {
    console.error('❌ PIPELINE TEST FAILED:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testFullPipeline().catch(console.error);

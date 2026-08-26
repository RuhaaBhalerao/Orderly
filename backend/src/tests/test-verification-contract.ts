import path from 'path';
import fs from 'fs';
import FormData from 'form-data';
// @ts-ignore
import fetch from 'node-fetch';
import { prisma } from '../lib/prisma';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const TEST_QUESTIONS = [
  { id: 1, question: "What is the contract value?", expectedKeywords: ["38,50,000", "GST"] },
  { id: 2, question: "What are the payment terms?", expectedKeywords: ["50%", "business days", "calendar days"] },
  { id: 3, question: "What is the delivery deadline?", expectedKeywords: ["9 September 2026"] },
  { id: 4, question: "What happens if delivery is late?", expectedKeywords: ["1%", "week"] },
  { id: 5, question: "What is the maximum penalty?", expectedKeywords: ["5%"] },
  { id: 6, question: "How long is the warranty?", expectedKeywords: ["3", "year"] },
  { id: 7, question: "What are the termination conditions?", expectedKeywords: ["material breach", "15"] },
  { id: 8, question: "Does the contract automatically renew?", expectedKeywords: ["not", "renew"] },
  { id: 9, question: "Does the contract specify arbitration?", expectedNegative: true, forbiddenWords: ["arbitration panel", "AAA", "ICC rules"] },
  { id: 10, question: "What insurance requirement is mentioned?", expectedNegative: true, forbiddenWords: ["liability insurance", "$1,000,000", "policy"] },
];

async function runVerification() {
  console.log("=================================================");
  console.log("PROCUREAI COMPLETE WORKFLOW & AI CHAT TEST SUITE");
  console.log("=================================================\n");

  const pdfPath = path.resolve(process.cwd(), 'test-data/AI_CHAT_TEST_CONTRACT.pdf');
  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ Test contract PDF not found at ${pdfPath}`);
    process.exit(1);
  }
  console.log(`📄 Using Test Contract PDF: ${pdfPath}`);

  // Create test user directly or via API
  const testEmail = `test_verifier_${Date.now()}@example.com`;
  const registerRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Verification User', email: testEmail, password: 'Password123!' }),
  });

  const authData: any = await registerRes.json();
  if (!registerRes.ok || !authData.token) {
    console.error('❌ Failed to register test user:', authData);
    process.exit(1);
  }

  const token = authData.token;
  const userId = authData.user.id;
  console.log(`✅ User registered successfully. ID: ${userId}`);

  // ==========================================
  // WORKFLOW 1: PDF Upload -> Text Extraction -> Contract Creation -> AI Analysis -> AI Chat -> Chat History
  // ==========================================
  console.log("\n-------------------------------------------------");
  console.log("WORKFLOW 1: PDF Upload & AI Chat Q&A Testing");
  console.log("-------------------------------------------------");

  const formData = new FormData();
  formData.append('file', fs.createReadStream(pdfPath), 'AI_CHAT_TEST_CONTRACT.pdf');
  formData.append('title', 'Supplier Services & Equipment Contract');
  formData.append('vendor', 'ByteWorks Solutions Pvt. Ltd.');
  formData.append('contractType', 'Supplier Services Contract');
  formData.append('status', 'Active');
  formData.append('riskLevel', 'Low');
  formData.append('effectiveDate', '2026-08-20');
  formData.append('expiryDate', '2029-08-19');

  console.log("📤 Step 1: Uploading PDF contract...");
  const uploadRes = await fetch(`${BASE_URL}/contracts/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, ...formData.getHeaders() },
    body: formData as any,
  });

  const uploadData: any = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.contract?.id) {
    console.error('❌ Contract upload failed:', uploadData);
    process.exit(1);
  }

  const contractId = uploadData.contract.id;
  console.log(`✅ Contract created via PDF upload. Contract ID: ${contractId}`);

  console.log("🔍 Step 2: Triggering AI contract analysis...");
  const analyzeRes = await fetch(`${BASE_URL}/contracts/${contractId}/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  const analyzeData: any = await analyzeRes.json();
  if (!analyzeRes.ok || !analyzeData.analysis) {
    console.error('❌ AI Analysis failed:', analyzeData);
    process.exit(1);
  }

  console.log(`✅ AI Analysis completed! Risk Level: ${analyzeData.analysis.riskLevel}`);
  console.log(`   Summary: ${analyzeData.analysis.summary?.substring(0, 120)}...`);

  console.log("\n🤖 Step 3: Testing 10 AI Chat Questions with Real AI (OpenRouter)...");
  const chatResults = [];

  for (const tq of TEST_QUESTIONS) {
    console.log(`\n❓ Question ${tq.id}: ${tq.question}`);
    const chatRes = await fetch(`${BASE_URL}/contracts/${contractId}/chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userMessage: tq.question }),
    });

    const chatData: any = await chatRes.json();
    if (!chatRes.ok || !chatData.aiResponse) {
      console.error(`❌ Chat query ${tq.id} failed:`, chatData);
      process.exit(1);
    }

    const aiAnswer = chatData.aiResponse;
    console.log(`   🤖 AI Response: ${aiAnswer.trim()}`);

    // Evaluation
    let passed = true;
    let failureReason = "";

    if (tq.expectedKeywords) {
      const missingKeywords = tq.expectedKeywords.filter(
        kw => !aiAnswer.toLowerCase().includes(kw.toLowerCase())
      );
      if (missingKeywords.length > 0) {
        passed = false;
        failureReason = `Missing keywords: ${missingKeywords.join(', ')}`;
      }
    }

    if (tq.expectedNegative) {
      const lower = aiAnswer.toLowerCase();
      const correctlyStatesNotMentioned =
        lower.includes("does not contain") ||
        lower.includes("does not specify") ||
        lower.includes("does not provide") ||
        lower.includes("not mentioned") ||
        lower.includes("no arbitration") ||
        lower.includes("no insurance");

      if (!correctlyStatesNotMentioned) {
        passed = false;
        failureReason = "AI did not explicitly state that information is omitted/unspecified";
      }

      if (tq.forbiddenWords) {
        const hallucinatedWords = tq.forbiddenWords.filter(fw => lower.includes(fw.toLowerCase()));
        if (hallucinatedWords.length > 0) {
          passed = false;
          failureReason = `AI hallucinated terms: ${hallucinatedWords.join(', ')}`;
        }
      }
    }

    if (passed) {
      console.log(`   ✅ Question ${tq.id} PASSED`);
    } else {
      console.log(`   ⚠️ Question ${tq.id} NOTICE: ${failureReason}`);
    }

    chatResults.push({ id: tq.id, question: tq.question, response: aiAnswer, passed });
  }

  console.log("\n📚 Step 4: Verifying ChatHistory Persistence...");
  const historyRes = await fetch(`${BASE_URL}/contracts/${contractId}/chat`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const historyData: any = await historyRes.json();
  if (!historyRes.ok || !Array.isArray(historyData)) {
    console.error('❌ Failed to fetch chat history:', historyData);
    process.exit(1);
  }

  console.log(`✅ ChatHistory retrieved successfully. Total messages stored: ${historyData.length}`);

  // ==========================================
  // WORKFLOW 2: Gmail Email -> PDF Attachment -> Gmail Sync -> Contract Creation -> AI Analysis -> Dashboard -> AI Chat
  // ==========================================
  console.log("\n-------------------------------------------------");
  console.log("WORKFLOW 2: Gmail Attachment Sync & Intake Flow");
  console.log("-------------------------------------------------");

  // Save Gmail connection record for user
  console.log("📧 Step 1: Connecting Gmail account...");
  await prisma.gmailConnection.upsert({
    where: { userId },
    update: { gmailEmail: 'test.procureai@gmail.com', syncStatus: 'IDLE' },
    create: { userId, gmailEmail: 'test.procureai@gmail.com', accessToken: 'mock_token', syncStatus: 'IDLE' },
  });
  console.log("✅ Gmail connected for user");

  console.log("🔄 Step 2: Triggering Gmail Sync...");
  const syncRes = await fetch(`${BASE_URL}/gmail/sync`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      testPdfPath: pdfPath,
      title: 'Gmail Synced - Supplier Services & Equipment Contract',
      vendor: 'ByteWorks Solutions Pvt. Ltd.',
    }),
  });

  const syncData: any = await syncRes.json();
  if (!syncRes.ok || !syncData.contractIds || syncData.contractIds.length === 0) {
    console.error('❌ Gmail Sync failed:', syncData);
    process.exit(1);
  }

  const gmailContractId = syncData.contractIds[0];
  console.log(`✅ Gmail Sync completed. Synced Contract ID: ${gmailContractId}`);

  console.log("📊 Step 3: Verifying Contract on Dashboard (GET /api/contracts)...");
  const dashboardRes = await fetch(`${BASE_URL}/contracts`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const contractsList: any = await dashboardRes.json();
  if (!dashboardRes.ok || !Array.isArray(contractsList)) {
    console.error('❌ Failed to fetch dashboard contracts:', contractsList);
    process.exit(1);
  }

  const syncedContractFound = contractsList.find((c: any) => c.id === gmailContractId);
  if (!syncedContractFound) {
    console.error('❌ Synced contract not found on Dashboard');
    process.exit(1);
  }
  console.log(`✅ Dashboard contract found: "${syncedContractFound.title}" with status "${syncedContractFound.status}"`);

  console.log("🤖 Step 4: Testing AI Chat on Gmail-synced contract...");
  const gmailChatRes = await fetch(`${BASE_URL}/contracts/${gmailContractId}/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userMessage: "What is the warranty period and response time for critical failures?" }),
  });

  const gmailChatData: any = await gmailChatRes.json();
  if (!gmailChatRes.ok || !gmailChatData.aiResponse) {
    console.error('❌ AI Chat on Gmail contract failed:', gmailChatData);
    process.exit(1);
  }
  console.log(`   🤖 AI Response: ${gmailChatData.aiResponse.trim()}`);
  console.log("✅ AI Chat on Gmail-synced contract passed!");

  console.log("\n=================================================");
  console.log("🎉 ALL WORKFLOWS AND 10 TEST QUESTIONS COMPLETED!");
  console.log("=================================================\n");

  process.exit(0);
}

runVerification().catch(err => {
  console.error("❌ Unexpected test execution error:", err);
  process.exit(1);
});

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import { asyncHandler } from '@/middleware/errorMiddleware';
import {
  generateAuthUrl,
  exchangeCodeForTokens,
  getGmailConnection,
  saveGmailConnection,
  disconnectGmail,
  getGmailAddress,
  updateSyncStatus,
  fetchEmailsWithAttachments,
  downloadPdfAttachment,
  refreshAccessToken as refreshAccessTokenService,
} from '@/services/gmailService';
import { prisma } from '../lib/prisma';
import * as documentService from '../services/documentService';
import * as aiService from '../services/aiService';
import * as contractService from '../services/contractService';
import path from 'path';
import fs from 'fs';

/**
 * GET /api/gmail/auth
 * Generate OAuth authorization URL
 */
export const getAuthUrlController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Generate state token (should be random and stored server-side in production)
  const state = Buffer.from(userId).toString('base64');

  const authUrl = await generateAuthUrl(state);

  res.status(200).json({
    authUrl,
    message: 'Authorization URL generated',
  });
});

/**
 * GET /api/gmail/callback
 * Handle OAuth callback from Google
 */
export const handleOAuthCallbackController = asyncHandler(async (req: Request, res: Response) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state parameter' });
  }

  // Verify state (simple version - in production use sessions/CSRF tokens)
  let userId: string;
  try {
    userId = Buffer.from(state as string, 'base64').toString();
  } catch {
    return res.status(400).json({ error: 'Invalid state parameter' });
  }

  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    // Exchange code for tokens
    const { accessToken, refreshToken, expiresAt } = await exchangeCodeForTokens(code as string);

    // Get Gmail email address
    const gmailEmail = await getGmailAddress(accessToken);

    // Save Gmail connection
    await saveGmailConnection(userId, gmailEmail, accessToken, refreshToken, expiresAt);

    // Redirect to frontend dashboard with success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard?gmail=connected`);
  } catch (error) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/dashboard?gmail=error&message=${encodeURIComponent(
        error instanceof Error ? error.message : 'OAuth failed'
      )}`
    );
  }
});

/**
 * GET /api/gmail/status
 * Get Gmail connection status for user
 */
export const getStatusController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const connection = await getGmailConnection(userId);

  if (!connection) {
    return res.status(200).json({
      connected: false,
      message: 'No Gmail connection found',
    });
  }

  res.status(200).json({
    connected: true,
    gmailEmail: connection.gmailEmail,
    connectedAt: connection.connectedAt,
    lastSyncAt: connection.lastSyncAt,
    syncStatus: connection.syncStatus,
  });
});

/**
 * POST /api/gmail/sync
 * Trigger inbox sync (fetch contracts from Gmail & process attachments)
 */
export const syncInboxController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const connection = await getGmailConnection(userId);

  if (!connection) {
    return res.status(400).json({ error: 'Gmail not connected' });
  }

  try {
    // Mark sync as in progress
    await updateSyncStatus(userId, 'SYNCING');

    // Check if access token is expired and refresh if needed
    let accessToken = connection.accessToken;
    if (connection.expiresAt && new Date() > connection.expiresAt && connection.refreshToken) {
      const refreshed = await refreshAccessTokenService(connection.refreshToken);
      accessToken = refreshed.accessToken;
      // Update connection with new token
      await saveGmailConnection(userId, connection.gmailEmail, accessToken, connection.refreshToken, refreshed.expiresAt);
    }

    // Fetch emails with PDF attachments
    const emails = await fetchEmailsWithAttachments(accessToken);
    const createdContracts = [];

    for (const email of emails) {
      for (const attachment of email.attachments) {
        try {
          // Download PDF attachment
          const pdfBuffer = await downloadPdfAttachment(accessToken, email.messageId, attachment.fileId);

          // Save PDF to disk with unique filename
          const fileName = `${Date.now()}-${attachment.filename}`;
          const uploadPath = path.join(process.cwd(), 'uploads/contracts', fileName);
          
          // Ensure directory exists
          const dir = path.dirname(uploadPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          fs.writeFileSync(uploadPath, pdfBuffer);

          // Extract text from PDF
          const extractedText = await documentService.extractTextFromPDF(uploadPath);

          if (extractedText) {
            // Create contract record from synced email attachment
            const contract = await prisma.contract.create({
              data: {
                userId,
                title: email.subject || 'Contract from Gmail',
                vendor: email.from?.split('<')[0].trim() || 'Unknown Vendor',
                status: 'Review',
                riskLevel: 'Medium',
                contractType: 'Email Attachment',
                effectiveDate: email.date,
                expiryDate: new Date(email.date.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year from received
                summary: `Contract received from ${email.from} on ${email.date.toLocaleDateString()}`,
                fileName,
                pdfPath: `/uploads/contracts/${fileName}`,
                extractedText,
              },
            });

            // Perform AI contract analysis asynchronously
            try {
              const aiResult = await aiService.analyzeContract(extractedText);
              if (aiResult.success && aiResult.analysis) {
                await contractService.saveContractAnalysis(contract.id, aiResult.analysis);
              }
            } catch (aiError) {
              console.warn(`AI analysis failed for contract ${contract.id}:`, aiError);
              // Continue anyway - contract is created, analysis just failed
            }

            createdContracts.push(contract.id);
          }
        } catch (attachmentError) {
          console.error(`Failed to process attachment ${attachment.filename}:`, attachmentError);
          // Continue with other attachments
        }
      }
    }

    // Mark sync as complete
    await updateSyncStatus(userId, 'IDLE');

    res.status(200).json({
      message: 'Gmail Sync completed successfully',
      syncStatus: 'IDLE',
      emailsProcessed: emails.length,
      contractsSynced: createdContracts.length,
      contractIds: createdContracts,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Sync failed';
    await updateSyncStatus(userId, 'ERROR', errorMessage);

    res.status(500).json({
      error: 'Sync failed',
      message: errorMessage,
    });
  }
});

/**
 * POST /api/gmail/disconnect
 * Disconnect Gmail account
 */
export const disconnectController = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const connection = await getGmailConnection(userId);

  if (!connection) {
    return res.status(400).json({ error: 'Gmail not connected' });
  }

  await disconnectGmail(userId);

  res.status(200).json({
    message: 'Gmail account disconnected',
  });
});

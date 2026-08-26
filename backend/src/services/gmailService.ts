import { prisma } from '../lib/prisma';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { encryptData, decryptData } from '../utils/encryption';

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
];

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/gmail/callback';

/**
 * Create OAuth2 client with decrypted credentials
 */
function getOAuth2Client(accessToken?: string) {
  const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
  
  if (accessToken) {
    oauth2Client.setCredentials({ access_token: accessToken });
  }
  
  return oauth2Client;
}

/**
 * Get decrypted Gmail connection
 */
async function getDecryptedGmailConnection(userId: string) {
  const connection = await prisma.gmailConnection.findUnique({
    where: { userId },
  });

  if (!connection) {
    return null;
  }

  // Decrypt tokens
  return {
    ...connection,
    accessToken: connection.accessToken ? decryptData(connection.accessToken) : '',
    refreshToken: connection.refreshToken ? decryptData(connection.refreshToken) : undefined,
  };
}

/**
 * Get Gmail authorization URL for user
 */
export async function generateAuthUrl(state: string): Promise<string> {
  const oauth2Client = getOAuth2Client();
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GMAIL_SCOPES,
    state: state,
    prompt: 'consent', // Force re-consent to get refresh token
  });

  return authUrl;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}> {
  const oauth2Client = getOAuth2Client();
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    const expiresIn = tokens.expiry_date ? 
      new Date(tokens.expiry_date) : 
      new Date(Date.now() + 3600 * 1000); // 1 hour default

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || undefined,
      expiresAt: expiresIn,
    };
  } catch (error) {
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresAt: Date;
}> {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    if (!credentials.access_token) {
      throw new Error('No access token in refresh response');
    }

    const expiresAt = credentials.expiry_date ?
      new Date(credentials.expiry_date) :
      new Date(Date.now() + 3600 * 1000);

    return {
      accessToken: credentials.access_token,
      expiresAt,
    };
  } catch (error) {
    throw new Error(`Failed to refresh access token: ${error}`);
  }
}

/**
 * Get Gmail connection (with decrypted tokens)
 */
export async function getGmailConnection(userId: string) {
  return getDecryptedGmailConnection(userId);
}

/**
 * Save Gmail connection with encrypted tokens
 */
export async function saveGmailConnection(
  userId: string,
  gmailEmail: string,
  accessToken: string,
  refreshToken?: string,
  expiresAt?: Date
) {
  // Encrypt tokens before storing
  const encryptedAccessToken = encryptData(accessToken);
  const encryptedRefreshToken = refreshToken ? encryptData(refreshToken) : undefined;

  return prisma.gmailConnection.upsert({
    where: { userId },
    update: {
      gmailEmail,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken || undefined,
      expiresAt,
      syncStatus: 'IDLE',
      syncError: null,
    },
    create: {
      userId,
      gmailEmail,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      expiresAt,
    },
  });
}

/**
 * Disconnect Gmail account
 */
export async function disconnectGmail(userId: string) {
  return prisma.gmailConnection.delete({
    where: { userId },
  });
}

/**
 * Fetch Gmail address from connected account
 */
export async function getGmailAddress(accessToken: string): Promise<string> {
  const oauth2Client = getOAuth2Client(accessToken);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client as any });

  try {
    const profile = await gmail.users.getProfile({ userId: 'me' });
    return profile.data.emailAddress || '';
  } catch (error) {
    throw new Error(`Failed to get Gmail profile: ${error}`);
  }
}

/**
 * Fetch emails with PDF attachments from Gmail inbox
 */
export async function fetchEmailsWithAttachments(
  accessToken: string,
  maxResults: number = 10
): Promise<
  {
    messageId: string;
    subject: string;
    from: string;
    date: Date;
    attachments: { filename: string; mimeType: string; fileId: string }[];
  }[]
> {
  const oauth2Client = getOAuth2Client(accessToken);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client as any });

  try {
    // Get list of messages with PDF attachments
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: 'filename:pdf', // Search for emails with PDF attachments
      maxResults,
    });

    const messages = listResponse.data.messages || [];
    const emails = [];

    for (const msg of messages) {
      if (!msg.id) continue;

      const messageResponse = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full',
      });

      const msgData = messageResponse.data;
      const headers = msgData.payload?.headers || [];
      
      const getHeader = (name: string) =>
        headers.find((h: any) => h.name === name)?.value || '';

      const subject = getHeader('Subject');
      const from = getHeader('From');
      const dateStr = getHeader('Date');
      const date = new Date(dateStr);

      const attachments = [];
      const parts = msgData.payload?.parts || [];

      for (const part of parts) {
        if (part.filename && part.mimeType?.includes('pdf')) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType,
            fileId: part.body?.attachmentId || '',
          });
        }
      }

      if (attachments.length > 0) {
        emails.push({
          messageId: msg.id,
          subject,
          from,
          date,
          attachments,
        });
      }
    }

    return emails;
  } catch (error) {
    throw new Error(`Failed to fetch emails: ${error}`);
  }
}

/**
 * Download PDF attachment from Gmail
 */
export async function downloadPdfAttachment(
  accessToken: string,
  messageId: string,
  attachmentId: string
): Promise<Buffer> {
  const oauth2Client = getOAuth2Client(accessToken);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client as any });

  try {
    const attachmentResponse = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId,
      id: attachmentId,
    });

    const data = attachmentResponse.data.data;
    if (!data) {
      throw new Error('No attachment data');
    }

    // Data is base64url encoded
    const buffer = Buffer.from(data, 'base64');
    return buffer;
  } catch (error) {
    throw new Error(`Failed to download attachment: ${error}`);
  }
}

/**
 * Update sync status
 */
export async function updateSyncStatus(
  userId: string,
  status: 'IDLE' | 'SYNCING' | 'ERROR',
  error?: string
) {
  return prisma.gmailConnection.update({
    where: { userId },
    data: {
      syncStatus: status,
      syncError: error || null,
      lastSyncAt: status === 'IDLE' ? new Date() : undefined,
    },
  });
}

import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import * as contractService from '../services/contractService';
import * as documentService from '../services/documentService';
import { getUploadFileUrl, deleteUploadedFile } from '../middleware/uploadMiddleware';
import { prisma } from '../lib/prisma';

/**
 * POST /api/contracts/upload
 * Upload a PDF contract and extract text
 */
export async function uploadContractController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({ message: 'No PDF file uploaded' });
      return;
    }

    const file = req.file;
    console.log(`File uploaded: ${file.filename}`);

    // Validate PDF
    const validation = await documentService.validatePDF(file.path);
    if (!validation.valid) {
      // Delete the uploaded file
      await deleteUploadedFile(file.filename);
      res.status(400).json({ message: 'Invalid or corrupted PDF file' });
      return;
    }

    if (!validation.hasText) {
      // Delete the uploaded file
      await deleteUploadedFile(file.filename);
      res.status(400).json({
        message: 'This PDF does not contain extractable text. OCR support will be added later.',
      });
      return;
    }

    // Extract text from PDF
    let extractedText: string | null = null;
    try {
      extractedText = await documentService.extractTextFromPDF(file.path);
    } catch (error: any) {
      // Delete the uploaded file
      await deleteUploadedFile(file.filename);
      if (error.status) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'Failed to extract text from PDF' });
      }
      return;
    }

    // Extract metadata from request body
    const {
      title,
      vendor,
      status,
      riskLevel,
      contractType,
      effectiveDate,
      expiryDate,
      summary,
    } = req.body;

    // Validate required fields
    if (!title || !vendor || !status || !riskLevel || !contractType || !effectiveDate || !expiryDate) {
      // Delete the uploaded file
      await deleteUploadedFile(file.filename);
      res.status(400).json({
        message: 'Missing required fields: title, vendor, status, riskLevel, contractType, effectiveDate, expiryDate',
      });
      return;
    }

    // Create contract with document information
    const contract = await prisma.contract.create({
      data: {
        userId: req.userId,
        title,
        vendor,
        status,
        riskLevel,
        contractType,
        effectiveDate: new Date(effectiveDate),
        expiryDate: new Date(expiryDate),
        summary: summary || null,
        fileName: file.originalname,
        pdfPath: getUploadFileUrl(file.filename),
        extractedText: extractedText || null,
      },
    });

    console.log(`Contract created: ${contract.id}`);

    res.status(201).json({
      message: 'Contract uploaded successfully',
      contract: {
        id: contract.id,
        title: contract.title,
        vendor: contract.vendor,
        status: contract.status,
        riskLevel: contract.riskLevel,
        contractType: contract.contractType,
        fileName: contract.fileName,
        pdfPath: contract.pdfPath,
        extractedText: contract.extractedText ? contract.extractedText.substring(0, 500) + '...' : null, // Return first 500 chars
        createdAt: contract.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error uploading contract:', error);

    // Clean up uploaded file on error
    if (req.file) {
      try {
        await deleteUploadedFile(req.file.filename);
      } catch (deleteError) {
        console.error('Error cleaning up uploaded file:', deleteError);
      }
    }

    res.status(500).json({ message: 'Internal server error' });
  }
}

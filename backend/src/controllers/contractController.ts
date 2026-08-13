import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../types/auth';
import * as contractService from '../services/contractService';
import * as aiService from '../services/aiService';

/**
 * GET /api/contracts
 * Get all contracts for the authenticated user
 */
export async function getContractsController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const contracts = await contractService.getContractsByUserId(req.userId);
    res.status(200).json(contracts);
  } catch (error: any) {
    console.error('Error getting contracts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * GET /api/contracts/:id
 * Get a single contract (includes analysis if available)
 */
export async function getContractController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const contract = await contractService.getContractById(id, req.userId);

    // Format response with analysis if available
    const response: any = contract;

    if (
      contract.aiSummary ||
      contract.aiContractType ||
      contract.aiVendor ||
      contract.aiKeyTerms ||
      contract.aiRisks ||
      contract.aiRecommendations
    ) {
      response.analysis = aiService.formatAnalysisResponse({
        aiSummary: contract.aiSummary,
        aiContractType: contract.aiContractType,
        aiVendor: contract.aiVendor,
        aiEffectiveDate: contract.aiEffectiveDate,
        aiExpiryDate: contract.aiExpiryDate,
        aiRiskLevel: contract.aiRiskLevel,
        aiKeyTerms: contract.aiKeyTerms,
        aiRisks: contract.aiRisks,
        aiRecommendations: contract.aiRecommendations,
      });
    } else {
      response.analysis = null;
    }

    res.status(200).json(response);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      console.error('Error getting contract:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * POST /api/contracts
 * Create a new contract
 */
export async function createContractController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().reduce((acc, err: any) => {
          acc[err.param || 'unknown'] = err.msg;
          return acc;
        }, {} as Record<string, string>),
      });
      return;
    }

    const contract = await contractService.createContract(req.userId, req.body);
    res.status(201).json(contract);
  } catch (error: any) {
    console.error('Error creating contract:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * PUT /api/contracts/:id
 * Update a contract
 */
export async function updateContractController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().reduce((acc, err: any) => {
          acc[err.param || 'unknown'] = err.msg;
          return acc;
        }, {} as Record<string, string>),
      });
      return;
    }

    const { id } = req.params;
    const contract = await contractService.updateContract(id, req.userId, req.body);
    res.status(200).json(contract);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      console.error('Error updating contract:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * POST /api/contracts/:id/analyze
 * Analyze a contract using AI
 */
export async function analyzeContractController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    // Get contract and verify ownership
    const contract = await contractService.getContractById(id, req.userId);

    // Check if contract has extracted text
    if (!contract.extractedText) {
      res.status(400).json({
        message: 'Cannot analyze contract',
        error: 'Contract does not have extracted text. Please upload a PDF first.',
      });
      return;
    }

    console.log(`[Analyze] Starting analysis for contract ${id}`);

    // Mark as analyzing
    await contractService.updateContractAnalysisStatus(id, 'PENDING', null);

    // Call AI service
    const aiResult = await aiService.analyzeContract(contract.extractedText);

    if (!aiResult.success) {
      console.error(`[Analyze] Analysis failed for contract ${id}:`, aiResult.error);
      // Update status to FAILED
      await contractService.updateContractAnalysisStatus(id, 'FAILED', aiResult.error || 'Unknown error');
      res.status(400).json({
        message: 'Contract analysis failed',
        error: aiResult.error,
      });
      return;
    }

    // Save analysis to database
    const analysis = aiResult.analysis!;
    const updated = await contractService.saveContractAnalysis(id, analysis);

    console.log(`[Analyze] Analysis complete for contract ${id}`);

    res.status(200).json({
      message: 'Contract analyzed successfully',
      analysis: aiService.formatAnalysisResponse({
        aiSummary: updated.aiSummary,
        aiContractType: updated.aiContractType,
        aiVendor: updated.aiVendor,
        aiEffectiveDate: updated.aiEffectiveDate,
        aiExpiryDate: updated.aiExpiryDate,
        aiRiskLevel: updated.aiRiskLevel,
        aiKeyTerms: updated.aiKeyTerms,
        aiRisks: updated.aiRisks,
        aiRecommendations: updated.aiRecommendations,
      }),
      textTruncated: aiResult.textTruncated || false,
    });
  } catch (error: any) {
    console.error('Error analyzing contract:', error);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

/**
 * DELETE /api/contracts/:id
 * Delete a contract
 */
export async function deleteContractController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    await contractService.deleteContract(id, req.userId);
    res.status(204).send();
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      console.error('Error deleting contract:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

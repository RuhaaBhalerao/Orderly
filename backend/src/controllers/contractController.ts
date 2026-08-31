import { Response } from 'express';
import { AuthRequest } from '../types/auth.js';
import * as contractService from '../services/contractService.js';
import { getUploadFileUrl } from '../middleware/uploadMiddleware.js';

export async function getContractsController(req: AuthRequest, res: Response) {
  try {
    if (!req.userId || !req.userRole) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const contracts = await contractService.getContracts(req.userId, req.userRole);
    res.status(200).json(contracts);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}

export async function getContractController(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const contract = await contractService.getContractById(id);
    res.status(200).json(contract);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}

export async function createContractController(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    let fileName: string | undefined;
    let fileUrl: string | undefined;
    let fileType: string | undefined;
    let fileSize: number | undefined;

    if (req.file) {
      fileName = req.file.filename;
      fileUrl = getUploadFileUrl(req.file.filename);
      fileType = req.file.mimetype;
      fileSize = req.file.size;
    }

    const contract = await contractService.createContract(req.userId, {
      ...req.body,
      fileName: fileName || req.body.fileName,
      fileUrl: fileUrl || req.body.fileUrl,
      fileType: fileType || req.body.fileType,
      fileSize: fileSize || req.body.fileSize,
    });

    res.status(201).json(contract);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}

export async function deleteContractController(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const result = await contractService.deleteContract(id, req.userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}

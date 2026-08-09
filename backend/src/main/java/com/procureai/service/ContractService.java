package com.procureai.service;

import com.procureai.dto.ContractRequest;
import com.procureai.dto.ContractResponse;
import com.procureai.model.Contract;
import com.procureai.model.User;
import com.procureai.repository.ContractRepository;
import com.procureai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractService {
    
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    
    /**
     * Get all contracts for the authenticated user
     */
    public List<ContractResponse> getAllContractsForUser(String userId) {
        List<Contract> contracts = contractRepository.findByUserId(userId);
        return contracts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a specific contract by ID
     * Verifies that the contract belongs to the user
     */
    public ContractResponse getContractById(String contractId, String userId) {
        Contract contract = contractRepository.findByIdAndUserId(contractId, userId)
                .orElseThrow(() -> new RuntimeException("Contract not found or does not belong to user"));
        
        return mapToResponse(contract);
    }
    
    /**
     * Create a new contract for the authenticated user
     */
    public ContractResponse createContract(ContractRequest request, String userId) {
        // Get the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Create contract
        Contract contract = Contract.builder()
                .user(user)
                .title(request.getTitle())
                .vendor(request.getVendor())
                .status(request.getStatus())
                .riskLevel(request.getRiskLevel())
                .summary(request.getSummary())
                .contractType(request.getContractType())
                .effectiveDate(request.getEffectiveDate())
                .expiryDate(request.getExpiryDate())
                .pdfPath(request.getPdfPath())
                .build();
        
        // Save contract
        Contract savedContract = contractRepository.save(contract);
        
        return mapToResponse(savedContract);
    }
    
    /**
     * Update an existing contract
     * Verifies that the contract belongs to the user
     */
    public ContractResponse updateContract(String contractId, ContractRequest request, String userId) {
        Contract contract = contractRepository.findByIdAndUserId(contractId, userId)
                .orElseThrow(() -> new RuntimeException("Contract not found or does not belong to user"));
        
        // Update fields
        contract.setTitle(request.getTitle());
        contract.setVendor(request.getVendor());
        contract.setStatus(request.getStatus());
        contract.setRiskLevel(request.getRiskLevel());
        contract.setSummary(request.getSummary());
        contract.setContractType(request.getContractType());
        contract.setEffectiveDate(request.getEffectiveDate());
        contract.setExpiryDate(request.getExpiryDate());
        contract.setPdfPath(request.getPdfPath());
        
        // Save updated contract
        Contract updatedContract = contractRepository.save(contract);
        
        return mapToResponse(updatedContract);
    }
    
    /**
     * Delete a contract
     * Verifies that the contract belongs to the user
     */
    public void deleteContract(String contractId, String userId) {
        Contract contract = contractRepository.findByIdAndUserId(contractId, userId)
                .orElseThrow(() -> new RuntimeException("Contract not found or does not belong to user"));
        
        contractRepository.delete(contract);
    }
    
    /**
     * Convert Contract entity to ContractResponse DTO
     */
    private ContractResponse mapToResponse(Contract contract) {
        return ContractResponse.builder()
                .id(contract.getId())
                .title(contract.getTitle())
                .vendor(contract.getVendor())
                .status(contract.getStatus())
                .riskLevel(contract.getRiskLevel())
                .summary(contract.getSummary())
                .contractType(contract.getContractType())
                .effectiveDate(contract.getEffectiveDate())
                .expiryDate(contract.getExpiryDate())
                .pdfPath(contract.getPdfPath())
                .createdAt(contract.getCreatedAt())
                .updatedAt(contract.getUpdatedAt())
                .build();
    }
}

package com.procureai.controller;

import com.procureai.dto.ContractRequest;
import com.procureai.dto.ContractResponse;
import com.procureai.service.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ContractController {
    
    private final ContractService contractService;
    
    /**
     * Get all contracts for the authenticated user
     * GET /api/contracts
     * Protected endpoint - requires JWT token
     */
    @GetMapping
    public ResponseEntity<List<ContractResponse>> getAllContracts(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        List<ContractResponse> contracts = contractService.getAllContractsForUser(userId);
        return ResponseEntity.ok(contracts);
    }
    
    /**
     * Get a specific contract by ID
     * GET /api/contracts/{id}
     * Protected endpoint - requires JWT token
     * Verifies that the contract belongs to the authenticated user
     */
    @GetMapping("/{id}")
    public ResponseEntity<ContractResponse> getContractById(
            @PathVariable String id,
            Authentication authentication
    ) {
        String userId = (String) authentication.getPrincipal();
        ContractResponse contract = contractService.getContractById(id, userId);
        return ResponseEntity.ok(contract);
    }
    
    /**
     * Create a new contract for the authenticated user
     * POST /api/contracts
     * Protected endpoint - requires JWT token
     */
    @PostMapping
    public ResponseEntity<ContractResponse> createContract(
            @Valid @RequestBody ContractRequest request,
            Authentication authentication
    ) {
        String userId = (String) authentication.getPrincipal();
        ContractResponse contract = contractService.createContract(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(contract);
    }
    
    /**
     * Update an existing contract
     * PUT /api/contracts/{id}
     * Protected endpoint - requires JWT token
     * Verifies that the contract belongs to the authenticated user
     */
    @PutMapping("/{id}")
    public ResponseEntity<ContractResponse> updateContract(
            @PathVariable String id,
            @Valid @RequestBody ContractRequest request,
            Authentication authentication
    ) {
        String userId = (String) authentication.getPrincipal();
        ContractResponse contract = contractService.updateContract(id, request, userId);
        return ResponseEntity.ok(contract);
    }
    
    /**
     * Delete a contract
     * DELETE /api/contracts/{id}
     * Protected endpoint - requires JWT token
     * Verifies that the contract belongs to the authenticated user
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContract(
            @PathVariable String id,
            Authentication authentication
    ) {
        String userId = (String) authentication.getPrincipal();
        contractService.deleteContract(id, userId);
        return ResponseEntity.noContent().build();
    }
}

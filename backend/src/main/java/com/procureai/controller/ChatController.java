package com.procureai.controller;

import com.procureai.dto.ChatRequest;
import com.procureai.dto.ChatResponse;
import com.procureai.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts/{contractId}/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ChatController {
    
    private final ChatService chatService;
    
    /**
     * Get chat history for a specific contract
     * GET /api/contracts/{contractId}/chat
     * Protected endpoint - requires JWT token
     * Verifies that the contract belongs to the authenticated user
     */
    @GetMapping
    public ResponseEntity<List<ChatResponse>> getChatHistory(
            @PathVariable String contractId,
            Authentication authentication
    ) {
        String userId = (String) authentication.getPrincipal();
        List<ChatResponse> chatHistory = chatService.getChatHistory(contractId, userId);
        return ResponseEntity.ok(chatHistory);
    }
    
    /**
     * Save a chat message (user message + AI response)
     * POST /api/contracts/{contractId}/chat
     * Protected endpoint - requires JWT token
     * Verifies that the contract belongs to the authenticated user
     */
    @PostMapping
    public ResponseEntity<ChatResponse> saveChatMessage(
            @PathVariable String contractId,
            @Valid @RequestBody ChatRequest request,
            Authentication authentication
    ) {
        String userId = (String) authentication.getPrincipal();
        ChatResponse chatResponse = chatService.saveChatMessage(contractId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(chatResponse);
    }
}

package com.procureai.service;

import com.procureai.dto.ChatRequest;
import com.procureai.dto.ChatResponse;
import com.procureai.model.ChatHistory;
import com.procureai.model.Contract;
import com.procureai.repository.ChatHistoryRepository;
import com.procureai.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    
    private final ChatHistoryRepository chatHistoryRepository;
    private final ContractRepository contractRepository;
    
    /**
     * Get chat history for a specific contract
     * Verifies that the contract belongs to the user
     */
    public List<ChatResponse> getChatHistory(String contractId, String userId) {
        // Verify that the contract belongs to the user
        Contract contract = contractRepository.findByIdAndUserId(contractId, userId)
                .orElseThrow(() -> new RuntimeException("Contract not found or does not belong to user"));
        
        // Get chat history ordered by timestamp
        List<ChatHistory> chatHistory = chatHistoryRepository.findByContractIdOrderByTimestampAsc(contractId);
        
        return chatHistory.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Save a chat message (user message + AI response)
     * Verifies that the contract belongs to the user
     */
    public ChatResponse saveChatMessage(String contractId, ChatRequest request, String userId) {
        // Verify that the contract belongs to the user
        Contract contract = contractRepository.findByIdAndUserId(contractId, userId)
                .orElseThrow(() -> new RuntimeException("Contract not found or does not belong to user"));
        
        // Create chat history entry
        ChatHistory chatHistory = ChatHistory.builder()
                .contract(contract)
                .userMessage(request.getUserMessage())
                .aiResponse(request.getAiResponse())
                .build();
        
        // Save chat history
        ChatHistory savedChat = chatHistoryRepository.save(chatHistory);
        
        return mapToResponse(savedChat);
    }
    
    /**
     * Convert ChatHistory entity to ChatResponse DTO
     */
    private ChatResponse mapToResponse(ChatHistory chatHistory) {
        return ChatResponse.builder()
                .id(chatHistory.getId())
                .contractId(chatHistory.getContract().getId())
                .userMessage(chatHistory.getUserMessage())
                .aiResponse(chatHistory.getAiResponse())
                .timestamp(chatHistory.getTimestamp())
                .build();
    }
}

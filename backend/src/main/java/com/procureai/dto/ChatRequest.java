package com.procureai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequest {
    
    @NotBlank(message = "User message is required")
    private String userMessage;
    
    @NotBlank(message = "AI response is required")
    private String aiResponse;
}

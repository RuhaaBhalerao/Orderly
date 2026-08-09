package com.procureai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    
    private String id;
    private String contractId;
    private String userMessage;
    private String aiResponse;
    private LocalDateTime timestamp;
}

package com.procureai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractResponse {
    
    private String id;
    private String title;
    private String vendor;
    private String status;
    private String riskLevel;
    private String summary;
    private String contractType;
    private LocalDate effectiveDate;
    private LocalDate expiryDate;
    private String pdfPath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

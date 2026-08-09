package com.procureai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Vendor is required")
    private String vendor;
    
    @NotBlank(message = "Status is required")
    private String status;
    
    @NotBlank(message = "Risk level is required")
    private String riskLevel;
    
    private String summary;
    
    @NotBlank(message = "Contract type is required")
    private String contractType;
    
    @NotNull(message = "Effective date is required")
    private LocalDate effectiveDate;
    
    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;
    
    private String pdfPath;
}

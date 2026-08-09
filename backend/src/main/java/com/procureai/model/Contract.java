package com.procureai.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contract {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;
    
    @NotBlank(message = "Vendor is required")
    @Column(nullable = false)
    private String vendor;
    
    @Column(nullable = false)
    private String status;  // e.g., "Draft", "Review", "Approved", "Signed", "Expired"
    
    @Column(nullable = false)
    private String riskLevel;  // e.g., "Low", "Medium", "High", "Critical"
    
    @Column(columnDefinition = "TEXT")
    private String summary;
    
    @Column(nullable = false)
    private String contractType;  // e.g., "MSA", "SLA", "NDA", "Purchase Agreement"
    
    @Column(nullable = false)
    private LocalDate effectiveDate;
    
    @Column(nullable = false)
    private LocalDate expiryDate;
    
    @Column(name = "pdf_path")
    private String pdfPath;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

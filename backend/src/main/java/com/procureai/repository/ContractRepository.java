package com.procureai.repository;

import com.procureai.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, String> {
    
    /**
     * Find all contracts belonging to a specific user
     */
    List<Contract> findByUserId(String userId);
    
    /**
     * Find a contract by ID and user ID (for ownership verification)
     */
    Optional<Contract> findByIdAndUserId(String id, String userId);
}

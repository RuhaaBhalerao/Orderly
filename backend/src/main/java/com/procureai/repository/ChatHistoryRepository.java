package com.procureai.repository;

import com.procureai.model.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, String> {
    
    /**
     * Find all chat history for a specific contract, ordered by timestamp
     */
    List<ChatHistory> findByContractIdOrderByTimestampAsc(String contractId);
}

package com.hospital.system.repository;

import com.hospital.system.entity.Feedback;
import com.hospital.system.entity.FeedbackStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByUserUserIdOrderBySubmittedAtDesc(Long userId);
    List<Feedback> findByStatusOrderBySubmittedAtDesc(FeedbackStatus status);
    List<Feedback> findAllByOrderBySubmittedAtDesc();
    long countByStatus(FeedbackStatus status);
}

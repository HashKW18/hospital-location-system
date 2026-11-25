package com.hospital.system.repository;

import com.hospital.system.entity.Notification;
import com.hospital.system.entity.NotificationCategory;
import com.hospital.system.entity.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByStatusOrderByPublishedAtDesc(NotificationStatus status);
    List<Notification> findByCategoryAndStatusOrderByPublishedAtDesc(NotificationCategory category, NotificationStatus status);
    List<Notification> findTop5ByStatusOrderByPublishedAtDesc(NotificationStatus status);
}

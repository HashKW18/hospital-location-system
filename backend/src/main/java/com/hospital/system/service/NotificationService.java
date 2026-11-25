package com.hospital.system.service;

import com.hospital.system.dto.NotificationDto;
import com.hospital.system.entity.Notification;
import com.hospital.system.entity.NotificationCategory;
import com.hospital.system.entity.NotificationStatus;
import com.hospital.system.entity.User;
import com.hospital.system.exception.ResourceNotFoundException;
import com.hospital.system.repository.NotificationRepository;
import com.hospital.system.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public List<NotificationDto> getPublishedNotifications(String categoryStr) {
        List<Notification> list;
        if (categoryStr != null && !categoryStr.equalsIgnoreCase("All")) {
            try {
                NotificationCategory category = NotificationCategory.valueOf(categoryStr.toUpperCase());
                list = notificationRepository.findByCategoryAndStatusOrderByPublishedAtDesc(category, NotificationStatus.PUBLISHED);
            } catch (IllegalArgumentException e) {
                list = notificationRepository.findByStatusOrderByPublishedAtDesc(NotificationStatus.PUBLISHED);
            }
        } else {
            list = notificationRepository.findByStatusOrderByPublishedAtDesc(NotificationStatus.PUBLISHED);
        }

        return list.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<NotificationDto> getLatestAnnouncements() {
        return notificationRepository.findTop5ByStatusOrderByPublishedAtDesc(NotificationStatus.PUBLISHED).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<NotificationDto> getAllNotificationsForStaff() {
        return notificationRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationDto createNotification(NotificationDto dto, Long staffUserId) {
        User staff = userRepository.findById(staffUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found"));

        Notification notification = new Notification();
        notification.setTitle(dto.getTitle());
        notification.setMessage(dto.getMessage());
        notification.setCategory(dto.getCategory() != null ? dto.getCategory() : NotificationCategory.GENERAL);
        notification.setExpiryDate(dto.getExpiryDate());
        notification.setStatus(dto.getStatus() != null ? dto.getStatus() : NotificationStatus.PUBLISHED);
        notification.setCreatedBy(staff);

        Notification saved = notificationRepository.save(notification);
        return convertToDto(saved);
    }

    @Transactional
    public NotificationDto updateNotification(Long id, NotificationDto dto) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        notification.setTitle(dto.getTitle());
        notification.setMessage(dto.getMessage());
        if (dto.getCategory() != null) notification.setCategory(dto.getCategory());
        if (dto.getExpiryDate() != null) notification.setExpiryDate(dto.getExpiryDate());
        if (dto.getStatus() != null) notification.setStatus(dto.getStatus());

        Notification saved = notificationRepository.save(notification);
        return convertToDto(saved);
    }

    @Transactional
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification not found with id: " + id);
        }
        notificationRepository.deleteById(id);
    }

    private NotificationDto convertToDto(Notification notif) {
        NotificationDto dto = new NotificationDto();
        dto.setNotificationId(notif.getNotificationId());
        dto.setTitle(notif.getTitle());
        dto.setMessage(notif.getMessage());
        dto.setCategory(notif.getCategory());
        dto.setPublishedAt(notif.getPublishedAt());
        dto.setExpiryDate(notif.getExpiryDate());
        dto.setStatus(notif.getStatus());
        if (notif.getCreatedBy() != null) {
            dto.setCreatedById(notif.getCreatedBy().getUserId());
            dto.setCreatedByName(notif.getCreatedBy().getFullName());
        }
        return dto;
    }
}

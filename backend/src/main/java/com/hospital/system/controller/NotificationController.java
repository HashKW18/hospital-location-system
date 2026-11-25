package com.hospital.system.controller;

import com.hospital.system.dto.NotificationDto;
import com.hospital.system.entity.User;
import com.hospital.system.repository.UserRepository;
import com.hospital.system.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(notificationService.getPublishedNotifications(category));
    }

    @GetMapping("/latest")
    public ResponseEntity<List<NotificationDto>> getLatestAnnouncements() {
        return ResponseEntity.ok(notificationService.getLatestAnnouncements());
    }

    @GetMapping("/all")
    public ResponseEntity<List<NotificationDto>> getAllForStaff() {
        return ResponseEntity.ok(notificationService.getAllNotificationsForStaff());
    }

    @PostMapping
    public ResponseEntity<NotificationDto> createNotification(
            @Valid @RequestBody NotificationDto dto,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return new ResponseEntity<>(notificationService.createNotification(dto, user.getUserId()), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotificationDto> updateNotification(@PathVariable Long id, @Valid @RequestBody NotificationDto dto) {
        return ResponseEntity.ok(notificationService.updateNotification(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}

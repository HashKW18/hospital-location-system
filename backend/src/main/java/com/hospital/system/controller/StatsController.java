package com.hospital.system.controller;

import com.hospital.system.entity.CampStatus;
import com.hospital.system.entity.FeedbackStatus;
import com.hospital.system.entity.Role;
import com.hospital.system.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final MedicalCampRepository campRepository;
    private final CampRegistrationRepository registrationRepository;
    private final FeedbackRepository feedbackRepository;
    private final NotificationRepository notificationRepository;

    public StatsController(UserRepository userRepository,
                           LocationRepository locationRepository,
                           MedicalCampRepository campRepository,
                           CampRegistrationRepository registrationRepository,
                           FeedbackRepository feedbackRepository,
                           NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.campRepository = campRepository;
        this.registrationRepository = registrationRepository;
        this.feedbackRepository = feedbackRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/public")
    public ResponseEntity<Map<String, Object>> getPublicStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLocations", locationRepository.count());
        stats.put("totalDepartments", 13);
        stats.put("upcomingCamps", campRepository.findByStatus(CampStatus.UPCOMING).size());
        stats.put("totalDoctors", 142); // Representative hospital metric
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("registeredPatients", userRepository.countByRole(Role.REGISTERED_USER));
        stats.put("staffMembers", userRepository.countByRole(Role.STAFF));
        stats.put("totalLocations", locationRepository.count());
        stats.put("totalCamps", campRepository.count());
        stats.put("activeCamps", campRepository.findByStatus(CampStatus.UPCOMING).size());
        stats.put("totalRegistrations", registrationRepository.count());
        stats.put("totalFeedback", feedbackRepository.count());
        stats.put("pendingFeedback", feedbackRepository.countByStatus(FeedbackStatus.PENDING));
        stats.put("underReviewFeedback", feedbackRepository.countByStatus(FeedbackStatus.UNDER_REVIEW));
        stats.put("resolvedFeedback", feedbackRepository.countByStatus(FeedbackStatus.RESOLVED));
        stats.put("totalNotifications", notificationRepository.count());
        return ResponseEntity.ok(stats);
    }
}

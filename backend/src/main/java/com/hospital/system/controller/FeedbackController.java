package com.hospital.system.controller;

import com.hospital.system.dto.FeedbackDto;
import com.hospital.system.dto.FeedbackStatusUpdateDto;
import com.hospital.system.entity.User;
import com.hospital.system.repository.UserRepository;
import com.hospital.system.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final UserRepository userRepository;

    public FeedbackController(FeedbackService feedbackService, UserRepository userRepository) {
        this.feedbackService = feedbackService;
        this.userRepository = userRepository;
    }

    @PostMapping("/submit")
    public ResponseEntity<FeedbackDto> submitFeedback(
            @Valid @RequestBody FeedbackDto dto,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return new ResponseEntity<>(feedbackService.submitFeedback(dto, user.getUserId()), HttpStatus.CREATED);
    }

    @GetMapping("/my-feedback")
    public ResponseEntity<List<FeedbackDto>> getMyFeedback(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(feedbackService.getUserFeedback(user.getUserId()));
    }

    @GetMapping("/manage")
    public ResponseEntity<List<FeedbackDto>> getAllFeedback(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(feedbackService.getAllFeedbackForStaff(status));
    }

    @PutMapping("/manage/{id}/status")
    public ResponseEntity<FeedbackDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackStatusUpdateDto dto,
            Authentication authentication) {
        User staff = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(feedbackService.updateFeedbackStatus(id, dto, staff.getUserId()));
    }
}

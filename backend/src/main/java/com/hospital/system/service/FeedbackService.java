package com.hospital.system.service;

import com.hospital.system.dto.FeedbackDto;
import com.hospital.system.dto.FeedbackStatusUpdateDto;
import com.hospital.system.entity.*;
import com.hospital.system.exception.BadRequestException;
import com.hospital.system.exception.ResourceNotFoundException;
import com.hospital.system.repository.FeedbackRepository;
import com.hospital.system.repository.LocationRepository;
import com.hospital.system.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;

    public FeedbackService(FeedbackRepository feedbackRepository,
                           UserRepository userRepository,
                           LocationRepository locationRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
    }

    @Transactional
    public FeedbackDto submitFeedback(FeedbackDto dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setCategory(dto.getCategory());
        feedback.setFeedbackType(dto.getFeedbackType() != null ? dto.getFeedbackType() : FeedbackType.SUGGESTION);
        feedback.setRating(dto.getRating() != null ? dto.getRating() : 5);
        feedback.setMessage(dto.getMessage());
        feedback.setStatus(FeedbackStatus.PENDING);

        if (dto.getLocationId() != null) {
            Location loc = locationRepository.findById(dto.getLocationId()).orElse(null);
            feedback.setLocation(loc);
        }

        Feedback saved = feedbackRepository.save(feedback);
        return convertToDto(saved);
    }

    public List<FeedbackDto> getUserFeedback(Long userId) {
        return feedbackRepository.findByUserUserIdOrderBySubmittedAtDesc(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<FeedbackDto> getAllFeedbackForStaff(String statusStr) {
        List<Feedback> list;
        if (statusStr != null && !statusStr.equalsIgnoreCase("All")) {
            try {
                FeedbackStatus status = FeedbackStatus.valueOf(statusStr.toUpperCase());
                list = feedbackRepository.findByStatusOrderBySubmittedAtDesc(status);
            } catch (IllegalArgumentException e) {
                list = feedbackRepository.findAllByOrderBySubmittedAtDesc();
            }
        } else {
            list = feedbackRepository.findAllByOrderBySubmittedAtDesc();
        }

        return list.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional
    public FeedbackDto updateFeedbackStatus(Long feedbackId, FeedbackStatusUpdateDto dto, Long staffUserId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + feedbackId));

        User staff = userRepository.findById(staffUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found"));

        feedback.setStatus(dto.getStatus());
        if (dto.getStaffResponse() != null) {
            feedback.setStaffResponse(dto.getStaffResponse());
            feedback.setRespondedBy(staff);
            feedback.setRespondedAt(LocalDateTime.now());
        }

        Feedback saved = feedbackRepository.save(feedback);
        return convertToDto(saved);
    }

    private FeedbackDto convertToDto(Feedback fb) {
        FeedbackDto dto = new FeedbackDto();
        dto.setFeedbackId(fb.getFeedbackId());
        dto.setUserId(fb.getUser().getUserId());
        dto.setUserName(fb.getUser().getFullName());
        dto.setUserEmail(fb.getUser().getEmail());
        dto.setCategory(fb.getCategory());
        dto.setFeedbackType(fb.getFeedbackType());
        dto.setRating(fb.getRating());
        dto.setMessage(fb.getMessage());
        dto.setSubmittedAt(fb.getSubmittedAt());
        dto.setStatus(fb.getStatus());
        dto.setStaffResponse(fb.getStaffResponse());
        dto.setRespondedAt(fb.getRespondedAt());

        if (fb.getLocation() != null) {
            dto.setLocationId(fb.getLocation().getLocationId());
            dto.setLocationName(fb.getLocation().getLocationName());
        }

        if (fb.getRespondedBy() != null) {
            dto.setRespondedByName(fb.getRespondedBy().getFullName());
        }

        return dto;
    }
}

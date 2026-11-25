package com.hospital.system.controller;

import com.hospital.system.dto.CampRegistrationDto;
import com.hospital.system.dto.MedicalCampDto;
import com.hospital.system.entity.User;
import com.hospital.system.repository.UserRepository;
import com.hospital.system.service.MedicalCampService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/camps")
public class MedicalCampController {

    private final MedicalCampService campService;
    private final UserRepository userRepository;

    public MedicalCampController(MedicalCampService campService, UserRepository userRepository) {
        this.campService = campService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<MedicalCampDto>> getAllCamps(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            Authentication authentication) {
        Long currentUserId = getUserIdFromAuth(authentication);
        return ResponseEntity.ok(campService.getAllCamps(search, category, currentUserId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalCampDto> getCampById(@PathVariable Long id, Authentication authentication) {
        Long currentUserId = getUserIdFromAuth(authentication);
        return ResponseEntity.ok(campService.getCampById(id, currentUserId));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(campService.getCategories());
    }

    @PostMapping
    public ResponseEntity<MedicalCampDto> createCamp(@Valid @RequestBody MedicalCampDto dto) {
        return new ResponseEntity<>(campService.createCamp(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalCampDto> updateCamp(@PathVariable Long id, @Valid @RequestBody MedicalCampDto dto) {
        return ResponseEntity.ok(campService.updateCamp(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCamp(@PathVariable Long id) {
        campService.deleteCamp(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<CampRegistrationDto> registerForCamp(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        String notes = body != null ? body.get("notes") : "";
        return new ResponseEntity<>(campService.registerForCamp(id, user.getUserId(), notes), HttpStatus.CREATED);
    }

    @PostMapping("/registrations/{regId}/cancel")
    public ResponseEntity<Map<String, String>> cancelRegistration(
            @PathVariable Long regId,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        campService.cancelRegistration(regId, user.getUserId());
        return ResponseEntity.ok(Collections.singletonMap("message", "Registration cancelled successfully"));
    }

    @GetMapping("/my-registrations")
    public ResponseEntity<List<CampRegistrationDto>> getMyRegistrations(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(campService.getUserRegistrations(user.getUserId()));
    }

    @GetMapping("/{id}/registrations")
    public ResponseEntity<List<CampRegistrationDto>> getCampRegistrations(@PathVariable Long id) {
        return ResponseEntity.ok(campService.getCampRegistrations(id));
    }

    private Long getUserIdFromAuth(Authentication auth) {
        if (auth == null) return null;
        return userRepository.findByEmail(auth.getName())
                .map(User::getUserId)
                .orElse(null);
    }
}

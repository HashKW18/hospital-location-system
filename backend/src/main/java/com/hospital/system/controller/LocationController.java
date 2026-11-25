package com.hospital.system.controller;

import com.hospital.system.dto.LocationDto;
import com.hospital.system.entity.User;
import com.hospital.system.repository.UserRepository;
import com.hospital.system.service.LocationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;
    private final UserRepository userRepository;

    public LocationController(LocationService locationService, UserRepository userRepository) {
        this.locationService = locationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<LocationDto>> searchLocations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String building,
            @RequestParam(required = false) String floor) {
        return ResponseEntity.ok(locationService.searchLocations(search, category, building, floor));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocationDto> getLocationById(@PathVariable Long id) {
        return ResponseEntity.ok(locationService.getLocationById(id));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(locationService.getCategories());
    }

    @GetMapping("/buildings")
    public ResponseEntity<List<String>> getBuildings() {
        return ResponseEntity.ok(locationService.getBuildings());
    }

    @GetMapping("/floors")
    public ResponseEntity<List<String>> getFloors() {
        return ResponseEntity.ok(locationService.getFloors());
    }

    @PostMapping
    public ResponseEntity<LocationDto> createLocation(@Valid @RequestBody LocationDto dto) {
        return new ResponseEntity<>(locationService.createLocation(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LocationDto> updateLocation(@PathVariable Long id, @Valid @RequestBody LocationDto dto) {
        return ResponseEntity.ok(locationService.updateLocation(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<Map<String, Object>> toggleFavorite(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        boolean favorited = locationService.toggleFavorite(user.getUserId(), id);
        Map<String, Object> resp = new HashMap<>();
        resp.put("favorited", favorited);
        resp.put("message", favorited ? "Location saved to favorites" : "Location removed from favorites");
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/my-favorites")
    public ResponseEntity<List<LocationDto>> getMyFavorites(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(locationService.getUserFavorites(user.getUserId()));
    }
}

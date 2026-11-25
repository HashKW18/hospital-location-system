package com.hospital.system.controller;

import com.hospital.system.dto.UserDto;
import com.hospital.system.entity.AccountStatus;
import com.hospital.system.entity.Role;
import com.hospital.system.entity.User;
import com.hospital.system.repository.UserRepository;
import com.hospital.system.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(userService.getUserProfile(user.getUserId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(@RequestBody UserDto dto, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(userService.updateProfile(user.getUserId(), dto));
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserDto> updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Role role = Role.valueOf(body.get("role").toUpperCase());
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserDto> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        AccountStatus status = AccountStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(userService.updateUserStatus(id, status));
    }
}

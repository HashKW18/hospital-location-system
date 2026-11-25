package com.hospital.system.service;

import com.hospital.system.config.JwtTokenProvider;
import com.hospital.system.dto.AuthRequest;
import com.hospital.system.dto.AuthResponse;
import com.hospital.system.dto.RegisterRequest;
import com.hospital.system.entity.AccountStatus;
import com.hospital.system.entity.Role;
import com.hospital.system.entity.User;
import com.hospital.system.exception.BadRequestException;
import com.hospital.system.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("Your account is " + user.getAccountStatus() + ". Please contact hospital administration.");
        }

        return new AuthResponse(jwt, user.getUserId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        // Strict Requirement: Public registration cannot select Administrator or Staff role
        User user = new User(
                request.getFullName(),
                request.getEmail(),
                request.getPhoneNumber(),
                passwordEncoder.encode(request.getPassword()),
                Role.REGISTERED_USER
        );

        User savedUser = userRepository.save(user);

        // Auto authenticate on successful registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(jwt, savedUser.getUserId(), savedUser.getFullName(), savedUser.getEmail(), savedUser.getRole().name());
    }
}

package com.hospital.system.service;

import com.hospital.system.dto.CampRegistrationDto;
import com.hospital.system.dto.MedicalCampDto;
import com.hospital.system.entity.*;
import com.hospital.system.exception.BadRequestException;
import com.hospital.system.exception.ResourceNotFoundException;
import com.hospital.system.repository.CampRegistrationRepository;
import com.hospital.system.repository.LocationRepository;
import com.hospital.system.repository.MedicalCampRepository;
import com.hospital.system.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalCampService {

    private final MedicalCampRepository campRepository;
    private final CampRegistrationRepository registrationRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;

    public MedicalCampService(MedicalCampRepository campRepository,
                              CampRegistrationRepository registrationRepository,
                              LocationRepository locationRepository,
                              UserRepository userRepository) {
        this.campRepository = campRepository;
        this.registrationRepository = registrationRepository;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
    }

    public List<MedicalCampDto> getAllCamps(String query, String category, Long currentUserId) {
        List<MedicalCamp> camps;
        if (query != null && !query.trim().isEmpty()) {
            camps = campRepository.searchCamps(query.trim());
        } else {
            camps = campRepository.findAll();
        }

        return camps.stream()
                .filter(c -> category == null || category.equalsIgnoreCase("All") || c.getCategory().equalsIgnoreCase(category))
                .map(c -> convertToDto(c, currentUserId))
                .collect(Collectors.toList());
    }

    public MedicalCampDto getCampById(Long campId, Long currentUserId) {
        MedicalCamp camp = campRepository.findById(campId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical camp not found with id: " + campId));
        return convertToDto(camp, currentUserId);
    }

    @Transactional
    public MedicalCampDto createCamp(MedicalCampDto dto) {
        MedicalCamp camp = new MedicalCamp();
        mapDtoToEntity(dto, camp);
        MedicalCamp saved = campRepository.save(camp);
        return convertToDto(saved, null);
    }

    @Transactional
    public MedicalCampDto updateCamp(Long id, MedicalCampDto dto) {
        MedicalCamp camp = campRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical camp not found with id: " + id));
        mapDtoToEntity(dto, camp);
        MedicalCamp saved = campRepository.save(camp);
        return convertToDto(saved, null);
    }

    @Transactional
    public void deleteCamp(Long id) {
        if (!campRepository.existsById(id)) {
            throw new ResourceNotFoundException("Medical camp not found with id: " + id);
        }
        campRepository.deleteById(id);
    }

    @Transactional
    public CampRegistrationDto registerForCamp(Long campId, Long userId, String notes) {
        MedicalCamp camp = campRepository.findById(campId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical camp not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (camp.getStatus() == CampStatus.CANCELLED || camp.getStatus() == CampStatus.COMPLETED) {
            throw new BadRequestException("Registration is closed. This camp is " + camp.getStatus().name().toLowerCase() + ".");
        }

        if (camp.getRegistrationDeadline().isBefore(LocalDate.now())) {
            throw new BadRequestException("The registration deadline for this medical camp has passed (" + camp.getRegistrationDeadline() + ").");
        }

        if (registrationRepository.existsByUserUserIdAndCampCampId(userId, campId)) {
            throw new BadRequestException("You are already registered for this medical camp.");
        }

        long confirmedCount = registrationRepository.countByCampCampIdAndRegistrationStatus(campId, RegistrationStatus.CONFIRMED);
        if (confirmedCount >= camp.getCapacity()) {
            throw new BadRequestException("Registration is full. No available capacity remains for this camp.");
        }

        CampRegistration registration = new CampRegistration(user, camp, notes);
        CampRegistration saved = registrationRepository.save(registration);

        return convertRegistrationToDto(saved);
    }

    @Transactional
    public void cancelRegistration(Long registrationId, Long userId) {
        CampRegistration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        if (!reg.getUser().getUserId().equals(userId)) {
            throw new BadRequestException("You are not authorized to cancel this registration.");
        }

        reg.setRegistrationStatus(RegistrationStatus.CANCELLED);
        registrationRepository.save(reg);
    }

    public List<CampRegistrationDto> getUserRegistrations(Long userId) {
        return registrationRepository.findByUserUserIdOrderByRegistrationDateDesc(userId).stream()
                .map(this::convertRegistrationToDto)
                .collect(Collectors.toList());
    }

    public List<CampRegistrationDto> getCampRegistrations(Long campId) {
        return registrationRepository.findByCampCampId(campId).stream()
                .map(this::convertRegistrationToDto)
                .collect(Collectors.toList());
    }

    public List<String> getCategories() {
        return campRepository.findDistinctCategories();
    }

    private void mapDtoToEntity(MedicalCampDto dto, MedicalCamp camp) {
        camp.setCampName(dto.getCampName());
        camp.setDescription(dto.getDescription());
        camp.setCategory(dto.getCategory());
        camp.setCampDate(dto.getCampDate());
        camp.setStartTime(dto.getStartTime());
        camp.setEndTime(dto.getEndTime());
        camp.setRegistrationDeadline(dto.getRegistrationDeadline());
        if (dto.getCapacity() != null) {
            camp.setCapacity(dto.getCapacity());
        }
        if (dto.getIsFree() != null) {
            camp.setIsFree(dto.getIsFree());
        }
        if (dto.getStatus() != null) {
            camp.setStatus(dto.getStatus());
        }

        if (dto.getLocationId() != null) {
            Location loc = locationRepository.findById(dto.getLocationId()).orElse(null);
            camp.setLocation(loc);
        }
    }

    private MedicalCampDto convertToDto(MedicalCamp camp, Long currentUserId) {
        MedicalCampDto dto = new MedicalCampDto();
        dto.setCampId(camp.getCampId());
        dto.setCampName(camp.getCampName());
        dto.setDescription(camp.getDescription());
        dto.setCategory(camp.getCategory());
        dto.setCampDate(camp.getCampDate());
        dto.setStartTime(camp.getStartTime());
        dto.setEndTime(camp.getEndTime());
        dto.setRegistrationDeadline(camp.getRegistrationDeadline());
        dto.setCapacity(camp.getCapacity());
        dto.setStatus(camp.getStatus());
        dto.setIsFree(camp.getIsFree());

        long registered = registrationRepository.countByCampCampIdAndRegistrationStatus(camp.getCampId(), RegistrationStatus.CONFIRMED);
        dto.setRegisteredCount((int) registered);
        dto.setAvailableSlots(Math.max(0, camp.getCapacity() - (int) registered));

        if (currentUserId != null) {
            dto.setUserRegistered(registrationRepository.existsByUserUserIdAndCampCampId(currentUserId, camp.getCampId()));
        }

        if (camp.getLocation() != null) {
            dto.setLocationId(camp.getLocation().getLocationId());
            dto.setLocationName(camp.getLocation().getLocationName());
            dto.setBuildingAndFloor(camp.getLocation().getBuilding() + " - " + camp.getLocation().getFloor());
        }

        return dto;
    }

    private CampRegistrationDto convertRegistrationToDto(CampRegistration reg) {
        CampRegistrationDto dto = new CampRegistrationDto();
        dto.setRegistrationId(reg.getRegistrationId());
        dto.setUserId(reg.getUser().getUserId());
        dto.setUserName(reg.getUser().getFullName());
        dto.setUserEmail(reg.getUser().getEmail());
        dto.setCampId(reg.getCamp().getCampId());
        dto.setCampName(reg.getCamp().getCampName());
        dto.setCampCategory(reg.getCamp().getCategory());
        dto.setCampDate(reg.getCamp().getCampDate().toString());
        dto.setCampTime(reg.getCamp().getStartTime() + " - " + reg.getCamp().getEndTime());
        if (reg.getCamp().getLocation() != null) {
            dto.setLocationName(reg.getCamp().getLocation().getLocationName());
        }
        dto.setRegistrationDate(reg.getRegistrationDate());
        dto.setRegistrationStatus(reg.getRegistrationStatus());
        dto.setNotes(reg.getNotes());
        return dto;
    }
}

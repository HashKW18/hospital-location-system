package com.hospital.system.service;

import com.hospital.system.dto.LocationDto;
import com.hospital.system.entity.Department;
import com.hospital.system.entity.FavoriteLocation;
import com.hospital.system.entity.Location;
import com.hospital.system.entity.User;
import com.hospital.system.exception.ResourceNotFoundException;
import com.hospital.system.repository.DepartmentRepository;
import com.hospital.system.repository.FavoriteLocationRepository;
import com.hospital.system.repository.LocationRepository;
import com.hospital.system.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationService {

    private final LocationRepository locationRepository;
    private final DepartmentRepository departmentRepository;
    private final FavoriteLocationRepository favoriteLocationRepository;
    private final UserRepository userRepository;

    public LocationService(LocationRepository locationRepository,
                           DepartmentRepository departmentRepository,
                           FavoriteLocationRepository favoriteLocationRepository,
                           UserRepository userRepository) {
        this.locationRepository = locationRepository;
        this.departmentRepository = departmentRepository;
        this.favoriteLocationRepository = favoriteLocationRepository;
        this.userRepository = userRepository;
    }

    public List<LocationDto> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<LocationDto> searchLocations(String query, String category, String building, String floor) {
        List<Location> locations;
        if (query != null && !query.trim().isEmpty()) {
            locations = locationRepository.searchLocations(query.trim());
        } else {
            locations = locationRepository.findAll();
        }

        return locations.stream()
                .filter(l -> category == null || category.equalsIgnoreCase("All") || l.getCategory().equalsIgnoreCase(category))
                .filter(l -> building == null || building.equalsIgnoreCase("All") || l.getBuilding().equalsIgnoreCase(building))
                .filter(l -> floor == null || floor.equalsIgnoreCase("All") || l.getFloor().equalsIgnoreCase(floor))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public LocationDto getLocationById(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));
        return convertToDto(location);
    }

    @Transactional
    public LocationDto createLocation(LocationDto dto) {
        Location location = new Location();
        mapDtoToEntity(dto, location);
        Location saved = locationRepository.save(location);
        return convertToDto(saved);
    }

    @Transactional
    public LocationDto updateLocation(Long id, LocationDto dto) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));
        mapDtoToEntity(dto, location);
        Location saved = locationRepository.save(location);
        return convertToDto(saved);
    }

    @Transactional
    public void deleteLocation(Long id) {
        if (!locationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Location not found with id: " + id);
        }
        locationRepository.deleteById(id);
    }

    public List<String> getCategories() {
        return locationRepository.findDistinctCategories();
    }

    public List<String> getBuildings() {
        return locationRepository.findDistinctBuildings();
    }

    public List<String> getFloors() {
        return locationRepository.findDistinctFloors();
    }

    @Transactional
    public boolean toggleFavorite(Long userId, Long locationId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));

        if (favoriteLocationRepository.existsByUserUserIdAndLocationLocationId(userId, locationId)) {
            favoriteLocationRepository.deleteByUserUserIdAndLocationLocationId(userId, locationId);
            return false; // removed
        } else {
            favoriteLocationRepository.save(new FavoriteLocation(user, location));
            return true; // added
        }
    }

    public List<LocationDto> getUserFavorites(Long userId) {
        return favoriteLocationRepository.findByUserUserIdOrderByCreatedAtDesc(userId).stream()
                .map(fav -> convertToDto(fav.getLocation()))
                .collect(Collectors.toList());
    }

    private void mapDtoToEntity(LocationDto dto, Location location) {
        location.setLocationName(dto.getLocationName());
        location.setCategory(dto.getCategory());
        location.setBuilding(dto.getBuilding());
        location.setFloor(dto.getFloor());
        location.setRoomNumber(dto.getRoomNumber());
        location.setDescription(dto.getDescription());
        location.setDirections(dto.getDirections());
        location.setOpeningHours(dto.getOpeningHours() != null ? dto.getOpeningHours() : "24 Hours");
        if (dto.getStatus() != null) {
            location.setStatus(dto.getStatus());
        }

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElse(null);
            location.setDepartment(department);
        }
    }

    private LocationDto convertToDto(Location location) {
        LocationDto dto = new LocationDto();
        dto.setLocationId(location.getLocationId());
        dto.setLocationName(location.getLocationName());
        dto.setCategory(location.getCategory());
        dto.setBuilding(location.getBuilding());
        dto.setFloor(location.getFloor());
        dto.setRoomNumber(location.getRoomNumber());
        dto.setDescription(location.getDescription());
        dto.setDirections(location.getDirections());
        dto.setOpeningHours(location.getOpeningHours());
        dto.setStatus(location.getStatus());
        dto.setUpdatedAt(location.getUpdatedAt());

        if (location.getDepartment() != null) {
            dto.setDepartmentId(location.getDepartment().getDepartmentId());
            dto.setDepartmentName(location.getDepartment().getDepartmentName());
        }
        return dto;
    }
}

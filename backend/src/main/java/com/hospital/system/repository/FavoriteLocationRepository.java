package com.hospital.system.repository;

import com.hospital.system.entity.FavoriteLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteLocationRepository extends JpaRepository<FavoriteLocation, Long> {
    List<FavoriteLocation> findByUserUserIdOrderByCreatedAtDesc(Long userId);
    Optional<FavoriteLocation> findByUserUserIdAndLocationLocationId(Long userId, Long locationId);
    boolean existsByUserUserIdAndLocationLocationId(Long userId, Long locationId);
    void deleteByUserUserIdAndLocationLocationId(Long userId, Long locationId);
}

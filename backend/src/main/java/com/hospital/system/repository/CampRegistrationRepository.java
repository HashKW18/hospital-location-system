package com.hospital.system.repository;

import com.hospital.system.entity.CampRegistration;
import com.hospital.system.entity.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampRegistrationRepository extends JpaRepository<CampRegistration, Long> {
    List<CampRegistration> findByUserUserIdOrderByRegistrationDateDesc(Long userId);
    List<CampRegistration> findByCampCampId(Long campId);
    Optional<CampRegistration> findByUserUserIdAndCampCampId(Long userId, Long campId);
    boolean existsByUserUserIdAndCampCampId(Long userId, Long campId);
    long countByCampCampIdAndRegistrationStatus(Long campId, RegistrationStatus status);
}

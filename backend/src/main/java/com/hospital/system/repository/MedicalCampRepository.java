package com.hospital.system.repository;

import com.hospital.system.entity.CampStatus;
import com.hospital.system.entity.MedicalCamp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicalCampRepository extends JpaRepository<MedicalCamp, Long> {
    List<MedicalCamp> findByStatus(CampStatus status);
    List<MedicalCamp> findByCategoryIgnoreCase(String category);
    List<MedicalCamp> findByCampDateGreaterThanEqualOrderByCampDateAsc(LocalDate date);

    @Query("SELECT c FROM MedicalCamp c WHERE " +
           "LOWER(c.campName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<MedicalCamp> searchCamps(@Param("query") String query);

    @Query("SELECT DISTINCT c.category FROM MedicalCamp c ORDER BY c.category")
    List<String> findDistinctCategories();
}

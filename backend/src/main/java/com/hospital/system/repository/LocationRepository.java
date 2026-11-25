package com.hospital.system.repository;

import com.hospital.system.entity.Location;
import com.hospital.system.entity.LocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByCategoryIgnoreCase(String category);
    List<Location> findByBuildingIgnoreCase(String building);
    List<Location> findByFloorIgnoreCase(String floor);
    List<Location> findByStatus(LocationStatus status);

    @Query("SELECT l FROM Location l WHERE " +
           "LOWER(l.locationName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(l.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(l.building) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(l.floor) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(l.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(l.department IS NOT NULL AND LOWER(l.department.departmentName) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Location> searchLocations(@Param("query") String query);

    @Query("SELECT DISTINCT l.category FROM Location l ORDER BY l.category")
    List<String> findDistinctCategories();

    @Query("SELECT DISTINCT l.building FROM Location l ORDER BY l.building")
    List<String> findDistinctBuildings();

    @Query("SELECT DISTINCT l.floor FROM Location l ORDER BY l.floor")
    List<String> findDistinctFloors();
}

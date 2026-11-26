package com.ecobike.ecobike_backend;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BikeRepository extends JpaRepository<Bike, Long> {

    @Query("SELECT DISTINCT b.brand FROM Bike b WHERE b.region = :region ORDER BY b.brand")
    List<String> findDistinctBrands(@Param("region") String region);

    @Query("SELECT DISTINCT b.model FROM Bike b WHERE b.region = :region AND b.brand = :brand ORDER BY b.model")
    List<String> findDistinctModels(@Param("region") String region, @Param("brand") String brand);

    List<Bike> findByRegionAndBrandAndModelOrderByYearDesc(String region, String brand, String model);
}
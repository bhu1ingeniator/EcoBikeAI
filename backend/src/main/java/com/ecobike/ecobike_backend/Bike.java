package com.ecobike.ecobike_backend;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "bikes", indexes = {
        @Index(name = "idx_region_brand", columnList = "region, brand"),
        @Index(name = "idx_region_brand_model", columnList = "region, brand, model")
})
@Data
public class Bike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String region;          // INDIA or GLOBAL
    private String brand;
    private String model;
    private Integer year;
    private String category;
    private Double engineCc;
    private Double powerHp;
    private Double mileageKmpl;
    private String fuelType;        // Petrol or Electric
    private String transmission;
    private Double weightKg;
    private Double fuelTankL;
    private Double price;
    private String currency;        // INR or USD
    private Double co2GKm;
    private String co2Source;       // DATASET, ESTIMATED or ZERO_TAILPIPE
}
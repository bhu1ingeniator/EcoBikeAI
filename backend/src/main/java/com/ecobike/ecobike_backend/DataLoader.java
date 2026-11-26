package com.ecobike.ecobike_backend;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final BikeRepository repo;

    public DataLoader(BikeRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) throws Exception {
        if (repo.count() > 0) {
            System.out.println("Bikes already loaded: " + repo.count());
            return;
        }
        load("data/bikes_india_clean.csv");
        load("data/bikes_global_clean.csv");
        System.out.println("Loaded bikes: " + repo.count());
    }

    private void load(String path) throws Exception {
        List<Bike> batch = new ArrayList<>();
        try (Reader reader = new InputStreamReader(
                new ClassPathResource(path).getInputStream(), StandardCharsets.UTF_8);
             CSVParser parser = CSVFormat.DEFAULT.builder()
                     .setHeader().setSkipHeaderRecord(true).build().parse(reader)) {

            for (CSVRecord r : parser) {
                Bike b = new Bike();
                b.setRegion(str(r, "region"));
                b.setBrand(str(r, "brand"));
                b.setModel(str(r, "model"));
                b.setYear(num(r, "year") == null ? null : num(r, "year").intValue());
                b.setCategory(str(r, "category"));
                b.setEngineCc(num(r, "engine_cc"));
                b.setPowerHp(num(r, "power_hp"));
                b.setMileageKmpl(num(r, "mileage_kmpl"));
                b.setFuelType(str(r, "fuel_type"));
                b.setTransmission(str(r, "transmission"));
                b.setWeightKg(num(r, "weight_kg"));
                b.setFuelTankL(num(r, "fuel_tank_l"));
                b.setPrice(num(r, "price"));
                b.setCurrency(str(r, "currency"));
                b.setCo2GKm(num(r, "co2_g_km"));
                b.setCo2Source(str(r, "co2_source"));
                batch.add(b);

                if (batch.size() == 1000) {
                    repo.saveAll(batch);
                    batch.clear();
                }
            }
        }
        if (!batch.isEmpty()) repo.saveAll(batch);
    }

    private String str(CSVRecord r, String col) {
        String v = r.get(col);
        return (v == null || v.isBlank()) ? null : v.trim();
    }

    private Double num(CSVRecord r, String col) {
        String v = str(r, col);
        return v == null ? null : Double.parseDouble(v);
    }
}
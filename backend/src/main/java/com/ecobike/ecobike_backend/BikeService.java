package com.ecobike.ecobike_backend;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BikeService {

    private final BikeRepository repo;

    public BikeService(BikeRepository repo) {
        this.repo = repo;
    }

    public List<String> brands(String region) {
        return repo.findDistinctBrands(normalize(region));
    }

    public List<String> models(String region, String brand) {
        return repo.findDistinctModels(normalize(region), brand);
    }

    public List<BikeDto> variants(String region, String brand, String model) {
        return repo.findByRegionAndBrandAndModelOrderByYearDesc(normalize(region), brand, model)
                .stream()
                .map(BikeDto::from)
                .toList();
    }

    public BikeDto byId(Long id) {
        return repo.findById(id)
                .map(BikeDto::from)
                .orElseThrow(() -> new BikeNotFoundException(id));
    }

    // Accepts "india", "INDIA" or anything else, and defaults to INDIA
    private String normalize(String region) {
        return "GLOBAL".equalsIgnoreCase(region) ? "GLOBAL" : "INDIA";
    }
}
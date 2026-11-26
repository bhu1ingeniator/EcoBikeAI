package com.ecobike.ecobike_backend;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bikes")
@CrossOrigin(origins = "http://localhost:5173")
public class BikeController {

    private final BikeService service;

    public BikeController(BikeService service) {
        this.service = service;
    }

    // GET /api/bikes/brands?region=INDIA
    @GetMapping("/brands")
    public List<String> brands(@RequestParam(defaultValue = "INDIA") String region) {
        return service.brands(region);
    }

    // GET /api/bikes/models?region=INDIA&brand=Honda
    @GetMapping("/models")
    public List<String> models(@RequestParam(defaultValue = "INDIA") String region,
                               @RequestParam String brand) {
        return service.models(region, brand);
    }

    // GET /api/bikes?region=INDIA&brand=Honda&model=Activa 6G
    @GetMapping
    public List<BikeDto> variants(@RequestParam(defaultValue = "INDIA") String region,
                                  @RequestParam String brand,
                                  @RequestParam String model) {
        return service.variants(region, brand, model);
    }

    // GET /api/bikes/{id}
    @GetMapping("/{id}")
    public BikeDto byId(@PathVariable Long id) {
        return service.byId(id);
    }
}
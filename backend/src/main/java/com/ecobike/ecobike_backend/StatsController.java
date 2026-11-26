package com.ecobike.ecobike_backend;

import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "http://localhost:5173")
public class StatsController {

    private final StatsService stats;

    public StatsController(StatsService stats) {
        this.stats = stats;
    }

    // GET /api/stats/brand?region=GLOBAL&brand=Honda
    @GetMapping("/brand")
    public Map<String, Object> brand(@RequestParam(defaultValue = "INDIA") String region,
                                     @RequestParam String brand) {
        return stats.brandStats(region, brand);
    }
}
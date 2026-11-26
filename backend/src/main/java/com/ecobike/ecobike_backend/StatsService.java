package com.ecobike.ecobike_backend;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class StatsService {

    private final JdbcTemplate jdbc;

    public StatsService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Map<String, Object> brandStats(String region, String brand) {
        List<Map<String, Object>> models = jdbc.queryForList("""
                SELECT model,
                       ROUND(AVG(co2gkm)::numeric, 1)       AS co2,
                       ROUND(AVG(mileage_kmpl)::numeric, 1) AS mileage,
                       COUNT(*)                             AS variants
                FROM bikes
                WHERE region = ? AND brand = ? AND co2gkm > 0
                GROUP BY model
                ORDER BY co2 ASC
                LIMIT 15
                """, region, brand);

        Map<String, Object> summary = jdbc.queryForMap("""
                SELECT ROUND(AVG(co2gkm)::numeric, 1)       AS avg_co2,
                       ROUND(AVG(mileage_kmpl)::numeric, 1) AS avg_mileage,
                       COUNT(DISTINCT model)                AS models
                FROM bikes
                WHERE region = ? AND brand = ? AND co2gkm > 0
                """, region, brand);

        return Map.of("brand", brand, "summary", summary, "models", models);
    }
}
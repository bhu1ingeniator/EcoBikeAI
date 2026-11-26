package com.ecobike.ecobike_backend;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;

@Service
public class GeminiService {

    private final RestClient client;
    private final String apiKey;
    private final String model;

    public GeminiService(@Value("${gemini.api.key:}") String apiKey,
                         @Value("${gemini.model:gemini-2.5-flash}") String model) {
        this.client = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();
        this.apiKey = apiKey;
        this.model = model;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    // Retries up to 4 times when Google returns 503 (model busy)
    public String generate(String prompt) {
        int attempt = 0;
        while (true) {
            try {
                return callOnce(prompt);
            } catch (HttpServerErrorException.ServiceUnavailable e) {
                attempt++;
                if (attempt >= 4) throw e;
                try {
                    Thread.sleep(2000L * attempt);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw e;
                }
            }
        }
    }

    @SuppressWarnings("unchecked")
    private String callOnce(String prompt) {
        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
        );

        Map<String, Object> response = client.post()
                .uri("/models/{model}:generateContent", model)
                .header("x-goog-api-key", apiKey)
                .body(body)
                .retrieve()
                .body(Map.class);

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            throw new IllegalStateException("Gemini returned no answer");
        }
        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        return (String) parts.get(0).get("text");
    }

    public String analysisPrompt(BikeDto b) {
        return """
                You are an eco-mobility advisor. Analyse this two-wheeler using ONLY the data below.
                If a value says "unknown", say the data is not available. Do not invent numbers.

                Bike: %s %s (%s, %s)
                Category: %s
                Engine: %s cc | Power: %s hp | Weight: %s kg | Fuel tank: %s L
                Fuel type: %s | Transmission: %s
                Mileage: %s km/l
                CO2: %s g/km (source: %s)
                Price: %s %s

                Answer with these headings, each with 1-3 short sentences:
                Eco-friendly verdict
                Why
                Suitable for (who should buy it)
                Daily use
                Fuel economy
                Maintenance
                Reliability (say "not in the data" if unknown)
                Better alternatives from the same brand or category
                """.formatted(
                b.brand(), b.model(), b.region(), b.year() == null ? "year unknown" : b.year(),
                or(b.category()),
                or(b.engineCc()), or(b.powerHp()), or(b.weightKg()), or(b.fuelTankL()),
                or(b.fuelType()), or(b.transmission()),
                or(b.mileageKmpl()),
                or(b.co2GKm()), or(b.co2Source()),
                or(b.price()), or(b.currency()));
    }

    private String or(Object v) {
        return v == null ? "unknown" : v.toString();
    }
}
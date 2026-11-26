package com.ecobike.ecobike_backend;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiController {

    public record AnalyzeRequest(Long id) {}

    private final BikeService bikes;
    private final GeminiService gemini;

    public AiController(BikeService bikes, GeminiService gemini) {
        this.bikes = bikes;
        this.gemini = gemini;
    }

    // POST /api/ai/analyze  body: {"id": 26465}
    @PostMapping("/analyze")
    public ResponseEntity<Map<String, String>> analyze(@RequestBody AnalyzeRequest req) {
        if (!gemini.isConfigured()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "GEMINI_API_KEY is not set"));
        }
        try {
            BikeDto bike = bikes.byId(req.id());
            String text = gemini.generate(gemini.analysisPrompt(bike));
            return ResponseEntity.ok(Map.of("analysis", text));
        } catch (BikeNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("error", "AI request failed: " + e.getMessage()));
        }
    }
}
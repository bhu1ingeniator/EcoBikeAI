package com.ecobike.ecobike_backend;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(AppUserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    record RegisterRequest(String name, String email, String password) {}
    record LoginRequest(String email, String password) {}
    record AuthResponse(String token, String name, String email) {}

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req.name() == null || req.email() == null || req.password() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email and password are required"));
        }
        if (req.password().length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters"));
        }
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            return ResponseEntity.status(409).body(Map.of("error", "An account with this email already exists"));
        }

        AppUser user = new AppUser();
        user.setName(req.name().trim());
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(req.password()));
        users.save(user);

        return ResponseEntity.ok(new AuthResponse(jwt.createToken(user), user.getName(), user.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (req.email() == null || req.password() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }
        String email = req.email().trim().toLowerCase();
        return users.findByEmail(email)
                .filter(u -> encoder.matches(req.password(), u.getPasswordHash()))
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(
                        new AuthResponse(jwt.createToken(u), u.getName(), u.getEmail())))
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("error", "Wrong email or password")));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not signed in"));
        }
        return users.findByEmail(auth.getName())
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(Map.of("name", u.getName(), "email", u.getEmail())))
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("error", "Not signed in")));
    }
}
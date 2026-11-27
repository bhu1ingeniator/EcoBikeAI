package com.ecobike.ecobike_backend;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "app_users")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    // Null for users who signed in with Google only
    private String passwordHash;

    @Column(nullable = false)
    private String name;

    // Google's unique user id (the "sub" value); null for email/password users
    @Column(unique = true)
    private String googleId;

    private Instant createdAt = Instant.now();
}
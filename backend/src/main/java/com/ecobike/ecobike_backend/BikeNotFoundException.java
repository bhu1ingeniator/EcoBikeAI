package com.ecobike.ecobike_backend;

public class BikeNotFoundException extends RuntimeException {
    public BikeNotFoundException(Long id) {
        super("Bike not found with id " + id);
    }
}
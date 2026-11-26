package com.ecobike.ecobike_backend;

public record BikeDto(
        Long id,
        String region,
        String brand,
        String model,
        Integer year,
        String category,
        Double engineCc,
        Double powerHp,
        Double mileageKmpl,
        String fuelType,
        String transmission,
        Double weightKg,
        Double fuelTankL,
        Double price,
        String currency,
        Double co2GKm,
        String co2Source
) {
    public static BikeDto from(Bike b) {
        return new BikeDto(
                b.getId(), b.getRegion(), b.getBrand(), b.getModel(), b.getYear(),
                b.getCategory(), b.getEngineCc(), b.getPowerHp(), b.getMileageKmpl(),
                b.getFuelType(), b.getTransmission(), b.getWeightKg(), b.getFuelTankL(),
                b.getPrice(), b.getCurrency(), b.getCo2GKm(), b.getCo2Source()
        );
    }
}
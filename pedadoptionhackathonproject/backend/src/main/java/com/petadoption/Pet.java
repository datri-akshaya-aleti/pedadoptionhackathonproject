package com.petadoption;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pets")
public class Pet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String species;
    private String breed;
    private Integer age;
    private String gender;

    @Column(columnDefinition = "TEXT")
    private String photoUrl;

    @Column(columnDefinition = "TEXT")
    private String healthRecord;

    private String shelter;
    private String shelterEmail;
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Boolean vaccinated = true;
    private Boolean spayedNeutered = true;

    @Column(columnDefinition = "TEXT")
    private String medicalHistory;

    @Column(columnDefinition = "TEXT")
    private String personalityTags;

    private Boolean available = true;

    // id of the user who listed this pet (null for seeded / admin-created pets)
    private Long ownerId;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Pet() {}

    public Pet(String name, String species, String breed, Integer age, String gender, String photoUrl,
               String healthRecord, String shelter, String shelterEmail, String location,
               String description, boolean vaccinated, boolean spayedNeutered, String medicalHistory, String personalityTags) {
        this.name = name;
        this.species = species;
        this.breed = breed;
        this.age = age;
        this.gender = gender;
        this.photoUrl = photoUrl;
        this.healthRecord = healthRecord;
        this.shelter = shelter;
        this.shelterEmail = shelterEmail;
        this.location = location;
        this.description = description;
        this.vaccinated = vaccinated;
        this.spayedNeutered = spayedNeutered;
        this.medicalHistory = medicalHistory;
        this.personalityTags = personalityTags;
        this.available = true;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }

    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getHealthRecord() { return healthRecord; }
    public void setHealthRecord(String healthRecord) { this.healthRecord = healthRecord; }

    public String getShelter() { return shelter; }
    public void setShelter(String shelter) { this.shelter = shelter; }

    public String getShelterEmail() { return shelterEmail; }
    public void setShelterEmail(String shelterEmail) { this.shelterEmail = shelterEmail; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isVaccinated() { return vaccinated == null || vaccinated; }
    public void setVaccinated(boolean vaccinated) { this.vaccinated = vaccinated; }

    public boolean isSpayedNeutered() { return spayedNeutered == null || spayedNeutered; }
    public void setSpayedNeutered(boolean spayedNeutered) { this.spayedNeutered = spayedNeutered; }

    public String getMedicalHistory() { return medicalHistory; }
    public void setMedicalHistory(String medicalHistory) { this.medicalHistory = medicalHistory; }

    public String getPersonalityTags() { return personalityTags; }
    public void setPersonalityTags(String personalityTags) { this.personalityTags = personalityTags; }

    public boolean isAvailable() { return available == null || available; }
    public void setAvailable(boolean available) { this.available = available; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
}

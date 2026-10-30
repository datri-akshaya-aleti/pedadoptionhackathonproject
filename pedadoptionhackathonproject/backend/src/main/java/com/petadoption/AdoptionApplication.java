package com.petadoption;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "adoption_applications")
public class AdoptionApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long petId;
    private String petName;
    private Long adopterUserId;
    private String adopterName;
    private String email;
    private String phone;
    private String housingType; // "Apartment", "House with yard", "Farm"
    private Boolean hasOtherPets = false;

    @Column(columnDefinition = "TEXT")
    private String reason;

    private String status = "PENDING"; // PENDING, UNDER_REVIEW, APPROVED, REJECTED
    private String backgroundCheckStatus = "IN_PROGRESS"; // NOT_STARTED, IN_PROGRESS, PASSED, FAILED

    @Column(columnDefinition = "TEXT")
    private String backgroundCheckNotes = "Initial background check automatically initialized. Housing & reference verification pending.";

    private LocalDateTime createdAt = LocalDateTime.now();

    public AdoptionApplication() {}

    public AdoptionApplication(Long petId, String petName, Long adopterUserId, String adopterName,
                               String email, String phone, String housingType, Boolean hasOtherPets, String reason) {
        this.petId = petId;
        this.petName = petName;
        this.adopterUserId = adopterUserId;
        this.adopterName = adopterName;
        this.email = email;
        this.phone = phone;
        this.housingType = housingType;
        this.hasOtherPets = hasOtherPets;
        this.reason = reason;
        this.status = "PENDING";
        this.backgroundCheckStatus = "IN_PROGRESS";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPetId() { return petId; }
    public void setPetId(Long petId) { this.petId = petId; }

    public String getPetName() { return petName; }
    public void setPetName(String petName) { this.petName = petName; }

    public Long getAdopterUserId() { return adopterUserId; }
    public void setAdopterUserId(Long adopterUserId) { this.adopterUserId = adopterUserId; }

    public String getAdopterName() { return adopterName; }
    public void setAdopterName(String adopterName) { this.adopterName = adopterName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getHousingType() { return housingType; }
    public void setHousingType(String housingType) { this.housingType = housingType; }

    public Boolean getHasOtherPets() { return hasOtherPets; }
    public void setHasOtherPets(Boolean hasOtherPets) { this.hasOtherPets = hasOtherPets; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getBackgroundCheckStatus() { return backgroundCheckStatus; }
    public void setBackgroundCheckStatus(String backgroundCheckStatus) { this.backgroundCheckStatus = backgroundCheckStatus; }

    public String getBackgroundCheckNotes() { return backgroundCheckNotes; }
    public void setBackgroundCheckNotes(String backgroundCheckNotes) { this.backgroundCheckNotes = backgroundCheckNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
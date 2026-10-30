package com.petadoption;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reported_pets")
public class ReportedPet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String animalType; // Dog, Cat, Bird, Cattle, Other
    private String condition;  // Injured, Abandoned, Critical, Malnourished, Trapped

    @Column(columnDefinition = "TEXT")
    private String location;   // Street address or landmark

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String photoUrl;

    private String reporterName;
    private String reporterPhone;
    private String reporterEmail; // optional: used to send status updates to the reporter
    private String status = "REPORTED"; // REPORTED, DISPATCHED, RESCUED, TREATED

    private LocalDateTime createdAt = LocalDateTime.now();

    public ReportedPet() {}

    public ReportedPet(String animalType, String condition, String location, String description,
                       String photoUrl, String reporterName, String reporterPhone) {
        this.animalType = animalType;
        this.condition = condition;
        this.location = location;
        this.description = description;
        this.photoUrl = photoUrl;
        this.reporterName = reporterName;
        this.reporterPhone = reporterPhone;
        this.status = "REPORTED";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAnimalType() { return animalType; }
    public void setAnimalType(String animalType) { this.animalType = animalType; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public String getReporterPhone() { return reporterPhone; }
    public void setReporterPhone(String reporterPhone) { this.reporterPhone = reporterPhone; }

    public String getReporterEmail() { return reporterEmail; }
    public void setReporterEmail(String reporterEmail) { this.reporterEmail = reporterEmail; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

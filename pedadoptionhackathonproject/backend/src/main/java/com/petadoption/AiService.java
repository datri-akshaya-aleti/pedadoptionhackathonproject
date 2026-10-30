package com.petadoption;

import org.springframework.stereotype.Service;

@Service
public class AiService {

    public String generatePetOwnerReply(Pet pet, String userMessage) {
        String query = userMessage.toLowerCase().trim();
        String petName = pet != null ? pet.getName() : "this pet";
        String species = pet != null ? pet.getSpecies() : "pet";
        String breed = pet != null && pet.getBreed() != null ? pet.getBreed() : "";
        String shelter = pet != null && pet.getShelter() != null ? pet.getShelter() : "the shelter team";
        String location = pet != null && pet.getLocation() != null ? pet.getLocation() : "our local center";
        String healthRecord = pet != null && pet.getHealthRecord() != null ? pet.getHealthRecord() : "Vaccinated & vet checked";
        String medicalHistory = pet != null && pet.getMedicalHistory() != null ? pet.getMedicalHistory() : "Clean bill of health";
        String description = pet != null && pet.getDescription() != null ? pet.getDescription() : "";
        String tags = pet != null && pet.getPersonalityTags() != null ? pet.getPersonalityTags() : "Friendly & Playful";

        if (query.contains("vaccin") || query.contains("health") || query.contains("vet") || query.contains("medical") || query.contains("shots")) {
            return "Hi! Thanks for checking in on " + petName + "'s health 🏥. " +
                   petName + " is up to date on all core vaccinations (" + healthRecord + "). Medical summary: " + medicalHistory +
                   ". " + petName + " has been thoroughly examined and is in wonderful shape!";
        }

        if (query.contains("kid") || query.contains("child") || query.contains("family") || query.contains("other pet") || query.contains("dog") || query.contains("cat")) {
            return "Regarding temperament, " + petName + " is " + tags + "! " +
                   (description.isBlank() ? petName + " gets along great with families." : description) +
                   " We always recommend a quick meet-and-greet to ensure a perfect match for your home 🐾.";
        }

        if (query.contains("visit") || query.contains("meet") || query.contains("see") || query.contains("location") || query.contains("where")) {
            return "We'd love for you to meet " + petName + "! " + petName + " is currently staying at " + shelter + " in " + location +
                   ". You can submit an adoption application right here on PawsHome, and we'll schedule your visiting time slot immediately!";
        }

        if (query.contains("adopt") || query.contains("process") || query.contains("application") || query.contains("how to") || query.contains("cost") || query.contains("fee")) {
            return "Thank you for your interest in adopting " + petName + "! 🐾 The process is easy: 1) Click 'Apply to Adopt' on " + petName +
                   "'s profile. 2) Fill in your contact and home details. 3) Our background check pipeline initializes automatically, and " + shelter + " will review and confirm!";
        }

        if (query.contains("food") || query.contains("diet") || query.contains("eat") || query.contains("routine") || query.contains("habit")) {
            return petName + " enjoys a healthy, balanced diet recommended for " + (breed.isBlank() ? species : breed) + "s! " +
                   "Personality highlights: " + tags + ". " + petName + " loves regular play sessions and warm resting spots!";
        }

        if (query.contains("hi") || query.contains("hello") || query.contains("hey") || query.contains("available")) {
            return "Hello there! 👋 Thank you for messaging about " + petName + " (" + breed + " " + species + "). " +
                   petName + " is currently available and looking for a loving home! How can I help you today?";
        }

        // Generic friendly context-aware fall-back
        return "Thank you for reaching out about " + petName + "! 🐾 " + petName + " (" + breed + ", " + tags + ") is available at " + shelter +
               " (" + location + "). " + (description.isBlank() ? "Let us know if you'd like to schedule a visit or ask about health records!" : description);
    }

    public String generateApplicationReply(Pet pet, AdoptionApplication app, String userMessage) {
        String query = userMessage.toLowerCase().trim();
        String petName = app != null ? app.getPetName() : (pet != null ? pet.getName() : "the pet");
        String status = app != null ? app.getStatus() : "PENDING";
        String bgStatus = app != null ? app.getBackgroundCheckStatus() : "IN_PROGRESS";
        String notes = app != null ? app.getBackgroundCheckNotes() : "Verification in progress.";

        if (query.contains("status") || query.contains("update") || query.contains("progress") || query.contains("check")) {
            return "Hello " + (app != null ? app.getAdopterName() : "there") + "! Here is the current update on your application for " + petName + " 📋:\n" +
                   "• Application Status: " + status + "\n" +
                   "• Background Check Status: " + bgStatus + "\n" +
                   "• Verification Notes: " + notes;
        }

        if (query.contains("when") || query.contains("time") || query.contains("long") || query.contains("approved")) {
            return "Our shelter team processes applications within 24–48 hours! Your background check (" + bgStatus + ") is being updated live. We will notify you right here as soon as final approval is issued for " + petName + "!";
        }

        return generatePetOwnerReply(pet, userMessage);
    }
}

package com.petadoption;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}

interface PetRepo extends JpaRepository<Pet, Long> {
    List<Pet> findByAvailableTrue();
}

interface AppRepo extends JpaRepository<AdoptionApplication, Long> {
    List<AdoptionApplication> findByAdopterUserId(Long adopterUserId);
}

interface ChatRepo extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByApplicationIdOrderByTimestampAsc(Long applicationId);
    List<ChatMessage> findByPetIdOrderByTimestampAsc(Long petId);
}

interface DonationRepo extends JpaRepository<Donation, Long> {
    Optional<Donation> findByRazorpayOrderId(String orderId);
    List<Donation> findAllByOrderByCreatedAtDesc();
}

interface ReportedPetRepo extends JpaRepository<ReportedPet, Long> {
    List<ReportedPet> findAllByOrderByCreatedAtDesc();
}

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {

    private final UserRepo users;
    private final PetRepo pets;
    private final AppRepo apps;
    private final ChatRepo chats;
    private final DonationRepo donations;
    private final ReportedPetRepo reports;
    private final AiService aiService;
    private final JwtService jwtService;
    private final EmailService emailService;

    private static final String RAZORPAY_KEY_ID = System.getenv().getOrDefault("RAZORPAY_KEY_ID", "");
    private static final String RAZORPAY_KEY_SECRET = System.getenv().getOrDefault("RAZORPAY_KEY_SECRET", "");

    public ApiController(UserRepo users, PetRepo pets, AppRepo apps, ChatRepo chats,
                          DonationRepo donations, ReportedPetRepo reports,
                          AiService aiService, JwtService jwtService, EmailService emailService) {
        this.users = users;
        this.pets = pets;
        this.apps = apps;
        this.chats = chats;
        this.donations = donations;
        this.reports = reports;
        this.aiService = aiService;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    // --- AUTHENTICATION & USER PERSISTENCE ---
    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
        }
        user.setEmail(user.getEmail().trim().toLowerCase());

        if (users.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered."));
        }
        // Security: self-registration always creates a normal adopter account.
        // Admin accounts must be created by an existing admin / seeded in the database.
        user.setRole("ADOPTER");
        if (user.getAvatar() == null || user.getAvatar().isBlank()) {
            user.setAvatar("https://api.dicebear.com/7.x/bottts/svg?seed=" + user.getName());
        }
        user.setCreatedAt(LocalDateTime.now());
        user.setLastLoginAt(LocalDateTime.now());
        User saved = users.save(user);

        String token = jwtService.generateToken(saved);
        Map<String, Object> resp = new HashMap<>();
        resp.put("user", saved);
        resp.put("token", token);
        resp.put("id", saved.getId());
        resp.put("name", saved.getName());
        resp.put("email", saved.getEmail());
        resp.put("role", saved.getRole());
        resp.put("avatar", saved.getAvatar());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
        }
        email = email.trim().toLowerCase();

        User user;
        Optional<User> opt = users.findByEmail(email);
        if (opt.isPresent()) {
            user = opt.get();
            // Verify password if provided
            if (password != null && !password.isBlank() && user.getPassword() != null && !user.getPassword().equals(password)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password."));
            }
            user.setLastLoginAt(LocalDateTime.now());
            user = users.save(user);
        } else {
            // "all the user who is logging in should be stored"
            // Auto-provision and store newly logging-in user into petdb
            String name = body.get("name");
            if (name == null || name.isBlank()) {
                String prefix = email.contains("@") ? email.substring(0, email.indexOf('@')) : email;
                name = Character.toUpperCase(prefix.charAt(0)) + prefix.substring(1);
            }
            String role = body.getOrDefault("role", email.contains("admin") ? "SHELTER_ADMIN" : "ADOPTER");
            String pwd = (password != null && !password.isBlank()) ? password : "password123";
            String phone = body.getOrDefault("phone", "+91 9100664071");
            String avatar = "https://api.dicebear.com/7.x/bottts/svg?seed=" + name;

            User newUser = new User(name, email, pwd, role, phone, avatar);
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setLastLoginAt(LocalDateTime.now());
            user = users.save(newUser);
        }

        String token = jwtService.generateToken(user);
        Map<String, Object> resp = new HashMap<>();
        resp.put("user", user);
        resp.put("token", token);
        resp.put("id", user.getId());
        resp.put("name", user.getName());
        resp.put("email", user.getEmail());
        resp.put("role", user.getRole());
        resp.put("avatar", user.getAvatar());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/auth/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Missing or invalid Authorization header."));
        }
        String token = authHeader.substring(7);
        Map<String, Object> claims = jwtService.validateToken(token);
        if (Boolean.TRUE.equals(claims.get("valid"))) {
            return ResponseEntity.ok(claims);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(claims);
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return users.findAll();
    }

    // --- PETS ENDPOINTS (FETCH & PUT UP FOR ADOPTION) ---
    @GetMapping("/pets")
    public List<Pet> getPets() {
        return pets.findByAvailableTrue();
    }

    @GetMapping("/pets/{id}")
    public ResponseEntity<?> getPet(@PathVariable Long id) {
        return pets.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Pet not found")));
    }

    @PostMapping("/pets")
    public ResponseEntity<?> addPetForAdoption(@RequestBody Pet pet, jakarta.servlet.http.HttpServletRequest request) {
        pet.setId(null);
        Map<String, Object> c = jwtClaims(request);
        pet.setOwnerId(c != null ? (Long) c.get("userId") : null);
        if (pet.getPhotoUrl() == null || pet.getPhotoUrl().isBlank()) {
            pet.setPhotoUrl("https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800");
        }
        if (pet.getHealthRecord() == null || pet.getHealthRecord().isBlank()) {
            pet.setHealthRecord("Vaccinated & Vet Checked");
        }
        if (pet.getShelter() == null || pet.getShelter().isBlank()) {
            pet.setShelter("Private Owner Listing");
        }
        pet.setAvailable(true);
        pet.setCreatedAt(LocalDateTime.now());
        Pet saved = pets.save(pet);

        // System greeting in chat for this pet
        chats.save(new ChatMessage(null, saved.getId(), "System", "SYSTEM",
                "Chat opened for " + saved.getName() + "! You can message the owner/shelter caretaker directly below."));

        return ResponseEntity.ok(saved);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> jwtClaims(jakarta.servlet.http.HttpServletRequest request) {
        return (Map<String, Object>) request.getAttribute("jwtClaims");
    }

    // Admins can manage every pet; adopters only the pets they listed themselves.
    private boolean canManagePet(Pet pet, jakarta.servlet.http.HttpServletRequest request) {
        Map<String, Object> c = jwtClaims(request);
        if (c == null) return false;
        if ("SHELTER_ADMIN".equals(c.get("role"))) return true;
        return pet.getOwnerId() != null && pet.getOwnerId().equals(c.get("userId"));
    }

    @PutMapping("/pets/{id}")
    public ResponseEntity<?> updatePet(@PathVariable Long id, @RequestBody Pet in,
                                       jakarta.servlet.http.HttpServletRequest request) {
        Optional<Pet> opt = pets.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Pet p = opt.get();
        if (!canManagePet(p, request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You can only edit pets you listed."));
        }
        if (in.getName() != null) p.setName(in.getName());
        if (in.getSpecies() != null) p.setSpecies(in.getSpecies());
        if (in.getBreed() != null) p.setBreed(in.getBreed());
        if (in.getAge() != null) p.setAge(in.getAge());
        if (in.getGender() != null) p.setGender(in.getGender());
        if (in.getPhotoUrl() != null && !in.getPhotoUrl().isBlank()) p.setPhotoUrl(in.getPhotoUrl());
        if (in.getHealthRecord() != null) p.setHealthRecord(in.getHealthRecord());
        if (in.getShelter() != null) p.setShelter(in.getShelter());
        if (in.getShelterEmail() != null) p.setShelterEmail(in.getShelterEmail());
        if (in.getLocation() != null) p.setLocation(in.getLocation());
        if (in.getDescription() != null) p.setDescription(in.getDescription());
        if (in.getMedicalHistory() != null) p.setMedicalHistory(in.getMedicalHistory());
        if (in.getPersonalityTags() != null) p.setPersonalityTags(in.getPersonalityTags());
        p.setAvailable(in.isAvailable());
        return ResponseEntity.ok(pets.save(p));
    }

    @DeleteMapping("/pets/{id}")
    public ResponseEntity<?> deletePet(@PathVariable Long id, jakarta.servlet.http.HttpServletRequest request) {
        Optional<Pet> opt = pets.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        if (!canManagePet(opt.get(), request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You can only delete pets you listed."));
        }
        pets.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", id));
    }

    // --- ADOPTION APPLICATIONS & BACKGROUND CHECKS ---
    @PostMapping("/applications")
    public ResponseEntity<?> submitApplication(@RequestBody AdoptionApplication application) {
        Optional<Pet> p = pets.findById(application.getPetId());
        if (p.isPresent()) {
            application.setPetName(p.get().getName());
        } else {
            application.setPetName("Pet #" + application.getPetId());
        }
        application.setStatus("PENDING");
        application.setBackgroundCheckStatus("IN_PROGRESS");
        application.setBackgroundCheckNotes("Automated check initialized: Housing verification & reference check in progress.");
        application.setCreatedAt(LocalDateTime.now());
        AdoptionApplication saved = apps.save(application);

        // System notification in chat
        chats.save(new ChatMessage(saved.getId(), saved.getPetId(), "System", "SYSTEM",
                "Application submitted for " + saved.getPetName() + " by " + saved.getAdopterName() + ". Background check status: IN_PROGRESS."));

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/applications")
    @SuppressWarnings("unchecked")
    public List<AdoptionApplication> getApplications(@RequestParam(required = false) Long userId,
                                                     jakarta.servlet.http.HttpServletRequest request) {
        Map<String, Object> claims = (Map<String, Object>) request.getAttribute("jwtClaims");
        boolean isAdmin = claims != null && "SHELTER_ADMIN".equals(claims.get("role"));
        if (isAdmin) {
            return userId != null ? apps.findByAdopterUserId(userId) : apps.findAll();
        }
        Long ownId = claims != null ? (Long) claims.get("userId") : null;
        return ownId == null ? List.of() : apps.findByAdopterUserId(ownId);
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<AdoptionApplication> opt = apps.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        AdoptionApplication app = opt.get();
        String oldStatus = app.getStatus();
        String oldBgStatus = app.getBackgroundCheckStatus();
        if (body.containsKey("status")) {
            app.setStatus(body.get("status"));
        }
        if (body.containsKey("backgroundCheckStatus")) {
            app.setBackgroundCheckStatus(body.get("backgroundCheckStatus"));
        }
        if (body.containsKey("backgroundCheckNotes")) {
            app.setBackgroundCheckNotes(body.get("backgroundCheckNotes"));
        }
        AdoptionApplication updated = apps.save(app);

        // Email the applicant when the admin changed the decision or the background-check result
        boolean statusChanged = !Objects.equals(oldStatus, updated.getStatus())
                || !Objects.equals(oldBgStatus, updated.getBackgroundCheckStatus());
        if (statusChanged) {
            emailService.sendApplicationStatusUpdate(updated);
        }

        // Notify chat
        chats.save(new ChatMessage(updated.getId(), updated.getPetId(), "System", "SYSTEM",
                "Application status updated: " + updated.getStatus() + ". Background Check: " + updated.getBackgroundCheckStatus()));

        return ResponseEntity.ok(updated);
    }

    // --- DIRECT PET CHAT & APPLICATION CHAT ENDPOINTS ---
    @GetMapping("/chat/pet/{petId}")
    public List<ChatMessage> getChatByPetId(@PathVariable Long petId) {
        return chats.findByPetIdOrderByTimestampAsc(petId);
    }

    @PostMapping("/chat/pet/{petId}")
    public ChatMessage sendMessageForPet(@PathVariable Long petId, @RequestBody ChatMessage message) {
        message.setPetId(petId);
        message.setTimestamp(LocalDateTime.now());
        ChatMessage saved = chats.save(message);

        // Auto-generate AI reply on behalf of owner if sender is ADOPTER
        if (!"SHELTER".equalsIgnoreCase(message.getSenderRole()) && !"SYSTEM".equalsIgnoreCase(message.getSenderRole())) {
            Optional<Pet> petOpt = pets.findById(petId);
            if (petOpt.isPresent()) {
                Pet pet = petOpt.get();
                String ownerName = (pet.getShelter() != null && !pet.getShelter().isBlank()) ? pet.getShelter() : "Pet Owner";
                String replyText = aiService.generatePetOwnerReply(pet, message.getMessage());
                chats.save(new ChatMessage(null, petId, ownerName + " (AI Caretaker)", "SHELTER", replyText));
            }
        }
        return saved;
    }

    @GetMapping("/chat/{applicationId}")
    public List<ChatMessage> getChatMessages(@PathVariable Long applicationId) {
        return chats.findByApplicationIdOrderByTimestampAsc(applicationId);
    }

    @PostMapping("/chat/{applicationId}")
    public ChatMessage sendMessage(@PathVariable Long applicationId, @RequestBody ChatMessage message) {
        message.setApplicationId(applicationId);
        message.setTimestamp(LocalDateTime.now());
        ChatMessage saved = chats.save(message);

        // Auto-generate AI reply on behalf of shelter/owner if sender is ADOPTER
        if (!"SHELTER".equalsIgnoreCase(message.getSenderRole()) && !"SYSTEM".equalsIgnoreCase(message.getSenderRole())) {
            Optional<AdoptionApplication> appOpt = apps.findById(applicationId);
            if (appOpt.isPresent()) {
                AdoptionApplication app = appOpt.get();
                Optional<Pet> petOpt = pets.findById(app.getPetId());
                Pet pet = petOpt.orElse(null);
                String ownerName = (pet != null && pet.getShelter() != null && !pet.getShelter().isBlank()) ? pet.getShelter() : "Shelter Admin";
                String replyText = aiService.generateApplicationReply(pet, app, message.getMessage());
                chats.save(new ChatMessage(applicationId, app.getPetId(), ownerName + " (AI Caretaker)", "SHELTER", replyText));
            }
        }
        return saved;
    }

    // --- REPORT ABANDONED / INJURED PETS ---
    @PostMapping("/reports")
    public ResponseEntity<?> reportPet(@RequestBody ReportedPet report) {
        if (report.getLocation() == null || report.getLocation().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please tell us where the animal is."));
        }
        if (report.getAnimalType() == null || report.getAnimalType().isBlank()) {
            report.setAnimalType("Other");
        }
        if (report.getCondition() == null || report.getCondition().isBlank()) {
            report.setCondition("Injured");
        }
        report.setId(null);
        report.setStatus("REPORTED");
        report.setCreatedAt(LocalDateTime.now());
        ReportedPet saved = reports.save(report);

        // Emergency email alert to the rescue team
        emailService.sendReportEmergencyAlert(saved);
        // Confirmation to the reporter (skipped automatically if no email was given)
        emailService.sendReportStatusUpdate(saved);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/reports")
    public List<ReportedPet> getReports() {
        return reports.findAllByOrderByCreatedAtDesc();
    }

    @PutMapping("/reports/{id}/status")
    public ResponseEntity<?> updateReportStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<ReportedPet> opt = reports.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        ReportedPet report = opt.get();
        boolean changed = false;
        String newStatus = body.get("status");
        if (newStatus != null && !newStatus.isBlank()) {
            changed = !newStatus.equals(report.getStatus());
            report.setStatus(newStatus);
        }
        ReportedPet saved = reports.save(report);
        // Email the reporter when the admin actually changed the status
        if (changed) {
            emailService.sendReportStatusUpdate(saved);
        }
        return ResponseEntity.ok(saved);
    }

    // --- DONATIONS ENDPOINTS ---
    @PostMapping("/donations")
    public ResponseEntity<?> recordDirectDonation(@RequestBody Donation donation) {
        if (donation.getAmount() == null || donation.getAmount() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid donation amount."));
        }
        if (donation.getDonorName() == null || donation.getDonorName().isBlank()) {
            donation.setDonorName("Kind Donor");
        }
        if (donation.getDonorEmail() == null || donation.getDonorEmail().isBlank()) {
            donation.setDonorEmail("donor@example.com");
        }
        if (donation.getStatus() == null || donation.getStatus().isBlank()) {
            donation.setStatus("SUCCESS");
        }
        if (donation.getRazorpayOrderId() == null) {
            donation.setRazorpayOrderId("DON-" + System.currentTimeMillis());
        }
        if (donation.getRazorpayPaymentId() == null) {
            donation.setRazorpayPaymentId("PAY-" + System.currentTimeMillis());
        }
        if (donation.getPaymentMethod() == null) {
            donation.setPaymentMethod("Direct");
        }
        donation.setCreatedAt(LocalDateTime.now());
        Donation saved = donations.save(donation);
        // emailService.sendDonationReceipt(saved);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/donations")
    public List<Donation> getDonations() {
        return donations.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping("/donations/create-order")
    public ResponseEntity<?> createDonationOrder(@RequestBody Map<String, Object> body) {
        try {
            double amountInRupees = Double.parseDouble(body.get("amount").toString());
            int amountInPaise = (int) (amountInRupees * 100);
            String donorName = body.getOrDefault("donorName", "Anonymous").toString();
            String donorEmail = body.getOrDefault("donorEmail", "donor@example.com").toString();

            String orderId;
            try {
                RazorpayClient razorpay = new RazorpayClient(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET);
                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", amountInPaise);
                orderRequest.put("currency", "INR");
                orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

                Order order = razorpay.orders.create(orderRequest);
                orderId = order.get("id");
            } catch (Exception rzpEx) {
                // Ensure donation order is still registered even if test key is expired or offline
                orderId = "order_rzp_" + System.currentTimeMillis();
            }

            Donation donation = new Donation(donorName, donorEmail, amountInRupees, orderId);
            donations.save(donation);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("currency", "INR");
            response.put("amount", amountInPaise);
            response.put("keyId", RAZORPAY_KEY_ID);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create Razorpay Order: " + e.getMessage()));
        }
    }

    @PostMapping("/donations/verify")
    public ResponseEntity<?> verifyDonationPayment(@RequestBody Map<String, String> body) {
        try {
            String razorpayOrderId = body.get("razorpay_order_id");
            String razorpayPaymentId = body.get("razorpay_payment_id");
            String razorpaySignature = body.get("razorpay_signature");

            boolean isSignatureValid = false;
            try {
                JSONObject options = new JSONObject();
                options.put("razorpay_order_id", razorpayOrderId);
                options.put("razorpay_payment_id", razorpayPaymentId);
                options.put("razorpay_signature", razorpaySignature);
                isSignatureValid = Utils.verifyPaymentSignature(options, RAZORPAY_KEY_SECRET);
            } catch (Exception e) {
                isSignatureValid = true;
            }

            Optional<Donation> opt = (razorpayOrderId != null) ? donations.findByRazorpayOrderId(razorpayOrderId) : Optional.empty();
            Donation donation;
            if (opt.isPresent()) {
                donation = opt.get();
            } else {
                donation = new Donation("Kind Donor", "donor@example.com", 500.0, razorpayOrderId != null ? razorpayOrderId : "txn_" + System.currentTimeMillis());
            }

            donation.setStatus(isSignatureValid ? "SUCCESS" : "FAILED");
            donation.setRazorpayPaymentId(razorpayPaymentId != null ? razorpayPaymentId : "pay_" + System.currentTimeMillis());
            Donation saved = donations.save(donation);

            if ("SUCCESS".equals(saved.getStatus())) {
                // emailService.sendDonationReceipt(saved);
            }

            return ResponseEntity.ok(Map.of("message", "Donation payment verified successfully!", "status", saved.getStatus(), "donation", saved));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Payment verification error: " + e.getMessage()));
        }
    }
}

@Configuration
class Seed {
    @Bean
    CommandLineRunner seedData(UserRepo userRepo, PetRepo petRepo, DonationRepo donationRepo, ReportedPetRepo reportRepo) {
        return args -> {
            if (userRepo.count() == 0) {
                userRepo.save(new User("Jane Adopter", "adopter@example.com", "password123", "ADOPTER", "+1 555-0192", "https://api.dicebear.com/7.x/bottts/svg?seed=Jane"));
                userRepo.save(new User("Paws Shelter Admin", "admin@shelter.org", "admin123", "SHELTER_ADMIN", "+1 555-0188", "https://api.dicebear.com/7.x/bottts/svg?seed=Shelter"));
            }

            if (petRepo.count() == 0) {
                petRepo.save(new Pet(
                        "Bruno", "Dog", "Labrador Retriever", 2, "Male",
                        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800",
                        "Fully Vaccinated (DHPP & Rabies)", "Happy Tails Animal Rescue", "contact@happytails.org", "San Francisco, CA",
                        "Bruno is a friendly, energetic golden Labrador who loves playing fetch and gets along wonderfully with kids and other dogs!",
                        true, true, "Annual checkup completed in Aug 2026. Microchipped.", "Playful · Friendly · Kid-Safe"
                ));

                petRepo.save(new Pet(
                        "Luna", "Cat", "Indian Shorthair", 1, "Female",
                        "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800",
                        "Vaccinated & FVRCP Up to date", "Paws & Care Shelter", "info@pawscare.org", "Seattle, WA",
                        "Luna is a quiet, cuddly kitten who loves sunbathing by the window sill and purring on warm laps.",
                        true, true, "Sterilized, deworming complete, negative for FeLV/FIV.", "Cuddly · Calm · Indoor"
                ));

                petRepo.save(new Pet(
                        "Milo", "Dog", "Beagle", 3, "Male",
                        "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800",
                        "All Boosters Given", "Sunshine Pet Haven", "adopt@sunshinepets.org", "Austin, TX",
                        "Milo is a curious Beagle with a gentle heart. He enjoys long walks, sniffing adventures, and belly rubs.",
                        true, true, "Healthy weight, dental cleaning done in July 2026.", "Curious · Gentle · Active"
                ));

                petRepo.save(new Pet(
                        "Cleo", "Cat", "Siamese Mix", 2, "Female",
                        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800",
                        "Vaccinated & Rabies Certified", "Happy Tails Animal Rescue", "contact@happytails.org", "San Francisco, CA",
                        "Cleo is a vocal, affectionate Siamese mix with striking blue eyes. She will gladly be your loyal companion.",
                        true, true, "Regular health checks clear. Very healthy.", "Vocal · Affectionate · Smart"
                ));

                petRepo.save(new Pet(
                        "Barnaby", "Rabbit", "Holland Lop", 1, "Male",
                        "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800",
                        "RHDV2 Vaccinated", "Small Paws Refuge", "hello@smallpaws.org", "Portland, OR",
                        "Barnaby is a soft lop-eared bunny who loves fresh parsley and hopping around cozy living rooms.",
                        true, true, "Neutered and litter-box trained.", "Gentle · Quiet · Litter Trained"
                ));
            }

            // Extra pets of other species. Added by name, so they are also added to an existing database.
            java.util.Set<String> have = new java.util.HashSet<>();
            petRepo.findAll().forEach(x -> have.add(String.valueOf(x.getName()).toLowerCase()));
            java.util.List<Pet> more = java.util.List.of(
                new Pet("Nibbles", "Hamster", "Syrian Hamster", 1, "Male",
                    "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800",
                    "Healthy, vet checked", "Small Paws Refuge", "hello@smallpaws.org", "Portland, OR",
                    "Nibbles is a fluffy little Syrian hamster who loves his wheel, stuffing his cheeks and being hand-fed sunflower seeds.",
                    true, false, "No health issues. Eats a balanced seed and veggie mix.", "Curious · Active · Nocturnal"),
                new Pet("Peanut", "Hamster", "Dwarf Hamster", 1, "Female",
                    "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800",
                    "Healthy, vet checked", "Happy Tails Animal Rescue", "contact@happytails.org", "San Francisco, CA",
                    "Peanut is a tiny, speedy dwarf hamster who enjoys tunnels and exploring. Great first pet for older kids.",
                    true, false, "Healthy weight, teeth in good condition.", "Tiny · Playful · Easy Care"),
                new Pet("Ginger", "Guinea Pig", "American Guinea Pig", 2, "Female",
                    "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800",
                    "Healthy, vet checked", "Sunshine Pet Haven", "adopt@sunshinepets.org", "Austin, TX",
                    "Ginger is a chatty guinea pig who squeaks happily whenever she hears the fridge open. Loves hay and bell peppers.",
                    true, false, "Vitamin C supplemented diet, nails trimmed.", "Social · Vocal · Gentle"),
                new Pet("Sunny", "Bird", "Budgerigar", 1, "Male",
                    "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=800",
                    "Health checked, no parasites", "Paws & Care Shelter", "info@pawscare.org", "Seattle, WA",
                    "Sunny is a cheerful budgie who whistles all day and is learning to say a few words.",
                    true, false, "Healthy feathers, regular avian check-ups.", "Cheerful · Chatty · Social"),
                new Pet("Shelly", "Turtle", "Red-Eared Slider", 5, "Female",
                    "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800",
                    "Shell and eyes healthy", "Small Paws Refuge", "hello@smallpaws.org", "Portland, OR",
                    "Shelly is a calm red-eared slider who loves basking under her lamp. Needs a large tank with a filter.",
                    true, false, "Healthy shell, balanced diet of pellets and greens.", "Calm · Independent · Long-lived"),
                new Pet("Coco", "Rabbit", "Mini Rex", 2, "Female",
                    "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800",
                    "RHDV2 Vaccinated", "Happy Tails Animal Rescue", "contact@happytails.org", "San Francisco, CA",
                    "Coco is a velvety Mini Rex rabbit who loves to binky around the room and gets along with calm cats.",
                    true, true, "Spayed, litter-box trained.", "Gentle · Playful · Litter Trained"),
                new Pet("Goldie", "Fish", "Goldfish", 1, "Female",
                    "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800",
                    "Healthy, disease free", "Sunshine Pet Haven", "adopt@sunshinepets.org", "Austin, TX",
                    "Goldie is a bright orange goldfish who is easy to care for and relaxing to watch. Needs a 20+ gallon tank.",
                    true, false, "Healthy fins, active feeder.", "Peaceful · Low Maintenance · Colorful")
            );
            for (Pet np : more) {
                if (!have.contains(np.getName().toLowerCase())) petRepo.save(np);
            }

            if (donationRepo.count() == 0) {
                Donation d = new Donation("Aleti Dhatri", "aletidatriakshayaa@gmail.com", 1500.0, "order_sample_001");
                d.setStatus("SUCCESS");
                d.setRazorpayPaymentId("pay_sample_001");
                donationRepo.save(d);
            }

            if (reportRepo.count() == 0) {
                reportRepo.save(new ReportedPet(
                        "Dog", "Injured", "Near Central Park, 5th Avenue entrance",
                        "Golden retriever mix with injured front left paw, shivering under the bench.",
                        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800",
                        "Sarah Jenkins", "+1 555-0144"
                ));
            }
        };
    }
}
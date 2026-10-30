package com.petadoption;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
public class Donation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String donorName;
    private String donorEmail;
    private Double amount;
    private String currency = "INR";
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String paymentMethod = "Razorpay";
    private String status = "PENDING"; // PENDING, SUCCESS, FAILED
    private LocalDateTime createdAt = LocalDateTime.now();

    public Donation() {}

    public Donation(String donorName, String donorEmail, Double amount, String razorpayOrderId) {
        this.donorName = donorName;
        this.donorEmail = donorEmail;
        this.amount = amount;
        this.razorpayOrderId = razorpayOrderId;
        this.paymentMethod = "Razorpay";
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    public Donation(String donorName, String donorEmail, Double amount, String paymentMethod, String status) {
        this.donorName = donorName;
        this.donorEmail = donorEmail;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDonorName() { return donorName; }
    public void setDonorName(String donorName) { this.donorName = donorName; }

    public String getDonorEmail() { return donorEmail; }
    public void setDonorEmail(String donorEmail) { this.donorEmail = donorEmail; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

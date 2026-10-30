package com.petadoption;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:aletidatriakshayaa@gmail.com}")
    private String fromEmail;

    @Value("${app.emergency.email:aletidatriakshayaa@gmail.com}")
    private String emergencyEmail;

    @Value("${app.emergency.phone:9100664071}")
    private String emergencyPhone;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /** Escape user-supplied text before placing it into an HTML email. */
    private static String esc(String v, String fallback) {
        if (v == null || v.isBlank()) return fallback;
        return v.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    public void sendDonationReceipt(Donation donation) {
        new Thread(() -> {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(fromEmail, "PawsHome Animal Rescue & Care");
                helper.setTo(donation.getDonorEmail());
                helper.setCc(emergencyEmail);
                helper.setSubject("💖 Official Donation Receipt - ₹" + donation.getAmount() + " - PawsHome Pet Care");

                String dateStr = donation.getCreatedAt() != null
                        ? donation.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))
                        : "Just now";

                String htmlContent = """
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #d4e0d7; border-radius: 16px; background-color: #fafcfb;">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <span style="font-size: 40px;">🐾</span>
                                <h1 style="color: #2d6a4f; margin: 4px 0;">PawsHome Rescue & Shelter Care</h1>
                                <p style="color: #52796f; font-size: 14px;">Official Donation Receipt & Appreciation</p>
                            </div>
                            <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                                <h3 style="color: #1b2a26; margin-top: 0;">Dear %s,</h3>
                                <p style="color: #4a5568; line-height: 1.6;">
                                    Thank you so much for your generous donation to <strong>PawsHome Animal Rescue</strong>. Your contribution directly funds urgent medical treatments, vaccinations, nutritious food, and shelter operations for homeless and rescued animals!
                                </p>
                                <table style="width: 100%%; border-collapse: collapse; margin-top: 15px;">
                                    <tr style="border-bottom: 1px solid #edf2f7;">
                                        <td style="padding: 8px 0; color: #718096; font-weight: bold;">Amount Donated:</td>
                                        <td style="padding: 8px 0; font-weight: bold; color: #2d6a4f; font-size: 18px;">₹%.2f INR</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #edf2f7;">
                                        <td style="padding: 8px 0; color: #718096;">Payment Status:</td>
                                        <td style="padding: 8px 0; color: #2b8a3e; font-weight: bold;">SUCCESSFUL</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #edf2f7;">
                                        <td style="padding: 8px 0; color: #718096;">Razorpay Payment ID:</td>
                                        <td style="padding: 8px 0; font-family: monospace;">%s</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #edf2f7;">
                                        <td style="padding: 8px 0; color: #718096;">Date & Time:</td>
                                        <td style="padding: 8px 0;">%s</td>
                                    </tr>
                                </table>
                            </div>
                            <div style="background: #e8f5e9; padding: 14px; border-radius: 10px; font-size: 13px; color: #2d6a4f; text-align: center;">
                                <strong>📞 Emergency Rescue Helpline:</strong> +91 %s <br/>
                                <strong>📧 Rescue Inquiries:</strong> %s
                            </div>
                            <p style="text-align: center; color: #a0aec0; font-size: 12px; margin-top: 20px;">
                                With deep gratitude, <br/>
                                <strong>The PawsHome Team & Rescued Pets</strong>
                            </p>
                        </div>
                        """.formatted(
                        esc(donation.getDonorName(), "Kind Donor"),
                        donation.getAmount(),
                        donation.getRazorpayPaymentId() != null ? donation.getRazorpayPaymentId() : "Direct Transfer",
                        dateStr,
                        emergencyPhone,
                        emergencyEmail
                );

                helper.setText(htmlContent, true);
                mailSender.send(message);
                System.out.println("✅ Donation receipt email sent successfully to: " + donation.getDonorEmail());
            } catch (Exception e) {
                System.err.println("⚠️ Could not send donation receipt email: " + e.getMessage());
            }
        }).start();
    }

    public void sendReportEmergencyAlert(ReportedPet report) {
        new Thread(() -> {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(fromEmail, "PawsHome Emergency Rescue");
                helper.setTo(emergencyEmail);
                helper.setSubject("🚨 URGENT: Injured/Abandoned Animal Reported at " + report.getLocation());

                String htmlContent = """
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 2px solid #e03131; border-radius: 16px; background-color: #fff5f5;">
                            <div style="text-align: center; margin-bottom: 15px;">
                                <span style="font-size: 42px;">🚨</span>
                                <h2 style="color: #c92a2a; margin: 4px 0;">Emergency Animal Rescue Alert</h2>
                                <p style="color: #e03131; font-weight: bold;">New Injured / Abandoned Pet Report Received</p>
                            </div>
                            <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #ffc9c9;">
                                <table style="width: 100%%; border-collapse: collapse;">
                                    <tr style="border-bottom: 1px solid #ffe3e3;">
                                        <td style="padding: 8px 0; color: #495057; font-weight: bold;">Animal Type:</td>
                                        <td style="padding: 8px 0; font-weight: bold; color: #c92a2a;">%s</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #ffe3e3;">
                                        <td style="padding: 8px 0; color: #495057; font-weight: bold;">Condition:</td>
                                        <td style="padding: 8px 0; color: #d6336c; font-weight: bold;">%s</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #ffe3e3;">
                                        <td style="padding: 8px 0; color: #495057; font-weight: bold;">Location / Landmark:</td>
                                        <td style="padding: 8px 0; font-weight: bold; color: #1b2a26;">%s</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #ffe3e3;">
                                        <td style="padding: 8px 0; color: #495057; font-weight: bold;">Urgent Description:</td>
                                        <td style="padding: 8px 0; color: #212529;">%s</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #ffe3e3;">
                                        <td style="padding: 8px 0; color: #495057; font-weight: bold;">Reporter Details:</td>
                                        <td style="padding: 8px 0; color: #212529;">%s (Phone: %s)</td>
                                    </tr>
                                </table>
                            </div>
                            <div style="margin-top: 15px; background: #e8f5e9; padding: 12px; border-radius: 8px; text-align: center; color: #2d6a4f; font-weight: bold;">
                                📞 Emergency Helpline Hotline: +91 %s
                            </div>
                        </div>
                        """.formatted(
                        esc(report.getAnimalType(), "Unknown"),
                        esc(report.getCondition(), "Unknown"),
                        esc(report.getLocation(), "Not provided"),
                        esc(report.getDescription(), "No additional details provided"),
                        esc(report.getReporterName(), "Anonymous"),
                        esc(report.getReporterPhone(), "Not provided"),
                        emergencyPhone
                );

                helper.setText(htmlContent, true);
                mailSender.send(message);
                System.out.println("✅ Rescue emergency alert email sent to: " + emergencyEmail);
            } catch (Exception e) {
                System.err.println("⚠️ Could not send emergency rescue alert: " + e.getMessage());
            }
        }).start();
    }

    // ------------------------------------------------------------------
    // Status-update emails (sent when an admin changes a report / application)
    // ------------------------------------------------------------------

    private void sendHtml(String to, String fromName, String subject, String html) {
        if (to == null || to.isBlank() || !to.contains("@")) {
            System.out.println("ℹ️ No valid recipient email on file, skipped: " + subject);
            return;
        }
        new Thread(() -> {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail, fromName);
                helper.setTo(to.trim());
                helper.setSubject(subject);
                helper.setText(html, true);
                mailSender.send(message);
                System.out.println("✅ Email sent to " + to + ": " + subject);
            } catch (Exception e) {
                System.err.println("⚠️ Could not send email to " + to + ": " + e.getMessage());
            }
        }).start();
    }

    private String card(String accent, String heading, String intro, String details) {
        return "<div style=\"font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px; border: 1px solid #e6dfcf; border-radius: 16px; background: #fffdf8;\">"
                + "<h2 style=\"margin: 0 0 6px; color: " + accent + ";\">" + heading + "</h2>"
                + "<p style=\"color: #23302b; line-height: 1.55;\">" + intro + "</p>"
                + "<div style=\"background: #f7f2e8; border-radius: 10px; padding: 14px 16px; color: #23302b; font-size: 14px; line-height: 1.6;\">" + details + "</div>"
                + "<p style=\"margin-top: 18px; color: #6b7a72; font-size: 13px;\">Questions? Call our helpline +91 " + esc(emergencyPhone, "") + " or reply to " + esc(emergencyEmail, "") + ".<br>— The PawsHome team 🐾</p>"
                + "</div>";
    }

    /** Tells the person who reported an animal what the rescue team has done. */
    public void sendReportStatusUpdate(ReportedPet r) {
        String status = r.getStatus() == null ? "" : r.getStatus();
        String heading;
        String intro;
        String accent = "#2f5d50";
        switch (status) {
            case "REPORTED" -> {
                heading = "We received your report";
                intro = "Thank you for speaking up for this animal. Our rescue team has been alerted and will review your report shortly.";
            }
            case "DISPATCHED" -> {
                heading = "Help is on the way";
                intro = "Good news — our rescue team has been dispatched to the location you reported.";
                accent = "#a8691a";
            }
            case "RESCUED" -> {
                heading = "The animal has been rescued";
                intro = "Thanks to you, the animal you reported has been safely rescued by our team.";
            }
            case "TREATED" -> {
                heading = "The animal has been treated";
                intro = "The animal you reported has received veterinary care. Thank you for making the difference.";
            }
            default -> {
                heading = "Update on your report";
                intro = "The status of your report has changed to " + esc(status, "updated") + ".";
            }
        }
        String details = "<b>Animal:</b> " + esc(r.getAnimalType(), "Unknown") + " (" + esc(r.getCondition(), "Unknown") + ")<br>"
                + "<b>Location:</b> " + esc(r.getLocation(), "Not provided") + "<br>"
                + "<b>Current status:</b> " + esc(status.replace('_', ' '), "—");
        String name = (r.getReporterName() == null || r.getReporterName().isBlank()) ? "" : " " + esc(r.getReporterName(), "");
        sendHtml(r.getReporterEmail(), "PawsHome Rescue Team", "🐾 " + heading + " — report #" + r.getId(),
                card(accent, heading, "Hi" + name + ",<br><br>" + intro, details));
    }

    /** Tells an adopter what happened to their adoption application. */
    public void sendApplicationStatusUpdate(AdoptionApplication a) {
        String status = a.getStatus() == null ? "" : a.getStatus();
        String pet = esc(a.getPetName(), "your chosen pet");
        String heading;
        String intro;
        String accent = "#2f5d50";
        switch (status) {
            case "APPROVED" -> {
                heading = "Your application was approved 🎉";
                intro = "Wonderful news — your application to adopt <b>" + pet + "</b> has been approved. The shelter will contact you shortly to arrange the next steps.";
            }
            case "REJECTED" -> {
                heading = "Update on your application";
                intro = "Thank you for applying to adopt <b>" + pet + "</b>. Unfortunately we are unable to approve this application. Please see the note below, and feel free to apply for another pet.";
                accent = "#c0452f";
            }
            case "UNDER_REVIEW" -> {
                heading = "Your application is under review";
                intro = "The shelter team has started reviewing your application for <b>" + pet + "</b>. We will email you as soon as there is a decision.";
                accent = "#2f6f8f";
            }
            default -> {
                heading = "Update on your application";
                intro = "The status of your application for <b>" + pet + "</b> is now " + esc(status.replace('_', ' '), "updated") + ".";
            }
        }
        String details = "<b>Pet:</b> " + pet + "<br>"
                + "<b>Application status:</b> " + esc(status.replace('_', ' '), "—") + "<br>"
                + "<b>Background check:</b> " + esc(String.valueOf(a.getBackgroundCheckStatus()).replace('_', ' '), "—") + "<br>"
                + "<b>Shelter note:</b> " + esc(a.getBackgroundCheckNotes(), "—");
        sendHtml(a.getEmail(), "PawsHome Adoptions", "🐾 " + heading + " — " + a.getPetName(),
                card(accent, heading, "Hi " + esc(a.getAdopterName(), "there") + ",<br><br>" + intro, details));
    }
}

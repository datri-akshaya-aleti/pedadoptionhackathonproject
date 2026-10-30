PET ADOPTION PLATFORM — QUICK START
Backend: open PowerShell in backend folder -> mvn spring-boot:run
Swagger: http://localhost:8080/swagger-ui/index.html
Frontend: open SECOND PowerShell in frontend folder -> npm install -> npm run dev
Frontend: http://localhost:5173
Uses PostgreSQL database pets.
Features: pet profiles, photos, breed, health records, shelters, adoption applications, background-check status, REST API, Swagger/OpenAPI, Postman-ready.

--- ADDED FEATURES ---
JWT: login/register return a signed token (24h). The React app sends it as "Authorization: Bearer <token>".
  Public: browse pets, donate, report a pet, auth endpoints. Everything else needs a valid token.
  Admin-only (role SHELTER_ADMIN): update application status, view/update rescue reports.
Donation emails: after a verified Razorpay payment a receipt is emailed to the donor (CC: rescue team).
Report Pet: red "Report Pet" button (navbar, and on the sign-in page) -> POST /api/reports -> emergency email
  . Admins see all reports under "Rescue Reports" and can set status.
Email settings live in backend/src/main/resources/application.properties
  (override with env vars MAIL_USERNAME, MAIL_PASSWORD, JWT_SECRET).
IMPORTANT: restart the backend (mvn spring-boot:run) so the new code is compiled - do not run the old target/*.jar.

--- UI REDESIGN (separate User and Admin interfaces) ---
Frontend is now split into components (frontend/src):
  App.jsx            session + role gate (admins -> /admin, adopters -> user app)
  layouts/UserLayout.jsx    adopter interface (light sidebar)
  layouts/AdminLayout.jsx   admin console (dark sidebar, "Admin" tag) - lazy loaded, adopters never download it
  pages/user/*       Dashboard, Discover, Favorites, My Applications, Messages, Profile
  pages/admin/*      Overview, Pets, Applications, Users, Rescue Reports, Donations, Messages, Settings
  pages/Auth.jsx     split-screen sign in / register
  style.css          design system (cream / forest green / teal / orange, dark mode)
No new npm packages were added: run "npm install" then "npm run dev" as before.

Backend security changes made to support the separation:
  - GET /api/users is admin-only; passwords are never returned in any JSON response.
  - Registration always creates an ADOPTER (clients can no longer choose the role).
  - GET /api/applications returns only the caller's own applications unless the caller is an admin.
Still to do (not changed): hash passwords (BCrypt), stop login auto-creating accounts,
move DB/mail secrets out of application.properties, restrict CORS, add PUT/DELETE /api/pets.

--- UPDATE: pet edit/delete ---
  PUT    /api/pets/{id}   admin: any pet, adopter: only pets they listed
  DELETE /api/pets/{id}   same rule
Pet.ownerId records who listed a pet. Pet booleans are now nullable so old database rows can't break GET /api/pets.

--- UPDATE: status emails ---
  Admin changes a rescue report status  -> email to the reporter (ReportedPet.reporterEmail, collected on the Report form)
  Admin changes an application decision / background check -> email to the applicant (AdoptionApplication.email)
  A new report also sends the reporter a "we received your report" email. Missing emails are skipped, not errors.
  Uses the existing Gmail SMTP settings in application.properties.

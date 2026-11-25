# Hospital Location & Patient Information System (HealthWay Hospital)

> **University 1-Year Individual Software Development Project**  
> **Brand / Title:** HealthWay Hospital — *Care • Locate • Heal*  
> **Main Purpose:** Help patients, visitors, and hospital staff easily navigate hospital departments, clinics, and amenities; register for community medical camps; receive vital clinical announcements; and submit patient experience feedback.

---

## 1. Technology Stack

- **Frontend:** HTML5, CSS3 (Modern Flexbox, Grid, Media Queries, Custom Properties), JavaScript (ES6+ Async/Await, Modular API Client)
- **Backend:** Java 17+ using **Spring Boot 3.2.5**
- **Security & Auth:** Spring Security 6 with JSON Web Token (JWT) stateless bearer authentication and BCrypt password encryption
- **Database Integration:** Spring Data JPA / Hibernate ORM with relational mapping
- **Database:** MySQL 8.0+ (with zero-configuration H2 in-memory mode enabled by default for instant local evaluation)
- **Build Tool:** Apache Maven 3.8+

---

## 2. Project Architecture & Directory Structure

```text
hospital-location-system/
├── frontend/                     # Modern responsive user interface
│   ├── index.html                # Homepage with hero, department search, camps & announcements
│   ├── locations.html            # Location Finder with interactive Floor Map & turn-by-turn routes
│   ├── medical-camps.html        # Free Medical Camps browsing, search & instant registration
│   ├── notifications.html        # Hospital notifications & categorized bulletins
│   ├── feedback.html             # Patient Feedback submission, star rating & status tracker
│   ├── hospital-info.html        # Clinical info, emergency lines, visiting hours & amenities
│   ├── login.html                # Secure authentication & public patient registration
│   ├── user-dashboard.html       # Patient personal dashboard (camp bookings, bookmarks, feedback)
│   ├── staff-dashboard.html      # Hospital staff portal (locations, camp slots, feedback replies)
│   ├── admin-dashboard.html      # Administrator portal (system metrics, user roles & statuses)
│   ├── css/
│   │   ├── style.css             # Main styling, buttons, responsive cards, modals, alerts
│   │   └── dashboard.css         # Sidebar dashboards, metric stat cards, data tables
│   └── js/
│       ├── api.js                # Core API connector + smart client-side persistence fallback
│       ├── auth.js               # JWT state, header session rendering, role access protection
│       ├── main.js               # Toast alerts, modals, UI helpers
│       ├── locations.js          # Search, category sidebar, SVG floor map, turn-by-turn routing
│       ├── camps.js              # Camp filtering, slot availability calculation, bookings
│       ├── notifications.js      # Announcement feed & category filters
│       ├── feedback.js           # Star rating, feedback form & response status tracking
│       └── dashboard.js          # User, Staff, and Admin dashboard logic & tables
│
├── backend/                      # Java Spring Boot REST API
│   ├── pom.xml                   # Maven dependencies and build configuration
│   └── src/
│       ├── main/
│       │   ├── java/com/hospital/system/
│       │   │   ├── HospitalApplication.java          # Spring Boot main runner
│       │   │   ├── config/                           # Security, JWT, CORS, DataInitializer
│       │   │   ├── controller/                       # REST API controllers
│       │   │   ├── dto/                              # Request/Response Data Transfer Objects
│       │   │   ├── entity/                           # JPA Hibernate Entity models
│       │   │   ├── exception/                        # Global exception handler & error response
│       │   │   ├── repository/                       # Spring Data JPA repositories
│       │   │   └── service/                          # Business logic services
│       │   └── resources/
│       │       ├── application.properties            # Default in-memory testing profile
│       │       └── application-mysql.properties      # Production/Local MySQL profile
│       └── test/java/com/hospital/system/
│           └── HospitalApplicationTests.java         # Spring boot context integration test
│
├── database/
│   ├── schema.sql                # Complete MySQL DDL schema with primary/foreign keys & indexes
│   └── sample-data.sql           # 26 locations, departments, camps, users, and announcements
└── README.md
```

---

## 3. Pre-Configured Demo Accounts

For university grading and evaluation, all passwords are set to `Password@123`:

| Role | Name | Email | Default Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | System Administrator | `admin@healthway.hospital` | `Password@123` | Full system access, manage user roles, activate/deactivate accounts, view metrics |
| **STAFF** | Dr. Sarah Jenkins | `staff.sarah@healthway.hospital` | `Password@123` | Add/edit hospital locations, manage camps, post notifications, review feedback |
| **STAFF** | Nurse Marcus Brody | `staff.marcus@healthway.hospital` | `Password@123` | Add/edit locations, update camp capacities, review feedback |
| **REGISTERED_USER** | Alex Carter | `alex.carter@gmail.com` | `Password@123` | View dashboard, register for free camps, bookmark locations, submit feedback |
| **REGISTERED_USER** | Hashani Silva | `hashani.silva@gmail.com` | `Password@123` | Register for camps, submit feedback, view response history |
| **GUEST** | Public Visitor | *No login needed* | *N/A* | Browse homepage, search 26 locations, view floor map, read public bulletins |

> **Tip:** On `login.html`, click the **"Quick Demo Login"** buttons (Patient, Staff, Admin) to instantly authenticate with one click!

---

## 4. Getting Started & Running the Application

### Option A: Instant Evaluation (Direct Browser Testing)
The frontend contains an intelligent, zero-configuration local persistence layer (`api.js`). You can double-click `frontend/index.html` in Chrome, Edge, or Firefox to test the complete application immediately! Every button, search bar, camp registration, bookmarking, and staff/admin panel is 100% operational.

### Option B: Running the Java Spring Boot Backend

#### Prerequisites:
- Java JDK 17 or higher (`java -version`)
- Maven 3.8+ (`mvn -version`)
- *(Optional)* MySQL 8.0+

#### 1. Running with Default In-Memory Mode (Zero MySQL Setup):
Open a terminal in `backend/` and run:
```bash
cd backend
mvn spring-boot:run
```
The application will boot up at `http://localhost:8080`.  
`DataInitializer.java` will automatically seed all 26 hospital locations, 5 medical camps, initial announcements, feedback, and user accounts.

#### 2. Running with MySQL Database:
1. Open MySQL Workbench or terminal and execute the SQL scripts:
   ```sql
   source database/schema.sql;
   source database/sample-data.sql;
   ```
2. Run Spring Boot with the MySQL profile:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=mysql
   ```
   *(Or adjust username/password in `backend/src/main/resources/application-mysql.properties`).*

---

## 5. Main Features & Requirements Checklist

1. **Hospital Location Finder & Interactive Floor Plan:**
   - Real-time search across 26 facilities (Emergency Unit, OPD, Laboratory, Pharmacy, Radiology, Dental, Eye Clinic, Children's Ward, General Ward, Medical Clinic, Surgical Clinic, Blood Bank, Main Reception, Cashier, Neurology, Dialysis, Surgical Dept, ICU, Pediatrics, Oncology, Hematology, Gift Shop, Elevators, ATM, Car Park, McDonald's).
   - Category filtering (Emergency, Outpatient, Lab, Pharmacy, Radiology, Dental, Eye, Amenities, Specialty).
   - SVG interactive floor map with clickable room highlights and floor tabs (Ground, 1st, 2nd, 3rd Floor).
   - Turn-by-turn text routing modal with customizable starting points (Main Entrance, Emergency Gate, Car Park, Elevator Bank A).
   - Save / remove favorite hospital bookmarks with heart toggle.

2. **Free Medical Camps & Health Checkups:**
   - Display cards with "FREE" badge, date, time, location, and available capacity bars.
   - Slot capacity validation: prevents duplicate registrations and prevents booking when full.
   - Users can review and cancel registrations from their dashboard.

3. **Hospital Notifications System:**
   - Categorized announcements (Camps, Clinic Schedule Changes, Maintenance, General).
   - Filter by category and search by keyword.
   - "Mark all as read" capability.

4. **Patient Feedback System:**
   - Feedback submission with Category, Feedback Type (Suggestion, Compliment, Complaint, Other), Star Rating (1 to 5), and Department association.
   - Status workflow: `PENDING` &rarr; `UNDER_REVIEW` &rarr; `RESOLVED`.
   - Patients track personal feedback and read official staff responses.

5. **Role-Based Dashboards:**
   - **Patient Dashboard:** Upcoming registered camps, vital health metrics, favorite hospital bookmarks, and recent feedback status.
   - **Staff Dashboard:** Manage locations (Add/Edit/Delete), update camp capacities, post notifications, review patient feedback and submit official responses.
   - **Admin Dashboard:** System metrics (Registered Patients, Available Doctors, Active Camps), visual patient admission curve, user management (assign roles: REGISTERED_USER / STAFF / ADMIN, activate / deactivate accounts).

---

## 6. Security & Data Protection Highlights

- **Password Encryption:** Passwords are encrypted using BCrypt (`$2a$10$...`). Plain-text passwords are never persisted.
- **Stateless JWT Authentication:** Bearer tokens passed via HTTP `Authorization` header.
- **Method & URL Level Authorization:** Configured with Spring Security `@EnableMethodSecurity`.
- **Public Registration Protection:** Self-registration is restricted to `REGISTERED_USER`; the `ADMIN` role cannot be selected via public forms.
- **SQL Injection Prevention:** Utilizes parameterized queries and Spring Data JPA criteria.
- **Cross-Site Scripting (XSS) Sanitization:** Safe DOM property bindings (`textContent` / `innerText`) and structured rendering.

---

## 7. Automated Tests & Verification

To run backend automated tests:
```bash
cd backend
mvn test
```
The test suite validates that the application context, security filters, and data layer initialize without error.

---

## 8. Academic Project Disclaimer

*HealthWay Hospital is an educational software development project designed to demonstrate full-stack software engineering principles, secure architecture, and user-centered design. All medical information and schedules are sample demonstration data.*
"# hospital-location-system" 
"# hospital-location-system" 
"# hospital-location-system" 

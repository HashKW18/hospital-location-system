package com.hospital.system.config;

import com.hospital.system.entity.*;
import com.hospital.system.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final LocationRepository locationRepository;
    private final MedicalCampRepository campRepository;
    private final CampRegistrationRepository registrationRepository;
    private final NotificationRepository notificationRepository;
    private final FeedbackRepository feedbackRepository;
    private final FavoriteLocationRepository favoriteLocationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           DepartmentRepository departmentRepository,
                           LocationRepository locationRepository,
                           MedicalCampRepository campRepository,
                           CampRegistrationRepository registrationRepository,
                           NotificationRepository notificationRepository,
                           FeedbackRepository feedbackRepository,
                           FavoriteLocationRepository favoriteLocationRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.locationRepository = locationRepository;
        this.campRepository = campRepository;
        this.registrationRepository = registrationRepository;
        this.notificationRepository = notificationRepository;
        this.feedbackRepository = feedbackRepository;
        this.favoriteLocationRepository = favoriteLocationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Already initialized
        }

        // 1. Initialize Users
        String encodedPass = passwordEncoder.encode("Password@123");

        User admin = new User("System Administrator", "admin@healthway.hospital", "+94 11 123 4567", encodedPass, Role.ADMIN);
        User staffSarah = new User("Dr. Sarah Jenkins", "staff.sarah@healthway.hospital", "+94 77 234 5678", encodedPass, Role.STAFF);
        User staffMarcus = new User("Nurse Marcus Brody", "staff.marcus@healthway.hospital", "+94 71 345 6789", encodedPass, Role.STAFF);
        User patientAlex = new User("Alex Carter", "alex.carter@gmail.com", "+94 76 987 6543", encodedPass, Role.REGISTERED_USER);
        User patientHashani = new User("Hashani Silva", "hashani.silva@gmail.com", "+94 78 456 1234", encodedPass, Role.REGISTERED_USER);

        userRepository.saveAll(Arrays.asList(admin, staffSarah, staffMarcus, patientAlex, patientHashani));

        // 2. Initialize Departments
        Department depEmergency = new Department("Emergency & Trauma", "24/7 rapid critical care and trauma triage services");
        Department depOpd = new Department("Outpatient Department", "Consultation clinics across multi-specialty medical fields");
        Department depLab = new Department("Diagnostic & Laboratory", "Pathology, hematology, and biochemistry testing");
        Department depRad = new Department("Radiology & Imaging", "X-Ray, CT Scan, MRI, and Ultrasound imaging units");
        Department depCardio = new Department("Cardiology", "Cardiovascular diagnostics, therapy, and coronary care");
        Department depPeds = new Department("Pediatrics & Neonatal", "Specialized healthcare and emergency services for children");
        Department depNeuro = new Department("Neurology & Neurosurgery", "Brain, spine, and nervous system disorder management");
        Department depOnco = new Department("Oncology", "Cancer diagnosis, radiation therapy, and chemotherapy unit");
        Department depNephro = new Department("Nephrology & Dialysis", "Kidney disease management and modern hemodialysis unit");
        Department depSurg = new Department("General Surgery", "Pre-operative and post-operative surgical theaters and wards");
        Department depDental = new Department("Dental Care", "Restorative, surgical, and cosmetic dental treatments");
        Department depEye = new Department("Ophthalmology", "Vision testing, cataract surgery, and eye treatment");
        Department depAmenities = new Department("Hospital Amenities", "Visitor services, food courts, ATMs, pharmacy, and parking");

        List<Department> savedDeps = departmentRepository.saveAll(Arrays.asList(
                depEmergency, depOpd, depLab, depRad, depCardio, depPeds, depNeuro,
                depOnco, depNephro, depSurg, depDental, depEye, depAmenities
        ));

        // Helper to find saved department by name
        Map<String, Department> dMap = new HashMap<>();
        for (Department d : savedDeps) {
            dMap.put(d.getDepartmentName(), d);
        }

        // 3. Initialize Locations (26 total locations)
        List<Location> locs = new ArrayList<>();

        locs.add(createLocation(dMap.get("Emergency & Trauma"), "Emergency Unit", "Emergency", "Main Building (Block A)", "Ground Floor", "ER-01",
                "Immediate emergency triage, resuscitation, and 24/7 acute trauma care.",
                "Enter via the dedicated Emergency Ambulance ramp on HealthWay Blvd. Follow red floor lines straight to ER reception.", "24 Hours"));

        locs.add(createLocation(dMap.get("Outpatient Department"), "Outpatient Department (OPD)", "Outpatient", "Main Building (Block A)", "1st Floor", "OPD-101",
                "General consultations, follow-up clinics, and specialist token booths.",
                "From Main Reception, take Central Elevator A to 1st Floor. Turn right; follow the green overhead signs.", "8:00 AM - 5:00 PM"));

        locs.add(createLocation(dMap.get("Diagnostic & Laboratory"), "Laboratory", "Laboratory", "Science Wing (Block B)", "1st Floor", "LAB-105",
                "Clinical blood tests, urine analysis, microbiology, and rapid pathology reports.",
                "Cross the connecting skybridge from Main Building Floor 1 to Block B. Laboratory reception is on the left.", "8:00 AM - 6:00 PM"));

        locs.add(createLocation(dMap.get("Hospital Amenities"), "Pharmacy", "Pharmacy", "Main Building (Block A)", "Ground Floor", "PH-01",
                "Prescription medication dispensary, medical sundries, and OTC medicines.",
                "Located next to the Main Hospital Lobby on the ground floor, directly opposite the Cashier counter.", "24 Hours"));

        locs.add(createLocation(dMap.get("Radiology & Imaging"), "Radiology Department", "Radiology", "Main Building (Block A)", "2nd Floor", "RAD-204",
                "Digital X-rays, 128-slice CT scans, 3T MRI, and high-res Ultrasound imaging.",
                "Take Elevator B to the 2nd floor, turn left past Cardiology, and proceed to the Radiology waiting hall.", "24 Hours"));

        locs.add(createLocation(dMap.get("Dental Care"), "Dental Clinic", "Clinic", "Dental Wing (Block C)", "1st Floor", "DNT-102",
                "Routine checkups, scaling, pediatric dental, and orthodontic surgery.",
                "Enter Block C entrance, take stairs or lift to Floor 1. Dental clinic is immediately opposite the elevator.", "8:30 AM - 5:00 PM"));

        locs.add(createLocation(dMap.get("Ophthalmology"), "Eye Clinic", "Clinic", "Dental & Eye Wing (Block C)", "2nd Floor", "EYE-201",
                "Visual acuity checks, glaucoma screening, retinal imaging, and refraction.",
                "Take Elevator C to 2nd Floor. Proceed straight down the well-lit corridor toward Room EYE-201.", "8:30 AM - 4:30 PM"));

        locs.add(createLocation(dMap.get("Pediatrics & Neonatal"), "Children's Ward", "Ward", "Women & Child Wing (Block D)", "2nd Floor", "W-D201",
                "Inpatient care for pediatric patients with play area and family-friendly rooms.",
                "Use the West Garden entrance to Block D. Take Elevator D to 2nd Floor; follow pediatric cartoon wall art.", "Visiting: 10 AM-12 PM & 4 PM-7 PM"));

        locs.add(createLocation(dMap.get("General Surgery"), "General Ward", "Ward", "Inpatient Tower (Block E)", "3rd Floor", "W-E301",
                "Comfortable general inpatient accommodation with dedicated nursing stations.",
                "Take East Wing Elevators to the 3rd floor. Register at Ward Nurses Station 3.", "Visiting: 11 AM-1 PM & 5 PM-7 PM"));

        locs.add(createLocation(dMap.get("Outpatient Department"), "Medical Clinic", "Clinic", "Main Building (Block A)", "1st Floor", "MC-108",
                "Internal medicine specialists for hypertension, diabetes, and chronic illness care.",
                "Head to OPD on Floor 1, turn into Hallway B, Clinic Room 108.", "9:00 AM - 4:00 PM"));

        locs.add(createLocation(dMap.get("General Surgery"), "Surgical Clinic", "Clinic", "Surgical Pavilion (Block F)", "1st Floor", "SC-102",
                "Pre-surgery evaluations, wound dressing clinics, and post-op reviews.",
                "Follow blue arrows from Main Atrium through ground corridor to Block F, Floor 1.", "8:00 AM - 3:00 PM"));

        locs.add(createLocation(dMap.get("Diagnostic & Laboratory"), "Blood Bank", "Laboratory", "Science Wing (Block B)", "Ground Floor", "BB-02",
                "Safe blood storage, voluntary donor lounge, and compatibility cross-matching.",
                "Enter Block B via side courtyard; Blood Bank donor lounge is on the ground floor next to specimen receiving.", "8:00 AM - 8:00 PM"));

        locs.add(createLocation(dMap.get("Hospital Amenities"), "Main Reception", "Service", "Main Building (Block A)", "Ground Floor", "LOBBY-01",
                "Central information desk, admission processing, wheelchair assistance, and guidance.",
                "Directly inside the main entrance revolving doors beneath the central hospital glass canopy.", "24 Hours"));

        locs.add(createLocation(dMap.get("Hospital Amenities"), "Cashier", "Service", "Main Building (Block A)", "Ground Floor", "CSH-01",
                "Payment settlement, insurance pre-authorization, and deposit processing.",
                "Ground floor lobby, directly across from the Central Pharmacy counter.", "24 Hours"));

        locs.add(createLocation(dMap.get("Neurology & Neurosurgery"), "Neurology", "Specialty", "Specialist Wing (Block G)", "3rd Floor", "NEU-301",
                "Consultation rooms for stroke, epilepsy, and neurological rehabilitation.",
                "Take Elevator G to 3rd Floor, turn right toward the Neuro Diagnostics wing.", "8:30 AM - 4:00 PM"));

        locs.add(createLocation(dMap.get("Nephrology & Dialysis"), "Dialysis", "Specialty", "Renal Care Center (Block H)", "1st Floor", "DIA-101",
                "Modern hemodialysis and peritoneal dialysis stations with dedicated nephrologists.",
                "Access Block H through rear entrance or take connector bridge from Block A, Floor 1.", "6:00 AM - 10:00 PM"));

        locs.add(createLocation(dMap.get("General Surgery"), "Surgical Department", "Surgery", "Surgical Pavilion (Block F)", "2nd Floor", "OT-200",
                "Modular operating theaters with HEPA airflow and advanced surgical equipment.",
                "Authorized access only. From Elevator F to Floor 2, check in at Surgical Reception Desk.", "24 Hours"));

        locs.add(createLocation(dMap.get("Cardiology"), "Intensive Care Unit", "Critical Care", "Main Building (Block A)", "3rd Floor", "ICU-300",
                "Advanced life-support monitoring and critical post-operative recovery care.",
                "Take Medical Priority Elevator B to 3rd Floor. Strict intercom access at ICU double doors.", "Visiting: 4 PM - 5 PM"));

        locs.add(createLocation(dMap.get("Pediatrics & Neonatal"), "Pediatrics", "Pediatrics", "Women & Child Wing (Block D)", "1st Floor", "PED-101",
                "Outpatient consultations with pediatrician specialists and routine immunizations.",
                "Enter Block D, take ramp or elevator to Floor 1. Play area is adjacent to waiting room.", "8:00 AM - 6:00 PM"));

        locs.add(createLocation(dMap.get("Oncology"), "Oncology", "Oncology", "Hope Center (Block J)", "Ground Floor", "ONC-01",
                "Chemotherapy day ward, cancer counseling, and oncology outpatient clinic.",
                "Direct ramp access from South Car Park into Block J Ground Floor.", "8:00 AM - 5:00 PM"));

        locs.add(createLocation(dMap.get("Diagnostic & Laboratory"), "Hematology", "Laboratory", "Science Wing (Block B)", "2nd Floor", "HEM-201",
                "Diagnosis and treatment of blood disorders, anemia, and clotting conditions.",
                "Block B, 2nd Floor, past Clinical Chemistry. Signboard marked HEMATOLOGY.", "8:30 AM - 4:30 PM"));

        locs.add(createLocation(dMap.get("Hospital Amenities"), "Gift shop (flowers and Gifts)", "Amenities", "Main Building (Block A)", "Ground Floor", "GFT-01",
                "Fresh flowers, get-well greeting cards, healthy snacks, toiletries, and gifts.",
                "Located inside the Main Atrium corridor next to the South Courtyard entrance.", "8:00 AM - 9:00 PM"));

        locs.add(createLocation(dMap.get("Hospital Amenities"), "Elevators", "Facility", "Main Building (Block A)", "Ground Floor", "ELEV-01",
                "High-speed public and patient transport elevators connecting all floors.",
                "Located in the Central Atrium beside Main Reception and Information Desk.", "24 Hours"));

        locs.add(createLocation(dMap.get("Hospital Amenities"), "ATM", "Amenities", "Main Building (Block A)", "Ground Floor", "ATM-01",
                "24/7 multi-bank cash dispenser and digital banking terminal.",
                "Ground floor, adjacent to Cashier Counter and Main Pharmacy exit.", "24 Hours"));

        locs.add(createLocation(dMap.get("Hospital Amenities"), "Car park entrance", "Facility", "Hospital Grounds", "Ground Floor", "CP-MAIN",
                "Multi-level covered visitor parking with 500+ bays and disability parking.",
                "Follow outer ring road signage marked 'P - Visitor Parking Entrance'.", "24 Hours"));

        locs.add(createLocation(dMap.get("Hospital Amenities"), "McDonalds", "Amenities", "Hospital Plaza (Block P)", "Ground Floor", "MCD-01",
                "Family dining, fresh coffee, McCafe beverages, and healthy breakfast selections.",
                "Directly situated in the outdoor landscaped Hospital Plaza next to Block A West Wing.", "6:30 AM - 11:00 PM"));

        List<Location> savedLocs = locationRepository.saveAll(locs);

        // 4. Initialize Medical Camps
        MedicalCamp camp1 = new MedicalCamp();
        camp1.setCampName("Free General Health Checkup");
        camp1.setDescription("Comprehensive wellness screening including BMI check, random blood glucose, blood pressure, and free general physician consultation.");
        camp1.setCategory("General Health");
        camp1.setCampDate(LocalDate.now().plusDays(10));
        camp1.setStartTime(LocalTime.of(8, 0));
        camp1.setEndTime(LocalTime.of(13, 0));
        camp1.setLocation(savedLocs.get(12)); // Main Reception / Lobby
        camp1.setRegistrationDeadline(LocalDate.now().plusDays(9));
        camp1.setCapacity(150);
        camp1.setIsFree(true);
        camp1.setStatus(CampStatus.UPCOMING);

        MedicalCamp camp2 = new MedicalCamp();
        camp2.setCampName("Free Dental & Oral Health Camp");
        camp2.setDescription("Preventive dental examination, oral cancer screening, ultrasonic scaling advice, and complimentary oral hygiene kits.");
        camp2.setCategory("Dental Checkup");
        camp2.setCampDate(LocalDate.now().plusDays(14));
        camp2.setStartTime(LocalTime.of(9, 0));
        camp2.setEndTime(LocalTime.of(14, 0));
        camp2.setLocation(savedLocs.get(5)); // Dental Clinic
        camp2.setRegistrationDeadline(LocalDate.now().plusDays(13));
        camp2.setCapacity(80);
        camp2.setIsFree(true);
        camp2.setStatus(CampStatus.UPCOMING);

        MedicalCamp camp3 = new MedicalCamp();
        camp3.setCampName("Free Blood Donation Camp");
        camp3.setDescription("Community life-saver blood drive in association with the National Blood Bank. Donors receive refreshments, blood group card, and certificate.");
        camp3.setCategory("Blood Donation");
        camp3.setCampDate(LocalDate.now().plusDays(20));
        camp3.setStartTime(LocalTime.of(8, 0));
        camp3.setEndTime(LocalTime.of(16, 0));
        camp3.setLocation(savedLocs.get(11)); // Blood Bank
        camp3.setRegistrationDeadline(LocalDate.now().plusDays(19));
        camp3.setCapacity(200);
        camp3.setIsFree(true);
        camp3.setStatus(CampStatus.UPCOMING);

        MedicalCamp camp4 = new MedicalCamp();
        camp4.setCampName("Free Eye & Vision Screening");
        camp4.setDescription("Digital visual acuity test, refractive error testing, cataract check, and free reading glasses distribution for eligible seniors.");
        camp4.setCategory("Eye Checkup");
        camp4.setCampDate(LocalDate.now().plusDays(25));
        camp4.setStartTime(LocalTime.of(9, 0));
        camp4.setEndTime(LocalTime.of(15, 0));
        camp4.setLocation(savedLocs.get(6)); // Eye Clinic
        camp4.setRegistrationDeadline(LocalDate.now().plusDays(24));
        camp4.setCapacity(100);
        camp4.setIsFree(true);
        camp4.setStatus(CampStatus.UPCOMING);

        MedicalCamp camp5 = new MedicalCamp();
        camp5.setCampName("Pediatric Health & Wellness Camp");
        camp5.setDescription("Growth milestone assessment, childhood nutrition advice, pediatric vision/hearing screening, and pediatrician review.");
        camp5.setCategory("Vaccination & Pediatric");
        camp5.setCampDate(LocalDate.now().plusDays(30));
        camp5.setStartTime(LocalTime.of(10, 0));
        camp5.setEndTime(LocalTime.of(14, 0));
        camp5.setLocation(savedLocs.get(7)); // Children's Ward
        camp5.setRegistrationDeadline(LocalDate.now().plusDays(29));
        camp5.setCapacity(75);
        camp5.setIsFree(true);
        camp5.setStatus(CampStatus.UPCOMING);

        List<MedicalCamp> savedCamps = campRepository.saveAll(Arrays.asList(camp1, camp2, camp3, camp4, camp5));

        // 5. Initialize Camp Registrations
        CampRegistration reg1 = new CampRegistration(patientAlex, savedCamps.get(0), "Morning checkup appointment requested");
        CampRegistration reg2 = new CampRegistration(patientAlex, savedCamps.get(2), "Regular voluntary O+ blood donor");
        CampRegistration reg3 = new CampRegistration(patientHashani, savedCamps.get(1), "First time dental checkup");

        registrationRepository.saveAll(Arrays.asList(reg1, reg2, reg3));

        // 6. Initialize Notifications
        Notification notif1 = new Notification();
        notif1.setTitle("New Medical Camp Added: Free General Health Checkup");
        notif1.setMessage("Registration is now open for our upcoming Free General Health Checkup. Book your slot today!");
        notif1.setCategory(NotificationCategory.CAMP);
        notif1.setCreatedBy(staffSarah);
        notif1.setExpiryDate(LocalDate.now().plusDays(15));
        notif1.setStatus(NotificationStatus.PUBLISHED);

        Notification notif2 = new Notification();
        notif2.setTitle("Urgent: Blood Donation Camp Coming Soon");
        notif2.setMessage("Join our community blood donation drive. Help replenish critical hospital reserves.");
        notif2.setCategory(NotificationCategory.CAMP);
        notif2.setCreatedBy(staffSarah);
        notif2.setExpiryDate(LocalDate.now().plusDays(25));
        notif2.setStatus(NotificationStatus.PUBLISHED);

        Notification notif3 = new Notification();
        notif3.setTitle("Outpatient Clinic Hours Updated");
        notif3.setMessage("Starting this month, regular clinic hours will operate from 8:00 AM to 5:00 PM on weekdays.");
        notif3.setCategory(NotificationCategory.SCHEDULE_CHANGE);
        notif3.setCreatedBy(staffMarcus);
        notif3.setExpiryDate(LocalDate.now().plusDays(60));
        notif3.setStatus(NotificationStatus.PUBLISHED);

        Notification notif4 = new Notification();
        notif4.setTitle("Central Elevators Routine Maintenance");
        notif4.setMessage("Elevator Bank B will undergo routine servicing this Saturday from 1:00 PM to 3:00 PM.");
        notif4.setCategory(NotificationCategory.SERVICE_INTERRUPTION);
        notif4.setCreatedBy(staffMarcus);
        notif4.setExpiryDate(LocalDate.now().plusDays(7));
        notif4.setStatus(NotificationStatus.PUBLISHED);

        Notification notif5 = new Notification();
        notif5.setTitle("Free Digital Health Location System Active");
        notif5.setMessage("Explore the interactive hospital floor guide to navigate all departments and facilities.");
        notif5.setCategory(NotificationCategory.ANNOUNCEMENT);
        notif5.setCreatedBy(admin);
        notif5.setExpiryDate(LocalDate.now().plusDays(90));
        notif5.setStatus(NotificationStatus.PUBLISHED);

        notificationRepository.saveAll(Arrays.asList(notif1, notif2, notif3, notif4, notif5));

        // 7. Initialize Feedback
        Feedback fb1 = new Feedback();
        fb1.setUser(patientAlex);
        fb1.setLocation(savedLocs.get(4)); // Radiology
        fb1.setCategory(FeedbackCategory.CONFUSING_DIRECTIONS);
        fb1.setFeedbackType(FeedbackType.SUGGESTION);
        fb1.setRating(4);
        fb1.setMessage("Finding the 2nd floor Radiology entrance was a bit confusing because the sign near the stairwell was partially obscured.");
        fb1.setStatus(FeedbackStatus.RESOLVED);
        fb1.setStaffResponse("Thank you for your feedback! Our facilities maintenance team has relocated the banner and installed prominent overhead directional indicators.");
        fb1.setRespondedBy(staffSarah);

        Feedback fb2 = new Feedback();
        fb2.setUser(patientHashani);
        fb2.setLocation(savedLocs.get(13)); // Cashier
        fb2.setCategory(FeedbackCategory.SCHEDULE_ISSUE);
        fb2.setFeedbackType(FeedbackType.COMPLAINT);
        fb2.setRating(3);
        fb2.setMessage("Peak queue time at Cashier counter 2 took over 20 minutes around 11:30 AM.");
        fb2.setStatus(FeedbackStatus.UNDER_REVIEW);
        fb2.setStaffResponse("We apologize for the wait. We are opening two extra rapid billing counters during peak midday hours.");
        fb2.setRespondedBy(staffMarcus);

        Feedback fb3 = new Feedback();
        fb3.setUser(patientAlex);
        fb3.setLocation(savedLocs.get(12)); // Main Reception
        fb3.setCategory(FeedbackCategory.DIFFICULTY_FINDING);
        fb3.setFeedbackType(FeedbackType.SUGGESTION);
        fb3.setRating(5);
        fb3.setMessage("The interactive floor map made finding the Dental Wing straightforward!");
        fb3.setStatus(FeedbackStatus.PENDING);

        feedbackRepository.saveAll(Arrays.asList(fb1, fb2, fb3));

        // 8. Initialize Favorites
        FavoriteLocation fav1 = new FavoriteLocation(patientAlex, savedLocs.get(0)); // Emergency
        FavoriteLocation fav2 = new FavoriteLocation(patientAlex, savedLocs.get(3)); // Pharmacy
        FavoriteLocation fav3 = new FavoriteLocation(patientAlex, savedLocs.get(4)); // Radiology
        FavoriteLocation fav4 = new FavoriteLocation(patientHashani, savedLocs.get(1)); // OPD
        FavoriteLocation fav5 = new FavoriteLocation(patientHashani, savedLocs.get(5)); // Dental Clinic

        favoriteLocationRepository.saveAll(Arrays.asList(fav1, fav2, fav3, fav4, fav5));
    }

    private Location createLocation(Department department, String name, String category, String building,
                                   String floor, String roomNumber, String description, String directions, String hours) {
        Location loc = new Location();
        loc.setDepartment(department);
        loc.setLocationName(name);
        loc.setCategory(category);
        loc.setBuilding(building);
        loc.setFloor(floor);
        loc.setRoomNumber(roomNumber);
        loc.setDescription(description);
        loc.setDirections(directions);
        loc.setOpeningHours(hours);
        loc.setStatus(LocationStatus.OPEN);
        return loc;
    }
}

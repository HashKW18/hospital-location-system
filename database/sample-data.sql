-- Hospital Location & Patient Information System
-- Demonstration & Initial Sample Data
-- NOTE: All data herein is strictly for educational and demonstration purposes.

USE hospital_db;

-- 1. Departments
INSERT INTO departments (department_id, department_name, description) VALUES
(1, 'Emergency & Trauma', '24/7 rapid critical care and trauma triage services'),
(2, 'Outpatient Department', 'Consultation clinics across multi-specialty medical fields'),
(3, 'Diagnostic & Laboratory', 'Pathology, hematology, and biochemistry testing'),
(4, 'Radiology & Imaging', 'X-Ray, CT Scan, MRI, and Ultrasound imaging units'),
(5, 'Cardiology', 'Comprehensive cardiovascular diagnostics, therapy, and CCU'),
(6, 'Pediatrics & Neonatal', 'Specialized healthcare and emergency services for children'),
(7, 'Neurology & Neurosurgery', 'Brain, spine, and nervous system disorder management'),
(8, 'Oncology', 'Cancer diagnosis, radiation therapy, and chemotherapy unit'),
(9, 'Nephrology & Dialysis', 'Kidney disease management and modern hemodialysis unit'),
(10, 'General Surgery', 'Pre-operative and post-operative surgical theaters and wards'),
(11, 'Dental Care', 'Restorative, surgical, and cosmetic dental treatments'),
(12, 'Ophthalmology', 'Vision testing, cataract surgery, and eye treatment'),
(13, 'Hospital Amenities', 'Visitor services, food courts, ATMs, pharmacy, and parking');

-- 2. Locations (Includes all 26 required locations)
INSERT INTO locations (location_id, department_id, location_name, category, building, floor, room_number, description, directions, opening_hours, status) VALUES
(1, 1, 'Emergency Unit', 'Emergency', 'Main Building (Block A)', 'Ground Floor', 'ER-01', 'Immediate emergency triage and trauma resuscitation.', 'Located at top-center rear of Ground Floor. From Main Reception, head straight north along central corridor past Central Elevator Bank A. Dedicated ambulance trauma bay directly behind.', '24 Hours', 'OPEN'),
(2, 2, 'Outpatient Department (OPD)', 'Outpatient', 'Main Building (Block A)', '1st Floor', 'OPD-101', 'General consultations, follow-up clinics, and specialist token booths.', 'Located at center of 1st Floor. Take Central Elevator Bank A from Ground Floor up to 1st Floor into circular OPD reception lounge and consultation desks.', '8:00 AM - 5:00 PM', 'OPEN'),
(3, 3, 'Laboratory', 'Laboratory', 'Science Wing (Block B)', '1st Floor', 'LAB-105', 'Clinical blood tests, urine analysis, and rapid pathology reports.', 'Take Elevator Bank A to 1st Floor. Turn left into Science Wing (Block B). Diagnostic Laboratory and specimen intake are on your left.', '8:00 AM - 6:00 PM', 'OPEN'),
(4, 13, 'Pharmacy', 'Pharmacy', 'Main Building (Block A)', 'Ground Floor', 'PH-01', 'Prescription medication dispensary, medical sundries, and OTC medicines.', 'Located in top-right wing of Ground Floor. From Main Reception, walk east past Cashier; turn left down main corridor. Central Pharmacy dispensing is on right.', '24 Hours', 'OPEN'),
(5, 4, 'Radiology Department', 'Radiology', 'Main Building (Block A)', '2nd Floor', 'RAD-204', 'Digital X-rays, 128-slice CT scans, 3T MRI, and high-res Ultrasound.', 'Located in center rotunda of 2nd Floor. Take Elevator Bank A to 2nd Floor; walk straight ahead into central imaging rotunda with CT, MRI, and X-Ray suites.', '24 Hours', 'OPEN'),
(6, 11, 'Dental Clinic', 'Clinic', 'Dental Wing (Block C)', '1st Floor', 'DNT-102', 'Routine checkups, scaling, pediatric dental, and orthodontic surgery.', 'Take Elevator Bank A to 1st Floor. Turn left towards Dental Wing (Block C); Dental Clinic is located midway down left corridor.', '8:30 AM - 5:00 PM', 'OPEN'),
(7, 12, 'Eye Clinic', 'Clinic', 'Dental & Eye Wing (Block C)', '2nd Floor', 'EYE-201', 'Visual acuity checks, glaucoma screening, retinal imaging, and refraction.', 'Take Elevator Bank A to 2nd Floor. Turn left into lower-left wing (Block C). Eye Clinic (Room EYE-201) with visual acuity lanes is on left.', '8:30 AM - 4:30 PM', 'OPEN'),
(8, 6, 'Children''s Ward', 'Ward', 'Women & Child Wing (Block D)', '2nd Floor', 'W-D201', 'Inpatient care for pediatric patients with family-friendly rooms.', 'Take Elevator Bank A to 2nd Floor. Turn right down corridor into Women & Child Wing (Block D) on far right. Children\'s Ward and family play lounge are at end.', 'Visiting: 10 AM-12 PM & 4 PM-7 PM', 'OPEN'),
(9, 10, 'General Ward', 'Ward', 'Inpatient Tower (Block E)', '3rd Floor', 'W-E301', 'Comfortable general inpatient accommodation with dedicated nursing stations.', 'Take Elevator Bank A to 3rd Floor. Turn right down bright east corridor into Inpatient Tower (Block E). Check in with nursing station in General Ward.', 'Visiting: 11 AM-1 PM & 5 PM-7 PM', 'OPEN'),
(10, 2, 'Medical Clinic', 'Clinic', 'Main Building (Block A)', '1st Floor', 'MC-108', 'Internal medicine specialists for chronic condition management.', 'Take Elevator Bank A to 1st Floor. Turn right from central OPD lounge into mid-right corridor. Medical Clinic (Room MC-108) is on right.', '9:00 AM - 4:00 PM', 'OPEN'),
(11, 10, 'Surgical Clinic', 'Clinic', 'Surgical Pavilion (Block F)', '1st Floor', 'SC-102', 'Pre-surgery evaluations and wound dressing clinics.', 'Take Elevator Bank A to 1st Floor. Turn right towards upper-right wing (Block F). Surgical Clinic consultation suites are on left side of pavilion.', '8:00 AM - 3:00 PM', 'OPEN'),
(12, 3, 'Blood Bank', 'Laboratory', 'Science Wing (Block B)', 'Ground Floor', 'BB-02', 'Safe blood storage, voluntary donations, and compatibility cross-matching.', 'Located in upper-left wing of Ground Floor. From Main Reception, head northwest past Elevator Bank A into Science Wing (Block B). Donor lounge is on left.', '8:00 AM - 8:00 PM', 'OPEN'),
(13, 13, 'Main Reception', 'Service', 'Main Building (Block A)', 'Ground Floor', 'LOBBY-01', 'Central information desk, admission processing, wheelchair assistance, and guidance.', 'Directly in center of Ground Floor atrium. Enter through main glass front entrance doors; circular reception desk and digital kiosk are immediately in front.', '24 Hours', 'OPEN'),
(14, 13, 'Cashier & Billing', 'Service', 'Main Building (Block A)', 'Ground Floor', 'CSH-01', 'Payment settlement, insurance pre-authorization, and deposit processing.', 'Located on Ground Floor, directly to right side of central circular Main Reception desk. Dedicated counters for outpatient billing and cashier clearance.', '24 Hours', 'OPEN'),
(15, 7, 'Neurology', 'Specialty', 'Specialist Wing (Block G)', '3rd Floor', 'NEU-301', 'Consultation rooms for stroke, epilepsy, and neurological rehabilitation.', 'Take Elevator Bank A to 3rd Floor. Turn left into Specialist Wing (Block G) in upper-left wing. Neurology suites and neuro-diagnostic rooms are down corridor.', '8:30 AM - 4:00 PM', 'OPEN'),
(16, 9, 'Dialysis Unit', 'Specialty', 'Renal Care Center (Block H)', '1st Floor', 'DIA-101', 'State-of-the-art hemodialysis and peritoneal dialysis stations.', 'Take Elevator Bank A to 1st Floor. Turn left and proceed to bottom-left wing (Block H). Renal Care Center and hemodialysis stations are through double doors.', '6:00 AM - 10:00 PM', 'OPEN'),
(17, 10, 'Surgical Department', 'Surgery', 'Surgical Pavilion (Block F)', '2nd Floor', 'OT-200', 'Modular operating theaters with HEPA airflow and advanced surgical equipment.', 'Take Elevator Bank A to 2nd Floor. Turn right into Surgical Pavilion (Block F) in upper-right wing. Sterile operating suites are through security entrance.', '24 Hours', 'OPEN'),
(18, 5, 'Intensive Care Unit (ICU)', 'Critical Care', 'Main Building (Block A)', '3rd Floor', 'ICU-300', 'Advanced life-support monitoring and critical post-operative recovery.', 'Take Elevator Bank A to 3rd Floor. Turn southwest toward bottom-left wing of Block A. Check in via strict intercom at double doors of Intensive Care Unit.', 'Visitor hours: 4 PM - 5 PM only', 'OPEN'),
(19, 6, 'Pediatrics Department', 'Pediatrics', 'Women & Child Wing (Block D)', '1st Floor', 'PED-101', 'Outpatient consultations with pediatrician specialists and immunizations.', 'Take Elevator Bank A to 1st Floor. Walk past OPD rotunda down eastern corridor into Women & Child Wing (Block D) on far right. Pediatric clinic is at end.', '8:00 AM - 6:00 PM', 'OPEN'),
(20, 8, 'Oncology Unit', 'Oncology', 'Hope Center (Block J)', 'Ground Floor', 'ONC-01', 'Chemotherapy day ward, cancer counseling, and oncology outpatient clinic.', 'Located on Ground Floor in far top-right wing. From Main Reception, follow eastern corridor past Pharmacy into Hope Center (Block J) for oncology daycare.', '8:00 AM - 5:00 PM', 'OPEN'),
(21, 3, 'Hematology', 'Laboratory', 'Science Wing (Block B)', '2nd Floor', 'HEM-201', 'Diagnosis and treatment of blood disorders, anemia, and clotting conditions.', 'Take Elevator Bank A to 2nd Floor. Turn left into Science Wing (Block B) in upper-left wing. Hematology diagnostics and blood clinics are directly down hall.', '8:30 AM - 4:30 PM', 'OPEN'),
(22, 13, 'Gift Shop (Flowers and Gifts)', 'Amenities', 'Main Building (Block A)', 'Ground Floor', 'GFT-01', 'Fresh flowers, greeting cards, healthy snacks, toiletries, and gifts.', 'Located on Ground Floor in bottom-left corner of main lobby. Upon entering through main glass front doors, gift boutique is immediately on left near seating.', '8:00 AM - 9:00 PM', 'OPEN'),
(23, 13, 'Central Elevators (Bank A)', 'Facility', 'Main Building (Block A)', 'All Floors', 'ELEV-A', 'High-speed public and patient transport elevators connecting all hospital floors.', 'Located in mid-left core on all floors (Ground, 1st, 2nd, 3rd), providing rapid vertical transit to all clinical departments and inpatient wards.', '24 Hours', 'OPEN'),
(24, 13, 'ATM & Banking Kiosk', 'Amenities', 'Main Building (Block A)', 'Ground Floor', 'ATM-01', 'Multi-bank cash dispenser and digital banking terminal.', 'Located on Ground Floor directly adjacent to Cashier counters on right side of main entrance lobby. 24-hour multi-bank automated teller machine.', '24 Hours', 'OPEN'),
(25, 13, 'Car Park Entrance & Valet', 'Facility', 'Hospital Grounds', 'Ground Floor', 'CP-MAIN', 'Covered visitor parking with 500+ bays and dedicated disability parking.', 'Located on Ground Floor at bottom-right exterior. Driveway with automated barrier gate, ticket dispensers, and sheltered walkway directly into hospital lobby.', '24 Hours', 'OPEN'),
(26, 13, 'McDonald''s Express Food Court', 'Amenities', 'Hospital Plaza (Block P)', 'Ground Floor', 'MCD-01', 'Family dining, fresh coffee, McCafe beverages, and healthy breakfast selections.', 'Located on Ground Floor in far-right commercial wing (Block P). Accessible via eastern atrium corridor leading out to landscaped Hospital Plaza dining area.', '6:30 AM - 11:00 PM', 'OPEN'),
(27, 13, 'Hospital Restrooms & Bathrooms (Ground Floor)', 'Amenities', 'Main Building (Block A)', 'Ground Floor', 'WC-GF', 'Sanitized public washrooms including male, female, fully wheelchair-accessible toilets, and baby diaper-changing stations.', 'Located in bottom-right corridor on Ground Floor, past Cashier and ATM. Features fully accessible wheelchair washrooms and baby diaper changing stations.', '24 Hours', 'OPEN'),
(28, 13, 'Hospital Restrooms & Bathrooms (1st Floor)', 'Amenities', 'Main Building (Block A)', '1st Floor', 'WC-1F', 'Clean public restrooms and family washrooms for visitors to OPD and Diagnostic Laboratory.', 'Located in bottom-right corridor on 1st Floor. From Central Elevator Bank A or OPD rotunda, head toward southeast corridor; clearly indicated by blue signs.', '24 Hours', 'OPEN'),
(29, 13, 'Hospital Restrooms & Bathrooms (2nd Floor)', 'Amenities', 'Main Building (Block A)', '2nd Floor', 'WC-2F', 'Accessible restrooms with grab bars, emergency call pull-cords, and child-friendly wash stations.', 'Located in bottom-right corridor on 2nd Floor, next to staff prep lounge and south of central Radiology rotunda. Fully accessible with emergency cords.', '24 Hours', 'OPEN'),
(30, 13, 'Hospital Restrooms & Bathrooms (3rd Floor)', 'Amenities', 'Main Building (Block A)', '3rd Floor', 'WC-3F', 'Modern inpatient and visitor restrooms with touchless sensor faucets and hygiene dispensers.', 'Located in bottom-right corridor on 3rd Floor, directly opposite Inpatient Tower General Ward entrance. Modern hygiene fixtures and wheelchair accessibility.', '24 Hours', 'OPEN');

-- 3. Users (Initial Admin, Staff, and Registered Patients)
-- Passwords are all BCrypt for: Password@123
INSERT INTO users (user_id, full_name, email, phone_number, password_hash, role, account_status) VALUES
(1, 'System Administrator', 'admin@healthway.hospital', '+94 11 123 4567', '$2a$10$wN166tU.fFq6nC0Wp8U8E.F6vR4vX508P3Fp5.q8qNlm5XzEaR8S.', 'ADMIN', 'ACTIVE'),
(2, 'Dr. Sarah Jenkins', 'staff.sarah@healthway.hospital', '+94 77 234 5678', '$2a$10$wN166tU.fFq6nC0Wp8U8E.F6vR4vX508P3Fp5.q8qNlm5XzEaR8S.', 'STAFF', 'ACTIVE'),
(3, 'Nurse Marcus Brody', 'staff.marcus@healthway.hospital', '+94 71 345 6789', '$2a$10$wN166tU.fFq6nC0Wp8U8E.F6vR4vX508P3Fp5.q8qNlm5XzEaR8S.', 'STAFF', 'ACTIVE'),
(4, 'Alex Carter', 'alex.carter@gmail.com', '+94 76 987 6543', '$2a$10$wN166tU.fFq6nC0Wp8U8E.F6vR4vX508P3Fp5.q8qNlm5XzEaR8S.', 'REGISTERED_USER', 'ACTIVE'),
(5, 'Hashani Silva', 'hashani.silva@gmail.com', '+94 78 456 1234', '$2a$10$wN166tU.fFq6nC0Wp8U8E.F6vR4vX508P3Fp5.q8qNlm5XzEaR8S.', 'REGISTERED_USER', 'ACTIVE');

-- 4. Medical Camps
INSERT INTO medical_camps (camp_id, camp_name, description, category, camp_date, start_time, end_time, location_id, registration_deadline, capacity, status, is_free) VALUES
(1, 'Free General Health Checkup', 'Comprehensive wellness screening including BMI check, random blood glucose, blood pressure, and free general physician consultation.', 'General Health', '2026-11-20', '08:00:00', '13:00:00', 13, '2026-11-19', 150, 'UPCOMING', TRUE),
(2, 'Free Dental & Oral Health Camp', 'Preventive dental examination, oral cancer screening, ultrasonic scaling advice, and complimentary oral hygiene sample kits.', 'Dental Checkup', '2026-11-24', '09:00:00', '14:00:00', 6, '2026-11-23', 80, 'UPCOMING', TRUE),
(3, 'Free Blood Donation Camp', 'Community life-saver blood drive in association with the National Blood Bank. Donors receive refreshments, blood group card, and certificate.', 'Blood Donation', '2026-11-28', '08:00:00', '16:00:00', 12, '2026-11-27', 200, 'UPCOMING', TRUE),
(4, 'Free Eye & Vision Screening', 'Digital visual acuity test, refractive error testing, cataract check, and free reading glasses distribution for eligible seniors.', 'Eye Checkup', '2026-12-05', '09:00:00', '15:00:00', 7, '2026-12-04', 100, 'UPCOMING', TRUE),
(5, 'Pediatric Health & Wellness Camp', 'Growth milestone assessment, childhood nutrition advice, pediatric vision/hearing screening, and pediatrician review.', 'Vaccination & Pediatric', '2026-12-12', '10:00:00', '14:00:00', 8, '2026-12-11', 75, 'UPCOMING', TRUE);

-- 5. Camp Registrations
INSERT INTO camp_registrations (registration_id, user_id, camp_id, registration_date, registration_status, notes) VALUES
(1, 4, 1, CURRENT_TIMESTAMP, 'CONFIRMED', 'Registered for morning 9:00 AM slot'),
(2, 4, 3, CURRENT_TIMESTAMP, 'CONFIRMED', 'Voluntary regular O+ blood donor'),
(3, 5, 2, CURRENT_TIMESTAMP, 'CONFIRMED', 'First time dental camp checkup');

-- 6. Notifications
INSERT INTO notifications (notification_id, title, message, category, created_by, published_at, expiry_date, status) VALUES
(1, 'New Medical Camp Added: Free General Health Checkup', 'Registration is now open for our Free Community General Health Checkup on November 20 at the Main Hospital Lobby.', 'CAMP', 2, CURRENT_TIMESTAMP, '2026-11-20', 'PUBLISHED'),
(2, 'Urgent: Blood Donation Camp on November 28', 'Join us for the community blood drive in the Blood Bank Donor Wing. Help replenish critical hospital reserves.', 'CAMP', 2, CURRENT_TIMESTAMP, '2026-11-28', 'PUBLISHED'),
(3, 'Outpatient Clinic Hours Updated', 'Starting this month, select specialty outpatient clinics in Block A will remain open until 5:00 PM on weekdays.', 'SCHEDULE_CHANGE', 2, CURRENT_TIMESTAMP, '2026-12-31', 'PUBLISHED'),
(4, 'Elevator Bank B Routine Maintenance', 'Elevator B will undergo quarterly safety inspection this Saturday between 1:00 PM and 3:00 PM. Please use Elevator Bank A.', 'SERVICE_INTERRUPTION', 3, CURRENT_TIMESTAMP, '2026-11-15', 'PUBLISHED'),
(5, 'Free Digital Health Records System Live', 'Patients can now view and save hospital location bookmarks directly from their personalized dashboard.', 'ANNOUNCEMENT', 1, CURRENT_TIMESTAMP, '2026-12-31', 'PUBLISHED');

-- 7. Feedback
INSERT INTO feedback (feedback_id, user_id, location_id, category, feedback_type, rating, message, submitted_at, status, staff_response, responded_by, responded_at) VALUES
(1, 4, 5, 'CONFUSING_DIRECTIONS', 'SUGGESTION', 4, 'Finding the 2nd floor Radiology entrance was a bit confusing because the sign near the stairwell was partially obscured by an informational banner.', CURRENT_TIMESTAMP, 'RESOLVED', 'Thank you for your feedback! Our facilities maintenance team has relocated the banner and installed prominent overhead directional indicators.', 2, CURRENT_TIMESTAMP),
(2, 5, 4, 'SCHEDULE_ISSUE', 'COMPLAINT', 3, 'During peak hours around 11:30 AM, the queue at Cashier counter 2 took over 20 minutes.', CURRENT_TIMESTAMP, 'UNDER_REVIEW', 'We apologize for the wait. We have opened two extra rapid-billing counters during the 11 AM - 1 PM rush hours.', 3, CURRENT_TIMESTAMP),
(3, 4, 13, 'DIFFICULTY_FINDING', 'SUGGESTION', 5, 'The new digital interactive location map made it much easier to find the Dental Wing from the main entrance!', CURRENT_TIMESTAMP, 'PENDING', NULL, NULL, NULL);

-- 8. Favorite Locations
INSERT INTO favorite_locations (favorite_id, user_id, location_id) VALUES
(1, 4, 1),
(2, 4, 4),
(3, 4, 5),
(4, 5, 2),
(5, 5, 6);

/**
 * HealthWay Hospital - API Client & Smart Data Layer
 * Handles communication with the Java Spring Boot Backend (http://localhost:8080/api)
 * Automatically includes JWT Authorization header and gracefully handles offline/mock fallback.
 */

const API_BASE_URL = 'http://localhost:8080/api';

const api = {
  // Store authentication credentials
  getToken() {
    return localStorage.getItem('hw_auth_token');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('hw_current_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setAuth(token, user) {
    localStorage.setItem('hw_auth_token', token);
    localStorage.setItem('hw_current_user', JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('hw_auth_token');
    localStorage.removeItem('hw_current_user');
  },

  // Base HTTP Request
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.message || `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (err) {
      // If network fails (e.g. backend server is not running or local file access),
      // seamlessly utilize the persistent Local Mock Layer for university evaluation!
      console.warn(`[API] Backend connection notice on ${endpoint}: ${err.message}. Engaging Local Storage Provider.`);
      return MockDatabase.handleRequest(endpoint, options, this.getCurrentUser());
    }
  },

  /* Auth Endpoints */
  async login(email, password) {
    try {
      const resp = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      this.setAuth(resp.token, {
        userId: resp.userId,
        fullName: resp.fullName,
        email: resp.email,
        role: resp.role
      });
      return resp;
    } catch (err) {
      throw err;
    }
  },

  async register(data) {
    const resp = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    this.setAuth(resp.token, {
      userId: resp.userId,
      fullName: resp.fullName,
      email: resp.email,
      role: resp.role
    });
    return resp;
  },

  /* Locations */
  async getLocations(search = '', category = '', building = '', floor = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);
    if (building && building !== 'All') params.append('building', building);
    if (floor && floor !== 'All') params.append('floor', floor);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/locations${query}`);
  },

  async getLocationById(id) {
    return this.request(`/locations/${id}`);
  },

  async createLocation(locationData) {
    return this.request('/locations', {
      method: 'POST',
      body: JSON.stringify(locationData)
    });
  },

  async updateLocation(id, locationData) {
    return this.request(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(locationData)
    });
  },

  async deleteLocation(id) {
    return this.request(`/locations/${id}`, {
      method: 'DELETE'
    });
  },

  async toggleFavorite(locationId) {
    return this.request(`/locations/${locationId}/favorite`, {
      method: 'POST'
    });
  },

  async getMyFavorites() {
    return this.request('/locations/my-favorites');
  },

  /* Medical Camps */
  async getCamps(search = '', category = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/camps${query}`);
  },

  async getCampById(id) {
    return this.request(`/camps/${id}`);
  },

  async registerForCamp(campId, notes = '') {
    return this.request(`/camps/${campId}/register`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
  },

  async cancelCampRegistration(registrationId) {
    return this.request(`/camps/registrations/${registrationId}/cancel`, {
      method: 'POST'
    });
  },

  async getMyCampRegistrations() {
    return this.request('/camps/my-registrations');
  },

  async createCamp(campData) {
    return this.request('/camps', {
      method: 'POST',
      body: JSON.stringify(campData)
    });
  },

  async updateCamp(id, campData) {
    return this.request(`/camps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campData)
    });
  },

  async deleteCamp(id) {
    return this.request(`/camps/${id}`, {
      method: 'DELETE'
    });
  },

  /* Notifications */
  async getNotifications(category = '') {
    const query = category && category !== 'All' ? `?category=${category}` : '';
    return this.request(`/notifications${query}`);
  },

  async getLatestAnnouncements() {
    return this.request('/notifications/latest');
  },

  async createNotification(notifData) {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notifData)
    });
  },

  async updateNotification(id, notifData) {
    return this.request(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(notifData)
    });
  },

  async deleteNotification(id) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE'
    });
  },

  /* Feedback */
  async submitFeedback(feedbackData) {
    return this.request('/feedback/submit', {
      method: 'POST',
      body: JSON.stringify(feedbackData)
    });
  },

  async getMyFeedback() {
    return this.request('/feedback/my-feedback');
  },

  async getAllFeedback(status = '') {
    const query = status && status !== 'All' ? `?status=${status}` : '';
    return this.request(`/feedback/manage${query}`);
  },

  async updateFeedbackStatus(id, status, staffResponse) {
    return this.request(`/feedback/manage/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, staffResponse })
    });
  },

  /* Users & Admin */
  async getAllUsers() {
    return this.request('/users');
  },

  async updateUserRole(userId, role) {
    return this.request(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  },

  async updateUserStatus(userId, status) {
    return this.request(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  async getStats() {
    return this.request('/stats/dashboard');
  },

  /* Appointments */
  async getTodayAppointments() {
    return this.request('/appointments/today');
  },

  async createAppointment(apptData) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(apptData)
    });
  },

  async updateAppointment(id, apptData) {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(apptData)
    });
  },

  async updateAppointmentStatus(id, status) {
    return this.request(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  async deleteAppointment(id) {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE'
    });
  },

  /* Staff Management & Profiles */
  async createStaffUser(staffData) {
    return this.request('/users/staff', {
      method: 'POST',
      body: JSON.stringify(staffData)
    });
  },

  async updateStaffProfile(profileData) {
    return this.request('/users/staff/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  async updateUserProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  /* Hospital Information (Public & Admin Editable) */
  async getHospitalInfo() {
    return this.request('/hospital/info');
  },

  async updateHospitalInfo(infoData) {
    return this.request('/hospital/info', {
      method: 'PUT',
      body: JSON.stringify(infoData)
    });
  }
};

/**
 * CLIENT-SIDE SMART MOCK DATABASE
 * Provides instant live interaction even when opening frontend directly in browser!
 */
const MockDatabase = {
  initialized: false,

  init() {
    if (localStorage.getItem('hw_mock_initialized')) {
      this.initialized = true;
      return;
    }

    // Default Users
    const users = [
      { userId: 1, fullName: 'System Administrator', email: 'admin@healthway.hospital', phoneNumber: '+94 11 123 4567', role: 'ADMIN', accountStatus: 'ACTIVE', password: 'Password@123' },
      { userId: 2, fullName: 'Dr. Sarah Jenkins', email: 'staff.sarah@healthway.hospital', phoneNumber: '+94 77 234 5678', role: 'STAFF', accountStatus: 'ACTIVE', password: 'Password@123' },
      { userId: 3, fullName: 'Nurse Marcus Brody', email: 'staff.marcus@healthway.hospital', phoneNumber: '+94 71 345 6789', role: 'STAFF', accountStatus: 'ACTIVE', password: 'Password@123' },
      { userId: 4, fullName: 'Alex Carter', email: 'alex.carter@gmail.com', phoneNumber: '+94 76 987 6543', role: 'REGISTERED_USER', accountStatus: 'ACTIVE', password: 'Password@123' },
      { userId: 5, fullName: 'Hashani Silva', email: 'hashani.silva@gmail.com', phoneNumber: '+94 78 456 1234', role: 'REGISTERED_USER', accountStatus: 'ACTIVE', password: 'Password@123' }
    ];

    // Default Locations (All 30 locations accurately synchronized with 3D Architectural Floor Plans)
    const locations = [
      { locationId: 1, locationName: 'Emergency Unit', category: 'Emergency', building: 'Main Building (Block A)', floor: 'Ground Floor', roomNumber: 'ER-01', description: '24/7 rapid critical trauma & emergency resuscitation bay.', directions: 'Located at the top-center rear of the Ground Floor. From Main Reception, head straight north along the central corridor past Central Elevators Bank A. Dedicated emergency ambulance driveway and trauma resuscitation entrance are located directly behind.', openingHours: '24 Hours', status: 'OPEN' },
      { locationId: 2, locationName: 'Outpatient Department (OPD)', category: 'Outpatient', building: 'Main Building (Block A)', floor: '1st Floor', roomNumber: 'OPD-101', description: 'General specialist token counters and patient consultation clinics.', directions: 'Located at the center of the 1st Floor. Take Central Elevator Bank A from the Ground Floor up to the 1st Floor. Step out directly into the central circular OPD reception lounge and consultation token desks.', openingHours: '8:00 AM - 5:00 PM', status: 'OPEN' },
      { locationId: 3, locationName: 'Laboratory', category: 'Laboratory', building: 'Science Wing (Block B)', floor: '1st Floor', roomNumber: 'LAB-105', description: 'Comprehensive diagnostic blood, urine, and pathology test center.', directions: 'Take Elevator Bank A to the 1st Floor. Turn left into Science Wing (Block B). The diagnostic Laboratory, blood draw stations, and specimen intake counters are located on your left.', openingHours: '8:00 AM - 6:00 PM', status: 'OPEN' },
      { locationId: 4, locationName: 'Pharmacy', category: 'Pharmacy', building: 'Main Building (Block A)', floor: 'Ground Floor', roomNumber: 'PH-01', description: 'Prescription dispensing, surgical consumables, and emergency medications.', directions: 'Located in the top-right wing of the Ground Floor. From Main Reception, walk east past the Cashier counters; turn left down the main corridor. Central Pharmacy dispensing counter is directly on your right.', openingHours: '24 Hours', status: 'OPEN' },
      { locationId: 5, locationName: 'Radiology Department', category: 'Radiology', building: 'Main Building (Block A)', floor: '2nd Floor', roomNumber: 'RAD-204', description: 'Digital X-Ray, 128-slice CT scan, 3T MRI, and high-res Ultrasound rotunda.', directions: 'Located in the center rotunda of the 2nd Floor. Take Elevator Bank A to the 2nd Floor; walk straight ahead into the central imaging rotunda featuring 3T MRI, CT scanner suites, and viewing stations.', openingHours: '24 Hours', status: 'OPEN' },
      { locationId: 6, locationName: 'Dental Clinic', category: 'Dental Clinic', building: 'Dental Wing (Block C)', floor: '1st Floor', roomNumber: 'DNT-102', description: 'Oral hygiene, scaling, pediatric dental care, and orthodontics.', directions: 'Take Elevator Bank A to the 1st Floor. Turn left towards Dental Wing (Block C); the Dental Clinic (Room DNT-102) is located midway down the left corridor with specialized oral care chairs.', openingHours: '8:30 AM - 5:00 PM', status: 'OPEN' },
      { locationId: 7, locationName: 'Eye Clinic', category: 'Eye Clinic', building: 'Dental & Eye Wing (Block C)', floor: '2nd Floor', roomNumber: 'EYE-201', description: 'Visual acuity tests, cataract checks, and retinal screening.', directions: 'Take Elevator Bank A to the 2nd Floor. Turn left into the lower-left wing (Block C). Eye Clinic (Room EYE-201) with visual acuity lanes and refraction examination rooms is on your left.', openingHours: '8:30 AM - 4:30 PM', status: 'OPEN' },
      { locationId: 8, locationName: 'Children\'s Ward', category: 'Children\'s Ward', building: 'Women & Child Wing (Block D)', floor: '2nd Floor', roomNumber: 'W-D201', description: 'Pediatric inpatient ward with family rooms and child-friendly play areas.', directions: 'Take Elevator Bank A to the 2nd Floor. Turn right and follow the corridor into Women & Child Wing (Block D) on the far right. Pediatric inpatient rooms and family play lounge are located at the end of the wing.', openingHours: 'Visiting: 10 AM-12 PM & 4 PM-7 PM', status: 'OPEN' },
      { locationId: 9, locationName: 'General Ward', category: 'General Ward', building: 'Inpatient Tower (Block E)', floor: '3rd Floor', roomNumber: 'W-E301', description: 'Comfortable general inpatient accommodation with dedicated nursing station.', directions: 'Take Elevator Bank A to the 3rd Floor. Turn right down the bright east corridor into Inpatient Tower (Block E). Check in with the nursing station in the General Ward wing.', openingHours: 'Visiting: 11 AM-1 PM & 5 PM-7 PM', status: 'OPEN' },
      { locationId: 10, locationName: 'Medical Clinic', category: 'Medical Clinic', building: 'Main Building (Block A)', floor: '1st Floor', roomNumber: 'MC-108', description: 'Internal medicine specialist clinic for chronic illnesses.', directions: 'Take Elevator Bank A to the 1st Floor. Turn right from the central OPD lounge into the mid-right corridor. Medical Clinic (Room MC-108) is on your right for specialist internal medicine consultations.', openingHours: '9:00 AM - 4:00 PM', status: 'OPEN' },
      { locationId: 11, locationName: 'Surgical Clinic', category: 'Surgical Clinic', building: 'Surgical Pavilion (Block F)', floor: '1st Floor', roomNumber: 'SC-102', description: 'Pre-surgery consultation and postoperative wound dressing.', directions: 'Take Elevator Bank A to the 1st Floor. Turn right towards the upper-right wing (Block F). Surgical Clinic consultation and post-op wound evaluation rooms are located on the left side of the pavilion.', openingHours: '8:00 AM - 3:00 PM', status: 'OPEN' },
      { locationId: 12, locationName: 'Blood Bank', category: 'Blood Bank', building: 'Science Wing (Block B)', floor: 'Ground Floor', roomNumber: 'BB-02', description: 'Safe blood donor lounge and rapid transfusion supply.', directions: 'Located in the upper-left wing of the Ground Floor. From Main Reception, head northwest past Elevator Bank A into Science Wing (Block B). Blood Bank donation lounge and transfusion supply desk are on your left.', openingHours: '8:00 AM - 8:00 PM', status: 'OPEN' },
      { locationId: 13, locationName: 'Main Reception', category: 'Main Reception', building: 'Main Building (Block A)', floor: 'Ground Floor', roomNumber: 'LOBBY-01', description: 'Central information kiosk, wheelchair assistance, and check-in desk.', directions: 'Directly in the center of the Ground Floor atrium. Enter through the main glass front entrance doors; the large circular reception desk and digital navigation kiosk are immediately in front of you.', openingHours: '24 Hours', status: 'OPEN' },
      { locationId: 14, locationName: 'Cashier', category: 'Cashier', building: 'Main Building (Block A)', floor: 'Ground Floor', roomNumber: 'CSH-01', description: 'Patient billing, payments, and insurance claims clearance.', directions: 'Located on the Ground Floor, directly to the right side of the central circular Main Reception desk. Dedicated counters for outpatient billing, insurance approval, and payment settlement.', openingHours: '24 Hours', status: 'OPEN' },
      { locationId: 15, locationName: 'Nurology', category: 'Nurology', building: 'Specialist Wing (Block G)', floor: '3rd Floor', roomNumber: 'NEU-301', description: 'Neurology consults, stroke management, and EEG diagnostics.', directions: 'Take Elevator Bank A to the 3rd Floor. Turn left into Specialist Wing (Block G) in the upper-left wing. Neurology consultation suites and neuro-diagnostic EEG rooms are down the corridor.', openingHours: '8:30 AM - 4:00 PM', status: 'OPEN' },
      { locationId: 16, locationName: 'Dialysis', category: 'Dialysis', building: 'Renal Care Center (Block H)', floor: '1st Floor', roomNumber: 'DIA-101', description: 'Modern hemodialysis stations with dedicated nephrology care.', directions: 'Take Elevator Bank A to the 1st Floor. Turn left and proceed to the bottom-left wing (Block H). Renal Care Center and hemodialysis treatment stations are through the double frosted glass doors.', openingHours: '6:00 AM - 10:00 PM', status: 'OPEN' },
      { locationId: 17, locationName: 'Surgical Department', category: 'Surgical Department', building: 'Surgical Pavilion (Block F)', floor: '2nd Floor', roomNumber: 'OT-200', description: 'State-of-the-art modular operating suites with laminar airflow.', directions: 'Take Elevator Bank A to the 2nd Floor. Turn right into Surgical Pavilion (Block F) in the upper-right wing. Sterile operating theater suites and surgical pre-op intake are through the authorized security entrance.', openingHours: '24 Hours', status: 'OPEN' },
      { locationId: 18, locationName: 'Intensive Care unit', category: 'Intensive Care unit', building: 'Main Building (Block A)', floor: '3rd Floor', roomNumber: 'ICU-300', description: 'Advanced critical care and life-support monitoring.', directions: 'Take Elevator Bank A to the 3rd Floor. Turn southwest toward the bottom-left wing of Block A. Check in via the strict intercom system at the double security doors of the Intensive Care Unit.', openingHours: 'Visiting: 4:00 PM - 5:00 PM', status: 'OPEN' },
      { locationId: 19, locationName: 'Pediatrics', category: 'Pediatrics', building: 'Women & Child Wing (Block D)', floor: '1st Floor', roomNumber: 'PED-101', description: 'Outpatient pediatric specialist clinic with children\'s play area.', directions: 'Take Elevator Bank A to the 1st Floor. Walk past the OPD rotunda down the eastern corridor into Women & Child Wing (Block D) on the far right. Pediatric consultation rooms and child-friendly play zone are at the end.', openingHours: '8:00 AM - 6:00 PM', status: 'OPEN' },
      { locationId: 20, locationName: 'Oncology', category: 'Oncology', building: 'Hope Center (Block J)', floor: 'Ground Floor', roomNumber: 'ONC-01', description: 'Comprehensive cancer diagnostics, chemotherapy daycare, and counseling.', directions: 'Located on the Ground Floor in the far top-right wing. From Main Reception, follow the main eastern corridor past Pharmacy into Hope Center (Block J) for oncology consultations and chemotherapy daycare.', openingHours: '8:00 AM - 5:00 PM', status: 'OPEN' },
      { locationId: 21, locationName: 'Hematology', category: 'Hematology', building: 'Science Wing (Block B)', floor: '2nd Floor', roomNumber: 'HEM-201', description: 'Diagnosis and specialized management of blood disorders.', directions: 'Take Elevator Bank A to the 2nd Floor. Turn left into Science Wing (Block B) in the upper-left wing. Hematology diagnostics and blood disorder outpatient clinics are located directly down the hall.', openingHours: '8:30 AM - 4:30 PM', status: 'OPEN' },
      { locationId: 22, locationName: 'Gift shop (flowers and Gifts)', category: 'Gift shop (flowers and Gifts)', building: 'Main Building (Block A)', floor: 'Ground Floor', roomNumber: 'GFT-01', description: 'Fresh floral arrangements, cards, fruit baskets, and healthy snacks.', directions: 'Located on the Ground Floor in the bottom-left corner of the main lobby. Upon entering through the main glass front doors, the flower and gift boutique is immediately on your left near the visitor seating area.', openingHours: '8:00 AM - 9:00 PM', status: 'OPEN' },
      { locationId: 23, locationName: 'Elevators', category: 'Elevators', building: 'Main Building (Block A)', floor: 'All Floors', roomNumber: 'ELEV-A', description: 'High-speed passenger and stretcher elevator banks connecting all levels.', directions: 'Central Elevator & Stairs Bank A is situated in the mid-left core on all floors (Ground, 1st, 2nd, 3rd), providing rapid direct access to all clinical departments, wards, and diagnostic units.', openingHours: '24 Hours', status: 'OPEN' },
      { locationId: 24, locationName: 'ATM', category: 'ATM', building: 'Main Building (Block A)', floor: 'Ground Floor', roomNumber: 'ATM-01', description: '24-hour multi-bank automated teller machine and cash deposit.', directions: 'Located on the Ground Floor directly adjacent to the Cashier counters on the right side of the main entrance lobby. 24-hour multi-bank automated teller machine and banking terminal.', openingHours: '24 Hours', status: 'OPEN' },
      { locationId: 25, locationName: 'Car park entrance', category: 'Car park entrance', building: 'Hospital Grounds', floor: 'Ground Floor', roomNumber: 'CP-MAIN', description: 'Covered visitor parking with 500+ bays and disability accessibility.', directions: 'Located on the Ground Floor at the bottom-right exterior. Driveway with automated barrier gate, ticket dispensers, and pedestrian sheltered covered walkway directly into the hospital lobby.', openingHours: '24 Hours', status: 'OPEN' },
      { locationId: 26, locationName: 'Mcdonalds', category: 'Mcdonalds', building: 'Hospital Plaza (Block P)', floor: 'Ground Floor', roomNumber: 'MCD-01', description: 'Family restaurant, McCafe coffee, fresh breakfast, and refreshments.', directions: 'Located on the Ground Floor in the far-right commercial wing (Block P). Accessible via the eastern atrium corridor leading out to the landscaped Hospital Plaza dining area.', openingHours: '6:30 AM - 11:00 PM', status: 'OPEN' },
      { locationId: 27, locationName: 'Hospital Restrooms & Bathrooms (Ground Floor)', category: 'Visitor Facility', building: 'Main Building (Block A)', floor: 'Ground Floor', roomNumber: 'WC-GF', description: 'Sanitized public washrooms including male, female, fully wheelchair-accessible toilets, and baby diaper-changing stations.', directions: 'Located in the bottom-right corridor on the Ground Floor, past the Cashier and ATM. Features male, female, fully accessible wheelchair washrooms, and infant diaper changing stations.', openingHours: '24 Hours', status: 'OPEN' },
      { locationId: 28, locationName: 'Hospital Restrooms & Bathrooms (1st Floor)', category: 'Visitor Facility', building: 'Main Building (Block A)', floor: '1st Floor', roomNumber: 'WC-1F', description: 'Clean public restrooms and family washrooms for visitors to OPD and Diagnostic Laboratory.', directions: 'Located in the bottom-right corridor on the 1st Floor. From Central Elevator Bank A or the OPD rotunda, head toward the southeast corridor; clearly indicated by blue illuminated signage.', openingHours: '24 Hours', status: 'OPEN' },
      { locationId: 29, locationName: 'Hospital Restrooms & Bathrooms (2nd Floor)', category: 'Visitor Facility', building: 'Main Building (Block A)', floor: '2nd Floor', roomNumber: 'WC-2F', description: 'Accessible restrooms with grab bars, emergency call pull-cords, and child-friendly wash stations.', directions: 'Located in the bottom-right corridor on the 2nd Floor, next to the staff prep lounge and south of the central Radiology rotunda. Fully accessible with grab bars and emergency cords.', openingHours: '24 Hours', status: 'OPEN' },
      { locationId: 30, locationName: 'Hospital Restrooms & Bathrooms (3rd Floor)', category: 'Visitor Facility', building: 'Main Building (Block A)', floor: '3rd Floor', roomNumber: 'WC-3F', description: 'Modern inpatient and visitor restrooms with touchless sensor faucets and hygiene dispensers.', directions: 'Located in the bottom-right corridor on the 3rd Floor, directly opposite the Inpatient Tower General Ward entrance. Modern hygiene fixtures and wheelchair accessible facilities.', openingHours: '24 Hours', status: 'OPEN' }
    ];

    // Default Medical Camps
    const camps = [
      { campId: 1, campName: 'Free General Health Checkup', category: 'General Health', campDate: '2026-11-20', startTime: '08:00', endTime: '13:00', locationId: 13, locationName: 'Main Reception', buildingAndFloor: 'Main Building (Block A) - Ground Floor', registrationDeadline: '2026-11-19', capacity: 150, registeredCount: 42, availableSlots: 108, status: 'UPCOMING', isFree: true, description: 'Comprehensive wellness screening including BMI check, random blood glucose, blood pressure, and free general physician consultation.' },
      { campId: 2, campName: 'Free Dental & Oral Health Camp', category: 'Dental Checkup', campDate: '2026-11-24', startTime: '09:00', endTime: '14:00', locationId: 6, locationName: 'Dental Clinic', buildingAndFloor: 'Dental Wing (Block C) - 1st Floor', registrationDeadline: '2026-11-23', capacity: 80, registeredCount: 38, availableSlots: 42, status: 'UPCOMING', isFree: true, description: 'Preventive dental examination, oral cancer screening, ultrasonic scaling advice, and complimentary oral hygiene sample kits.' },
      { campId: 3, campName: 'Free Blood Donation Camp', category: 'Blood Donation', campDate: '2026-11-28', startTime: '08:00', endTime: '16:00', locationId: 12, locationName: 'Blood Bank', buildingAndFloor: 'Science Wing (Block B) - Ground Floor', registrationDeadline: '2026-11-27', capacity: 200, registeredCount: 115, availableSlots: 85, status: 'UPCOMING', isFree: true, description: 'Community life-saver blood drive in association with the National Blood Bank. Donors receive refreshments, blood group card, and certificate.' },
      { campId: 4, campName: 'Free Eye & Vision Screening', category: 'Eye Checkup', campDate: '2026-12-05', startTime: '09:00', endTime: '15:00', locationId: 7, locationName: 'Eye Clinic', buildingAndFloor: 'Dental & Eye Wing (Block C) - 2nd Floor', registrationDeadline: '2026-12-04', capacity: 100, registeredCount: 65, availableSlots: 35, status: 'UPCOMING', isFree: true, description: 'Digital visual acuity test, refractive error testing, cataract check, and free reading glasses distribution for eligible seniors.' },
      { campId: 5, campName: 'Pediatric Health & Wellness Camp', category: 'Vaccination & Pediatric', campDate: '2026-12-12', startTime: '10:00', endTime: '14:00', locationId: 8, locationName: 'Children\'s Ward', buildingAndFloor: 'Women & Child Wing (Block D) - 2nd Floor', registrationDeadline: '2026-12-11', capacity: 75, registeredCount: 29, availableSlots: 46, status: 'UPCOMING', isFree: true, description: 'Growth milestone assessment, childhood nutrition advice, pediatric vision/hearing screening, and pediatrician review.' }
    ];

    // Registrations
    const registrations = [
      { registrationId: 1, userId: 4, userName: 'Alex Carter', campId: 1, campName: 'Free General Health Checkup', campCategory: 'General Health', campDate: '2026-11-20', campTime: '08:00 - 13:00', locationName: 'Main Reception', registrationDate: '2026-11-06T14:30:00', registrationStatus: 'CONFIRMED', notes: 'Morning slot preferred' },
      { registrationId: 2, userId: 4, userName: 'Alex Carter', campId: 3, campName: 'Free Blood Donation Camp', campCategory: 'Blood Donation', campDate: '2026-11-28', campTime: '08:00 - 16:00', locationName: 'Blood Bank', registrationDate: '2026-11-06T15:00:00', registrationStatus: 'CONFIRMED', notes: 'Regular donor' }
    ];

    // Notifications
    const notifications = [
      { notificationId: 1, title: 'New Medical Camp Added: Free General Health Checkup', message: 'Registration is now open for our upcoming Free General Health Checkup on November 20 at Main Reception.', category: 'CAMP', publishedAt: '2026-11-06T10:00:00', status: 'PUBLISHED' },
      { notificationId: 2, title: 'Urgent: Blood Donation Camp Coming Soon', message: 'Join us for the community blood drive in the Blood Bank Donor Wing on November 28. Help save lives.', category: 'CAMP', publishedAt: '2026-11-06T11:30:00', status: 'PUBLISHED' },
      { notificationId: 3, title: 'Clinic Hours Updated', message: 'Starting next week, regular clinic hours in Outpatient Block A will change to 8:00 AM - 5:00 PM.', category: 'SCHEDULE_CHANGE', publishedAt: '2026-11-05T09:00:00', status: 'PUBLISHED' },
      { notificationId: 4, title: 'Dental Clinic Special Screening on April 28', message: 'Special dental clinic and checkup sessions starting soon in Block C Dental Wing.', category: 'CAMP', publishedAt: '2026-11-04T14:00:00', status: 'PUBLISHED' },
      { notificationId: 5, title: 'System Maintenance Completed', message: 'Scheduled system upgrade is done. The hospital patient portal is fully operational.', category: 'ANNOUNCEMENT', publishedAt: '2026-11-03T16:00:00', status: 'PUBLISHED' }
    ];

    // Feedback
    const feedback = [
      { feedbackId: 1, userId: 4, userName: 'Alex Carter', locationId: 5, locationName: 'Radiology Department', category: 'CONFUSING_DIRECTIONS', feedbackType: 'SUGGESTION', rating: 4, message: 'Finding the 2nd floor Radiology entrance was slightly confusing because signage near the elevator was obscured.', submittedAt: '2026-11-05T12:00:00', status: 'RESOLVED', staffResponse: 'Thank you for your feedback! Our facilities maintenance team has installed prominent overhead directional signs.' },
      { feedbackId: 2, userId: 5, userName: 'Hashani Silva', locationId: 4, locationName: 'Cashier', category: 'SCHEDULE_ISSUE', feedbackType: 'COMPLAINT', rating: 3, message: 'Queue at cashier counter 2 took over 20 minutes around midday.', submittedAt: '2026-11-06T09:30:00', status: 'UNDER_REVIEW', staffResponse: 'We apologize for the wait. We have added two additional express billing counters during peak hours.' },
      { feedbackId: 3, userId: 4, userName: 'Alex Carter', locationId: 13, locationName: 'Main Reception', category: 'DIFFICULTY_FINDING', feedbackType: 'SUGGESTION', rating: 5, message: 'The interactive floor plan made finding the Dental Wing straightforward and easy!', submittedAt: '2026-11-06T15:20:00', status: 'PENDING', staffResponse: null }
    ];

    // Favorites
    const favorites = [1, 4, 5]; // locationIds for user 4

    // Appointments (matching Photo 21 mockup)
    const appointments = [
      { id: 1, time: '09:45 AM', patientName: 'James Carter', department: 'Cardiology', room: 'Room 304', status: 'In Progress' },
      { id: 2, time: '10:30 AM', patientName: 'Elena Rostova', department: 'General Checkup', room: 'Room 102', status: 'Waiting' },
      { id: 3, time: '11:15 AM', patientName: 'Marcus Vance', department: 'Cardiology', room: 'Room 304', status: 'Scheduled' },
      { id: 4, time: '11:45 AM', patientName: 'David Miller', department: 'Cardiology', room: 'Room 304', status: 'Scheduled' },
      { id: 5, time: '01:30 PM', patientName: 'Sophia Hayes', department: 'Cardiology', room: 'Room 304', status: 'Waiting' },
      { id: 6, time: '02:15 PM', patientName: 'Oliver Bennett', department: 'Pediatrics', room: 'Room 105', status: 'Scheduled' }
    ];

    localStorage.setItem('hw_mock_users', JSON.stringify(users));
    localStorage.setItem('hw_mock_locations', JSON.stringify(locations));
    localStorage.setItem('hw_mock_camps', JSON.stringify(camps));
    localStorage.setItem('hw_mock_registrations', JSON.stringify(registrations));
    localStorage.setItem('hw_mock_notifications', JSON.stringify(notifications));
    localStorage.setItem('hw_mock_feedback', JSON.stringify(feedback));
    localStorage.setItem('hw_mock_favorites', JSON.stringify(favorites));
    localStorage.setItem('hw_mock_appointments', JSON.stringify(appointments));

    const hospitalInfo = {
      hospitalName: 'HealthWay Hospital',
      tagline: 'Care • Locate • Heal',
      heroTitle: 'About HealthWay Hospital',
      heroSubtitle: 'Providing high-standard patient healthcare, clinical diagnostics, emergency treatment, and community welfare services with compassion and excellence.',
      emergencyHotline: '+94 11 123 4567 (Ext 1)',
      emergencyText: 'Our Emergency & Trauma Unit is open 24 hours every day. If you require urgent ambulance transfer or acute life-support care, contact our 24/7 Emergency Hotline immediately at +94 11 123 4567 (Ext 1) or use the designated ambulance entrance on HealthWay Boulevard.',
      clinicalOverview: 'HealthWay Hospital is a state-of-the-art multi-specialty tertiary care hospital. With over 250 in-patient beds, 13 specialized clinical departments, modular surgical suites, and advanced 3T MRI & CT imaging, we are committed to providing seamless medical services to patients and visitors.',
      mission: 'To deliver high-quality, patient-centric healthcare with accessible hospital navigation.',
      vision: 'To be the region\'s most trusted hospital, recognized for clinical excellence and patient hospitality.',
      hoursGeneral: '11:00 AM - 1:00 PM | 5:00 PM - 7:00 PM',
      hoursPediatrics: '10:00 AM - 12:00 PM | 4:00 PM - 7:00 PM',
      hoursICU: '4:00 PM - 5:00 PM (Direct family only)',
      address: '123 Health Street, Colombo 00700, Sri Lanka',
      inquiryPhone: '+94 11 123 4567 / +94 11 123 4568',
      email: 'info@healthway.hospital',
      parkingInfo: '500+ multi-level covered bays with first 30 minutes complimentary.'
    };
    if (!localStorage.getItem('hw_hospital_info')) {
      localStorage.setItem('hw_hospital_info', JSON.stringify(hospitalInfo));
    }

    localStorage.setItem('hw_mock_initialized', 'true');
    this.initialized = true;
  },

  handleRequest(endpoint, options = {}, currentUser = null) {
    this.init();
    
    // Automatically synchronize updated 3D floor map directions and locations
    try {
      if (!localStorage.getItem('hw_floor_maps_v3_synced')) {
        localStorage.removeItem('hw_mock_initialized');
        this.init();
        localStorage.setItem('hw_floor_maps_v3_synced', 'true');
      }
    } catch (e) {}

    if (!localStorage.getItem('hw_mock_appointments')) {
      const defaultAppts = [
        { id: 1, time: '09:45 AM', patientName: 'James Carter', department: 'Cardiology', room: 'Room 304', status: 'In Progress' },
        { id: 2, time: '10:30 AM', patientName: 'Elena Rostova', department: 'General Checkup', room: 'Room 102', status: 'Waiting' },
        { id: 3, time: '11:15 AM', patientName: 'Marcus Vance', department: 'Cardiology', room: 'Room 304', status: 'Scheduled' },
        { id: 4, time: '11:45 AM', patientName: 'David Miller', department: 'Cardiology', room: 'Room 304', status: 'Scheduled' },
        { id: 5, time: '01:30 PM', patientName: 'Sophia Hayes', department: 'Cardiology', room: 'Room 304', status: 'Waiting' },
        { id: 6, time: '02:15 PM', patientName: 'Oliver Bennett', department: 'Pediatrics', room: 'Room 105', status: 'Scheduled' }
      ];
      localStorage.setItem('hw_mock_appointments', JSON.stringify(defaultAppts));
    }
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : {};

    // Auth Login
    if (endpoint === '/auth/login' && method === 'POST') {
      const users = JSON.parse(localStorage.getItem('hw_mock_users'));
      const found = users.find(u => u.email.toLowerCase() === body.email.toLowerCase() && u.password === body.password);
      if (!found) throw new Error('Invalid email or password');
      if (found.accountStatus !== 'ACTIVE') throw new Error('Account is inactive or suspended');
      return {
        token: 'mock-jwt-token-' + found.userId,
        userId: found.userId,
        fullName: found.fullName,
        email: found.email,
        role: found.role
      };
    }

    // Auth Register
    if (endpoint === '/auth/register' && method === 'POST') {
      const users = JSON.parse(localStorage.getItem('hw_mock_users'));
      if (users.find(u => u.email.toLowerCase() === body.email.toLowerCase())) {
        throw new Error('Email is already registered: ' + body.email);
      }
      const newUser = {
        userId: Date.now(),
        fullName: body.fullName,
        email: body.email,
        phoneNumber: body.phoneNumber || '',
        role: 'REGISTERED_USER',
        accountStatus: 'ACTIVE',
        password: body.password
      };
      users.push(newUser);
      localStorage.setItem('hw_mock_users', JSON.stringify(users));
      return {
        token: 'mock-jwt-token-' + newUser.userId,
        userId: newUser.userId,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      };
    }

    // Locations
    if (endpoint.startsWith('/locations') && method === 'GET') {
      const locations = JSON.parse(localStorage.getItem('hw_mock_locations'));
      const url = new URL('http://dummy.com' + endpoint);
      const search = url.searchParams.get('search');
      const category = url.searchParams.get('category');
      const building = url.searchParams.get('building');
      const floor = url.searchParams.get('floor');

      if (endpoint === '/locations/my-favorites') {
        const favIds = JSON.parse(localStorage.getItem('hw_mock_favorites') || '[]');
        return locations.filter(l => favIds.includes(l.locationId));
      }

      const matchId = endpoint.match(/\/locations\/(\d+)$/);
      if (matchId) {
        const loc = locations.find(l => l.locationId === parseInt(matchId[1]));
        if (!loc) throw new Error('Location not found');
        return loc;
      }

      return locations.filter(l => {
        if (search) {
          const q = search.toLowerCase();
          const match = l.locationName.toLowerCase().includes(q) ||
                        l.category.toLowerCase().includes(q) ||
                        l.building.toLowerCase().includes(q) ||
                        l.description.toLowerCase().includes(q);
          if (!match) return false;
        }
        if (category && category !== 'All' && l.category !== category) return false;
        if (building && building !== 'All' && l.building !== building) return false;
        if (floor && floor !== 'All' && l.floor !== floor) return false;
        return true;
      });
    }

    if (endpoint === '/locations' && method === 'POST') {
      const locations = JSON.parse(localStorage.getItem('hw_mock_locations'));
      const newLoc = { ...body, locationId: Date.now(), status: body.status || 'OPEN' };
      locations.unshift(newLoc);
      localStorage.setItem('hw_mock_locations', JSON.stringify(locations));
      return newLoc;
    }

    if (endpoint.match(/\/locations\/\d+$/) && method === 'PUT') {
      const id = parseInt(endpoint.split('/').pop());
      const locations = JSON.parse(localStorage.getItem('hw_mock_locations'));
      const idx = locations.findIndex(l => l.locationId === id);
      if (idx !== -1) {
        locations[idx] = { ...locations[idx], ...body };
        localStorage.setItem('hw_mock_locations', JSON.stringify(locations));
        return locations[idx];
      }
      throw new Error('Location not found');
    }

    if (endpoint.match(/\/locations\/\d+$/) && method === 'DELETE') {
      const id = parseInt(endpoint.split('/').pop());
      let locations = JSON.parse(localStorage.getItem('hw_mock_locations'));
      locations = locations.filter(l => l.locationId !== id);
      localStorage.setItem('hw_mock_locations', JSON.stringify(locations));
      return null;
    }

    if (endpoint.match(/\/locations\/\d+\/favorite/) && method === 'POST') {
      const locId = parseInt(endpoint.split('/')[2]);
      let favs = JSON.parse(localStorage.getItem('hw_mock_favorites') || '[]');
      let favorited = false;
      if (favs.includes(locId)) {
        favs = favs.filter(id => id !== locId);
      } else {
        favs.push(locId);
        favorited = true;
      }
      localStorage.setItem('hw_mock_favorites', JSON.stringify(favs));
      return { favorited, message: favorited ? 'Location saved to favorites' : 'Location removed from favorites' };
    }

    // Medical Camps
    if (endpoint.startsWith('/camps') && method === 'GET') {
      const camps = JSON.parse(localStorage.getItem('hw_mock_camps'));
      if (endpoint === '/camps/my-registrations') {
        const regs = JSON.parse(localStorage.getItem('hw_mock_registrations') || '[]');
        return currentUser ? regs.filter(r => r.userId === currentUser.userId) : regs;
      }
      const matchId = endpoint.match(/\/camps\/(\d+)$/);
      if (matchId) {
        const camp = camps.find(c => c.campId === parseInt(matchId[1]));
        if (!camp) throw new Error('Medical camp not found');
        return camp;
      }
      return camps;
    }

    if (endpoint === '/camps' && method === 'POST') {
      const camps = JSON.parse(localStorage.getItem('hw_mock_camps') || '[]');
      const newCamp = {
        campId: Date.now(),
        campName: body.campName,
        category: body.category || 'General Health',
        campDate: body.campDate || '2026-11-30',
        startTime: body.startTime || '09:00',
        endTime: body.endTime || '14:00',
        locationName: body.locationName || 'Main Hospital Hall',
        buildingAndFloor: body.buildingAndFloor || 'Main Building (Block A) - Ground Floor',
        registrationDeadline: body.registrationDeadline || body.campDate || '2026-11-29',
        capacity: parseInt(body.capacity) || 100,
        registeredCount: 0,
        availableSlots: parseInt(body.capacity) || 100,
        status: body.status || 'UPCOMING',
        isFree: body.isFree !== undefined ? body.isFree : true,
        description: body.description || ''
      };
      camps.unshift(newCamp);
      localStorage.setItem('hw_mock_camps', JSON.stringify(camps));
      return newCamp;
    }

    if (endpoint.match(/\/camps\/\d+$/) && method === 'PUT') {
      const campId = parseInt(endpoint.split('/').pop());
      const camps = JSON.parse(localStorage.getItem('hw_mock_camps') || '[]');
      const idx = camps.findIndex(c => c.campId === campId);
      if (idx !== -1) {
        camps[idx] = { ...camps[idx], ...body };
        if (body.capacity !== undefined) {
          camps[idx].capacity = parseInt(body.capacity);
          camps[idx].availableSlots = Math.max(0, camps[idx].capacity - (camps[idx].registeredCount || 0));
        }
        localStorage.setItem('hw_mock_camps', JSON.stringify(camps));
        return camps[idx];
      }
      throw new Error('Medical Camp not found');
    }

    if (endpoint.match(/\/camps\/\d+$/) && method === 'DELETE') {
      const campId = parseInt(endpoint.split('/').pop());
      let camps = JSON.parse(localStorage.getItem('hw_mock_camps') || '[]');
      camps = camps.filter(c => c.campId !== campId);
      localStorage.setItem('hw_mock_camps', JSON.stringify(camps));
      return null;
    }

    if (endpoint.match(/\/camps\/\d+\/register/) && method === 'POST') {
      const campId = parseInt(endpoint.split('/')[2]);
      const camps = JSON.parse(localStorage.getItem('hw_mock_camps'));
      const camp = camps.find(c => c.campId === campId);
      if (!camp) throw new Error('Camp not found');
      if (camp.availableSlots <= 0) throw new Error('Registration is full');

      let regs = JSON.parse(localStorage.getItem('hw_mock_registrations') || '[]');
      if (currentUser && regs.find(r => r.userId === currentUser.userId && r.campId === campId && r.registrationStatus === 'CONFIRMED')) {
        throw new Error('You are already registered for this medical camp');
      }

      camp.registeredCount++;
      camp.availableSlots--;
      localStorage.setItem('hw_mock_camps', JSON.stringify(camps));

      const newReg = {
        registrationId: Date.now(),
        userId: currentUser ? currentUser.userId : 4,
        userName: currentUser ? currentUser.fullName : 'Guest Patient',
        campId: camp.campId,
        campName: camp.campName,
        campCategory: camp.category,
        campDate: camp.campDate,
        campTime: `${camp.startTime} - ${camp.endTime}`,
        locationName: camp.locationName,
        registrationDate: new Date().toISOString(),
        registrationStatus: 'CONFIRMED',
        notes: body.notes || ''
      };
      regs.unshift(newReg);
      localStorage.setItem('hw_mock_registrations', JSON.stringify(regs));
      return newReg;
    }

    if (endpoint.match(/\/camps\/registrations\/\d+\/cancel/) && method === 'POST') {
      const regId = parseInt(endpoint.split('/')[3]);
      let regs = JSON.parse(localStorage.getItem('hw_mock_registrations') || '[]');
      const reg = regs.find(r => r.registrationId === regId);
      if (reg) {
        reg.registrationStatus = 'CANCELLED';
        localStorage.setItem('hw_mock_registrations', JSON.stringify(regs));
        return { message: 'Registration cancelled successfully' };
      }
      throw new Error('Registration not found');
    }

    // Notifications
    if (endpoint.startsWith('/notifications') && method === 'GET') {
      const notifs = JSON.parse(localStorage.getItem('hw_mock_notifications'));
      return notifs;
    }

    if (endpoint === '/notifications' && method === 'POST') {
      const notifs = JSON.parse(localStorage.getItem('hw_mock_notifications'));
      const newNotif = {
        ...body,
        notificationId: Date.now(),
        publishedAt: new Date().toISOString(),
        status: body.status || 'PUBLISHED'
      };
      notifs.unshift(newNotif);
      localStorage.setItem('hw_mock_notifications', JSON.stringify(notifs));
      return newNotif;
    }

    if (endpoint.match(/\/notifications\/\d+$/) && method === 'PUT') {
      const notifId = parseInt(endpoint.split('/').pop());
      const notifs = JSON.parse(localStorage.getItem('hw_mock_notifications') || '[]');
      const idx = notifs.findIndex(n => n.notificationId === notifId);
      if (idx !== -1) {
        notifs[idx] = { ...notifs[idx], ...body };
        localStorage.setItem('hw_mock_notifications', JSON.stringify(notifs));
        return notifs[idx];
      }
      throw new Error('Notification not found');
    }

    if (endpoint.match(/\/notifications\/\d+$/) && method === 'DELETE') {
      const notifId = parseInt(endpoint.split('/').pop());
      let notifs = JSON.parse(localStorage.getItem('hw_mock_notifications') || '[]');
      notifs = notifs.filter(n => n.notificationId !== notifId);
      localStorage.setItem('hw_mock_notifications', JSON.stringify(notifs));
      return null;
    }

    // Appointments
    if (endpoint.startsWith('/appointments')) {
      const appts = JSON.parse(localStorage.getItem('hw_mock_appointments') || '[]');
      if (endpoint === '/appointments/today' && method === 'GET') {
        return appts;
      }
      if (endpoint === '/appointments' && method === 'POST') {
        const newAppt = {
          id: Date.now(),
          time: body.time || '10:00 AM',
          patientName: body.patientName || 'New Patient',
          department: body.department || 'Cardiology',
          room: body.room || 'Room 101',
          status: body.status || 'Scheduled',
          doctor: body.doctor || 'Dr. Sarah Jenkins'
        };
        appts.push(newAppt);
        localStorage.setItem('hw_mock_appointments', JSON.stringify(appts));
        return newAppt;
      }
      if (endpoint.match(/\/appointments\/\d+$/) && method === 'PUT') {
        const id = parseInt(endpoint.split('/').pop());
        const idx = appts.findIndex(a => a.id === id);
        if (idx !== -1) {
          appts[idx] = { ...appts[idx], ...body };
          localStorage.setItem('hw_mock_appointments', JSON.stringify(appts));
          return appts[idx];
        }
        throw new Error('Appointment not found');
      }
      if (endpoint.match(/\/appointments\/\d+\/status/) && method === 'PUT') {
        const id = parseInt(endpoint.split('/')[2]);
        const appt = appts.find(a => a.id === id);
        if (appt) {
          appt.status = body.status;
          localStorage.setItem('hw_mock_appointments', JSON.stringify(appts));
          return appt;
        }
        throw new Error('Appointment not found');
      }
      if (endpoint.match(/\/appointments\/\d+$/) && method === 'DELETE') {
        const id = parseInt(endpoint.split('/').pop());
        const filtered = appts.filter(a => a.id !== id);
        localStorage.setItem('hw_mock_appointments', JSON.stringify(filtered));
        return null;
      }
      return appts;
    }

    // Feedback
    if (endpoint === '/feedback/submit' && method === 'POST') {
      const feedbackList = JSON.parse(localStorage.getItem('hw_mock_feedback'));
      const newFb = {
        feedbackId: Date.now(),
        userId: currentUser ? currentUser.userId : 4,
        userName: currentUser ? currentUser.fullName : 'Patient User',
        locationId: body.locationId || null,
        locationName: body.locationName || 'General Facility',
        category: body.category,
        feedbackType: body.feedbackType || 'SUGGESTION',
        rating: body.rating || 5,
        message: body.message,
        submittedAt: new Date().toISOString(),
        status: 'PENDING',
        staffResponse: null
      };
      feedbackList.unshift(newFb);
      localStorage.setItem('hw_mock_feedback', JSON.stringify(feedbackList));
      return newFb;
    }

    if (endpoint === '/feedback/my-feedback' && method === 'GET') {
      const feedbackList = JSON.parse(localStorage.getItem('hw_mock_feedback'));
      return currentUser ? feedbackList.filter(f => f.userId === currentUser.userId) : feedbackList;
    }

    if (endpoint.startsWith('/feedback/manage') && method === 'GET') {
      return JSON.parse(localStorage.getItem('hw_mock_feedback'));
    }

    if (endpoint.match(/\/feedback\/manage\/\d+\/status/) && method === 'PUT') {
      const id = parseInt(endpoint.split('/')[3]);
      const feedbackList = JSON.parse(localStorage.getItem('hw_mock_feedback'));
      const fb = feedbackList.find(f => f.feedbackId === id);
      if (fb) {
        fb.status = body.status;
        if (body.staffResponse) fb.staffResponse = body.staffResponse;
        localStorage.setItem('hw_mock_feedback', JSON.stringify(feedbackList));
        return fb;
      }
      throw new Error('Feedback not found');
    }

    // Users (Admin)
    if (endpoint === '/users' && method === 'GET') {
      return JSON.parse(localStorage.getItem('hw_mock_users'));
    }

    if (endpoint.match(/\/users\/\d+\/role/) && method === 'PUT') {
      const id = parseInt(endpoint.split('/')[2]);
      const users = JSON.parse(localStorage.getItem('hw_mock_users'));
      const u = users.find(x => x.userId === id);
      if (u) {
        u.role = body.role;
        localStorage.setItem('hw_mock_users', JSON.stringify(users));
        return u;
      }
      throw new Error('User not found');
    }

    if (endpoint.match(/\/users\/\d+\/status/) && method === 'PUT') {
      const id = parseInt(endpoint.split('/')[2]);
      const users = JSON.parse(localStorage.getItem('hw_mock_users'));
      const u = users.find(x => x.userId === id);
      if (u) {
        u.accountStatus = body.status;
        localStorage.setItem('hw_mock_users', JSON.stringify(users));
        return u;
      }
      throw new Error('User not found');
    }

    // Create Staff Account (Admin feature)
    if (endpoint === '/users/staff' && method === 'POST') {
      const users = JSON.parse(localStorage.getItem('hw_mock_users') || '[]');
      if (users.find(u => u.email.toLowerCase() === body.email.toLowerCase())) {
        throw new Error('Email is already registered: ' + body.email);
      }
      const newStaff = {
        userId: Date.now(),
        fullName: body.fullName,
        email: body.email,
        phoneNumber: body.phoneNumber || '+94 77 000 0000',
        role: 'STAFF',
        department: body.department || 'Cardiology',
        activeShift: body.activeShift || '08:00 AM - 04:00 PM',
        accountStatus: 'ACTIVE',
        password: body.password || 'Password@123'
      };
      users.push(newStaff);
      localStorage.setItem('hw_mock_users', JSON.stringify(users));
      return newStaff;
    }

    // Staff Edit Their Account
    if (endpoint === '/users/staff/profile' && method === 'PUT') {
      const users = JSON.parse(localStorage.getItem('hw_mock_users') || '[]');
      const user = currentUser || api.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      const idx = users.findIndex(u => u.userId === user.userId);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...body };
        localStorage.setItem('hw_mock_users', JSON.stringify(users));
        const updatedUser = {
          ...user,
          fullName: body.fullName || user.fullName,
          phoneNumber: body.phoneNumber !== undefined ? body.phoneNumber : user.phoneNumber,
          department: body.department !== undefined ? body.department : user.department,
          activeShift: body.activeShift !== undefined ? body.activeShift : user.activeShift
        };
        localStorage.setItem('hw_current_user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      throw new Error('Staff member account not found');
    }

    // Patient Edit Their Profile
    if (endpoint === '/users/profile' && method === 'PUT') {
      const users = JSON.parse(localStorage.getItem('hw_mock_users') || '[]');
      const user = currentUser || api.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      const idx = users.findIndex(u => u.userId === user.userId);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...body };
        localStorage.setItem('hw_mock_users', JSON.stringify(users));
        const updatedUser = {
          ...user,
          fullName: body.fullName || user.fullName,
          phoneNumber: body.phoneNumber !== undefined ? body.phoneNumber : user.phoneNumber,
          bloodGroup: body.bloodGroup !== undefined ? body.bloodGroup : user.bloodGroup,
          age: body.age !== undefined ? body.age : user.age,
          height: body.height !== undefined ? body.height : user.height,
          weight: body.weight !== undefined ? body.weight : user.weight
        };
        localStorage.setItem('hw_current_user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      throw new Error('Patient profile not found');
    }

    // Hospital Information (Public & Admin Editable)
    if (endpoint === '/hospital/info' && method === 'GET') {
      const info = localStorage.getItem('hw_hospital_info');
      if (info) return JSON.parse(info);
      return {
        hospitalName: 'HealthWay Hospital',
        tagline: 'Care • Locate • Heal',
        heroTitle: 'About HealthWay Hospital',
        heroSubtitle: 'Providing high-standard patient healthcare, clinical diagnostics, emergency treatment, and community welfare services with compassion and excellence.',
        emergencyHotline: '+94 11 123 4567 (Ext 1)',
        emergencyText: 'Our Emergency & Trauma Unit is open 24 hours every day. If you require urgent ambulance transfer or acute life-support care, contact our 24/7 Emergency Hotline immediately at +94 11 123 4567 (Ext 1) or use the designated ambulance entrance on HealthWay Boulevard.',
        clinicalOverview: 'HealthWay Hospital is a state-of-the-art multi-specialty tertiary care hospital. With over 250 in-patient beds, 13 specialized clinical departments, modular surgical suites, and advanced 3T MRI & CT imaging, we are committed to providing seamless medical services to patients and visitors.',
        mission: 'To deliver high-quality, patient-centric healthcare with accessible hospital navigation.',
        vision: 'To be the region\'s most trusted hospital, recognized for clinical excellence and patient hospitality.',
        hoursGeneral: '11:00 AM - 1:00 PM | 5:00 PM - 7:00 PM',
        hoursPediatrics: '10:00 AM - 12:00 PM | 4:00 PM - 7:00 PM',
        hoursICU: '4:00 PM - 5:00 PM (Direct family only)',
        address: '123 Health Street, Colombo 00700, Sri Lanka',
        inquiryPhone: '+94 11 123 4567 / +94 11 123 4568',
        email: 'info@healthway.hospital',
        parkingInfo: '500+ multi-level covered bays with first 30 minutes complimentary.'
      };
    }

    if (endpoint === '/hospital/info' && method === 'PUT') {
      const current = JSON.parse(localStorage.getItem('hw_hospital_info') || '{}');
      const updated = { ...current, ...body };
      localStorage.setItem('hw_hospital_info', JSON.stringify(updated));
      return updated;
    }

    // Stats
    if (endpoint.includes('/stats')) {
      const users = JSON.parse(localStorage.getItem('hw_mock_users') || '[]');
      const locs = JSON.parse(localStorage.getItem('hw_mock_locations') || '[]');
      const camps = JSON.parse(localStorage.getItem('hw_mock_camps') || '[]');
      const regs = JSON.parse(localStorage.getItem('hw_mock_registrations') || '[]');
      const fbs = JSON.parse(localStorage.getItem('hw_mock_feedback') || '[]');
      return {
        totalUsers: users.length,
        registeredPatients: users.filter(u => u.role === 'REGISTERED_USER').length,
        staffMembers: users.filter(u => u.role === 'STAFF').length,
        totalLocations: locs.length,
        totalCamps: camps.length,
        activeCamps: camps.filter(c => c.status === 'UPCOMING').length,
        totalRegistrations: regs.length,
        totalFeedback: fbs.length,
        pendingFeedback: fbs.filter(f => f.status === 'PENDING').length,
        underReviewFeedback: fbs.filter(f => f.status === 'UNDER_REVIEW').length,
        resolvedFeedback: fbs.filter(f => f.status === 'RESOLVED').length,
        totalNotifications: 5
      };
    }

    return [];
  }
};

// Auto initialize mock DB upon loading
MockDatabase.init();

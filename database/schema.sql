-- Hospital Location & Patient Information System
-- Database Schema for MySQL 8.0+

CREATE DATABASE IF NOT EXISTS hospital_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hospital_db;

-- Drop tables in reverse order of foreign keys
DROP TABLE IF EXISTS favorite_locations;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS camp_registrations;
DROP TABLE IF EXISTS medical_camps;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone_number VARCHAR(25),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('GUEST', 'REGISTERED_USER', 'STAFF', 'ADMIN') NOT NULL DEFAULT 'REGISTERED_USER',
    account_status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Departments Table
CREATE TABLE departments (
    department_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Locations Table
CREATE TABLE locations (
    location_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT,
    location_name VARCHAR(120) NOT NULL,
    category VARCHAR(60) NOT NULL,
    building VARCHAR(80) NOT NULL,
    floor VARCHAR(40) NOT NULL,
    room_number VARCHAR(40),
    description TEXT,
    directions TEXT,
    opening_hours VARCHAR(100) DEFAULT '24 Hours',
    status ENUM('OPEN', 'CLOSED', 'UNDER_MAINTENANCE') NOT NULL DEFAULT 'OPEN',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_locations_department FOREIGN KEY (department_id) 
        REFERENCES departments(department_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Medical Camps Table
CREATE TABLE medical_camps (
    camp_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    camp_name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(60) NOT NULL,
    camp_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location_id BIGINT,
    registration_deadline DATE NOT NULL,
    capacity INT NOT NULL DEFAULT 50,
    status ENUM('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'UPCOMING',
    is_free BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_camps_location FOREIGN KEY (location_id) 
        REFERENCES locations(location_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Camp Registrations Table
CREATE TABLE camp_registrations (
    registration_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    camp_id BIGINT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registration_status ENUM('CONFIRMED', 'CANCELLED', 'ATTENDED') NOT NULL DEFAULT 'CONFIRMED',
    notes VARCHAR(255),
    CONSTRAINT uk_user_camp UNIQUE (user_id, camp_id),
    CONSTRAINT fk_reg_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_reg_camp FOREIGN KEY (camp_id) 
        REFERENCES medical_camps(camp_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Notifications Table
CREATE TABLE notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category ENUM('CAMP', 'ANNOUNCEMENT', 'SCHEDULE_CHANGE', 'SERVICE_INTERRUPTION', 'GENERAL') NOT NULL DEFAULT 'GENERAL',
    created_by BIGINT,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE,
    status ENUM('PUBLISHED', 'DRAFT', 'EXPIRED', 'ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
    CONSTRAINT fk_notifications_user FOREIGN KEY (created_by) 
        REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. Feedback Table
CREATE TABLE feedback (
    feedback_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    location_id BIGINT,
    category ENUM('DIFFICULTY_FINDING', 'CONFUSING_DIRECTIONS', 'INCORRECT_INFO', 'SCHEDULE_ISSUE', 'OTHER') NOT NULL,
    feedback_type ENUM('SUGGESTION', 'COMPLIMENT', 'COMPLAINT', 'OTHER') NOT NULL DEFAULT 'SUGGESTION',
    rating INT DEFAULT 5,
    message TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'UNDER_REVIEW', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
    staff_response TEXT,
    responded_by BIGINT,
    responded_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_location FOREIGN KEY (location_id) 
        REFERENCES locations(location_id) ON DELETE SET NULL,
    CONSTRAINT fk_feedback_staff FOREIGN KEY (responded_by) 
        REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. Favorite Locations Table
CREATE TABLE favorite_locations (
    favorite_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    location_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_favorite UNIQUE (user_id, location_id),
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_location FOREIGN KEY (location_id) 
        REFERENCES locations(location_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Indexes for performance
CREATE INDEX idx_locations_category ON locations(category);
CREATE INDEX idx_locations_building ON locations(building);
CREATE INDEX idx_locations_floor ON locations(floor);
CREATE INDEX idx_camps_date ON medical_camps(camp_date);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_feedback_status ON feedback(status);

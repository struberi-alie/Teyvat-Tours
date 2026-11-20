
USE teyvat_tours_db;

-- 1. TOUR PACKAGES
CREATE TABLE tour_packages (
    package_id INT AUTO_INCREMENT PRIMARY KEY,
    region_name VARCHAR(100) NOT NULL,
    package_name VARCHAR(150) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    duration VARCHAR(100) NOT NULL
);

-- 2. CLIENT INQUIRIES
CREATE TABLE client_inquiries (
    inquiry_id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact_number VARCHAR(30),
    preferred_destination VARCHAR(100),
    topic VARCHAR(100),
    message TEXT NOT NULL
);

-- 3. BOOKING REQUESTS
CREATE TABLE booking_requests (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    client_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact_number VARCHAR(30) NOT NULL,
    travel_date DATE NOT NULL,
    adults INT NOT NULL,
    children INT NOT NULL DEFAULT 0,
    special_requests TEXT,
    payment_method VARCHAR(100),
    CONSTRAINT fk_booking_package
        FOREIGN KEY (package_id)
        REFERENCES tour_packages(package_id)
);

-- 4. ADMIN ACCOUNTS
CREATE TABLE admin_accounts (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE DATABASE IF NOT EXISTS carbon_monitor;
USE carbon_monitor;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Carbon records table
CREATE TABLE IF NOT EXISTS carbon_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  region_id INT NOT NULL,
  carbon_amount DECIMAL(12, 2) NOT NULL,
  severity ENUM('Aman','Waspada','Siaga','Berbahaya','Sangat Berbahaya') NOT NULL,
  recorded_at DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Index for faster queries
CREATE INDEX idx_carbon_region ON carbon_records(region_id);
CREATE INDEX idx_carbon_date ON carbon_records(recorded_at);
CREATE INDEX idx_carbon_severity ON carbon_records(severity);

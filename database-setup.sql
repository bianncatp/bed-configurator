-- Bed Configurator Database Setup Script
-- Run this script to set up the database manually

-- Create database
CREATE DATABASE IF NOT EXISTS bed_configurator;
USE bed_configurator;

-- Create user (optional but recommended)
-- Change 'your_secure_password' to a strong password
CREATE USER IF NOT EXISTS 'bedconfig'@'localhost' IDENTIFIED BY 'bt.2025';
GRANT ALL PRIVILEGES ON bed_configurator.* TO 'bedconfig'@'localhost';
FLUSH PRIVILEGES;

-- Create configurations table
CREATE TABLE IF NOT EXISTS configurations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Frame (CadruPat) details
  cadru_material VARCHAR(50) NOT NULL,
  cadru_color VARCHAR(20) NOT NULL,
  cadru_price_per_unit DECIMAL(10, 2) NOT NULL,
  
  -- Headboard (CapatPat) details
  capat_material VARCHAR(50) NOT NULL,
  capat_color VARCHAR(20) NOT NULL,
  capat_price_per_unit DECIMAL(10, 2) NOT NULL,
  
  -- Dimensions in cm
  width INT NOT NULL,
  height INT NOT NULL,
  length INT NOT NULL,
  
  -- Pricing
  total_price DECIMAL(10, 2) NOT NULL,
  
  -- Camera view preset
  camera_view VARCHAR(20) DEFAULT 'default',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_created_at (created_at),
  INDEX idx_total_price (total_price),
  INDEX idx_camera_view (camera_view)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Create a view for easier querying
CREATE OR REPLACE VIEW configuration_summary AS
SELECT 
  id,
  CONCAT(cadru_material, ' frame with ', capat_material, ' headboard') AS description,
  CONCAT(width, 'x', height, 'x', length, ' cm') AS dimensions,
  total_price,
  created_at
FROM configurations
ORDER BY created_at DESC;

-- Insert sample data (optional)
INSERT INTO configurations (
  cadru_material, cadru_color, cadru_price_per_unit,
  capat_material, capat_color, capat_price_per_unit,
  width, height, length, total_price
) VALUES
  ('wood', '#8B4513', 50.00, 'fabric', '#D2B48C', 75.00, 160, 120, 200, 410),
  ('metal', '#2C2C2C', 120.00, 'leather', '#654321', 200.00, 180, 140, 200, 902),
  ('wood', '#DEB887', 50.00, 'fabric', '#808080', 75.00, 140, 100, 180, 352);

-- Show created tables
SHOW TABLES;

-- Display sample data
SELECT * FROM configuration_summary;

-- Success message
SELECT 'Database setup completed successfully!' AS message;

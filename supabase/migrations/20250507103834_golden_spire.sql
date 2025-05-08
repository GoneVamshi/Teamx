-- Create database
CREATE DATABASE IF NOT EXISTS workforce;
USE workforce;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'employee') NOT NULL,
  position VARCHAR(100),
  department VARCHAR(100),
  join_date DATE,
  phone VARCHAR(20),
  address TEXT,
  image_url VARCHAR(255)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status ENUM('present', 'absent') NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Leaves table
CREATE TABLE IF NOT EXISTS leaves (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status ENUM('pending', 'approved', 'rejected') NOT NULL,
  applied_on DATE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  priority ENUM('low', 'medium', 'high') NOT NULL,
  status ENUM('pending', 'in-progress', 'completed') NOT NULL,
  assigned_by INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  posted_by INT NOT NULL,
  FOREIGN KEY (posted_by) REFERENCES users(id)
);

-- Insert default admin user
INSERT INTO users (name, email, password, role, position, department, join_date, phone, address, image_url)
VALUES (
  'Admin User',
  'admin@workforce.com',
  'admin123',
  'admin',
  'System Administrator',
  'IT',
  '2023-01-15',
  '+1 (555) 123-4567',
  '123 Admin Street, Tech City',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'
);

-- Insert default employees
INSERT INTO users (name, email, password, role, position, department, join_date, phone, address, image_url)
VALUES
  (
    'John Doe',
    'john@workforce.com',
    'employee123',
    'employee',
    'Software Developer',
    'Engineering',
    '2023-03-10',
    '+1 (555) 987-6543',
    '456 Developer Avenue, Code Town',
    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
  ),
  (
    'Jane Smith',
    'jane@workforce.com',
    'employee123',
    'employee',
    'Marketing Specialist',
    'Marketing',
    '2023-02-20',
    '+1 (555) 456-7890',
    '789 Marketing Boulevard, Brand City',
    'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150'
  );
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS SocialMediaAnalyticsPro;
USE SocialMediaAnalyticsPro;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role ENUM('admin', 'analyst') DEFAULT 'analyst',
    profile_picture VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Platforms table
CREATE TABLE IF NOT EXISTS platforms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    api_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform accounts table
CREATE TABLE IF NOT EXISTS platform_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    platform_id INT NOT NULL,
    external_username VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_platform_account (user_id, platform_id)
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    platform_account_id INT NOT NULL,
    external_post_id VARCHAR(255) NOT NULL,
    content TEXT,
    media_url TEXT,
    date_posted DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (platform_account_id) REFERENCES platform_accounts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_post (platform_account_id, external_post_id)
);

-- Engagements table
CREATE TABLE IF NOT EXISTS engagements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    engagement_score DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_engagement (post_id)
);

-- Insert default platforms
INSERT IGNORE INTO platforms (name, api_name) VALUES 
('YouTube', 'youtube'),
('Instagram', 'instagram'),
('Twitter', 'twitter'),
('Facebook', 'facebook'),
('LinkedIn', 'linkedin'); 
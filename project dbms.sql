-- STEP 1: Create Database
CREATE DATABASE IF NOT EXISTS SocialMediaAnalyticsPro;
USE SocialMediaAnalyticsPro;

-- STEP 2: Users Table (for admins/analysts)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'analyst') DEFAULT 'analyst',
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- STEP 3: Platforms Table (YouTube, X, etc.)
CREATE TABLE platforms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,          -- e.g., 'YouTube', 'X'
    api_name VARCHAR(100),                     -- e.g., 'youtube', 'twitter'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- STEP 4: Platform Accounts (OAuth-Linked Accounts)
CREATE TABLE platform_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    platform_id INT,
    external_username VARCHAR(100),            -- e.g., YouTube handle
    access_token TEXT,
    refresh_token TEXT,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
);

-- STEP 5: Posts Table (fetched from API)
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    platform_account_id INT,
    external_post_id VARCHAR(100),             -- Post ID from API
    content TEXT,
    media_url TEXT,
    date_posted DATETIME,
    FOREIGN KEY (platform_account_id) REFERENCES platform_accounts(id) ON DELETE CASCADE
);

-- STEP 6: Engagement Metrics Table
CREATE TABLE engagements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT UNIQUE,
    likes INT DEFAULT 0,
    shares INT DEFAULT 0,
    comments INT DEFAULT 0,
    views INT DEFAULT 0,
    watch_time DECIMAL(6,2),                   -- In minutes
    engagement_score DECIMAL(6,2),             -- Custom metric
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- STEP 7: API Logs Table
CREATE TABLE api_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    platform_account_id INT,
    action VARCHAR(100),                       -- e.g., 'fetch_posts'
    status ENUM('success', 'failure') DEFAULT 'success',
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (platform_account_id) REFERENCES platform_accounts(id) ON DELETE CASCADE
);

-- STEP 8: Indexes for Performance
CREATE INDEX idx_post_date ON posts(date_posted);
CREATE INDEX idx_engagement_score ON engagements(engagement_score);

-- STEP 9: Initial Data
-- Insert YouTube platform
INSERT INTO platforms (name, api_name) 
VALUES ('YouTube', 'youtube');

-- Insert a test admin user (optional)
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Admin User', 'admin@example.com', '', 'admin');

-- Insert a test platform account (optional)
INSERT INTO platform_accounts (user_id, platform_id, external_username, access_token, refresh_token, expires_at)
VALUES (1, 1, 'TestYTUser', '', '', NOW());

-- STEP 10: Verify Data
-- Check users
SELECT * FROM users;

-- Check platforms
SELECT * FROM platforms;

-- Check platform accounts
SELECT * FROM platform_accounts;

-- Check recent posts with engagement metrics
SELECT 
    p.external_post_id, 
    p.content, 
    p.date_posted,
    e.views, 
    e.likes, 
    e.comments, 
    e.engagement_score
FROM posts p
JOIN engagements e ON p.id = e.post_id
ORDER BY p.id DESC
LIMIT 5;









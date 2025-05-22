const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      multipleStatements: true // Allow multiple statements
    });

    console.log('Connected to MySQL server');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'SocialMediaAnalyticsPro'}`);
    console.log('Database created or already exists');

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME || 'SocialMediaAnalyticsPro'}`);

    // Create tables
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        role VARCHAR(50) DEFAULT 'analyst',
        profile_picture TEXT,
        google_id VARCHAR(255) UNIQUE
      )`,
      `CREATE TABLE IF NOT EXISTS platforms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      )`,
      `CREATE TABLE IF NOT EXISTS platform_accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        platform_id INT NOT NULL,
        external_username VARCHAR(255),
        access_token TEXT,
        refresh_token TEXT,
        expires_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (platform_id) REFERENCES platforms(id)
      )`,
      `CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        platform_account_id INT NOT NULL,
        external_post_id VARCHAR(255),
        content TEXT,
        date_posted DATETIME,
        FOREIGN KEY (platform_account_id) REFERENCES platform_accounts(id)
      )`,
      `CREATE TABLE IF NOT EXISTS engagements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        views INT DEFAULT 0,
        likes INT DEFAULT 0,
        comments INT DEFAULT 0,
        engagement_score FLOAT DEFAULT 0,
        FOREIGN KEY (post_id) REFERENCES posts(id)
      )`
    ];

    for (const table of tables) {
      await connection.query(table);
    }
    console.log('Tables created successfully');

    // Insert YouTube platform if not exists
    await connection.query(`INSERT IGNORE INTO platforms (name) VALUES ('YouTube')`);
    console.log('YouTube platform added');

    console.log('Database setup completed successfully!');
  } catch (err) {
    console.error('Error setting up database:', err);
    throw err;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupDatabase().catch(console.error); 
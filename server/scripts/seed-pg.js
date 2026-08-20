import pool from '../config/postgres.js';

const seedDatabase = async () => {
  try {
    console.log('Starting PostgreSQL database seed...');

    // Drop tables if they exist to start fresh
    await pool.query('DROP TABLE IF EXISTS creator_profiles;');
    await pool.query('DROP TABLE IF EXISTS creators;');

    // Create creators table
    await pool.query(`
      CREATE TABLE creators (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL
      );
    `);
    console.log('Table "creators" created.');

    // Create creator_profiles table
    await pool.query(`
      CREATE TABLE creator_profiles (
        id SERIAL PRIMARY KEY,
        creator_id INTEGER NOT NULL,
        bio TEXT,
        CONSTRAINT fk_creator
          FOREIGN KEY(creator_id) 
          REFERENCES creators(id)
          ON DELETE CASCADE
      );
    `);
    console.log('Table "creator_profiles" created.');

    // Insert data into creators
    await pool.query(`
      INSERT INTO creators (name, email)
      VALUES 
        ('Rishikesh', 'rishikesh@example.com'),
        ('Amit', 'amit@example.com'),
        ('Priya', 'priya@example.com')
      RETURNING *;
    `);
    console.log('Inserted creators.');

    // Insert data into creator_profiles
    await pool.query(`
      INSERT INTO creator_profiles (creator_id, bio)
      VALUES 
        (1, 'Technology Creator & Developer'),
        (2, 'Web Developer & Designer'),
        (3, 'Data Scientist')
      RETURNING *;
    `);
    console.log('Inserted creator profiles.');

    console.log('PostgreSQL database seeded successfully!');
  } catch (error) {
    console.error('Error seeding the PostgreSQL database:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
};

seedDatabase();

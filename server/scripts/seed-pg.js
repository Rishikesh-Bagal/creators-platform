import pool from '../config/postgres.js';

const seedDatabase = async () => {
  try {
    console.log('Starting PostgreSQL database seed...');

    // Drop tables if they exist to start fresh
    await pool.query('DROP TABLE IF EXISTS posts;');
    await pool.query('DROP TABLE IF EXISTS users;');

    // Create users table
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table "users" created.');

    // Create posts table
    await pool.query(`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_author
          FOREIGN KEY(author_id) 
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `);
    console.log('Table "posts" created.');

    // Insert data into users
    await pool.query(`
      INSERT INTO users (name, email, password)
      VALUES 
        ('Rishikesh', 'rishikesh@example.com', 'hashed_pass_1'),
        ('Amit', 'amit@example.com', 'hashed_pass_2'),
        ('Priya', 'priya@example.com', 'hashed_pass_3')
      RETURNING *;
    `);
    console.log('Inserted users.');

    // Insert data into posts
    await pool.query(`
      INSERT INTO posts (title, content, author_id)
      VALUES 
        ('First PostgreSQL Post', 'This is content for the first post via PG.', 1),
        ('Learn SQL JOINs', 'SQL JOINs allow combining data from multiple tables.', 1),
        ('Backend Architecture', 'Discussing microservices vs monoliths.', 2)
      RETURNING *;
    `);
    console.log('Inserted posts.');

    console.log('PostgreSQL database seeded successfully!');
  } catch (error) {
    console.error('Error seeding the PostgreSQL database:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
};

seedDatabase();

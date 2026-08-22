import pool from '../config/postgres.js';

export const getPostsWithAuthors = async (req, res) => {
  try {
    // SQL JOIN DEMONSTRATION:
    // Fetching posts along with their author's name and email
    const query = `
      SELECT
          posts.id,
          posts.title,
          posts.content,
          posts.created_at,
          users.id AS author_id,
          users.name AS author_name,
          users.email AS author_email
      FROM posts
      JOIN users
          ON posts.author_id = users.id;
    `;
    
    const result = await pool.query(query);
    
    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows
    });
  } catch (error) {
    console.error('Error executing SQL JOIN query:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch posts from PostgreSQL.' });
  }
};

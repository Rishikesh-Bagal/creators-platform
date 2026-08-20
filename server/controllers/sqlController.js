import pool from '../config/postgres.js';

export const getCreatorsWithProfiles = async (req, res) => {
  try {
    const query = `
      SELECT
          creators.id,
          creators.name,
          creator_profiles.bio
      FROM creators
      INNER JOIN creator_profiles
          ON creators.id = creator_profiles.creator_id;
    `;
    
    const result = await pool.query(query);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error executing SQL JOIN query:', error);
    res.status(500).json({ error: 'Failed to fetch creators from PostgreSQL.' });
  }
};

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SqlDemo.css'; // Let's also create this file for some basic styling

const SqlDemo = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        setLoading(true);
        // Assuming your backend runs on port 5000 and is proxied or absolute URL
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${API_URL}/sql/creators`);
        setCreators(response.data);
      } catch (err) {
        console.error('Error fetching PostgreSQL data:', err);
        setError('Failed to load data from PostgreSQL. Make sure the backend is running and PostgreSQL is connected.');
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, []);

  return (
    <div className="sql-demo-container">
      <h2>SQL JOINs — PostgreSQL Demonstration</h2>
      <p>This page fetches data from a PostgreSQL database using an <code>INNER JOIN</code> query.</p>

      {loading && <p>Loading data...</p>}
      
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && (
        <div className="table-container">
          <table className="sql-table">
            <thead>
              <tr>
                <th>Creator Name</th>
                <th>Bio</th>
              </tr>
            </thead>
            <tbody>
              {creators.length > 0 ? (
                creators.map((creator) => (
                  <tr key={creator.id}>
                    <td>{creator.name}</td>
                    <td>{creator.bio}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No records found. Please run the seed script.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="sql-info">
        <h3>Backend Query:</h3>
        <pre>
{`SELECT
    creators.id,
    creators.name,
    creator_profiles.bio
FROM creators
INNER JOIN creator_profiles
    ON creators.id = creator_profiles.creator_id;`}
        </pre>
      </div>
    </div>
  );
};

export default SqlDemo;

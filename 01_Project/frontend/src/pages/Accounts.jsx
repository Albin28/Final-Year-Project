import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Accounts = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading accounts...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937' }}>Accounts (Temporary View)</h1>
          <p style={{ color: '#6B7280', marginTop: '0.5rem' }}>This is a temporary view to show all registered accounts for different franchise stores.</p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '500', color: '#6B7280' }}>ID</th>
                <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '500', color: '#6B7280' }}>Username</th>
                <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '500', color: '#6B7280' }}>Email</th>
                <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '500', color: '#6B7280' }}>Password (Hashed)</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#1F2937' }}>{user.id}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#1F2937', fontWeight: '500' }}>{user.username}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>{user.email}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6B7280', fontFamily: 'monospace', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title="Passwords are irreversibly hashed for security.">
                    {user.password}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                    No accounts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Accounts;

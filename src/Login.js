import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const allowedUsers = ['a1', 'a2', 'a3', 'a4'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!allowedUsers.includes(username)) {
      setError('No user found with that name.');
      return;
    }

    try {
      const res = await fetch(`/api/getUser?username=${username}`);
      let data;
      if (res.status === 200) {
        data = await res.json();
      } else if (res.status === 404) {
        data = { entries: [] };
        await fetch('/api/saveUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, data }),
        });
      } else {
        throw new Error('Unexpected response');
      }
      localStorage.setItem('username', username);
      navigate('/home');
    } catch (err) {
      setError('Error connecting to server.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Welcome to Fitness Schedule</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., a1"
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
}
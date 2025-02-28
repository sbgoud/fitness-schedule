import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Define the predefined users
  const allowedUsers = ['a1', 'a2', 'a3', 'a4'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state

    // Check if the username is in the predefined list
    if (!allowedUsers.includes(username)) {
      setError('No user found with that name.');
      return;
    }

    // Fetch user data
    const res = await fetch(`/api/getUser?username=${username}`);

    let data;
    if (res.status === 200) {
      data = await res.json();
    } else if (res.status === 404) {
      // If data doesn't exist, initialize with empty entries
      data = { entries: [] };
      await fetch('/api/saveUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, data }),
      });
    } else {
      setError('Error fetching user data.');
      return;
    }

    // Store username and navigate to home
    localStorage.setItem('username', username);
    navigate('/home');
  };

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
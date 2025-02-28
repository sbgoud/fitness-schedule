import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [data, setData] = useState(null);
  const [entry, setEntry] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/getUser?username=${username}`);
        if (res.status === 200) {
          const userData = await res.json();
          setData(userData);
        } else {
          setData({ entries: [] });
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchData();
  }, [username, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newEntry = { date: new Date().toISOString().split('T')[0], text: entry };
    const updatedData = { entries: [...(data?.entries || []), newEntry] };

    try {
      const res = await fetch('/api/saveUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, data: updatedData }),
      });
      if (res.status === 200) {
        setData(updatedData);
        setEntry('');
        setSaveStatus('Data saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        throw new Error('Save failed');
      }
    } catch (err) {
      setSaveStatus('Failed to save data.');
      console.error('Save error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="container mt-3">
      <header className="d-flex justify-content-between mb-3">
        <h5>{username}</h5>
        <h3>Fitness Schedule</h3>
        <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
      </header>
      {saveStatus && (
        <div className={`alert ${saveStatus.includes('Failed') ? 'alert-danger' : 'alert-success'}`}>
          {saveStatus}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="entry" className="form-label">Add Entry</label>
          <input
            type="text"
            className="form-control"
            id="entry"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Enter something"
          />
        </div>
        <button type="submit" className="btn btn-primary">Save</button>
      </form>
      <h4 className="mt-4">Entries</h4>
      <ul className="list-group">
        {data.entries.map((e, i) => (
          <li key={i} className="list-group-item">{e.date}: {e.text}</li>
        ))}
      </ul>
    </div>
  );
}
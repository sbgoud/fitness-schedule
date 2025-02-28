import { useState, useEffect } from 'react';

export default function Home() {
  const [data, setData] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/getUser?username=${username}`);
      if (res.status === 200) {
        const userData = await res.json();
        setData(userData);
      } else {
        setData({ entries: [] }); // Fallback, should already be handled in Login
      }
    };
    fetchData();
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Assume newEntry is formed from form inputs
    const newEntry = { date: new Date().toISOString().split('T')[0] /*, ...other fields */ };
    const updatedData = { entries: [...(data?.entries || []), newEntry] };

    await fetch('/api/saveUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, data: updatedData }),
    });

    setData(updatedData);
    setSaveStatus('Data saved successfully.');
    setTimeout(() => setSaveStatus(null), 3000); // Clear message after 3 seconds
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      {saveStatus && <div className="alert alert-success">{saveStatus}</div>}
      <form onSubmit={handleSubmit}>
        {/* Form fields for entry data */}
        <button type="submit">Save</button>
      </form>
      {/* Display data.entries as needed */}
    </div>
  );
}
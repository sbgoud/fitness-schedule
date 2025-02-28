import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const allowedItems = {
  breakfast: ['Idli', 'Dosa', 'Poha'],
  lunch: ['Rice', 'Dal', 'Vegetables'],
  dinner: ['Roti', 'Sabzi', 'Salad'],
};

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [todayData, setTodayData] = useState({
    wakeUp: { checked: false, timestamp: '', notes: '' },
    breakfast: { checked: false, timestamp: '', notes: '', items: '' },
    lunch: { checked: false, timestamp: '', notes: '', items: '' },
    dinner: { checked: false, timestamp: '', notes: '', items: '' },
  });
  const [showInfo, setShowInfo] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  // Check if user is logged in, fetch data on load
  useEffect(() => {
    if (!username) {
      navigate('/login');
    } else {
      fetchUserData();
    }
  }, [username, navigate]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`/api/getUser?username=${username}`);
      if (res.status === 200) {
        const data = await res.json();
        setUserData(data);
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = data.entries.find((entry) => entry.date === today);
        if (todayEntry) setTodayData(todayEntry); // Auto-fill today’s data
      } else {
        setUserData({ entries: [] });
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleCheck = (activity) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTodayData((prev) => ({
      ...prev,
      [activity]: {
        ...prev[activity],
        checked: !prev[activity].checked,
        timestamp: !prev[activity].checked ? timestamp : '',
      },
    }));
  };

  const handleNotesChange = (activity, value) => {
    setTodayData((prev) => ({
      ...prev,
      [activity]: { ...prev[activity], notes: value },
    }));
  };

  const handleItemsChange = (activity, value) => {
    setTodayData((prev) => ({
      ...prev,
      [activity]: { ...prev[activity], items: value },
    }));
  };

  const handleSubmit = async () => {
    const today = new Date().toISOString().split('T')[0];
    const updatedEntries = (userData?.entries || []).filter((entry) => entry.date !== today);
    updatedEntries.push({ date: today, ...todayData });
    const updatedData = { entries: updatedEntries };

    try {
      const res = await fetch('/api/saveUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, data: updatedData }),
      });
      if (res.status === 200) {
        setUserData(updatedData);
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

  const activities = [
    { name: 'wakeUp', label: 'Wake Up', time: '07:00 AM' },
    { name: 'breakfast', label: 'Breakfast', time: '08:00 AM' },
    { name: 'lunch', label: 'Lunch', time: '01:00 PM' },
    { name: 'dinner', label: 'Dinner', time: '07:00 PM' },
  ];

  return (
    <div className="container mt-3">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h5>{username}</h5>
        <h3>Fitness Schedule</h3>
        <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {saveStatus && (
        <div className={`alert ${saveStatus.includes('Failed') ? 'alert-danger' : 'alert-success'}`}>
          {saveStatus}
        </div>
      )}

      <h4>Today’s Activities</h4>
      {activities.map((activity) => (
        <div key={activity.name} className="card mb-3 p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id={activity.name}
                checked={todayData[activity.name].checked}
                onChange={() => handleCheck(activity.name)}
              />
              <label className="form-check-label" htmlFor={activity.name}>
                {activity.label} ({activity.time})
              </label>
            </div>
            {todayData[activity.name].checked && (
              <span>{todayData[activity.name].timestamp}</span>
            )}
          </div>
          <input
            type="text"
            className="form-control mt-2"
            placeholder="Notes"
            value={todayData[activity.name].notes}
            onChange={(e) => handleNotesChange(activity.name, e.target.value)}
          />
          {activity.name !== 'wakeUp' && (
            <div className="d-flex mt-2">
              <button
                className="btn btn-info btn-sm me-2"
                onClick={() => setShowInfo(activity.name)}
              >
                i
              </button>
              <input
                type="text"
                className="form-control"
                placeholder="What you had"
                value={todayData[activity.name].items}
                onChange={(e) => handleItemsChange(activity.name, e.target.value)}
              />
            </div>
          )}
          {showInfo === activity.name && (
            <div className="alert alert-info mt-2">
              <strong>Allowed Items:</strong>
              <ul>
                {allowedItems[activity.name]?.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowInfo(null)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      ))}
      <button className="btn btn-primary w-100 mb-4" onClick={handleSubmit}>
        Submit
      </button>

      <h4>Previous Days</h4>
      <div className="accordion">
        {userData?.entries?.map((entry, index) => (
          <div key={index} className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse${index}`}
              >
                {entry.date}
              </button>
            </h2>
            <div id={`collapse${index}`} className="accordion-collapse collapse">
              <div className="accordion-body">
                {Object.keys(entry)
                  .filter((key) => key !== 'date')
                  .map((activity) => (
                    <div key={activity}>
                      <p>
                        <strong>{activity}:</strong>{' '}
                        {entry[activity].checked ? 'Checked' : 'Not checked'}
                      </p>
                      {entry[activity].timestamp && (
                        <p>Timestamp: {entry[activity].timestamp}</p>
                      )}
                      {entry[activity].notes && (
                        <p>Notes: {entry[activity].notes}</p>
                      )}
                      {entry[activity].items && (
                        <p>Items: {entry[activity].items}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
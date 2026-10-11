import { useEffect, useState } from 'react';
import api from '../services/api';
import Alert from '../components/Alert';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setStats(res.data))
      .catch(() => setError('Could not load the dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="center-text">Loading dashboard...</p>;

  const cards = stats
    ? [
        { label: 'Total Artifacts', value: stats.total_artifacts },
        { label: 'Total Exhibits', value: stats.total_exhibits },
        { label: 'Pending Loan Requests', value: stats.pending_loans },
      ]
    : [];

  return (
    <div>
      <h2>Dashboard</h2>
      <Alert message={error} />
      <div className="stat-grid">
        {cards.map((card) => (
          <div className="card stat-card" key={card.label}>
            <p className="muted">{card.label}</p>
            <p className="stat-value">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
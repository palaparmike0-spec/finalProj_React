import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Pagination from '../components/Pagination';

const STATUSES = ['pending', 'approved', 'rejected', 'returned'];

const ACTION_LABELS = {
  approved: 'Approve request',
  rejected: 'Reject request',
  returned: 'Mark as returned',
};

export default function LoanRequests() {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const [loans, setLoans] = useState([]);
  const [meta, setMeta] = useState(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');

  const [action, setAction] = useState(null); // { loan, status }
  const [remarks, setRemarks] = useState('');
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    api
      .get('/loan-requests', { params: { status, page } })
      .then((res) => {
        if (cancelled) return;
        setLoans(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => !cancelled && setError('Could not load loan requests.'))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [status, page, reload]);

  const openAction = (loan, newStatus) => {
    setAction({ loan, status: newStatus });
    setRemarks('');
    setModalError('');
  };

  const closeAction = () => {
    setAction(null);
    setModalError('');
  };

  const submitAction = async () => {
    setSaving(true);
    setModalError('');
    try {
      await api.patch(`/loan-requests/${action.loan.id}/status`, {
        status: action.status,
        admin_remarks: remarks || null,
      });
      setSuccess(`Request marked as ${action.status}.`);
      setAction(null);
      setReload((r) => r + 1);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Could not update the request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>{isAdmin ? 'Loan Requests' : 'My Loan Requests'}</h2>
        {!isAdmin && (
          <Link to="/loan-requests/new" className="btn btn-primary">
            + New Request
          </Link>
        )}
      </div>

      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert message={error} onClose={() => setError('')} />

      <div className="toolbar">
        <select
          className="input"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="center-text">Loading loan requests...</p>
      ) : loans.length === 0 ? (
        <div className="card center-text">No loan requests found.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Artifact</th>
                {isAdmin && <th>Requested by</th>}
                <th>Purpose</th>
                <th>Needed</th>
                <th>Return</th>
                <th>Status</th>
                <th>Remarks</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loans.map((l) => (
                <tr key={l.id}>
                  <td>{l.artifact?.name}</td>
                  {isAdmin && <td>{l.user?.name}</td>}
                  <td>{l.purpose}</td>
                  <td>{l.date_needed?.slice(0, 10)}</td>
                  <td>{l.return_date?.slice(0, 10)}</td>
                  <td>
                    <span className={`status status-${l.status}`}>{l.status}</span>
                  </td>
                  <td>{l.admin_remarks || '-'}</td>
                  {isAdmin && (
                    <td className="actions">
                      {l.status === 'pending' && (
                        <>
                          <button className="btn btn-secondary" onClick={() => openAction(l, 'approved')}>
                            Approve
                          </button>
                          <button className="btn btn-danger" onClick={() => openAction(l, 'rejected')}>
                            Reject
                          </button>
                        </>
                      )}
                      {l.status === 'approved' && (
                        <button className="btn btn-secondary" onClick={() => openAction(l, 'returned')}>
                          Mark Returned
                        </button>
                      )}
                      {(l.status === 'rejected' || l.status === 'returned') && '-'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={setPage} />

      {action && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{ACTION_LABELS[action.status]}</h3>
            <p className="muted">
              {action.loan.artifact?.name} requested by {action.loan.user?.name}
            </p>
            <Alert message={modalError} />
            <div className="form-group">
              <label htmlFor="remarks">Remarks (optional)</label>
              <textarea
                id="remarks"
                rows="3"
                className="input"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <Button variant="secondary" type="button" onClick={closeAction}>
                Cancel
              </Button>
              <Button type="button" loading={saving} onClick={submitAction}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
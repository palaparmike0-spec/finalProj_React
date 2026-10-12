import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

export default function Exhibits() {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const [exhibits, setExhibits] = useState([]);
  const [meta, setMeta] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    api
      .get('/exhibits', { params: { search, page } })
      .then((res) => {
        if (cancelled) return;
        setExhibits(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => !cancelled && setError('Could not load exhibits.'))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [search, page, reload]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/exhibits/${deleteTarget.id}`);
      setSuccess(`"${deleteTarget.title}" was deleted.`);
      setDeleteTarget(null);
      if (exhibits.length === 1 && page > 1) setPage(page - 1);
      else setReload((r) => r + 1);
    } catch {
      setError('Could not delete the exhibit.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d) => (d ? d.slice(0, 10) : 'Open-ended');

  return (
    <div>
      <div className="page-header">
        <h2>Exhibits</h2>
        <Link to="/exhibits/new" className="btn btn-primary">
          + Add Exhibit
        </Link>
      </div>

      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert message={error} onClose={() => setError('')} />

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search by title..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="center-text">Loading exhibits...</p>
      ) : exhibits.length === 0 ? (
        <div className="card center-text">No exhibits found.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Start</th>
                <th>End</th>
                <th>Artifacts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exhibits.map((ex) => (
                <tr key={ex.id}>
                  <td>{ex.title}</td>
                  <td>{ex.location}</td>
                  <td>{formatDate(ex.start_date)}</td>
                  <td>{formatDate(ex.end_date)}</td>
                  <td>
                    {ex.artifacts?.length
                      ? `${ex.artifacts.length}: ${ex.artifacts.map((a) => a.name).join(', ')}`
                      : '-'}
                  </td>
                  <td className="actions">
                    <Link to={`/exhibits/${ex.id}/edit`} className="btn btn-secondary">Edit</Link>
                    {isAdmin && (
                      <button className="btn btn-danger" onClick={() => setDeleteTarget(ex)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={setPage} />

      <Modal
        open={!!deleteTarget}
        title="Delete exhibit?"
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      >
        Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? The artifacts themselves are not deleted.
      </Modal>
    </div>
  );
}

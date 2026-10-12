import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

const CATEGORIES = [
  'Textile', 'Religious', 'Ceramics', 'Tools', 'Maritime', 'Photographs',
  'Musical Instruments', 'Documents', 'Architecture', 'Currency', 'Historical Objects',
];

export default function Artifacts() {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const [artifacts, setArtifacts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Wait 400ms after typing stops before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load artifacts whenever search, category, or page changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    api
      .get('/artifacts', { params: { search, category, page } })
      .then((res) => {
        if (cancelled) return;
        setArtifacts(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => !cancelled && setError('Could not load artifacts.'))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [search, category, page]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/artifacts/${deleteTarget.id}`);
      setSuccess(`"${deleteTarget.name}" was deleted.`);
      setDeleteTarget(null);
      // If we deleted the last item on this page, go back one page
      if (artifacts.length === 1 && page > 1) setPage(page - 1);
      else setPage((p) => p); // triggers nothing; refetch below
      const res = await api.get('/artifacts', { params: { search, category, page: artifacts.length === 1 && page > 1 ? page - 1 : page } });
      setArtifacts(res.data.data);
      setMeta(res.data.meta);
    } catch {
      setError('Could not delete the artifact.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Artifacts</h2>
        {isAdmin && (
          <Link to="/artifacts/new" className="btn btn-primary">
            + Add Artifact
          </Link>
        )}
      </div>

      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert message={error} onClose={() => setError('')} />

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select
          className="input"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="center-text">Loading artifacts...</p>
      ) : artifacts.length === 0 ? (
        <div className="card center-text">No artifacts found.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Origin</th>
                <th>Exhibits</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {artifacts.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.category}</td>
                  <td>{a.condition}</td>
                  <td>{a.origin || '-'}</td>
                  <td>{a.exhibits?.length ? a.exhibits.map((e) => e.title).join(', ') : '-'}</td>
                  {isAdmin && (
                    <td className="actions">
                      <Link to={`/artifacts/${a.id}/edit`} className="btn btn-secondary">Edit</Link>
                      <button className="btn btn-danger" onClick={() => setDeleteTarget(a)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={setPage} />

      <Modal
        open={!!deleteTarget}
        title="Delete artifact?"
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      >
        Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
      </Modal>
    </div>
  );
}
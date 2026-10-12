import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

export default function Users() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      .get('/users', { params: { search, page } })
      .then((res) => {
        if (cancelled) return;
        setUsers(res.data.data);
        // Laravel's plain paginator puts the page info at the top level
        setMeta({ current_page: res.data.current_page, last_page: res.data.last_page });
      })
      .catch(() => !cancelled && setError('Could not load users.'))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [search, page, reload]);

  const changeRole = async (u, role) => {
    setError('');
    try {
      await api.put(`/users/${u.id}`, { role });
      setSuccess(`${u.name} is now ${role}.`);
      setReload((r) => r + 1);
    } catch {
      setError('Could not change the role.');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      setSuccess(`${deleteTarget.name} was deleted.`);
      setDeleteTarget(null);
      if (users.length === 1 && page > 1) setPage(page - 1);
      else setReload((r) => r + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the user.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Users</h2>
      </div>

      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert message={error} onClose={() => setError('')} />

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="center-text">Loading users...</p>
      ) : users.length === 0 ? (
        <div className="card center-text">No users found.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id}>
                    <td>{u.name} {isSelf && <span className="muted">(you)</span>}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className="input"
                        value={u.role}
                        disabled={isSelf}
                        onChange={(e) => changeRole(u, e.target.value)}
                      >
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                    </td>
                    <td className="actions">
                      {!isSelf && (
                        <button className="btn btn-danger" onClick={() => setDeleteTarget(u)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={setPage} />

      <Modal
        open={!!deleteTarget}
        title="Delete user?"
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      >
        Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? Their loan requests will also be removed.
      </Modal>
    </div>
  );
}
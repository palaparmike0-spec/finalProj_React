import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';

const EMPTY = {
  title: '',
  location: '',
  start_date: '',
  end_date: '',
  description: '',
};

export default function ExhibitForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState([]);
  const [allArtifacts, setAllArtifacts] = useState([]);
  const [pickerSearch, setPickerSearch] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const requests = [api.get('/artifacts', { params: { all: 1 } })];
    if (isEdit) requests.push(api.get(`/exhibits/${id}`));

    Promise.all(requests)
      .then(([artifactsRes, exhibitRes]) => {
        setAllArtifacts(artifactsRes.data.data);
        if (exhibitRes) {
          const ex = exhibitRes.data.data;
          setForm({
            title: ex.title || '',
            location: ex.location || '',
            start_date: ex.start_date ? ex.start_date.slice(0, 10) : '',
            end_date: ex.end_date ? ex.end_date.slice(0, 10) : '',
            description: ex.description || '',
          });
          setSelected((ex.artifacts || []).map((a) => a.id));
        }
      })
      .catch(() => setMessage('Could not load the form data.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleArtifact = (artifactId) => {
    setSelected((prev) =>
      prev.includes(artifactId) ? prev.filter((x) => x !== artifactId) : [...prev, artifactId]
    );
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.location.trim()) errs.location = 'Location is required.';
    if (!form.start_date) errs.start_date = 'Start date is required.';
    if (form.end_date && form.start_date && form.end_date < form.start_date) {
      errs.end_date = 'End date cannot be before the start date.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const clientErrors = validate();
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    const payload = { ...form, end_date: form.end_date || null, artifact_ids: selected };

    setSubmitting(true);
    try {
      if (isEdit) await api.put(`/exhibits/${id}`, payload);
      else await api.post('/exhibits', payload);

      navigate('/exhibits', {
        state: { message: isEdit ? 'Exhibit updated successfully.' : 'Exhibit added successfully.' },
      });
    } catch (err) {
      if (err.response?.status === 422) {
        const serverErrors = err.response.data.errors || {};
        const flat = {};
        Object.keys(serverErrors).forEach((key) => (flat[key] = serverErrors[key][0]));
        setErrors(flat);
      } else {
        setMessage('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="center-text">Loading...</p>;

  const visibleArtifacts = allArtifacts.filter((a) =>
    a.name.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  return (
    <div>
      <h2>{isEdit ? 'Edit Exhibit' : 'Add Exhibit'}</h2>
      <form className="card form-card" onSubmit={handleSubmit} noValidate>
        <Alert message={message} onClose={() => setMessage('')} />

        <FormInput label="Title" name="title" value={form.title} onChange={handleChange} error={errors.title} />
        <FormInput label="Location" name="location" value={form.location} onChange={handleChange} error={errors.location} />
        <FormInput label="Start date" name="start_date" type="date" value={form.start_date} onChange={handleChange} error={errors.start_date} />
        <FormInput label="End date (optional)" name="end_date" type="date" value={form.end_date} onChange={handleChange} error={errors.end_date} />

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="form-group">
          <label>Artifacts in this exhibit ({selected.length} selected)</label>
          <input
            className="input"
            placeholder="Filter artifacts..."
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
          />
          <div className="picker">
            {visibleArtifacts.length === 0 ? (
              <p className="muted">No artifacts match.</p>
            ) : (
              visibleArtifacts.map((a) => (
                <label key={a.id} className="picker-item">
                  <input
                    type="checkbox"
                    checked={selected.includes(a.id)}
                    onChange={() => toggleArtifact(a.id)}
                  />
                  <span>{a.name} <span className="muted">({a.category})</span></span>
                </label>
              ))
            )}
          </div>
          {errors.artifact_ids && <p className="error-text">{errors.artifact_ids}</p>}
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={() => navigate('/exhibits')}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save Changes' : 'Add Exhibit'}
          </Button>
        </div>
      </form>
    </div>
  );
}
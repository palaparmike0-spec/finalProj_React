import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';

const CATEGORIES = [
  'Textile', 'Religious', 'Ceramics', 'Tools', 'Maritime', 'Photographs',
  'Musical Instruments', 'Documents', 'Architecture', 'Currency', 'Historical Objects',
];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'];

const EMPTY = {
  name: '',
  category: '',
  condition: '',
  origin: '',
  acquisition_date: '',
  description: '',
};

export default function ArtifactForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  // In edit mode, load the existing artifact
  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/artifacts/${id}`)
      .then((res) => {
        const a = res.data.data;
        setForm({
          name: a.name || '',
          category: a.category || '',
          condition: a.condition || '',
          origin: a.origin || '',
          acquisition_date: a.acquisition_date ? a.acquisition_date.slice(0, 10) : '',
          description: a.description || '',
        });
      })
      .catch(() => setMessage('Could not load this artifact.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.category.trim()) errs.category = 'Category is required.';
    if (!form.condition) errs.condition = 'Please select a condition.';
    if (form.acquisition_date && new Date(form.acquisition_date) > new Date()) {
      errs.acquisition_date = 'Acquisition date cannot be in the future.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const clientErrors = validate();
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setSubmitting(true);
    try {
      if (isEdit) await api.put(`/artifacts/${id}`, form);
      else await api.post('/artifacts', form);

      navigate('/artifacts', {
        state: { message: isEdit ? 'Artifact updated successfully.' : 'Artifact added successfully.' },
      });
    } catch (err) {
      if (err.response?.status === 422) {
        const serverErrors = err.response.data.errors || {};
        const flat = {};
        Object.keys(serverErrors).forEach((key) => (flat[key] = serverErrors[key][0]));
        setErrors(flat);
      } else if (err.response?.status === 403) {
        setMessage('You do not have permission to do this.');
      } else {
        setMessage('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="center-text">Loading...</p>;

  return (
    <div>
      <h2>{isEdit ? 'Edit Artifact' : 'Add Artifact'}</h2>
      <form className="card form-card" onSubmit={handleSubmit} noValidate>
        <Alert message={message} onClose={() => setMessage('')} />

        <FormInput label="Name" name="name" value={form.name} onChange={handleChange} error={errors.name} />

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            name="category"
            list="category-list"
            value={form.category}
            onChange={handleChange}
            className={errors.category ? 'input input-error' : 'input'}
          />
          <datalist id="category-list">
            {CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {errors.category && <p className="error-text">{errors.category}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="condition">Condition</label>
          <select
            id="condition"
            name="condition"
            value={form.condition}
            onChange={handleChange}
            className={errors.condition ? 'input input-error' : 'input'}
          >
            <option value="">Select condition</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.condition && <p className="error-text">{errors.condition}</p>}
        </div>

        <FormInput label="Origin" name="origin" value={form.origin} onChange={handleChange} error={errors.origin} />
        <FormInput label="Acquisition date" name="acquisition_date" type="date" value={form.acquisition_date} onChange={handleChange} error={errors.acquisition_date} />

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            className={errors.description ? 'input input-error' : 'input'}
          />
          {errors.description && <p className="error-text">{errors.description}</p>}
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={() => navigate('/artifacts')}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save Changes' : 'Add Artifact'}
          </Button>
        </div>
      </form>
    </div>
  );
}
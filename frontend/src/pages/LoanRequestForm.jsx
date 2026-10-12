import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';

const EMPTY = {
  artifact_id: '',
  purpose: '',
  date_needed: '',
  return_date: '',
};

export default function LoanRequestForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [artifacts, setArtifacts] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/artifacts', { params: { all: 1 } })
      .then((res) => setArtifacts(res.data.data))
      .catch(() => setMessage('Could not load the artifact list.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const today = new Date().toISOString().slice(0, 10);

  const validate = () => {
    const errs = {};
    if (!form.artifact_id) errs.artifact_id = 'Please select an artifact.';
    if (!form.purpose.trim()) errs.purpose = 'Purpose is required.';
    if (!form.date_needed) errs.date_needed = 'Date needed is required.';
    else if (form.date_needed < today) errs.date_needed = 'Date needed cannot be in the past.';
    if (!form.return_date) errs.return_date = 'Return date is required.';
    else if (form.date_needed && form.return_date <= form.date_needed) {
      errs.return_date = 'Return date must be after the date needed.';
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
      await api.post('/loan-requests', form);
      navigate('/loan-requests', { state: { message: 'Loan request submitted successfully.' } });
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

  return (
    <div>
      <h2>New Loan Request</h2>
      <form className="card form-card" onSubmit={handleSubmit} noValidate>
        <Alert message={message} onClose={() => setMessage('')} />

        <div className="form-group">
          <label htmlFor="artifact_id">Artifact</label>
          <select
            id="artifact_id"
            name="artifact_id"
            value={form.artifact_id}
            onChange={handleChange}
            className={errors.artifact_id ? 'input input-error' : 'input'}
          >
            <option value="">Select an artifact</option>
            {artifacts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.category})
              </option>
            ))}
          </select>
          {errors.artifact_id && <p className="error-text">{errors.artifact_id}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="purpose">Purpose</label>
          <textarea
            id="purpose"
            name="purpose"
            rows="3"
            value={form.purpose}
            onChange={handleChange}
            className={errors.purpose ? 'input input-error' : 'input'}
          />
          {errors.purpose && <p className="error-text">{errors.purpose}</p>}
        </div>

        <FormInput label="Date needed" name="date_needed" type="date" value={form.date_needed} onChange={handleChange} error={errors.date_needed} />
        <FormInput label="Return date" name="return_date" type="date" value={form.return_date} onChange={handleChange} error={errors.return_date} />

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={() => navigate('/loan-requests')}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  );
}
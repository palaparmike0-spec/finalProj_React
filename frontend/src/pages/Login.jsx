import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.password) errs.password = 'Password is required.';
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
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 422) {
        const serverErrors = err.response.data.errors || {};
        setErrors({
          email: serverErrors.email?.[0],
          password: serverErrors.password?.[0],
        });
      } else {
        setMessage('Cannot reach the server. Make sure the API is running.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit} noValidate>
        <h2>Museum System</h2>
        <p className="muted">Sign in to continue</p>
        <Alert message={message} onClose={() => setMessage('')} />
        <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
        <FormInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} />
        <Button type="submit" loading={submitting}>Login</Button>
        <p className="muted center-text">
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
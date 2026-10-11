import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (form.password !== form.password_confirmation) errs.password_confirmation = 'Passwords do not match.';
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
      await register(form);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 422) {
        const serverErrors = err.response.data.errors || {};
        const flat = {};
        Object.keys(serverErrors).forEach((key) => (flat[key] = serverErrors[key][0]));
        setErrors(flat);
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
        <h2>Create Account</h2>
        <p className="muted">New accounts are created as Museum Staff</p>
        <Alert message={message} onClose={() => setMessage('')} />
        <FormInput label="Full name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
        <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
        <FormInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} />
        <FormInput label="Confirm password" name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} error={errors.password_confirmation} />
        <Button type="submit" loading={submitting}>Register</Button>
        <p className="muted center-text">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Artifacts from './pages/Artifacts';
import ArtifactForm from './pages/ArtifactForm';
import Exhibits from './pages/Exhibits';
import ExhibitForm from './pages/ExhibitForm';
import LoanRequests from './pages/LoanRequests';
import LoanRequestForm from './pages/LoanRequestForm';
import Users from './pages/Users';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Logged-in users (admin and staff) */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/artifacts" element={<Artifacts />} />
        <Route path="/exhibits" element={<Exhibits />} />
        <Route path="/exhibits/new" element={<ExhibitForm />} />
        <Route path="/exhibits/:id/edit" element={<ExhibitForm />} />
        <Route path="/loan-requests" element={<LoanRequests />} />
        <Route path="/loan-requests/new" element={<LoanRequestForm />} />

        {/* Admin only */}
        <Route path="/artifacts/new" element={<AdminRoute><ArtifactForm /></AdminRoute>} />
        <Route path="/artifacts/:id/edit" element={<AdminRoute><ArtifactForm /></AdminRoute>} />
        <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
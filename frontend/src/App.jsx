import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Artifacts from './pages/Artifacts';
import ArtifactForm from './pages/ArtifactForm';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Logged-in users */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/artifacts" element={<Artifacts />} />

        {/* Admin only */}
        <Route path="/artifacts/new" element={<AdminRoute><ArtifactForm /></AdminRoute>} />
        <Route path="/artifacts/:id/edit" element={<AdminRoute><ArtifactForm /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
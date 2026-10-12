import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Tubigon Museum</div>
      <button className="navbar-toggle" onClick={() => setOpen(!open)}>
        Menu
      </button>
      <div className={open ? 'navbar-links open' : 'navbar-links'} onClick={() => setOpen(false)}>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/artifacts">Artifacts</NavLink>
        {/* More links are added in the next steps:
            Artifacts, Exhibits, Loan Requests, and Users (admin only) */}
        {isAdmin && <span className="badge">Admin</span>}
        <span className="navbar-user">{user?.name}</span>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
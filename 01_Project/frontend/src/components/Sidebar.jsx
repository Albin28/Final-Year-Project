import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, LogOut, Users, Receipt } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);

  const sidebarStyle = {
    width: '260px',
    backgroundColor: 'var(--primary-color)',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    zIndex: 10
  };

  const headerStyle = {
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  };

  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '0.875rem 1.5rem',
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontSize: '14px'
  };

  const activeStyle = {
    ...linkStyle,
    backgroundColor: 'rgba(0,0,0,0.15)',
    color: '#ffffff',
    borderLeft: '4px solid #ffffff',
    paddingLeft: 'calc(1.5rem - 4px)'
  };

  const iconStyle = {
    marginRight: '0.875rem',
    opacity: 0.9
  };

  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>
        <div style={{ width: '32px', height: '32px', backgroundColor: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.2rem' }}>N</span>
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff', margin: 0, letterSpacing: '0.5px' }}>
          Nexus<span style={{ fontWeight: '400', opacity: 0.8 }}>ERP</span>
        </h1>
      </div>
      
      <div style={{ padding: '1rem 0', flex: 1 }}>
        <div style={{ padding: '0 1.5rem 0.5rem', fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: '600', letterSpacing: '1px' }}>
          Applications
        </div>
        <NavLink to="/" style={({isActive}) => isActive ? activeStyle : linkStyle} end>
          <LayoutDashboard size={18} style={iconStyle} /> Dashboard
        </NavLink>
        <NavLink to="/inventory" style={({isActive}) => isActive ? activeStyle : linkStyle}>
          <Package size={18} style={iconStyle} /> Inventory
        </NavLink>
        <NavLink to="/pos" style={({isActive}) => isActive ? activeStyle : linkStyle}>
          <Receipt size={18} style={iconStyle} /> Point Of Sale
        </NavLink>
        <NavLink to="/po" style={({isActive}) => isActive ? activeStyle : linkStyle}>
          <Package size={18} style={iconStyle} /> Purchase Orders
        </NavLink>
        <NavLink to="/analytics" style={({isActive}) => isActive ? activeStyle : linkStyle}>
          <LayoutDashboard size={18} style={iconStyle} /> Financial Analytics
        </NavLink>
        <NavLink to="/accounts" style={({isActive}) => isActive ? activeStyle : linkStyle}>
          <Users size={18} style={iconStyle} /> Accounts (Demo)
        </NavLink>
      </div>

      <div style={{ padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={logout} style={{ ...linkStyle, width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <LogOut size={18} style={iconStyle} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

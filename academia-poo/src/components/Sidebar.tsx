import React from 'react';
import { PageName, Usuario } from '../types';

const items: { page: PageName; icon: string; label: string }[] = [
  { page: 'dashboard',    icon: 'ti-layout-dashboard', label: 'Dashboard' },
  { page: 'academias',    icon: 'ti-building',          label: 'Academias' },
  { page: 'alunos',       icon: 'ti-users',             label: 'Alunos' },
  { page: 'instrutores',  icon: 'ti-user-star',         label: 'Instrutores' },
  { page: 'treinos',      icon: 'ti-clipboard-list',    label: 'Treinos' },
  { page: 'exercicios',   icon: 'ti-barbell',           label: 'Exercícios' },
  { page: 'mensalidades', icon: 'ti-receipt',           label: 'Mensalidades' },
];

interface Props {
  current: PageName;
  onNavigate: (p: PageName) => void;
  usuario: Usuario;
  onLogout: () => void;
}

export const Sidebar: React.FC<Props> = ({ current, onNavigate, usuario, onLogout }) => (
  <div className="sidebar">
    <div className="sidebar-logo">
      <h1><i className="ti ti-barbell" style={{ color: '#7F77DD' }} /> FitLife</h1>
      <p>Sistema de Academia</p>
    </div>

    {usuario.academiaId && (
      <div className="sidebar-academia-badge">
        <i className="ti ti-building" />
        Academia #{usuario.academiaId}
      </div>
    )}

    <span className="nav-section">Geral</span>
    <div className={`nav-item ${current === 'dashboard' ? 'active' : ''}`} onClick={() => onNavigate('dashboard')}>
      <i className="ti ti-layout-dashboard" /> Dashboard
    </div>

    <span className="nav-section">Cadastros</span>
    {items.slice(1).map(item => (
      <div key={item.page} className={`nav-item ${current === item.page ? 'active' : ''}`} onClick={() => onNavigate(item.page)}>
        <i className={`ti ${item.icon}`} /> {item.label}
      </div>
    ))}

    <div className="sidebar-footer">
      <div className="sidebar-user">
        <div className={`avatar av-purple`} style={{ width: 28, height: 28, fontSize: 10 }}>
          {usuario.nome.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{usuario.nome}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{usuario.empresaNome ?? 'Sistema'}</div>
        </div>
        <button onClick={onLogout} title="Sair" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', fontSize: 16, padding: 2 }}>
          <i className="ti ti-logout" />
        </button>
      </div>
    </div>
  </div>
);

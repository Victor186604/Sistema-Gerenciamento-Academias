import React from 'react';
import { ToastType } from '../hooks/useToast';

export const initials = (nome: string) =>
  nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const avatarColors = ['av-purple', 'av-blue', 'av-teal', 'av-coral'];
export const avatarColor = (nome: string) => avatarColors[nome.charCodeAt(0) % 4];

export const Avatar: React.FC<{ nome: string; size?: number }> = ({ nome, size = 32 }) => (
  <div className={`avatar ${avatarColor(nome)}`} style={{ width: size, height: size, fontSize: size * 0.34 }}>
    {initials(nome)}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'default' | 'danger'; size?: 'sm' }> = ({
  variant = 'default', size, className = '', children, ...props
}) => (
  <button className={`btn ${variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'btn-danger' : ''} ${size === 'sm' ? 'btn-sm' : ''} ${className}`} {...props}>
    {children}
  </button>
);

export const IconBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'edit' | 'del' }> = ({
  variant = 'edit', children, ...props
}) => (
  <button className={`icon-btn ${variant}`} {...props}>{children}</button>
);

export const Modal: React.FC<{ title: React.ReactNode; onClose: () => void; children: React.ReactNode; size?: 'sm' | 'md' }> = ({ title, onClose, children, size = 'md' }) => (
  <div className="modal-wrap" onClick={e => { if ((e.target as HTMLElement).classList.contains('modal-wrap')) onClose(); }}>
    <div className={`modal modal-${size}`}>
      <div className="modal-title">{title}</div>
      {children}
    </div>
  </div>
);

export const ConfirmModal: React.FC<{ message: string; onConfirm: () => void; onCancel: () => void }> = ({ message, onConfirm, onCancel }) => (
  <div className="modal-wrap" onClick={e => { if ((e.target as HTMLElement).classList.contains('modal-wrap')) onCancel(); }}>
    <div className="modal modal-sm">
      <div className="modal-title"><i className="ti ti-alert-triangle" style={{ color: '#e65100' }} /> Confirmar exclusão</div>
      <p style={{ fontSize: 13, color: '#555', marginBottom: '1.25rem', lineHeight: 1.5 }}>{message}</p>
      <div className="modal-footer">
        <Button onClick={onCancel}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm}><i className="ti ti-trash" /> Excluir</Button>
      </div>
    </div>
  </div>
);

export const ModalFooter: React.FC<{ onClose: () => void; onSave: () => void; saveLabel?: string }> = ({ onClose, onSave, saveLabel = 'Salvar' }) => (
  <div className="modal-footer">
    <Button onClick={onClose}>Cancelar</Button>
    <Button variant="primary" onClick={onSave}>{saveLabel}</Button>
  </div>
);

export const FormGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="form-group">
    <label>{label}</label>
    {children}
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`card ${className}`}>{children}</div>
);

export const CardHeader: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <div className="card-header">
    <h3>{title}</h3>
    {action}
  </div>
);

export const SearchBar: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <div className="search-wrap">
    <i className="ti ti-search" />
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'Buscar...'} />
  </div>
);

export const EmptyState: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <div className="empty-state">
    <i className={`ti ti-${icon}`} />
    {label}
  </div>
);

export const ToastContainer: React.FC<{ toasts: { id: number; message: string; type: ToastType }[] }> = ({ toasts }) => (
  <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 300 }}>
    {toasts.map(t => (
      <div key={t.id} className={`toast ${t.type}`}>
        <i className={`ti ti-${t.type === 'success' ? 'check' : 'alert-triangle'}`} />
        {t.message}
      </div>
    ))}
  </div>
);

export const PaperBadge: React.FC<{ papel: string }> = ({ papel }) => {
  const map: Record<string, [string, string]> = {
    superadmin: ['bg-red', 'Super Admin'],
    admin:      ['bg-purple', 'Admin'],
    operador:   ['bg-blue', 'Operador'],
  };
  const [cls, label] = map[papel] ?? ['bg-gray', papel];
  return <span className={`badge ${cls}`}>{label}</span>;
};

export const PlanoBadge: React.FC<{ plano: string }> = ({ plano }) => {
  const map: Record<string, [string, string]> = {
    basic:      ['bg-gray', 'Basic'],
    pro:        ['bg-blue', 'Pro'],
    enterprise: ['bg-purple', 'Enterprise'],
  };
  const [cls, label] = map[plano] ?? ['bg-gray', plano];
  return <span className={`badge ${cls}`}>{label}</span>;
};

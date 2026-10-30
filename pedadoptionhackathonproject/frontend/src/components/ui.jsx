import React, { useEffect } from 'react';
import Icon from './Icon.jsx';

export function Button({ variant = 'primary', size = 'md', icon, loading, children, className = '', ...rest }) {
  return (
    <button className={`btn btn-${variant} btn-${size} ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading ? <span className="spinner" /> : icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

const STATUS_TONE = {
  PENDING: 'warn', UNDER_REVIEW: 'info', APPROVED: 'success', REJECTED: 'danger',
  REPORTED: 'warn', DISPATCHED: 'info', RESCUED: 'success', TREATED: 'success',
  SUCCESS: 'success', FAILED: 'danger', IN_PROGRESS: 'info', PASSED: 'success', NOT_STARTED: 'neutral',
};
export const StatusBadge = ({ status }) => (
  <Badge tone={STATUS_TONE[status] || 'neutral'}>{String(status || '').replace(/_/g, ' ')}</Badge>
);

export function Modal({ title, subtitle, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p className="muted">{subtitle}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export const Field = ({ label, children, hint }) => (
  <label className="field">
    <span className="field-label">{label}</span>
    {children}
    {hint && <span className="field-hint">{hint}</span>}
  </label>
);

export const Empty = ({ icon = 'paw', title, children }) => (
  <div className="empty">
    <div className="empty-icon"><Icon name={icon} size={26} /></div>
    <h3>{title}</h3>
    {children && <p className="muted">{children}</p>}
  </div>
);

export const StatCard = ({ icon, label, value, tone = 'green', sub }) => (
  <div className="stat-card">
    <div className={`stat-icon tone-${tone}`}><Icon name={icon} size={20} /></div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="page-header">
    <div>
      <h1>{title}</h1>
      {subtitle && <p className="muted">{subtitle}</p>}
    </div>
    {actions && <div className="page-actions">{actions}</div>}
  </div>
);

export const Avatar = ({ user, size = 36 }) => (
  <img className="avatar" style={{ width: size, height: size }} src={user?.avatar} alt={user?.name || 'User'}
    onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
);

export function Toasts({ toasts }) {
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`}>
          <Icon name={t.kind === 'error' ? 'alert' : 'check'} size={16} /> {t.message}
        </div>
      ))}
    </div>
  );
}

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const formatMoney = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

import React from 'react';
import { useApp } from '../../context.js';
import { PageHeader, StatCard, StatusBadge, Empty, formatMoney, formatDate } from '../../components/ui.jsx';

export default function DonationsAdmin() {
  const { donations } = useApp();
  const list = [...donations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const paid = donations.filter((d) => d.status === 'SUCCESS');
  const total = paid.reduce((s, d) => s + (d.amount || 0), 0);
  return (
    <>
      <PageHeader title="Donations" subtitle="Only payments confirmed by Razorpay count toward the total." />
      <div className="stat-grid">
        <StatCard icon="rupee" label="Total confirmed" value={formatMoney(total)} tone="orange" />
        <StatCard icon="check" label="Successful payments" value={paid.length} tone="green" />
        <StatCard icon="clock" label="Pending / failed" value={donations.length - paid.length} tone="rose" />
      </div>
      <div className="card">
        {list.length === 0 ? <Empty icon="gift" title="No donations yet" /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Donor</th><th>Amount</th><th>Status</th><th>Payment ID</th><th>Date</th></tr></thead>
              <tbody>
                {list.map((d) => (
                  <tr key={d.id}>
                    <td><strong>{d.donorName}</strong><br /><span className="muted small">{d.donorEmail}</span></td>
                    <td>{formatMoney(d.amount)}</td>
                    <td><StatusBadge status={d.status} /></td>
                    <td className="muted small">{d.razorpayPaymentId || '—'}</td>
                    <td>{formatDate(d.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

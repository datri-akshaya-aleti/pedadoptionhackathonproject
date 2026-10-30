import React, { useState } from 'react';
import { Modal, Field, Button } from './ui.jsx';
import { API_BASE } from '../api.js';

export default function DonateModal({ user, onClose, toast }) {
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [busy, setBusy] = useState(false);
  const final = custom ? parseFloat(custom) : amount;

  const pay = async () => {
    if (!final || final <= 0) return toast('Please enter a valid amount.', 'error');
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/donations/create-order`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: final, donorName: name || 'Anonymous Donor', donorEmail: email || 'donor@example.com' }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error || 'Could not start the payment.');

      const rzp = new window.Razorpay({
        key: order.keyId, amount: order.amount, currency: order.currency,
        name: 'PawsHome Shelter Care', description: 'Pet care & animal rescue support',
        order_id: order.orderId,
        handler: async (r) => {
          const v = await fetch(`${API_BASE}/donations/verify`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ razorpay_order_id: r.razorpay_order_id, razorpay_payment_id: r.razorpay_payment_id, razorpay_signature: r.razorpay_signature }),
          });
          setBusy(false);
          if (!v.ok) return toast('Payment could not be verified. If money was deducted, please contact support.', 'error');
          // Only shown after the backend has verified the payment signature.
          toast(`Thank you! Your donation of ₹${final} was received. A receipt was emailed to ${email || 'you'}.`);
          onClose();
        },
        prefill: { name, email },
        theme: { color: '#2f5d50' },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on('payment.failed', (r) => { toast('Payment failed: ' + r.error.description, 'error'); setBusy(false); });
      rzp.open();
    } catch (err) {
      toast(err.message, 'error');
      setBusy(false);
    }
  };

  return (
    <Modal title="Support shelter care" subtitle="Your gift funds food, vaccinations and rescue operations." onClose={onClose}>
      <div className="form-grid">
        <Field label="Your name"><input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Email for receipt"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      </div>
      <p className="field-label" style={{ marginTop: 16 }}>Amount (₹ INR)</p>
      <div className="amount-row">
        {[250, 500, 1000, 2500].map((a) => (
          <button key={a} type="button" className={`amount ${amount === a && !custom ? 'on' : ''}`} onClick={() => { setAmount(a); setCustom(''); }}>₹{a}</button>
        ))}
      </div>
      <input type="number" min="1" placeholder="Custom amount" value={custom} onChange={(e) => setCustom(e.target.value)} />
      <div style={{ marginTop: 16 }}><Button onClick={pay} loading={busy} icon="heart">Donate ₹{final || 0} with Razorpay</Button></div>
    </Modal>
  );
}

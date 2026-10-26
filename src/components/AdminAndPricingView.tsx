import React, { useState } from 'react';
import {
  Check,
  CreditCard,
  Lock,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface AdminAndPricingViewProps {
  currentUserEmail: string;
  currentUserPlan: string;
  usersList: any[];
  supportTickets: any[];
  paymentsList: any[];
  analyticsEvents: any[];
  onRefreshData: () => void;
  onShowStatus: (msg: string) => void;
}

export const AdminAndPricingView: React.FC<AdminAndPricingViewProps> = ({
  currentUserEmail,
  currentUserPlan,
  usersList,
  supportTickets,
  paymentsList,
  analyticsEvents,
  onRefreshData,
  onShowStatus,
}) => {
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<{
    id: string;
    name: string;
    priceCents: number;
    priceDisplay: string;
  } | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'razorpay'>('stripe');
  const [cardHolderName, setCardHolderName] = useState('Vinay Kumar');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const isAdmin = currentUserEmail.toLowerCase() === 'vinay22y95@gmail.com';

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForCheckout) return;
    setIsProcessingPayment(true);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userUid: 'admin-vinay-uid',
          email: currentUserEmail,
          plan: selectedPlanForCheckout.id,
          amountCents: selectedPlanForCheckout.priceCents,
          currency: 'USD',
          provider: paymentProvider,
        }),
      });
      if (res.ok) {
        onShowStatus(
          `Payment succeeded via ${paymentProvider.toUpperCase()}! Upgraded to ${selectedPlanForCheckout.name}.`
        );
        setSelectedPlanForCheckout(null);
        onRefreshData();
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleUpdateUser = async (uid: string, role: string, plan: string) => {
    await fetch(`/api/admin/users/${uid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, plan }),
    });
    onShowStatus(`Updated user ${uid} to role=${role}, plan=${plan}`);
    onRefreshData();
  };

  const handleToggleTicketStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'open' ? 'resolved' : 'open';
    await fetch(`/api/admin/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    onShowStatus(`Support ticket #${id} marked as ${nextStatus}.`);
    onRefreshData();
  };

  const totalRevenueUsd =
    paymentsList.reduce((acc, p) => acc + (Number(p.amountCents) || 0), 0) / 100;
  const avgAtsAcrossUsers =
    usersList.length > 0
      ? Math.round(
          usersList.reduce((acc, u) => acc + (Number(u.avgAtsScore) || 85), 0) / usersList.length
        )
      : 90;

  return (
    <div className="flex flex-col gap-8">
      {/* PRICING & PAYMENT GATEWAY SECTION */}
      <section className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Plans, Pricing & Secure Payment Gateway
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Unlock all 24 executive templates, unlimited Gemini AI JD scans, multi-language localization, and career coaching.
            </p>
          </div>
          <div className="text-xs text-slate-600">
            Active Account Tier:{' '}
            <strong className="font-mono uppercase text-teal-700">{currentUserPlan}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Tier 1 */}
          <div className="p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">For Individual Job Seekers</div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Free Starter</h3>
              <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 mt-2">
                $0<span className="text-xs font-normal text-slate-500"> / forever</span>
              </div>
              <ul className="mt-4 flex flex-col gap-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />4 Uploaded Reference Templates
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  Real-time ATS Score Diagnostic
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  Standard PDF & DOCX Export
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onShowStatus('Free Starter tier is included by default.')}
              className="mt-6 w-full py-2 px-4 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Included in Workspace
            </button>
          </div>

          {/* Tier 2 */}
          <div className="p-5 rounded-xl border-2 border-teal-600 bg-teal-50/20 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-teal-700">For Active Career Transitions</div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Pro Career Optimizer</h3>
              <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 mt-2">
                $19<span className="text-xs font-normal text-slate-500"> / month</span>
              </div>
              <ul className="mt-4 flex flex-col gap-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  All 24 ATS-Verified Templates
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  Unlimited AI Job Description Scans
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  Built-In AI Cover Letter Generator
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  LinkedIn Experience Sync & DOCX Export
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() =>
                setSelectedPlanForCheckout({
                  id: 'pro',
                  name: 'Pro Career Optimizer',
                  priceCents: 1900,
                  priceDisplay: '$19.00 USD',
                })
              }
              className="mt-6 w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors"
            >
              Upgrade to Pro ($19/mo)
            </button>
          </div>

          {/* Tier 3 */}
          <div className="p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">
                For International & Executive Search
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Executive Global Suite</h3>
              <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 mt-2">
                $49<span className="text-xs font-normal text-slate-500"> / month</span>
              </div>
              <ul className="mt-4 flex flex-col gap-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  Multi-Language CV Parsing (10+ Markets)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  Executive Salary & Interview Coach
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  Priority Specialist Live Chat Support
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() =>
                setSelectedPlanForCheckout({
                  id: 'executive',
                  name: 'Executive Global Suite',
                  priceCents: 4900,
                  priceDisplay: '$49.00 USD',
                })
              }
              className="mt-6 w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              Upgrade to Executive ($49/mo)
            </button>
          </div>
        </div>

        {/* Interactive Payment Gateway Modal / Drawer */}
        {selectedPlanForCheckout && (
          <form
            onSubmit={handleCheckoutSubmit}
            className="mt-6 p-5 rounded-xl border border-slate-300 bg-slate-50 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Secure Checkout — {selectedPlanForCheckout.name} ({selectedPlanForCheckout.priceDisplay})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlanForCheckout(null)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaymentProvider('stripe')}
                className={`px-3 py-1.5 rounded text-xs font-semibold border ${
                  paymentProvider === 'stripe'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Stripe (International Cards)
              </button>
              <button
                type="button"
                onClick={() => setPaymentProvider('razorpay')}
                className={`px-3 py-1.5 rounded text-xs font-semibold border ${
                  paymentProvider === 'razorpay'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Razorpay (UPI / NetBanking / Cards)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cardholder / Account Name
                </label>
                <input
                  type="text"
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Instrument
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isProcessingPayment}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                {isProcessingPayment
                  ? 'Processing Transaction...'
                  : `Authorize ${selectedPlanForCheckout.priceDisplay} via ${paymentProvider.toUpperCase()}`}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ADMIN PANEL SECTION (vinay22y95@gmail.com) */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Admin Management & Analytics Console
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Designated Administrator:{' '}
              <span className="font-mono font-semibold text-slate-900">
                vinay22y95@gmail.com
              </span>{' '}
              · Support Routing:{' '}
              <span className="font-mono font-semibold text-slate-900">
                atsfriendlyresumes.admin@gmail.com
              </span>
              {!isAdmin && ' (Preview Mode Active)'}
            </p>
          </div>
          <button
            type="button"
            onClick={onRefreshData}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            Refresh Telemetry
          </button>
        </div>

        {/* 4-Column KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="text-xs text-slate-500">Total Registered Users</div>
            <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 mt-1">
              {usersList.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Synced in PostgreSQL</div>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="text-xs text-slate-500">Platform Average ATS Score</div>
            <div className="text-2xl font-extrabold font-mono tabular-nums text-teal-600 mt-1">
              {avgAtsAcrossUsers}/100
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Across active resumes</div>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="text-xs text-slate-500">Processed Subscription Volume</div>
            <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 mt-1">
              ${totalRevenueUsd.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {paymentsList.length} verified transactions
            </div>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="text-xs text-slate-500">Support Tickets (atsfriendlyresumes.admin)</div>
            <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 mt-1">
              {supportTickets.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {supportTickets.filter((t) => t.status === 'open').length} open inquiries
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-teal-600" />
            User Management & Subscription Tier Controls
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-2.5 px-3 font-semibold">User Name</th>
                  <th className="py-2.5 px-3 font-semibold">Email</th>
                  <th className="py-2.5 px-3 font-semibold">Role</th>
                  <th className="py-2.5 px-3 font-semibold">Plan Tier</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Resumes</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Avg ATS</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {usersList.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{u.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{u.email}</td>
                    <td className="py-2.5 px-3 capitalize text-slate-700">{u.role}</td>
                    <td className="py-2.5 px-3 uppercase font-mono text-teal-700 font-semibold">
                      {u.plan}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {u.resumesCount}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                      {u.avgAtsScore}%
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <select
                        aria-label={`Change plan for ${u.name}`}
                        value={u.plan}
                        onChange={(e) => handleUpdateUser(u.uid, u.role, e.target.value)}
                        className="border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-800"
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="executive">Executive</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Support Inquiries Inbox & Recent Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Support Inquiries Inbox (atsfriendlyresumes.admin@gmail.com)
            </h3>
            <div className="flex flex-col gap-2.5">
              {supportTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3.5 rounded-lg border border-slate-200 flex flex-col gap-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{ticket.subject}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleTicketStatus(ticket.id, ticket.status)}
                      className={`px-2.5 py-1 rounded font-medium text-[11px] ${
                        ticket.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {ticket.status === 'resolved' ? 'Resolved (Reopen)' : 'Open (Mark Resolved)'}
                    </button>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{ticket.message}</p>
                  <div className="text-[11px] text-slate-400">
                    From: {ticket.name} ({ticket.email}) · Routed to {ticket.recipientEmail}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Recent Platform Telemetry & Export Log
            </h3>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 text-xs">
              {analyticsEvents.slice(0, 6).map((ev) => (
                <div key={ev.id} className="p-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">{ev.eventType}</div>
                    <div className="text-slate-500 text-[11px]">
                      {ev.metadata || 'Workspace Event'} · Template: {ev.templateId || 'nordic-slate'}
                    </div>
                  </div>
                  <div className="font-mono tabular-nums text-right">
                    <span className="font-bold text-teal-700">ATS {ev.atsScore || 92}%</span>
                    <div className="text-[10px] text-slate-400 uppercase">{ev.language || 'en'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

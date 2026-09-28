import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Invoice } from '../../types';
import { X, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  invoice: Invoice;
  onClose: () => void;
}

export const RecordPaymentModal: React.FC<Props> = ({ invoice, onClose }) => {
  const { data, recordPayment, currentUser } = useSchool();

  const student = data.students.find((s) => s.id === invoice.studentId);
  const remainingDue = invoice.totalAmount - (invoice.amountPaid || 0);

  const [amount, setAmount] = useState<number>(remainingDue);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Card' | 'Cheque' | 'Online'>('Bank Transfer');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('Fee installment cleared');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Payment amount must be greater than 0.');
      return;
    }
    if (amount > remainingDue) {
      setError(`Payment cannot exceed the remaining due amount of $${remainingDue}.`);
      return;
    }

    recordPayment({
      invoiceId: invoice.id,
      studentId: invoice.studentId,
      amount,
      paymentDate,
      paymentMethod,
      transactionReference: transactionRef.trim() || `TXN-${Date.now().toString().slice(-6)}`,
      receivedBy: currentUser.name || 'Patricia Sterling',
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Record Fee Payment</h2>
              <p className="text-[11px] text-slate-500">
                Invoice {invoice.invoiceNumber} • {student?.firstName} {student?.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Invoice Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Invoiced</span>
              <div className="text-sm font-bold text-slate-900 font-mono">
                ${invoice.totalAmount.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Already Paid</span>
              <div className="text-sm font-bold text-emerald-700 font-mono">
                ${invoice.amountPaid.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Remaining Due</span>
              <div className="text-sm font-bold text-amber-700 font-mono">
                ${remainingDue.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Input Fields */}
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Payment Amount ($) *</label>
            <input
              type="number"
              min={1}
              max={remainingDue}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-base font-bold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <div className="flex gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setAmount(remainingDue)}
                className="text-[11px] text-blue-600 hover:underline font-bold"
              >
                Pay full balance (${remainingDue})
              </button>
              {remainingDue > 500 && (
                <button
                  type="button"
                  onClick={() => setAmount(Math.round(remainingDue / 2))}
                  className="text-[11px] text-slate-600 hover:underline font-medium"
                >
                  Pay 50% (${Math.round(remainingDue / 2)})
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Credit/Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Online">Online Portal</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-medium">
              Transaction Reference / Receipt Note
            </label>
            <input
              type="text"
              placeholder="e.g. TXN-WIRE-99231 or Check #4401"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-medium">Bursar Remarks</label>
            <input
              type="text"
              placeholder="e.g. Tuition installment received with thanks"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Record & Generate Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

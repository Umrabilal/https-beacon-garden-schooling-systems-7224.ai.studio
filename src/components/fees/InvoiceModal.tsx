import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { FeeItem } from '../../types';
import { X, Plus, Trash2, Receipt, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const InvoiceModal: React.FC<Props> = ({ onClose }) => {
  const { data, createInvoice } = useSchool();

  const [studentId, setStudentId] = useState<string>(data.students[0]?.id || '');
  const [dueDate, setDueDate] = useState<string>('2026-09-30');
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('Fall Term School Fees');
  const [items, setItems] = useState<FeeItem[]>([
    { id: '1', description: 'Fall Term Tuition Fee', amount: 2400 },
    { id: '2', description: 'Science & Computer Lab Fee', amount: 350 },
    { id: '3', description: 'Library & Learning Materials', amount: 150 },
  ]);

  const [error, setError] = useState<string>('');

  const selectedStudent = data.students.find((s) => s.id === studentId);

  const subtotal = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const totalAmount = Math.max(0, subtotal - discount);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), description: 'Transportation / Activities', amount: 200 },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleUpdateItem = (id: string, field: 'description' | 'amount', value: any) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: field === 'amount' ? Number(value) : value } : it))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      setError('Please select a student.');
      return;
    }
    if (items.length === 0 || totalAmount <= 0) {
      setError('Invoice must have at least one valid fee line item.');
      return;
    }

    createInvoice({
      studentId,
      classId: selectedStudent?.classId || data.classes[0].id,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate,
      items,
      subtotal,
      discount,
      totalAmount,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Receipt className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Generate Fee Invoice</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-slate-700">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Student & Due Date Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Billed Student *</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                {data.students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.firstName} {st.lastName} (Roll #{st.rollNumber} - {st.className})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Payment Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Fee Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Itemized Fee Particulars
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Fee Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Fee description (e.g. Tuition Fee)"
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                      $
                    </span>
                    <input
                      type="number"
                      min={0}
                      required
                      value={item.amount}
                      onChange={(e) => handleUpdateItem(item.id, 'amount', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-6 pr-2 py-1.5 text-slate-800 font-mono font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={items.length <= 1}
                    className="p-1.5 rounded text-slate-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotal, Discount & Total Calculation */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Amount:</span>
              <span className="font-mono font-bold text-slate-900">${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">
                Scholarship / Sibling Discount:
              </span>
              <div className="relative w-28">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                  -$
                </span>
                <input
                  type="number"
                  min={0}
                  max={subtotal}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-7 pr-2 py-1 text-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-right font-bold"
                />
              </div>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Invoiced Payable:</span>
              <span className="font-mono text-base text-blue-600 font-black">${totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-600 mb-1">Payment Instructions / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Payable via Bank Transfer or School Accounts counter"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
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
              <Receipt className="w-3.5 h-3.5" />
              <span>Issue Official Invoice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

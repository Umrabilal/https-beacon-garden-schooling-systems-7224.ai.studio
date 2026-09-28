import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { PaymentReceipt } from '../../types';
import { X, Printer, School, CreditCard } from 'lucide-react';

interface Props {
  receipt: PaymentReceipt;
  onClose: () => void;
}

export const ReceiptModal: React.FC<Props> = ({ receipt, onClose }) => {
  const { data } = useSchool();

  const student = data.students.find((s) => s.id === receipt.studentId);
  const invoice = data.invoices.find((i) => i.id === receipt.invoiceId);

  const remainingBalance = invoice
    ? invoice.totalAmount - (invoice.amountPaid || 0)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col print:shadow-none print:rounded-none border border-slate-200">
        {/* Action Top Bar */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm">Official Fee Payment Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Sheet */}
        <div className="p-8 space-y-6 bg-white text-slate-900 print:p-6">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
                <School className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  {data.schoolInfo.name}
                </h1>
                <p className="text-xs text-slate-500">
                  {data.schoolInfo.address} • Tel: {data.schoolInfo.phone}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded uppercase">
                Payment Receipt
              </span>
              <div className="text-xs font-mono font-bold text-slate-800 mt-1">
                {receipt.receiptNumber}
              </div>
              <div className="text-[11px] text-slate-500">Date: {receipt.paymentDate}</div>
            </div>
          </div>

          {/* Student & Invoice Meta */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 uppercase text-[10px] font-bold block">Received From (Student)</span>
              <span className="font-bold text-slate-900 text-sm">
                {student ? `${student.firstName} ${student.lastName}` : 'Student'}
              </span>
              <span className="text-slate-600 block text-[11px] font-mono">
                Roll #{student?.rollNumber} • {student?.className}
              </span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[10px] font-bold block">Invoice Reference</span>
              <span className="font-mono font-bold text-slate-800">
                {invoice ? invoice.invoiceNumber : 'N/A'}
              </span>
              <span className="text-slate-500 block text-[11px]">
                Term: {data.schoolInfo.currentTerm}
              </span>
            </div>
          </div>

          {/* Payment Detail Box */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-700 border-b border-slate-200 flex justify-between">
              <span>Transaction Particulars</span>
              <span>Amount</span>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Payment Channel</span>
                <span className="font-semibold text-slate-900">{receipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Reference / Check No.</span>
                <span className="font-mono font-semibold text-slate-900">
                  {receipt.transactionReference || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Authorized Receiver</span>
                <span className="text-slate-900">{receipt.receivedBy}</span>
              </div>
              {receipt.notes && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Remarks</span>
                  <span className="text-slate-700 italic">{receipt.notes}</span>
                </div>
              )}
            </div>

            {/* Total Cleared Highlight */}
            <div className="bg-green-50 border-t border-green-200 p-4 flex items-center justify-between">
              <div>
                <span className="text-green-800 text-[11px] font-bold uppercase block">
                  Amount Received in Full
                </span>
                <span className="text-xs text-green-700 font-medium">
                  Remaining Invoice Balance: ${remainingBalance.toLocaleString()}
                </span>
              </div>
              <div className="text-3xl font-black text-green-800 font-mono">
                ${receipt.amount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Stamp and Signature */}
          <div className="pt-6 flex justify-between items-end border-t border-slate-200 text-xs">
            <div className="space-y-1">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-600/60 flex items-center justify-center rotate-[-12deg] text-emerald-700 font-bold text-[10px] text-center p-2 uppercase">
                Official School Bursar Paid & Cleared
              </div>
            </div>

            <div className="text-center w-52">
              <div className="h-10 border-b border-dashed border-slate-400 flex items-end justify-center">
                <span className="font-serif italic font-bold text-slate-800">{receipt.receivedBy}</span>
              </div>
              <div className="font-bold text-slate-800 text-xs mt-1">Authorized Signature</div>
              <div className="text-[10px] text-slate-500">Accounts & Bursar Office</div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors shadow-xs"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

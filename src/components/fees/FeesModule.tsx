import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Invoice, PaymentReceipt } from '../../types';
import { ReceiptModal } from './ReceiptModal';
import { RecordPaymentModal } from './RecordPaymentModal';
import { InvoiceModal } from './InvoiceModal';
import {
  CreditCard,
  Receipt,
  Plus,
  DollarSign,
  Download,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export const FeesModule: React.FC<{
  isOpenCreateModal?: boolean;
  onCloseCreateModal?: () => void;
}> = ({ isOpenCreateModal, onCloseCreateModal }) => {
  const { data } = useSchool();

  const [activeTab, setActiveTab] = useState<'invoices' | 'receipts'>('invoices');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(isOpenCreateModal || false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [selectedReceiptForView, setSelectedReceiptForView] = useState<PaymentReceipt | null>(null);

  const invoicesList = Array.isArray(data?.invoices) ? data.invoices : [];
  const receiptsList = Array.isArray(data?.receipts) ? data.receipts : [];
  const studentsList = Array.isArray(data?.students) ? data.students : [];

  // Computed metrics
  const totalBilled = invoicesList.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalCollected = invoicesList.reduce((sum, i) => sum + (i.amountPaid || 0), 0);
  const outstandingBalance = totalBilled - totalCollected;
  const overdueInvoices = invoicesList.filter((i) => i.status === 'Overdue');
  const overdueTotal = overdueInvoices.reduce(
    (sum, i) => sum + (i.totalAmount - (i.amountPaid || 0)),
    0
  );

  // Filter invoices
  const filteredInvoices = invoicesList.filter((inv) => {
    const student = studentsList.find((s) => s.id === inv.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}`.toLowerCase() : '';
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter receipts
  const filteredReceipts = receiptsList.filter((rec) => {
    const student = studentsList.find((s) => s.id === rec.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}`.toLowerCase() : '';
    return (
      rec.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.includes(searchQuery.toLowerCase()) ||
      rec.transactionReference.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleExportFeesCSV = () => {
    const headers = [
      'Invoice Number',
      'Student Name',
      'Class',
      'Issue Date',
      'Due Date',
      'Total Amount',
      'Amount Paid',
      'Balance Due',
      'Status',
    ];
    const rows = filteredInvoices.map((inv) => {
      const student = data.students.find((s) => s.id === inv.studentId);
      const balance = inv.totalAmount - (inv.amountPaid || 0);
      return [
        inv.invoiceNumber,
        `"${student ? `${student.firstName} ${student.lastName}` : 'N/A'}"`,
        student?.className || 'N/A',
        inv.issueDate,
        inv.dueDate,
        inv.totalAmount,
        inv.amountPaid,
        balance,
        inv.status,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fee_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div id="fees-module" className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Fee Billing & Financial Accounts
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Accounts Receivable
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track tuition invoicing, record partial & full payments, and issue official stamped receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportFeesCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Ledger</span>
          </button>
          <button
            onClick={() => setIsCreateInvoiceOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 uppercase font-bold text-[11px]">
            <span>Total Invoiced</span>
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
            ${totalBilled.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {data.invoices.length} issued invoices
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 uppercase font-bold text-[11px]">
            <span>Collected Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono">
            ${totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">
            {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0}% collection rate
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 uppercase font-bold text-[11px]">
            <span>Pending Balance</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 font-mono">
            ${outstandingBalance.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Expected within term cycles</div>
        </div>

        {/* Overdue */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 uppercase font-bold text-[11px]">
            <span>Overdue Arrears</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700 font-mono">
            ${overdueTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-600 mt-1">
            {overdueInvoices.length} invoices require follow-up
          </div>
        </div>
      </div>

      {/* Main Ledger Section with Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Tab & Filter Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  activeTab === 'invoices'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Invoices ({data.invoices.length})
              </button>
              <button
                onClick={() => setActiveTab('receipts')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  activeTab === 'receipts'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Payment Receipts ({data.receipts.length})
              </button>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice #, student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {activeTab === 'invoices' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            )}
          </div>
        </div>

        {/* Invoices Table */}
        {activeTab === 'invoices' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const student = data.students.find((s) => s.id === inv.studentId);
                  const balance = inv.totalAmount - (inv.amountPaid || 0);

                  const statusColors: Record<string, string> = {
                    Paid: 'bg-green-50 text-green-700 border-green-200',
                    Partial: 'bg-blue-50 text-blue-700 border-blue-200',
                    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
                    Overdue: 'bg-rose-50 text-rose-700 border-rose-200',
                  };

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {student ? `${student.firstName} ${student.lastName}` : 'Student'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {student?.className} • Roll #{student?.rollNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{inv.issueDate}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{inv.dueDate}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        ${inv.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">
                        ${(inv.amountPaid || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-700">
                        ${balance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            statusColors[inv.status] || 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {inv.status !== 'Paid' && (
                          <button
                            onClick={() => setSelectedInvoiceForPayment(inv)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
                          >
                            Pay
                          </button>
                        )}
                        {/* If receipts exist, view latest receipt */}
                        {inv.amountPaid > 0 && (
                          <button
                            onClick={() => {
                              const rec = data.receipts.find((r) => r.invoiceId === inv.id);
                              if (rec) setSelectedReceiptForView(rec);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors shadow-xs"
                          >
                            Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Receipts Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Amount Cleared</th>
                  <th className="py-3 px-4">Received By</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceipts.map((rec) => {
                  const student = data.students.find((s) => s.id === rec.studentId);
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        {rec.receiptNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {student ? `${student.firstName} ${student.lastName}` : 'Student'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{rec.paymentDate}</td>
                      <td className="py-3 px-4 text-slate-700">{rec.paymentMethod}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {rec.transactionReference}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                        ${rec.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{rec.receivedBy}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedReceiptForView(rec)}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors flex items-center gap-1 ml-auto shadow-xs"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>Print</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {isCreateInvoiceOpen && (
        <InvoiceModal
          onClose={() => {
            setIsCreateInvoiceOpen(false);
            if (onCloseCreateModal) onCloseCreateModal();
          }}
        />
      )}

      {/* Record Payment Modal */}
      {selectedInvoiceForPayment && (
        <RecordPaymentModal
          invoice={selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
        />
      )}

      {/* View Receipt Modal */}
      {selectedReceiptForView && (
        <ReceiptModal
          receipt={selectedReceiptForView}
          onClose={() => setSelectedReceiptForView(null)}
        />
      )}
    </div>
  );
};

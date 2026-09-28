import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  School,
  Database,
  Download,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const {
    data,
    updateSchoolInfo,
    exportDatabaseJSON,
    importDatabaseJSON,
    resetToInitialData,
  } = useSchool();

  const [name, setName] = useState(data.schoolInfo.name);
  const [tagline, setTagline] = useState(data.schoolInfo.tagline);
  const [address, setAddress] = useState(data.schoolInfo.address);
  const [phone, setPhone] = useState(data.schoolInfo.phone);
  const [email, setEmail] = useState(data.schoolInfo.email);
  const [website, setWebsite] = useState(data.schoolInfo.website);
  const [ownerName, setOwnerName] = useState(data.schoolInfo.ownerName || 'Fazlur Rahman');
  const [principalName, setPrincipalName] = useState(data.schoolInfo.principalName || 'Fazlur Rahman');
  const [academicYear, setAcademicYear] = useState(data.schoolInfo.academicYear);
  const [currentTerm, setCurrentTerm] = useState(data.schoolInfo.currentTerm);
  const [currency, setCurrency] = useState(data.schoolInfo.currency);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolInfo({
      name,
      tagline,
      address,
      phone,
      email,
      website,
      ownerName,
      principalName,
      academicYear,
      currentTerm,
      currency,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const success = importDatabaseJSON(text);
      if (success) {
        setImportStatus('Database successfully restored from JSON file!');
      } else {
        setImportStatus('Failed to parse database file. Invalid schema.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div id="settings-module" className="space-y-6 max-w-5xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              School Configuration & Database Management
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              System Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure institutional profile, academic term cycles, backup offline database or restore from file.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>School institution parameters successfully updated in local store!</span>
        </div>
      )}

      {importStatus && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* School Profile Settings Form */}
      <form onSubmit={handleSaveInfo} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 text-xs text-slate-700 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Institutional Identity & Letterhead</h3>
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save School Profile</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Institution Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Motto / Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Official Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Website</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-600 mb-1 font-medium">Physical Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2 border-t border-slate-200">
          <div>
            <label className="block text-slate-600 mb-1 font-medium">School Owner</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. Fazlur Rahman"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Principal / Headmaster</label>
            <input
              type="text"
              value={principalName}
              onChange={(e) => setPrincipalName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Academic Year</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Current Term</label>
            <input
              type="text"
              value={currentTerm}
              onChange={(e) => setCurrentTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Billing Currency</label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono font-bold"
            />
          </div>
        </div>
      </form>

      {/* Database Management Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-xs text-slate-700 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Database className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900">
            Single-File SQLite Database Backup & Recovery
          </h3>
        </div>

        <p className="text-slate-500 leading-relaxed text-xs">
          The application uses an offline-first storage architecture mirroring single-file SQLite tables
          for Students, Attendance, Grades, Invoices, Receipts, and Timetables.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Backup */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                <Download className="w-4 h-4" />
                <span>Export SQLite Snapshot</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1 leading-normal">
                Save an instant offline JSON database snapshot containing all tables and records.
              </p>
            </div>
            <button
              onClick={exportDatabaseJSON}
              className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 text-blue-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
            >
              Download Backup File
            </button>
          </div>

          {/* Restore */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                <Upload className="w-4 h-4" />
                <span>Restore Database</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1 leading-normal">
                Upload and replace current school data with a previously exported backup file.
              </p>
            </div>
            <label className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 text-blue-700 border border-slate-200 text-xs font-semibold transition-colors text-center cursor-pointer shadow-xs">
              Upload Backup File
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Clean Demo State</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1 leading-normal">
                Restore the sample dataset with 8 students, classes, invoices, and schedules.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset all data to default demo state? Current changes will be overwritten.')) {
                  resetToInitialData();
                }
              }}
              className="w-full py-2 px-3 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

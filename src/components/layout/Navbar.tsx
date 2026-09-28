import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';
import {
  Search,
  Bell,
  Shield,
  GraduationCap,
  Calculator,
  UserCheck,
  Download,
  Database,
  Calendar,
  School,
  X,
  ExternalLink
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    data,
    currentUser,
    setCurrentUserRole,
    globalSearch,
    setGlobalSearch,
    setSelectedStudentId,
    setActiveTab,
    exportDatabaseJSON,
  } = useSchool();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Search matches across students and subjects
  const searchResults = globalSearch.trim()
    ? {
        students: data.students.filter(
          (s) =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(globalSearch.toLowerCase()) ||
            s.rollNumber.toLowerCase().includes(globalSearch.toLowerCase()) ||
            s.admissionNumber.toLowerCase().includes(globalSearch.toLowerCase()) ||
            s.className.toLowerCase().includes(globalSearch.toLowerCase())
        ),
        subjects: data.subjects.filter(
          (sub) =>
            sub.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
            sub.code.toLowerCase().includes(globalSearch.toLowerCase())
        ),
      }
    : null;

  const roleConfigs: { role: UserRole; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { role: 'admin', label: 'Super Admin', icon: Shield, desc: 'Full administrative & financial access' },
    { role: 'teacher', label: 'Faculty / Teacher', icon: GraduationCap, desc: 'Attendance, gradebook & timetable' },
    { role: 'accountant', label: 'Bursar / Accountant', icon: Calculator, desc: 'Invoicing, receipts & fee ledger' },
    { role: 'student_parent', label: 'Parent / Student Portal', icon: UserCheck, desc: 'Student profile, reports & dues' },
  ];

  const currentRoleConfig = roleConfigs.find((r) => r.role === currentUser.role) || roleConfigs[0];
  const RoleIcon = currentRoleConfig.icon;

  return (
    <header id="desktop-app-header" className="h-14 bg-white border-b border-slate-200 text-slate-800 flex items-center justify-between px-6 select-none relative z-30 shrink-0">
      {/* Brand & School Tag */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">
          <School className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-slate-900 tracking-tight text-base leading-none">
              {data.schoolInfo.name}
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80">
              v2.4.0
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {data.schoolInfo.academicYear} • {data.schoolInfo.currentTerm}
            </span>
          </p>
        </div>
      </div>

      {/* Global Search Bar with Live Quick Jump */}
      <div className="flex-1 max-w-md mx-6 relative">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search records, roll number, or subjects..."
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full bg-slate-100 text-xs text-slate-800 pl-9 pr-8 py-1.5 rounded-full border border-transparent focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 transition-all"
          />
          {globalSearch && (
            <button
              onClick={() => {
                setGlobalSearch('');
                setShowSearchResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Popup */}
        {showSearchResults && searchResults && (searchResults.students.length > 0 || searchResults.subjects.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
            {searchResults.students.length > 0 && (
              <div className="p-2 border-b border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                  Students ({searchResults.students.length})
                </div>
                {searchResults.students.slice(0, 5).map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setActiveTab('students');
                      setShowSearchResults(false);
                    }}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-xs text-slate-700 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-200">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Roll #{student.rollNumber} • {student.className}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            {searchResults.subjects.length > 0 && (
              <div className="p-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                  Subjects ({searchResults.subjects.length})
                </div>
                {searchResults.subjects.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setActiveTab('timetable');
                      setShowSearchResults(false);
                    }}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-xs text-slate-700"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{sub.name}</div>
                      <div className="text-[11px] text-slate-500">{sub.code} • {sub.credits} Credits</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Database Backup, Quick Date, Role Switcher */}
      <div className="flex items-center space-x-3">
        {/* Quick DB Backup Button */}
        <button
          id="btn-quick-db-backup"
          onClick={exportDatabaseJSON}
          title="Export current SQLite state snapshot as JSON"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Backup DB</span>
        </button>

        {/* Role Switcher Pill Dropdown */}
        <div className="relative">
          <button
            id="btn-role-switcher"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2.5 px-3 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 transition-all shadow-xs"
          >
            <div className="text-right leading-tight hidden sm:block">
              <div className="text-xs font-semibold text-slate-900">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{currentRoleConfig.label}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-xs">
              <RoleIcon className="w-4 h-4" />
            </div>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 text-slate-800">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">Switch Demo Perspective</div>
                <div className="text-[11px] text-slate-500">Test role-based access & permissions</div>
              </div>
              <div className="py-1 space-y-1">
                {roleConfigs.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentUser.role === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => {
                        setCurrentUserRole(item.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left flex items-start gap-2.5 p-2 rounded-lg text-xs transition-colors ${
                        isActive
                          ? 'bg-blue-50 border border-blue-200 text-blue-800 font-medium'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{item.label}</div>
                        <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole, UserProfile } from '../../types';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Shield,
  GraduationCap,
  Calculator,
  UserCheck,
  Mail,
  Phone,
  X,
} from 'lucide-react';

export const UsersModule: React.FC = () => {
  const { data, currentUser, setCurrentUserRole, addStaff } = useSchool();

  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('teacher');
  const [newStaffTitle, setNewStaffTitle] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  // Role permissions definitions
  const permissions = [
    {
      module: 'Students Profile & Enrollment',
      admin: 'Full (Create, Edit, Delete, Export)',
      teacher: 'View All, Edit Remarks',
      accountant: 'View Basic, View Dues',
      parent: 'View Own Child Only',
    },
    {
      module: 'Attendance Marking & Registers',
      admin: 'Full (All Classes, Historic Overrides)',
      teacher: 'Mark & Edit Assigned Classes',
      accountant: 'View Attendance Records',
      parent: 'View Child Attendance Rate',
    },
    {
      module: 'Examinations & Gradebook',
      admin: 'Full (Create Exams, Override Marks)',
      teacher: 'Grade Entry & Feedback',
      accountant: 'No Access',
      parent: 'View Official Report Card',
    },
    {
      module: 'Fees, Billing & Receipts',
      admin: 'Full Financial Ledger & Audits',
      teacher: 'View Payment Status Only',
      accountant: 'Issue Invoices, Collect, Stamped Receipts',
      parent: 'View Child Balance & Receipts',
    },
    {
      module: 'Timetables & Class Schedules',
      admin: 'Master Timetable Generator',
      teacher: 'View & Edit Assigned Periods',
      accountant: 'No Access',
      parent: 'View Class Daily Schedule',
    },
    {
      module: 'Database Backup & System Settings',
      admin: 'Full (Export, Restore, Config)',
      teacher: 'No Access',
      accountant: 'No Access',
      parent: 'No Access',
    },
  ];

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;

    const newStaff: UserProfile = {
      id: `u-${Date.now()}`,
      name: newStaffName.trim(),
      email: newStaffEmail.trim(),
      role: newStaffRole,
      title: newStaffTitle.trim() || 'Faculty Member',
      phone: newStaffPhone.trim() || '+92 (300) 000-0000',
    };

    addStaff(newStaff);
    setIsAddStaffOpen(false);
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffTitle('');
    setNewStaffPhone('');
  };

  return (
    <div id="users-module" className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              User Access & Role-Based Permissions
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Multi-Role Security
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage administrative access levels, faculty assignments, accountant rights, and parent/student portals.
          </p>
        </div>

        <button
          onClick={() => setIsAddStaffOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Role Switcher Interactive Cards */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            Active Demo Perspective Switcher
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any role to preview the application layout and permission gates from that persona's view.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              role: 'admin' as UserRole,
              title: 'Super Admin',
              icon: Shield,
              desc: 'Unrestricted control over students, staff, finances, grades, timetables & backups.',
            },
            {
              role: 'teacher' as UserRole,
              title: 'Faculty / Teacher',
              icon: GraduationCap,
              desc: 'Mark attendance registers, enter exam scores, view class schedules & write report remarks.',
            },
            {
              role: 'accountant' as UserRole,
              title: 'Bursar / Accountant',
              icon: Calculator,
              desc: 'Issue fee invoices, collect dues, record partial payments & print official stamped receipts.',
            },
            {
              role: 'student_parent' as UserRole,
              title: 'Parent / Student',
              icon: UserCheck,
              desc: 'Check child attendance rate, view academic report card & monitor outstanding tuition balances.',
            },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentUser.role === item.role;
            return (
              <div
                key={item.role}
                onClick={() => setCurrentUserRole(item.role)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 text-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white">
                        Active Role
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-3">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>

                <div className={`mt-4 pt-2 border-t text-[11px] font-semibold ${isActive ? 'border-blue-200 text-blue-700' : 'border-slate-100 text-slate-500'}`}>
                  {isActive ? 'Currently Active' : 'Click to Switch →'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Role Access & Permission Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Enforced System Policy</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">System Module</th>
                <th className="py-3 px-4 text-blue-700">Super Admin</th>
                <th className="py-3 px-4 text-slate-700">Class Teacher</th>
                <th className="py-3 px-4 text-slate-700">Bursar / Accountant</th>
                <th className="py-3 px-4 text-slate-700">Parent / Student</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissions.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{p.module}</td>
                  <td className="py-3 px-4 text-blue-700 font-semibold">{p.admin}</td>
                  <td className="py-3 px-4 text-slate-600">{p.teacher}</td>
                  <td className="py-3 px-4 text-slate-600">{p.accountant}</td>
                  <td className="py-3 px-4 text-slate-500">{p.parent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff & Faculty Directory */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Staff & Faculty Directory ({data.staff.length} Members)
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
          {data.staff.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-200">
                    {member.name[0]}
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    member.role === 'admin'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {member.role === 'admin' ? 'SUPER ADMIN' : member.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                  <div className="text-xs text-blue-600 font-medium">{member.title}</div>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{member.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Faculty Modal */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Add Faculty / Staff</h3>
              </div>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Lin"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. s.lin@oakridgeacademy.edu"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Role</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="teacher">Faculty / Teacher</option>
                    <option value="accountant">Bursar / Accountant</option>
                    <option value="admin">Super Admin</option>
                    <option value="student_parent">Parent / Student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Official Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Chemistry Instructor"
                  value={newStaffTitle}
                  onChange={(e) => setNewStaffTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Users,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  GraduationCap,
  Calendar,
  Building2,
  Phone,
  ArrowUpRight,
  UserPlus,
  FileCheck,
  HeartPulse,
} from 'lucide-react';

export const Dashboard: React.FC<{
  onOpenAddStudent: () => void;
  onOpenCreateInvoice: () => void;
}> = ({ onOpenAddStudent, onOpenCreateInvoice }) => {
  const { data, setActiveTab, setSelectedStudentId } = useSchool();
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');

  // Filter dataset based on selected branch
  const studentsList = Array.isArray(data?.students) ? data.students : [];
  const classesList = Array.isArray(data?.classes) ? data.classes : [];
  const invoicesList = Array.isArray(data?.invoices) ? data.invoices : [];
  const attendanceList = Array.isArray(data?.attendance) ? data.attendance : [];
  const branchesList = Array.isArray(data?.branches) ? data.branches : [];
  const staffList = Array.isArray(data?.staff) ? data.staff : [];

  const filteredStudents = studentsList.filter(
    (s) => selectedBranchId === 'all' || s.branchId === selectedBranchId
  );
  const filteredClasses = classesList.filter(
    (c) => selectedBranchId === 'all' || c.branchId === selectedBranchId
  );
  const filteredInvoices = invoicesList.filter((inv) => {
    const student = studentsList.find((s) => s.id === inv.studentId);
    return selectedBranchId === 'all' || student?.branchId === selectedBranchId;
  });

  // Metrics calculations
  const totalStudents = filteredStudents.length;
  const activeStudents = filteredStudents.filter((s) => s.status === 'Active').length;

  // Today's attendance for filtered students
  const today = '2026-09-01';
  const studentIds = new Set(filteredStudents.map((s) => s.id));
  const todayAttendanceRecords = attendanceList.filter(
    (a) => a.date === today && (a.period || 0) === 0 && studentIds.has(a.studentId)
  );
  const presentCount = todayAttendanceRecords.filter((a) => a.status === 'present').length;
  const lateCount = todayAttendanceRecords.filter((a) => a.status === 'late').length;
  const absentCount = todayAttendanceRecords.filter((a) => a.status === 'absent').length;
  const attendanceRate =
    todayAttendanceRecords.length > 0
      ? Math.round(((presentCount + lateCount * 0.8) / todayAttendanceRecords.length) * 100)
      : 96;

  // Fee totals
  const totalBilled = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = filteredInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const outstandingBalance = totalBilled - totalCollected;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 80;

  // Selected Branch Object
  const currentBranch = branchesList.find((b) => b.id === selectedBranchId);

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Top Banner & Campus Selector */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Beacon Garden Schooling System
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Session 2026–2027
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Playgroup to Grade 10 • Arat Koroona Village & Umarzai Bazar Campuses
          </p>
        </div>

        {/* Campus Filter Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
          <Building2 className="w-4 h-4 text-blue-600 ml-1.5 shrink-0" />
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none pr-2 py-0.5 cursor-pointer"
          >
            <option value="all">Consolidated (All Campuses)</option>
            {data.branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4-Column Stat Cards in Professional Polish Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div
          onClick={() => setActiveTab('students')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Enrolled</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-1 text-slate-900 tracking-tight">{totalStudents}</h2>
          <p className="text-emerald-600 text-[11px] font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{activeStudents} Active Profiles ({selectedBranchId === 'all' ? 'All Campuses' : currentBranch?.code})</span>
          </p>
        </div>

        {/* Card 2: Attendance Rate */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Attendance Rate</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-1 text-slate-900 tracking-tight">{attendanceRate}%</h2>
          <p className="text-slate-500 text-[11px] font-semibold mt-1">
            Today • {presentCount + lateCount} students recorded
          </p>
        </div>

        {/* Card 3: Fee Collection */}
        <div
          onClick={() => setActiveTab('fees')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Fee Collection</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-1 text-slate-900 tracking-tight">
            ${(totalCollected / 1000).toFixed(1)}k
          </h2>
          <p className="text-blue-600 text-[11px] font-bold mt-1">
            {collectionRate}% collected (${outstandingBalance.toLocaleString()} bal)
          </p>
        </div>

        {/* Card 4: Academic Sections & Classes */}
        <div
          onClick={() => setActiveTab('classes')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Active Classes</p>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-1 text-slate-900 tracking-tight">
            {filteredClasses.length} Sections
          </h2>
          <p className="text-slate-500 text-[11px] font-semibold mt-1">
            Playgroup to Grade 10 Curriculum
          </p>
        </div>
      </div>

      {/* Dual Branch Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.branches.map((b) => {
          const branchStudents = data.students.filter((s) => s.branchId === b.id);
          const branchClasses = data.classes.filter((c) => c.branchId === b.id);
          const isSelected = selectedBranchId === b.id;

          return (
            <div
              key={b.id}
              onClick={() => setSelectedBranchId(isSelected ? 'all' : b.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                isSelected
                  ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 font-bold flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                    <p className="text-xs text-slate-500">{b.address}</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
                  {b.code}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Campus Principal</div>
                  <div className="font-semibold text-slate-900 mt-0.5 truncate" title={b.headTeacher}>{b.headTeacher}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Students</div>
                  <div className="font-bold text-slate-900 mt-0.5">{branchStudents.length} Enrolled</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Grades</div>
                  <div className="font-bold text-slate-900 mt-0.5">{branchClasses.length} Sections</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Hotline</div>
                  <div className="font-mono text-slate-700 mt-0.5 text-[11px] truncate">{b.phone}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid: Recent Enrollments & Side Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Student Enrollments Table & Class Roster */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Student Enrollments Table Card */}
          <div className="bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Beacon Garden Student Roster</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {filteredStudents.length} students across selected campus filters
                </p>
              </div>
              <button
                onClick={() => setActiveTab('students')}
                className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Full Registry</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Roll</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Grade & Campus</th>
                    <th className="px-4 py-3">Guardian & Phone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100">
                  {filteredStudents.slice(0, 6).map((student) => {
                    const statusColor =
                      student.status === 'Active'
                        ? 'text-green-600 font-medium'
                        : 'text-amber-600 font-medium';

                    return (
                      <tr
                        key={student.id}
                        onClick={() => {
                          setSelectedStudentId(student.id);
                          setActiveTab('students');
                        }}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-700 font-mono font-bold">#{student.rollNumber}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">#{student.admissionNumber}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-800 font-medium">{student.className}</div>
                          <div className="text-[11px] text-blue-600 font-medium">
                            {student.branchId === 'branch-arat' ? 'Arat Koroona' : 'Umarzai Bazar'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-800 font-medium">{student.guardian.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {student.guardian.phone}
                          </div>
                        </td>
                        <td className={`px-4 py-3 ${statusColor}`}>{student.status}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-blue-600 font-semibold hover:underline text-xs">Dossier</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Classroom Attendance Snapshots */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Classroom Attendance Progress</h3>
                <p className="text-xs text-slate-500 mt-0.5">Section check-ins and teacher registers</p>
              </div>
              <button
                onClick={() => setActiveTab('attendance')}
                className="text-blue-600 text-xs font-semibold hover:underline"
              >
                Mark Register
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredClasses.map((cls) => {
                const studentsInClass = studentsList.filter((s) => s.classId === cls.id);
                const classTeacher = staffList.find((st) => st.id === cls.classTeacherId);
                const classAttendance = attendanceList.filter(
                  (a) => a.classId === cls.id && a.date === today && (a.period || 0) === 0
                );
                const pCount = classAttendance.filter((a) => a.status === 'present').length;
                const totalInCls = studentsInClass.length || 1;
                const pct = Math.round((pCount / totalInCls) * 100);

                return (
                  <div
                    key={cls.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{cls.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                          {cls.room}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {classTeacher ? classTeacher.name : 'Teacher'} • {studentsInClass.length} Students
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800">
                        {pCount}/{studentsInClass.length} Present
                      </div>
                      <div className="w-20 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(pct || 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Invoicing Summary Banner */}
        <div className="flex flex-col gap-6">
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onOpenAddStudent}
                className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-xs font-semibold text-center hover:bg-blue-100 transition-colors flex flex-col items-center gap-1"
              >
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>+ Enroll Student</span>
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold text-center hover:bg-slate-100 transition-colors flex flex-col items-center gap-1"
              >
                <CalendarCheck className="w-4 h-4 text-slate-600" />
                <span>Mark Attendance</span>
              </button>
              <button
                onClick={() => setActiveTab('grades')}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold text-center hover:bg-slate-100 transition-colors flex flex-col items-center gap-1"
              >
                <GraduationCap className="w-4 h-4 text-slate-600" />
                <span>Report Cards</span>
              </button>
              <button
                onClick={onOpenCreateInvoice}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold text-center hover:bg-slate-100 transition-colors flex flex-col items-center gap-1"
              >
                <CreditCard className="w-4 h-4 text-slate-600" />
                <span>Issue Invoice</span>
              </button>
            </div>
          </div>

          {/* Dark Contrast Invoicing Box */}
          <div className="bg-slate-900 rounded-xl p-4 text-white flex-1 relative overflow-hidden shadow-sm border border-slate-800 flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-white">Fee Invoicing</h3>
                <span className="text-[10px] bg-blue-600/80 text-white font-bold px-2 py-0.5 rounded-full">
                  Term 1 Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Beacon Garden fee billing ledger for Arat Koroona & Umarzai Bazar campuses.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded-lg text-xs">
                  <span className="text-slate-300">Total Billed:</span>
                  <span className="font-bold text-white">${totalBilled.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded-lg text-xs">
                  <span className="text-slate-300">Collected:</span>
                  <span className="font-bold text-emerald-400">${totalCollected.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center relative z-10">
              <span className="text-[11px] text-slate-400">Total Invoices: {filteredInvoices.length}</span>
              <button
                onClick={() => setActiveTab('fees')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>Manage Fees</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-blue-600 opacity-20 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Academic Calendar Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Academic Dates</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">2026–2027</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border-l-2 border-blue-500">
                <div className="font-semibold text-slate-800">Mid-Term Board Assessment</div>
                <div className="text-[11px] text-slate-500">Oct 15 – Oct 22 • Playgroup to Grade 10</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border-l-2 border-indigo-500">
                <div className="font-semibold text-slate-800">Parent-Teacher Assembly</div>
                <div className="text-[11px] text-slate-500">Nov 04 • Both Campuses</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

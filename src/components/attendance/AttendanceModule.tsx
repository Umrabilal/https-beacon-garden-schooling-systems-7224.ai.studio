import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AttendanceStatus } from '../../types';
import {
  Calendar,
  Check,
  X,
  Users,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
} from 'lucide-react';

export const AttendanceModule: React.FC = () => {
  const { data, markAttendance, batchMarkAttendance, currentUser } = useSchool();

  const classesList = Array.isArray(data?.classes) ? data.classes : [];
  const subjectsList = Array.isArray(data?.subjects) ? data.subjects : [];
  const studentsList = Array.isArray(data?.students) ? data.students : [];
  const attendanceList = Array.isArray(data?.attendance) ? data.attendance : [];

  const [selectedDate, setSelectedDate] = useState<string>('2026-09-01');
  const [selectedClassId, setSelectedClassId] = useState<string>(classesList[0]?.id || 'c-g10-arat');
  const [attendanceMode, setAttendanceMode] = useState<'daily' | 'period'>('daily');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjectsList[0]?.id || 'sub-math');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Active class info & students
  const activeClass =
    classesList.find((c) => c.id === selectedClassId) ||
    classesList[0] || {
      id: 'c-g10-arat',
      name: 'Grade 10-A (Science)',
      grade: 'Grade 10',
      section: 'A',
      branchId: 'branch-arat',
      room: 'Senior Hall 302',
      capacity: 35,
      classTeacherId: 'u-teacher-3',
    };
  const studentsInClass = studentsList.filter((s) => s.classId === selectedClassId && s.status === 'Active');

  // Filter attendance records for current selection
  const periodVal = attendanceMode === 'daily' ? 0 : selectedPeriod;
  const currentAttendanceRecords = attendanceList.filter(
    (a) =>
      a.classId === selectedClassId &&
      a.date === selectedDate &&
      (a.period || 0) === periodVal &&
      (attendanceMode === 'daily' || !a.subjectId || a.subjectId === selectedSubjectId)
  );

  // Helper to get status of a student
  const getStudentStatus = (studentId: string): AttendanceStatus | null => {
    const record = currentAttendanceRecords.find((a) => a.studentId === studentId);
    return record ? record.status : null;
  };

  // Helper to get remarks
  const getStudentRemarks = (studentId: string): string => {
    const record = currentAttendanceRecords.find((a) => a.studentId === studentId);
    return record?.remarks || '';
  };

  // Update status for single student
  const handleSetStatus = (studentId: string, status: AttendanceStatus, remarks?: string) => {
    markAttendance({
      studentId,
      classId: selectedClassId,
      date: selectedDate,
      period: periodVal,
      subjectId: attendanceMode === 'period' ? selectedSubjectId : undefined,
      status,
      remarks: remarks !== undefined ? remarks : getStudentRemarks(studentId),
      recordedBy: currentUser.id,
    });
  };

  // Batch actions
  const handleMarkAll = (status: AttendanceStatus) => {
    const records = studentsInClass.map((s) => ({
      studentId: s.id,
      classId: selectedClassId,
      date: selectedDate,
      period: periodVal,
      subjectId: attendanceMode === 'period' ? selectedSubjectId : undefined,
      status,
      remarks: status === 'present' ? '' : undefined,
      recordedBy: currentUser.id,
    }));
    batchMarkAttendance(records);
    setSaveToast(`All ${studentsInClass.length} students marked as ${status.toUpperCase()}`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Summary counts
  const presentCount = studentsInClass.filter((s) => getStudentStatus(s.id) === 'present').length;
  const absentCount = studentsInClass.filter((s) => getStudentStatus(s.id) === 'absent').length;
  const lateCount = studentsInClass.filter((s) => getStudentStatus(s.id) === 'late').length;
  const excusedCount = studentsInClass.filter((s) => getStudentStatus(s.id) === 'excused').length;
  const markedTotal = presentCount + absentCount + lateCount + excusedCount;
  const attendanceRate =
    markedTotal > 0 ? Math.round(((presentCount + lateCount * 0.8 + excusedCount) / markedTotal) * 100) : 0;

  // Date stepper
  const handleStepDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleExportAttendanceCSV = () => {
    const headers = ['Roll', 'Student Name', 'Class', 'Date', 'Period', 'Status', 'Remarks'];
    const rows = studentsInClass.map((s) => {
      const status = getStudentStatus(s.id) || 'Not Marked';
      const rem = getStudentRemarks(s.id);
      return [
        s.rollNumber,
        `"${s.firstName} ${s.lastName}"`,
        s.className,
        selectedDate,
        attendanceMode === 'daily' ? 'Daily Homeroom' : `Period ${selectedPeriod}`,
        status,
        `"${rem}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_${activeClass.name}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div id="attendance-module" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Class Attendance Register
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Daily & Period Tracking
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Record daily homeroom attendance or subject-wise period roll calls with instant metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Print Register</span>
          </button>
          <button
            onClick={handleExportAttendanceCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Control Strip (Date, Class, Mode, Batch Mark buttons) */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Date Selector with Stepper */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStepDate(-1)}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200 shadow-xs"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <button
              onClick={() => handleStepDate(1)}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200 shadow-xs"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDate('2026-09-01')}
              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-xs text-blue-700 border border-blue-200 font-bold shadow-xs"
            >
              Today
            </button>
          </div>

          {/* Class & Mode Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Class Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Class:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
              >
                {data.classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.room})
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setAttendanceMode('daily')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  attendanceMode === 'daily'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daily Homeroom
              </button>
              <button
                onClick={() => setAttendanceMode('period')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  attendanceMode === 'period'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Period-wise
              </button>
            </div>

            {attendanceMode === 'period' && (
              <>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value={1}>Period 1 (08:30)</option>
                  <option value={2}>Period 2 (09:25)</option>
                  <option value={3}>Period 3 (10:30)</option>
                  <option value={4}>Period 4 (11:25)</option>
                  <option value={5}>Period 5 (13:00)</option>
                  <option value={6}>Period 6 (13:55)</option>
                </select>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {data.subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons & Quick Summary Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Quick Mark Batch Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 mr-1 font-medium">Batch Actions:</span>
            <button
              onClick={() => handleMarkAll('present')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 text-xs font-bold transition-colors shadow-xs"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition-colors shadow-xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Mark All Absent</span>
            </button>
          </div>

          {/* Real-time Tally Indicators */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">
                Present: <strong className="text-emerald-700">{presentCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600 font-medium">
                Absent: <strong className="text-rose-700">{absentCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600 font-medium">
                Late: <strong className="text-amber-700">{lateCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-600 font-medium">
                Excused: <strong className="text-blue-700">{excusedCount}</strong>
              </span>
            </div>
            <div className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 font-bold text-slate-800 shadow-xs">
              Rate: <span className="text-emerald-700">{attendanceRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {saveToast && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-green-600" />
            <span>{saveToast}</span>
          </div>
          <button onClick={() => setSaveToast(null)} className="text-green-600 hover:text-green-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Attendance Sheet Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Roll Register: {activeClass.name}
            </h3>
            <span className="text-xs text-slate-500">({studentsInClass.length} Active Students)</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Date: {selectedDate} • {attendanceMode === 'daily' ? 'Homeroom' : `Period ${selectedPeriod}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-16">Roll</th>
                <th className="py-3 px-4">Student Particulars</th>
                <th className="py-3 px-4 text-center">Status Toggle (Click to mark)</th>
                <th className="py-3 px-4">Remarks / Reason</th>
                <th className="py-3 px-4 text-right">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentsInClass.map((student) => {
                const currentStatus = getStudentStatus(student.id);
                const currentRemarks = getStudentRemarks(student.id);

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      #{student.rollNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-200">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">
                            {student.firstName} {student.lastName}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            #{student.admissionNumber}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Interactive 4-Way Status Selector */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Present Button */}
                        <button
                          onClick={() => handleSetStatus(student.id, 'present')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs scale-102 ring-2 ring-emerald-500/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          Present (P)
                        </button>

                        {/* Late Button */}
                        <button
                          onClick={() => handleSetStatus(student.id, 'late')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            currentStatus === 'late'
                              ? 'bg-amber-500 text-white shadow-xs scale-102 ring-2 ring-amber-500/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          Late (L)
                        </button>

                        {/* Absent Button */}
                        <button
                          onClick={() => handleSetStatus(student.id, 'absent')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white shadow-xs scale-102 ring-2 ring-rose-500/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          Absent (A)
                        </button>

                        {/* Excused Button */}
                        <button
                          onClick={() => handleSetStatus(student.id, 'excused')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            currentStatus === 'excused'
                              ? 'bg-blue-600 text-white shadow-xs scale-102 ring-2 ring-blue-500/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                        >
                          Excused (E)
                        </button>
                      </div>
                    </td>

                    {/* Remarks input */}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Add reason/note..."
                        value={currentRemarks}
                        onChange={(e) => {
                          if (currentStatus) {
                            handleSetStatus(student.id, currentStatus, e.target.value);
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    {/* Badge */}
                    <td className="py-3 px-4 text-right">
                      {currentStatus ? (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
                            currentStatus === 'present'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : currentStatus === 'late'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : currentStatus === 'absent'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {currentStatus}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unmarked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

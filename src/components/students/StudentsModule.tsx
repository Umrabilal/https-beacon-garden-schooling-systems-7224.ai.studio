import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentFormModal } from './StudentFormModal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  LayoutGrid,
  List,
  Phone,
  AlertTriangle,
  Building2,
  HeartPulse,
  FileCheck,
} from 'lucide-react';

export const StudentsModule: React.FC<{
  onOpenReportCard: (studentId: string) => void;
}> = ({ onOpenReportCard }) => {
  const {
    data,
    deleteStudent,
    selectedStudentId,
    setSelectedStudentId,
    getStudentAttendanceStats,
    getStudentGPA,
    getStudentBalance,
  } = useSchool();

  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Selected student for detail modal
  const activeDetailStudent = selectedStudentId
    ? data.students.find((s) => s.id === selectedStudentId) || null
    : null;

  // Filtered student list
  const filteredStudents = data.students.filter((student) => {
    const matchesBranch = selectedBranch === 'all' || student.branchId === selectedBranch;
    const matchesClass = selectedClass === 'all' || student.classId === selectedClass;
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      fullName.includes(query) ||
      student.rollNumber.toLowerCase().includes(query) ||
      student.admissionNumber.toLowerCase().includes(query) ||
      student.guardian.name.toLowerCase().includes(query) ||
      student.guardian.phone.toLowerCase().includes(query) ||
      (student.guardian.cnicOrId && student.guardian.cnicOrId.includes(query)) ||
      (student.branchName && student.branchName.toLowerCase().includes(query));

    return matchesBranch && matchesClass && matchesStatus && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = [
      'Roll Number',
      'Admission Number',
      'First Name',
      'Last Name',
      'Branch / Campus',
      'Class',
      'Gender',
      'Date of Birth',
      'Blood Group',
      'Guardian Name',
      'Guardian Relation',
      'Guardian Phone',
      'Guardian CNIC',
      'Emergency Contact',
      'Medical Conditions',
      'Previous School',
      'Status',
    ];
    const rows = filteredStudents.map((s) => [
      s.rollNumber,
      s.admissionNumber,
      s.firstName,
      s.lastName,
      `"${s.branchName || 'Beacon Garden Campus'}"`,
      `"${s.className}"`,
      s.gender,
      s.dateOfBirth,
      s.bloodGroup,
      `"${s.guardian.name}"`,
      s.guardian.relationship,
      `"${s.guardian.phone}"`,
      `"${s.guardian.cnicOrId || ''}"`,
      `"${s.emergencyContact || ''}"`,
      `"${s.medicalDetails?.conditions || s.allergiesOrMedical || 'None'}"`,
      `"${s.previousSchool?.schoolName || 'Direct Entry'}"`,
      s.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `beacon_garden_students_roster_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div id="students-module" className="space-y-6">
      {/* Module Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Beacon Garden Student Information System
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {filteredStudents.length} Students
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Playgroup to Grade 10 • Arat Koroona Village & Umarzai Bazar Campuses • Comprehensive Profiles, Guardians & Transfer Records
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Roster CSV</span>
          </button>
          <button
            onClick={() => {
              setStudentToEdit(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, roll, guardian, CNIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-semibold"
            >
              <option value="all">All Campuses ({data.students.length})</option>
              {data.branches.map((b) => {
                const count = data.students.filter((s) => s.branchId === b.id).length;
                return (
                  <option key={b.id} value={b.id}>
                    {b.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Classes</option>
              {data.classes
                .filter((c) => selectedBranch === 'all' || c.branchId === selectedBranch)
                .map((cls) => {
                  const count = data.students.filter((s) => s.classId === cls.id).length;
                  return (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({count})
                    </option>
                  );
                })}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-end md:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              viewMode === 'table' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              viewMode === 'grid' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Student List */}
      {filteredStudents.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl shadow-xs">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No students match current filters</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try switching campuses or adjusting your search keywords.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Roll</th>
                  <th className="py-3 px-4">Student & Campus</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Guardian Contact</th>
                  <th className="py-3 px-4">Records & Health</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">GPA</th>
                  <th className="py-3 px-4">Fee Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const att = getStudentAttendanceStats(student.id);
                  const gpa = getStudentGPA(student.id);
                  const balance = getStudentBalance(student.id);
                  const docCount = student.documents?.length || 0;
                  const hasAlert =
                    (student.medicalDetails?.allergies && student.medicalDetails.allergies !== 'None') ||
                    (student.medicalDetails?.conditions && student.medicalDetails.conditions !== 'None');

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        #{student.rollNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs border border-blue-200 shrink-0">
                            {student.firstName[0]}{student.lastName[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                              <span>#{student.admissionNumber}</span>
                              <span>•</span>
                              <span className="text-blue-600 font-sans font-medium">
                                {student.branchId === 'branch-arat' ? 'Arat Koroona' : 'Umarzai Bazar'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {student.className}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">
                          {student.guardian.name} ({student.guardian.relationship})
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {student.guardian.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {docCount > 0 && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 flex items-center gap-1"
                              title={`${docCount} documents attached`}
                            >
                              <FileCheck className="w-3 h-3 text-blue-600" />
                              <span>{docCount} Docs</span>
                            </span>
                          )}
                          {hasAlert && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200 flex items-center gap-0.5"
                              title={student.medicalDetails?.allergies || student.medicalDetails?.conditions || 'Medical Alert'}
                            >
                              <HeartPulse className="w-3 h-3 text-rose-600" />
                              <span>Alert</span>
                            </span>
                          )}
                          {docCount === 0 && !hasAlert && (
                            <span className="text-[11px] text-slate-400">Regular</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              att.percentage >= 85
                                ? 'text-emerald-600'
                                : att.percentage >= 75
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {att.percentage}%
                          </span>
                          <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className={`h-full ${
                                att.percentage >= 85 ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${att.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-800">
                          {gpa.gpa > 0 ? gpa.gpa.toFixed(2) : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold font-mono ${
                            balance.balance === 0 ? 'text-emerald-600' : 'text-amber-700'
                          }`}
                        >
                          ${balance.balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            student.status === 'Active'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td
                        className="py-3 px-4 text-right space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelectedStudentId(student.id)}
                          title="View Full Profile Dossier"
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenReportCard(student.id)}
                          title="Generate Report Card"
                          className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setStudentToEdit(student);
                            setIsFormOpen(true);
                          }}
                          title="Edit Student"
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setStudentToDelete(student)}
                          title="Delete Student"
                          className="p-1.5 rounded-md hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const att = getStudentAttendanceStats(student.id);
            const gpa = getStudentGPA(student.id);
            const balance = getStudentBalance(student.id);

            return (
              <div
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm border border-blue-200">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          Roll #{student.rollNumber} • {student.className}
                        </div>
                        <div className="text-[11px] text-blue-600 font-medium mt-0.5">
                          {student.branchId === 'branch-arat' ? 'Arat Koroona' : 'Umarzai Bazar'}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        student.status === 'Active'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg text-center text-xs border border-slate-200/60">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Attend</div>
                      <div className="font-bold text-emerald-600 mt-0.5">{att.percentage}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">GPA</div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {gpa.gpa > 0 ? gpa.gpa.toFixed(2) : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Due</div>
                      <div
                        className={`font-bold mt-0.5 ${
                          balance.balance === 0 ? 'text-slate-600' : 'text-amber-700'
                        }`}
                      >
                        ${balance.balance}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{student.guardian.name} ({student.guardian.relationship})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-slate-500">{student.guardian.phone}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onOpenReportCard(student.id)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Report Card</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setStudentToEdit(student);
                        setIsFormOpen(true);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setStudentToDelete(student)}
                      className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Student Detail Modal */}
      {activeDetailStudent && (
        <StudentDetailModal
          student={activeDetailStudent}
          onClose={() => setSelectedStudentId(null)}
          onEdit={(s) => {
            setSelectedStudentId(null);
            setStudentToEdit(s);
            setIsFormOpen(true);
          }}
          onGenerateReportCard={(id) => {
            setSelectedStudentId(null);
            onOpenReportCard(id);
          }}
        />
      )}

      {/* Student Form Modal (Add / Edit) */}
      {isFormOpen && (
        <StudentFormModal
          studentToEdit={studentToEdit}
          onClose={() => {
            setIsFormOpen(false);
            setStudentToEdit(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center border border-rose-200">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Delete Student Record</h3>
                <p className="text-xs text-slate-500">This action will remove all local data.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete student{' '}
              <strong className="text-slate-900">
                {studentToDelete.firstName} {studentToDelete.lastName}
              </strong>{' '}
              (Roll #{studentToDelete.rollNumber})?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

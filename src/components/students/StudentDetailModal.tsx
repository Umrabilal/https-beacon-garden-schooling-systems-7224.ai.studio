import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student, StudentDocument } from '../../types';
import {
  X,
  User,
  Phone,
  Calendar,
  GraduationCap,
  CreditCard,
  Printer,
  FileText,
  Edit,
  Building2,
  HeartPulse,
  History,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Eye,
  Trash2,
  Plus,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  student: Student;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onGenerateReportCard: (studentId: string) => void;
}

type DetailTab = 'overview' | 'medical' | 'previousSchool' | 'documents' | 'academics' | 'fees';

export const StudentDetailModal: React.FC<Props> = ({
  student,
  onClose,
  onEdit,
  onGenerateReportCard,
}) => {
  const {
    data,
    updateStudent,
    getStudentAttendanceStats,
    getStudentGPA,
    getStudentBalance,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [previewDoc, setPreviewDoc] = useState<StudentDocument | null>(null);
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocType, setNewDocType] = useState<StudentDocument['type']>('Transfer Certificate (TC)');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocNotes, setNewDocNotes] = useState('');

  const attendanceStats = getStudentAttendanceStats(student.id);
  const gpaInfo = getStudentGPA(student.id);
  const feeBalance = getStudentBalance(student.id);

  const studentInvoices = (data.invoices || []).filter((i) => i.studentId === student.id);
  const studentGrades = (data.grades || []).filter((g) => g.studentId === student.id);
  const branch =
    (data.branches || []).find((b) => b.id === student.branchId) ||
    (data.branches && data.branches[0]) || {
      id: 'branch-arat',
      name: student.branchName || 'Arat Koroona Campus',
      code: 'AKC',
      address: 'Village Arat Koroona & Post Office Umarzai, Charsadda, KPK',
      phone: '+92 (91) 651-2244',
      email: 'arat.campus@beacongarden.edu.pk',
      headTeacher: 'Principal',
      totalRooms: 18,
      establishedYear: '2015',
    };

  const handlePrint = () => {
    window.print();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const newDoc: StudentDocument = {
        id: `doc-${Date.now()}`,
        title: newDocTitle.trim() || file.name.replace(/\.[^/.]+$/, ''),
        type: newDocType,
        fileName: file.name,
        fileSize: `${Math.round(file.size / 1024)} KB`,
        uploadDate: new Date().toISOString().split('T')[0],
        fileData: reader.result as string,
        notes: newDocNotes.trim() || 'Uploaded to student dossier archive.',
        verified: true,
      };

      const updatedDocs = [newDoc, ...(student.documents || [])];
      updateStudent({
        ...student,
        documents: updatedDocs,
      });

      setIsAddingDoc(false);
      setNewDocTitle('');
      setNewDocNotes('');
      e.target.value = '';
    };

    reader.readAsDataURL(file);
  };

  const handleDeleteDoc = (docId: string) => {
    const updatedDocs = (student.documents || []).filter((d) => d.id !== docId);
    updateStudent({
      ...student,
      documents: updatedDocs,
    });
  };

  const handleToggleDocVerify = (docId: string) => {
    const updatedDocs = (student.documents || []).map((d) =>
      d.id === docId ? { ...d, verified: !d.verified } : d
    );
    updateStudent({
      ...student,
      documents: updatedDocs,
    });
  };

  const hasAllergiesOrConditions =
    (student.medicalDetails?.allergies && student.medicalDetails.allergies !== 'None') ||
    (student.medicalDetails?.conditions && student.medicalDetails.conditions !== 'None') ||
    (student.allergiesOrMedical && student.allergiesOrMedical !== 'None');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-lg border border-blue-200 shrink-0">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {student.firstName} {student.lastName}
                </h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                    student.status === 'Active'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : student.status === 'Suspended'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {student.status}
                </span>
                {hasAllergiesOrConditions && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold flex items-center gap-1">
                    <HeartPulse className="w-3 h-3 text-rose-600" />
                    <span>Medical Alert</span>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                <span>Roll #{student.rollNumber}</span>
                <span>•</span>
                <span className="font-mono text-slate-700">Adm #{student.admissionNumber}</span>
                <span>•</span>
                <span className="font-semibold text-blue-700">{student.className}</span>
                <span>•</span>
                <span className="text-slate-600 font-medium">Campus: {branch?.name || student.branchName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onGenerateReportCard(student.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Report Card</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
              title="Print Complete Student Dossier"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Record</span>
            </button>
            <button
              onClick={() => onEdit(student)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Profile</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dossier Section Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-4 gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Guardians</span>
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'medical'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Medical & Health</span>
            {hasAllergiesOrConditions && (
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('previousSchool')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'previousSchool'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Previous School & TC</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Certificates & TC Uploads ({student.documents?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('academics')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'academics'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Exams & GPA ({gpaInfo.gpa.toFixed(2)})</span>
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'fees'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Fee Ledger</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 bg-white flex-1">
          {/* Quick Metrics Bar across all tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Attendance Standing</div>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">{attendanceStats.percentage}%</div>
              <div className="text-[10px] text-slate-400">
                {attendanceStats.present} present • {attendanceStats.absent} absent • {attendanceStats.late} late
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Cumulative GPA</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{gpaInfo.gpa.toFixed(2)} / 4.00</div>
              <div className="text-[10px] text-slate-400">{studentGrades.length} exam subject entries</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Fee Balance Due</div>
              <div className={`text-lg font-bold mt-0.5 ${feeBalance.balance === 0 ? 'text-emerald-600' : 'text-amber-700'}`}>
                ${feeBalance.balance.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">Paid: ${feeBalance.paid.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Campus Branch</div>
              <div className="text-xs font-bold text-blue-700 mt-1 truncate">{branch?.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{branch?.address}</div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & GUARDIAN DETAILS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Demographics */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Student Demographics & Identification</span>
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                      <span className="text-slate-500">Full Name</span>
                      <span className="font-semibold text-slate-900">
                        {student.firstName} {student.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                      <span className="text-slate-500">Gender & Blood Group</span>
                      <span className="font-medium text-slate-800">
                        {student.gender} • <strong className="text-rose-700 font-bold">{student.bloodGroup || 'B+'}</strong>
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                      <span className="text-slate-500">Date of Birth</span>
                      <span className="font-medium text-slate-800">{student.dateOfBirth}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                      <span className="text-slate-500">Assigned Branch / Campus</span>
                      <span className="font-semibold text-blue-700">{branch?.name}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                      <span className="text-slate-500">Class & Section</span>
                      <span className="font-semibold text-slate-900">{student.className}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                      <span className="text-slate-500">Enrollment Date</span>
                      <span className="font-medium text-slate-800">{student.enrollmentDate}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Residential Address</span>
                      <span className="font-medium text-slate-800 text-right max-w-xs">
                        {student.address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Guardian & Emergency Hot-line */}
                <div className="space-y-4">
                  {/* Guardian Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>Primary Parent / Guardian Contact</span>
                    </h3>

                    <div className="space-y-2">
                      <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                        <span className="text-slate-500">Guardian Name</span>
                        <span className="font-bold text-slate-900">
                          {student.guardian.name} ({student.guardian.relationship})
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                        <span className="text-slate-500">Primary Phone</span>
                        <a
                          href={`tel:${student.guardian.phone}`}
                          className="font-bold text-blue-600 hover:underline font-mono"
                        >
                          {student.guardian.phone}
                        </a>
                      </div>
                      {student.guardian.altPhone && (
                        <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                          <span className="text-slate-500">WhatsApp / Alt Phone</span>
                          <span className="font-mono text-slate-700">{student.guardian.altPhone}</span>
                        </div>
                      )}
                      {student.guardian.cnicOrId && (
                        <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                          <span className="text-slate-500">National CNIC / ID</span>
                          <span className="font-mono font-medium text-slate-800">{student.guardian.cnicOrId}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-1.5 border-b border-slate-200/80">
                        <span className="text-slate-500">Guardian Email</span>
                        <a
                          href={`mailto:${student.guardian.email}`}
                          className="font-medium text-blue-600 hover:underline truncate max-w-[200px]"
                        >
                          {student.guardian.email || 'None on record'}
                        </a>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Occupation</span>
                        <span className="font-medium text-slate-800">
                          {student.guardian.occupation || 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dedicated Emergency Contacts */}
                  <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Dedicated Emergency Contact & Pickup Escort</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Contact Person:</span>
                        <span className="font-bold text-slate-900">
                          {student.emergencyDetails?.name || student.guardian.name} (
                          {student.emergencyDetails?.relationship || student.guardian.relationship})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Direct Hotline:</span>
                        <a
                          href={`tel:${student.emergencyContact || student.emergencyDetails?.phone}`}
                          className="font-mono font-bold text-rose-700 hover:underline"
                        >
                          {student.emergencyContact || student.emergencyDetails?.phone || student.guardian.phone}
                        </a>
                      </div>
                      {student.emergencyDetails?.notes && (
                        <div className="pt-1.5 text-[11px] text-amber-800 italic">
                          Special Instructions: "{student.emergencyDetails.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDICAL & HEALTH */}
          {activeTab === 'medical' && (
            <div className="space-y-5">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2 text-slate-900">
                    <HeartPulse className="w-5 h-5 text-rose-600" />
                    <h3 className="font-bold text-xs uppercase tracking-wider">
                      Student Health Records & Medical Profile
                    </h3>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                    Blood Group: {student.bloodGroup || student.medicalDetails?.bloodGroup || 'B+'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Known Medical Conditions */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                    <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider block">
                      Chronic Illnesses / Known Medical Conditions
                    </span>
                    <div className="text-slate-800 font-medium">
                      {student.medicalDetails?.conditions || student.allergiesOrMedical || 'None on record'}
                    </div>
                  </div>

                  {/* Known Allergies */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                    <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider block">
                      Allergies & Dietary Restrictions
                    </span>
                    <div className="text-rose-700 font-medium">
                      {student.medicalDetails?.allergies || 'No known allergies reported'}
                    </div>
                  </div>
                </div>

                {/* Medications and Doctor Contacts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Regular Medications</span>
                    <span className="font-bold text-slate-900 mt-1 block">
                      {student.medicalDetails?.regularMedications || 'None'}
                    </span>
                  </div>
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Family Doctor / Pediatrician</span>
                    <span className="font-bold text-slate-900 mt-1 block">
                      {student.medicalDetails?.emergencyDoctorName || 'Not specified'}
                    </span>
                  </div>
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Doctor Contact Phone</span>
                    <span className="font-mono font-bold text-blue-600 mt-1 block">
                      {student.medicalDetails?.emergencyDoctorPhone || '—'}
                    </span>
                  </div>
                </div>

                {/* Emergency Protocols */}
                {student.medicalDetails?.specialCareInstructions && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                    <span className="font-bold uppercase text-[10px] block mb-1">Emergency Hospital / Action Protocol:</span>
                    <span>{student.medicalDetails.specialCareInstructions}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PREVIOUS SCHOOL & TRANSFER CERTIFICATE (TC/SLC) */}
          {activeTab === 'previousSchool' && (
            <div className="space-y-5">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-slate-900 border-b border-slate-200 pb-3">
                  <History className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wider">
                    Previous School Record & Transfer Certificate (TC / SLC) History
                  </h3>
                </div>

                {student.previousSchool?.schoolName ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Previous Educational Institution</span>
                        <div className="font-bold text-slate-900 text-sm">{student.previousSchool.schoolName}</div>
                      </div>
                      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Last Class Attended & Year</span>
                        <div className="font-bold text-slate-900 text-sm">
                          {student.previousSchool.previousClass || 'N/A'} • {student.previousSchool.passingYear || '2024'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">TC / SLC Serial Number</span>
                        <span className="font-mono font-bold text-blue-700 mt-1 block">
                          {student.previousSchool.tcNumber || 'TC-ON-FILE'}
                        </span>
                      </div>
                      <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">TC Issue Date</span>
                        <span className="font-medium text-slate-800 mt-1 block">
                          {student.previousSchool.tcIssueDate || '2024-08-10'}
                        </span>
                      </div>
                      <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Previous Academic Marks / GPA</span>
                        <span className="font-bold text-emerald-700 mt-1 block">
                          {student.previousSchool.previousPercentageOrGpa || 'A Grade / 88%'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Reason for Leaving Previous School:</span>
                        <span className="font-medium text-slate-800">{student.previousSchool.reasonForLeaving || 'Admitted to Beacon Garden System'}</span>
                      </div>
                      {student.previousSchool.remarks && (
                        <div className="flex justify-between pt-1 border-t border-slate-100">
                          <span className="text-slate-500">Character / Conduct Remarks:</span>
                          <span className="font-medium text-slate-800">{student.previousSchool.remarks}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-2">
                    <History className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-slate-800">Fresh Admission / Direct Entry</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      This student is directly enrolled at Beacon Garden Schooling System (e.g. Playgroup/Kindergarten), or previous school records are archived under uploaded certificates.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CERTIFICATES & ATTACHED DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Attached School Records, Transfer Certificates & Identity Proofs</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Official verified documents archived for this student dossier.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingDoc(!isAddingDoc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingDoc ? 'Cancel Upload' : 'Upload Document'}</span>
                </button>
              </div>

              {/* Quick Document Upload Form */}
              {isAddingDoc && (
                <div className="p-4 bg-slate-50 border border-blue-200 rounded-xl space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Document Category</label>
                      <select
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Transfer Certificate (TC)">Transfer Certificate (TC / SLC)</option>
                        <option value="Previous Report Card">Previous Grade Report Card</option>
                        <option value="Birth Certificate / B-Form">NADRA Birth Certificate / B-Form</option>
                        <option value="Medical Clearance">Medical Clearance / Vaccine Record</option>
                        <option value="Character Certificate">Character Certificate</option>
                        <option value="Other">Other Document</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Document Title</label>
                      <input
                        type="text"
                        value={newDocTitle}
                        onChange={(e) => setNewDocTitle(e.target.value)}
                        placeholder="e.g. Official Transfer Certificate from Govt School"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Admin Notes</label>
                      <input
                        type="text"
                        value={newDocNotes}
                        onChange={(e) => setNewDocNotes(e.target.value)}
                        placeholder="e.g. Original attested by Headmaster"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer bg-white">
                      <Upload className="w-6 h-6 text-blue-600 mb-1" />
                      <span className="font-bold text-slate-800 text-xs">Select file to upload (PDF, JPG, PNG, DOC)</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Documents List */}
              {(!student.documents || student.documents.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 space-y-2">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="font-bold">No documents attached to this profile yet.</p>
                  <p className="text-xs">Click "Upload Document" to attach Transfer Certificates, NADRA B-Form, or previous report cards.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {student.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-200 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{doc.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-slate-700 font-semibold border border-slate-200">
                              {doc.type}
                            </span>
                            {doc.verified && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-bold border border-green-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                            <span className="font-mono text-slate-600">{doc.fileName}</span>
                            {doc.fileSize && <span>• {doc.fileSize}</span>}
                            <span>• Added: {doc.uploadDate}</span>
                            {doc.notes && <span className="italic text-slate-600">• "{doc.notes}"</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-blue-600 text-xs font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleDocVerify(doc.id)}
                          className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                            doc.verified
                              ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {doc.verified ? 'Unverify' : 'Verify'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 border border-slate-200"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACADEMICS & EXAM GRADES */}
          {activeTab === 'academics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Academic Performance & Assessment Transcript</span>
                </h3>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  GPA: {gpaInfo.gpa.toFixed(2)} / 4.00
                </span>
              </div>

              {studentGrades.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                  No exam grade entries recorded yet for this session.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs bg-white">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-3">Score</th>
                        <th className="py-2.5 px-3">Grade</th>
                        <th className="py-2.5 px-3">Grade Point</th>
                        <th className="py-2.5 px-3">Teacher Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentGrades.map((g) => {
                        const subject = (data.subjects || []).find((s) => s.id === g.subjectId);
                        return (
                          <tr key={g.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              {subject?.name || 'Subject'}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {g.marksObtained} / {g.maxMarks}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                                {g.gradeLetter}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-700 font-semibold">{g.gradePoint}</td>
                            <td className="py-2.5 px-3 text-slate-500 italic">{g.remarks || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: FEES & INVOICES */}
          {activeTab === 'fees' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Fee Invoicing Ledger</span>
                </h3>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    feeBalance.balance === 0
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  Outstanding Balance: ${feeBalance.balance.toLocaleString()}
                </span>
              </div>

              {studentInvoices.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                  No invoices generated for this student yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {studentInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{inv.invoiceNumber}</div>
                        <div className="text-[11px] text-slate-500">
                          Due Date: {inv.dueDate} • Items: {inv.items.map((i) => i.description).join(', ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-slate-900">${inv.totalAmount.toLocaleString()}</div>
                          <div className="text-[11px] text-slate-500">
                            Paid: ${inv.amountPaid.toLocaleString()}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            inv.status === 'Paid'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : inv.status === 'Partial'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : inv.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Beacon Garden Schooling System • {branch?.name}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
          >
            Close Dossier
          </button>
        </div>

        {/* Document Viewer Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/70 p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">{previewDoc.title}</h3>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Document Type:</span>
                  <span className="font-bold text-slate-800">{previewDoc.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">File Name:</span>
                  <span className="font-mono text-slate-800">{previewDoc.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Upload Date:</span>
                  <span className="font-medium text-slate-800">{previewDoc.uploadDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className={`font-bold ${previewDoc.verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {previewDoc.verified ? 'Verified & Attested Official Document' : 'Pending Verification'}
                  </span>
                </div>
                {previewDoc.notes && (
                  <div className="pt-2 border-t border-slate-200 text-slate-600 italic">
                    Note: "{previewDoc.notes}"
                  </div>
                )}
              </div>

              {previewDoc.fileData ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 flex items-center justify-center bg-slate-100">
                  {previewDoc.fileData.startsWith('data:image') ? (
                    <img
                      src={previewDoc.fileData}
                      alt="Document Preview"
                      className="max-h-60 object-contain"
                    />
                  ) : (
                    <div className="p-6 text-center text-slate-500">
                      <FileText className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                      <p className="font-semibold">Official Record Archive</p>
                      <p className="text-[11px]">Ready for download and verification print.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500">
                  <FileText className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                  <p className="font-bold text-slate-800">{previewDoc.fileName}</p>
                  <p className="text-[11px] text-slate-400">
                    Official School Record Document Archive for Beacon Garden Schooling System
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student, StudentDocument } from '../../types';
import {
  X,
  UserPlus,
  Save,
  AlertCircle,
  Building2,
  User,
  Phone,
  HeartPulse,
  History,
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  FileCheck,
  Plus,
  Eye,
} from 'lucide-react';

interface Props {
  studentToEdit?: Student | null;
  onClose: () => void;
}

type TabKey = 'basic' | 'guardian' | 'medical' | 'previousSchool' | 'documents';

export const StudentFormModal: React.FC<Props> = ({ studentToEdit, onClose }) => {
  const { data, addStudent, updateStudent } = useSchool();

  const [activeTab, setActiveTab] = useState<TabKey>('basic');

  // Branch & Basic Info
  const [branchId, setBranchId] = useState<string>(
    studentToEdit?.branchId || (data?.branches && data.branches[0]?.id) || 'branch-arat'
  );
  const [firstName, setFirstName] = useState(studentToEdit?.firstName || '');
  const [lastName, setLastName] = useState(studentToEdit?.lastName || '');
  const [rollNumber, setRollNumber] = useState(studentToEdit?.rollNumber || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(studentToEdit?.gender || 'Male');
  const [dateOfBirth, setDateOfBirth] = useState(studentToEdit?.dateOfBirth || '2012-01-01');
  const [classId, setClassId] = useState(
    studentToEdit?.classId ||
      (data?.classes || []).find((c) => c.branchId === branchId)?.id ||
      (data?.classes && data.classes[0]?.id) ||
      'c-pg-arat'
  );
  const [bloodGroup, setBloodGroup] = useState(studentToEdit?.bloodGroup || 'B+');
  const [address, setAddress] = useState(
    studentToEdit?.address || 'Village Arat Koroona, Post Office Umarzai, Charsadda'
  );
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Suspended'>(
    studentToEdit?.status || 'Active'
  );

  // Guardian Details
  const [guardianName, setGuardianName] = useState(studentToEdit?.guardian?.name || '');
  const [guardianRelationship, setGuardianRelationship] = useState(
    studentToEdit?.guardian?.relationship || 'Father'
  );
  const [guardianPhone, setGuardianPhone] = useState(studentToEdit?.guardian?.phone || '');
  const [guardianAltPhone, setGuardianAltPhone] = useState(studentToEdit?.guardian?.altPhone || '');
  const [guardianEmail, setGuardianEmail] = useState(studentToEdit?.guardian?.email || '');
  const [guardianOccupation, setGuardianOccupation] = useState(
    studentToEdit?.guardian?.occupation || ''
  );
  const [guardianCnic, setGuardianCnic] = useState(studentToEdit?.guardian?.cnicOrId || '');
  const [guardianAddress, setGuardianAddress] = useState(studentToEdit?.guardian?.address || '');

  // Emergency Contacts
  const [emergencyName, setEmergencyName] = useState(
    studentToEdit?.emergencyDetails?.name || studentToEdit?.guardian?.name || ''
  );
  const [emergencyRelationship, setEmergencyRelationship] = useState(
    studentToEdit?.emergencyDetails?.relationship || 'Father'
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    studentToEdit?.emergencyContact || studentToEdit?.emergencyDetails?.phone || ''
  );
  const [emergencyAltPhone, setEmergencyAltPhone] = useState(
    studentToEdit?.emergencyDetails?.altPhone || ''
  );
  const [emergencyNotes, setEmergencyNotes] = useState(
    studentToEdit?.emergencyDetails?.notes || ''
  );

  // Medical Details
  const [medicalConditions, setMedicalConditions] = useState(
    studentToEdit?.medicalDetails?.conditions || ''
  );
  const [allergies, setAllergies] = useState(
    studentToEdit?.medicalDetails?.allergies || studentToEdit?.allergiesOrMedical || ''
  );
  const [regularMedications, setRegularMedications] = useState(
    studentToEdit?.medicalDetails?.regularMedications || ''
  );
  const [doctorName, setDoctorName] = useState(
    studentToEdit?.medicalDetails?.emergencyDoctorName || ''
  );
  const [doctorPhone, setDoctorPhone] = useState(
    studentToEdit?.medicalDetails?.emergencyDoctorPhone || ''
  );
  const [specialMedicalCare, setSpecialMedicalCare] = useState(
    studentToEdit?.medicalDetails?.specialCareInstructions || ''
  );

  // Previous School & Transfer Certificate (TC)
  const [prevSchoolName, setPrevSchoolName] = useState(
    studentToEdit?.previousSchool?.schoolName || ''
  );
  const [prevClass, setPrevClass] = useState(
    studentToEdit?.previousSchool?.previousClass || ''
  );
  const [prevPassingYear, setPrevPassingYear] = useState(
    studentToEdit?.previousSchool?.passingYear || '2024'
  );
  const [prevTcNumber, setPrevTcNumber] = useState(
    studentToEdit?.previousSchool?.tcNumber || ''
  );
  const [prevTcDate, setPrevTcDate] = useState(
    studentToEdit?.previousSchool?.tcIssueDate || ''
  );
  const [prevReasonLeaving, setPrevReasonLeaving] = useState(
    studentToEdit?.previousSchool?.reasonForLeaving || 'Relocation / Admitted to Beacon Garden'
  );
  const [prevPercentage, setPrevPercentage] = useState(
    studentToEdit?.previousSchool?.previousPercentageOrGpa || ''
  );
  const [prevRemarks, setPrevRemarks] = useState(
    studentToEdit?.previousSchool?.remarks || ''
  );

  // Documents & Certificates
  const [documents, setDocuments] = useState<StudentDocument[]>(
    studentToEdit?.documents || [
      {
        id: 'doc-tc-sample',
        title: 'Official School Transfer Certificate (TC / SLC)',
        type: 'Transfer Certificate (TC)',
        fileName: 'Transfer_Certificate_SLC.pdf',
        fileSize: '420 KB',
        uploadDate: new Date().toISOString().split('T')[0],
        verified: true,
        notes: 'Original stamped certificate verified by administration.',
      },
      {
        id: 'doc-bform-sample',
        title: 'NADRA Birth Certificate / B-Form Copy',
        type: 'Birth Certificate / B-Form',
        fileName: 'Nadra_B_Form_Official.pdf',
        fileSize: '680 KB',
        uploadDate: new Date().toISOString().split('T')[0],
        verified: true,
        notes: 'Verified date of birth and parentage.',
      },
    ]
  );

  // New Doc Upload Inputs
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<StudentDocument['type']>('Transfer Certificate (TC)');
  const [newDocNotes, setNewDocNotes] = useState('');
  const [previewDocModal, setPreviewDocModal] = useState<StudentDocument | null>(null);

  const [error, setError] = useState('');

  // When branch changes, filter classes or set default
  const branchClasses = (data?.classes || []).filter((c) => c.branchId === branchId);

  const handleBranchChange = (newBranchId: string) => {
    setBranchId(newBranchId);
    const firstClassOfBranch = (data?.classes || []).find((c) => c.branchId === newBranchId);
    if (firstClassOfBranch) {
      setClassId(firstClassOfBranch.id);
    }
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
        notes: newDocNotes.trim() || 'Uploaded via student registration portal.',
        verified: true,
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setNewDocTitle('');
      setNewDocNotes('');
      // Reset input
      e.target.value = '';
    };

    reader.readAsDataURL(file);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleToggleVerify = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, verified: !d.verified } : d))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !rollNumber.trim()) {
      setError('Please provide First Name, Last Name, and Roll Number.');
      setActiveTab('basic');
      return;
    }
    if (!guardianName.trim() || !guardianPhone.trim()) {
      setError('Guardian Name and Primary Phone are required for student safety records.');
      setActiveTab('guardian');
      return;
    }

    const selectedBranchObj = (data?.branches || []).find((b) => b.id === branchId);
    const branchName = selectedBranchObj ? selectedBranchObj.name : 'Arat Koroona Campus';

    const selectedClassObj = (data?.classes || []).find((c) => c.id === classId);
    const className = selectedClassObj ? selectedClassObj.name : 'Grade 10-A (Science)';

    const studentPayload: Omit<Student, 'id' | 'admissionNumber'> = {
      rollNumber: rollNumber.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      dateOfBirth,
      branchId,
      branchName,
      classId,
      className,
      bloodGroup,
      address: address.trim(),
      status,
      enrollmentDate: studentToEdit?.enrollmentDate || new Date().toISOString().split('T')[0],
      guardian: {
        name: guardianName.trim(),
        relationship: guardianRelationship.trim(),
        phone: guardianPhone.trim(),
        altPhone: guardianAltPhone.trim(),
        email: guardianEmail.trim(),
        occupation: guardianOccupation.trim(),
        cnicOrId: guardianCnic.trim(),
        address: guardianAddress.trim() || address.trim(),
      },
      emergencyContact: emergencyPhone.trim() || guardianPhone.trim(),
      emergencyDetails: {
        name: emergencyName.trim() || guardianName.trim(),
        relationship: emergencyRelationship.trim() || guardianRelationship.trim(),
        phone: emergencyPhone.trim() || guardianPhone.trim(),
        altPhone: emergencyAltPhone.trim(),
        notes: emergencyNotes.trim(),
      },
      allergiesOrMedical: allergies.trim() || medicalConditions.trim() || 'None',
      medicalDetails: {
        bloodGroup,
        conditions: medicalConditions.trim(),
        allergies: allergies.trim(),
        regularMedications: regularMedications.trim(),
        emergencyDoctorName: doctorName.trim(),
        emergencyDoctorPhone: doctorPhone.trim(),
        specialCareInstructions: specialMedicalCare.trim(),
      },
      previousSchool: {
        schoolName: prevSchoolName.trim(),
        previousClass: prevClass.trim(),
        passingYear: prevPassingYear.trim(),
        tcNumber: prevTcNumber.trim(),
        tcIssueDate: prevTcDate.trim(),
        reasonForLeaving: prevReasonLeaving.trim(),
        previousPercentageOrGpa: prevPercentage.trim(),
        remarks: prevRemarks.trim(),
      },
      documents,
    };

    if (studentToEdit) {
      updateStudent({
        ...studentToEdit,
        ...studentPayload,
      });
    } else {
      addStudent(studentPayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {studentToEdit ? 'Edit Student Profile & Dossier' : 'Beacon Garden Student Admission & Enrollment'}
              </h2>
              <p className="text-xs text-slate-500">
                Beacon Garden Schooling System • Comprehensive Profile & Transfer Records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-4 gap-1 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'basic'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Demographics & Branch</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guardian')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'guardian'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>2. Guardian & Emergency</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('medical')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'medical'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>3. Medical & Health File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('previousSchool')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'previousSchool'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>4. Previous School & TC</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>5. Certificates & Uploads ({documents.length})</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto text-xs text-slate-700 bg-white flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* TAB 1: BASIC DEMOGRAPHICS & BRANCH */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              {/* Branch Assignment Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    School Campus / Branch Assignment
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.branches.map((b) => (
                    <label
                      key={b.id}
                      onClick={() => handleBranchChange(b.id)}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                        branchId === b.id
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 text-slate-900 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="branchSelection"
                        checked={branchId === b.id}
                        onChange={() => handleBranchChange(b.id)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{b.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{b.address}</div>
                        {b.landmark && (
                          <div className="text-[10px] text-blue-700 font-semibold mt-1">
                            Landmark: {b.landmark}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Personal Particulars */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Student Identity Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Muhammad"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Last Name / Surname *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Bilal"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Class Roll Number *</label>
                    <input
                      type="text"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="e.g. 101"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Class (Playgroup to 10th)</label>
                    <select
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {branchClasses.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                      {branchClasses.length === 0 &&
                        data.classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-medium mb-1">Permanent Residential Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Village Arat Koroona, Post Office Umarzai, Tehsil Charsadda"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Enrollment Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold"
                    >
                      <option value="Active">Active Student</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GUARDIAN & EMERGENCY CONTACTS */}
          {activeTab === 'guardian' && (
            <div className="space-y-6">
              {/* Primary Guardian Details */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Primary Parent / Legal Guardian Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Guardian Full Name *</label>
                    <input
                      type="text"
                      required
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="e.g. Haji Bilal Ahmad"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Relationship to Student</label>
                    <select
                      value={guardianRelationship}
                      onChange={(e) => setGuardianRelationship(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Grandfather">Grandfather</option>
                      <option value="Grandmother">Grandmother</option>
                      <option value="Uncle">Uncle</option>
                      <option value="Aunt">Aunt</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">National CNIC / ID Number</label>
                    <input
                      type="text"
                      value={guardianCnic}
                      onChange={(e) => setGuardianCnic(e.target.value)}
                      placeholder="e.g. 17101-1234567-1"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Primary Phone / Mobile *</label>
                    <input
                      type="tel"
                      required
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="e.g. +92 (301) 889-4455"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Alternative Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={guardianAltPhone}
                      onChange={(e) => setGuardianAltPhone(e.target.value)}
                      placeholder="e.g. +92 (345) 998-1122"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Guardian Email</label>
                    <input
                      type="email"
                      value={guardianEmail}
                      onChange={(e) => setGuardianEmail(e.target.value)}
                      placeholder="e.g. bilal.ahmad.kpk@gmail.com"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Occupation & Employer</label>
                    <input
                      type="text"
                      value={guardianOccupation}
                      onChange={(e) => setGuardianOccupation(e.target.value)}
                      placeholder="e.g. Business Owner / Agriculture / Merchant"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Guardian Residential / Office Address</label>
                    <input
                      type="text"
                      value={guardianAddress}
                      onChange={(e) => setGuardianAddress(e.target.value)}
                      placeholder="e.g. Arat Koroona Village, Umarzai, Charsadda"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dedicated Emergency Contacts Section */}
              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <Phone className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wider">
                    Emergency Contact & Escort Authorization
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500">
                  This individual will be contacted immediately if parents cannot be reached during school hours or medical emergencies.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Emergency Contact Person</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="e.g. Tariq Ahmad (Uncle)"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Relationship</label>
                    <input
                      type="text"
                      value={emergencyRelationship}
                      onChange={(e) => setEmergencyRelationship(e.target.value)}
                      placeholder="e.g. Paternal Uncle, Neighbour, Driver"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Emergency Direct Hotline *</label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="e.g. +92 (301) 889-4455"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Secondary Emergency Phone</label>
                    <input
                      type="tel"
                      value={emergencyAltPhone}
                      onChange={(e) => setEmergencyAltPhone(e.target.value)}
                      placeholder="e.g. +92 (300) 905-1122"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Authorized Pickup & Special Instructions</label>
                    <input
                      type="text"
                      value={emergencyNotes}
                      onChange={(e) => setEmergencyNotes(e.target.value)}
                      placeholder="e.g. Authorized to pick up student from campus after school."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDICAL CONDITIONS & ALLERGIES */}
          {activeTab === 'medical' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wider">
                    Student Medical History, Conditions & Allergy Warnings
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Known Medical Conditions / Chronic Illnesses</label>
                    <textarea
                      rows={3}
                      value={medicalConditions}
                      onChange={(e) => setMedicalConditions(e.target.value)}
                      placeholder="e.g. Mild Childhood Asthma (carries inhaler), Vision corrective spectacles, Heart condition, None..."
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Allergies & Dietary Restrictions</label>
                    <textarea
                      rows={3}
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="e.g. Severe Penicillin allergy, Peanuts allergy, Dust sensitivity, Lactose intolerance, None..."
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Regular Medications (If any)</label>
                    <input
                      type="text"
                      value={regularMedications}
                      onChange={(e) => setRegularMedications(e.target.value)}
                      placeholder="e.g. Ventolin Inhaler on demand"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Family Doctor / Pediatrician Name</label>
                    <input
                      type="text"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      placeholder="e.g. Dr. Ihsan Ullah (MBBS)"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Doctor / Clinic Phone Number</label>
                    <input
                      type="tel"
                      value={doctorPhone}
                      onChange={(e) => setDoctorPhone(e.target.value)}
                      placeholder="e.g. +92 (91) 651-9900"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    First-Aid Protocol & Hospital Preference in Emergency
                  </label>
                  <input
                    type="text"
                    value={specialMedicalCare}
                    onChange={(e) => setSpecialMedicalCare(e.target.value)}
                    placeholder="e.g. District Headquarter (DHQ) Hospital Charsadda or Umarzai Rural Health Centre"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PREVIOUS SCHOOL & TRANSFER CERTIFICATE */}
          {activeTab === 'previousSchool' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <History className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wider">
                    Previous School Academic History & Transfer Certificate (TC / SLC)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500">
                  Enter credentials from the previous schooling institution and the official School Leaving Certificate.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-medium mb-1">Previous School / College Name</label>
                    <input
                      type="text"
                      value={prevSchoolName}
                      onChange={(e) => setPrevSchoolName(e.target.value)}
                      placeholder="e.g. Government Higher Secondary School Umarzai / Model Public School"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Last Class Attended</label>
                    <input
                      type="text"
                      value={prevClass}
                      onChange={(e) => setPrevClass(e.target.value)}
                      placeholder="e.g. Grade 9 / Grade 8 / Prep"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Passing / Leaving Year</label>
                    <input
                      type="text"
                      value={prevPassingYear}
                      onChange={(e) => setPrevPassingYear(e.target.value)}
                      placeholder="e.g. 2024"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">TC / SLC Serial Number</label>
                    <input
                      type="text"
                      value={prevTcNumber}
                      onChange={(e) => setPrevTcNumber(e.target.value)}
                      placeholder="e.g. TC-2024-8849"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">TC Issue Date</label>
                    <input
                      type="date"
                      value={prevTcDate}
                      onChange={(e) => setPrevTcDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Previous Score / GPA</label>
                    <input
                      type="text"
                      value={prevPercentage}
                      onChange={(e) => setPrevPercentage(e.target.value)}
                      placeholder="e.g. 88.4% / 3.8 GPA"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Reason for Leaving</label>
                    <input
                      type="text"
                      value={prevReasonLeaving}
                      onChange={(e) => setPrevReasonLeaving(e.target.value)}
                      placeholder="e.g. Transferred to Beacon Garden System / Family Relocation"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Previous Conduct / Character Remarks</label>
                    <input
                      type="text"
                      value={prevRemarks}
                      onChange={(e) => setPrevRemarks(e.target.value)}
                      placeholder="e.g. Exemplary academic conduct, active in co-curriculars"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CERTIFICATES & DOCUMENT UPLOADS */}
          {activeTab === 'documents' && (
            <div className="space-y-5">
              {/* Upload New Document Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Attach School Record or Transfer Certificate
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Document Category</label>
                    <select
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="Transfer Certificate (TC)">Transfer Certificate (TC / SLC)</option>
                      <option value="Previous Report Card">Previous Grade Report Card</option>
                      <option value="Birth Certificate / B-Form">NADRA Birth Certificate / B-Form</option>
                      <option value="Medical Clearance">Medical Fitness / Immunization</option>
                      <option value="Character Certificate">Character Certificate</option>
                      <option value="Other">Other Official Document</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Custom Document Title</label>
                    <input
                      type="text"
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      placeholder="e.g. Original TC - Govt School Umarzai"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Verification / Admin Notes</label>
                    <input
                      type="text"
                      value={newDocNotes}
                      onChange={(e) => setNewDocNotes(e.target.value)}
                      placeholder="e.g. Original inspected & attested"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Upload File Input Zone */}
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer bg-white">
                    <Upload className="w-7 h-7 text-blue-600 mb-1" />
                    <span className="font-bold text-slate-800 text-xs">
                      Click to choose file or drag & drop certificate
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Supports PDF, PNG, JPG, Scanned Documents (Max 15MB)
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Attached Records on File ({documents.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    All documents are encrypted and archived locally.
                  </span>
                </div>

                {documents.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 bg-slate-50">
                    No documents attached yet. Upload the student's Transfer Certificate or B-Form above.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-200 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">{doc.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                                {doc.type}
                              </span>
                              {doc.verified && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-bold border border-green-200 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Verified</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                              <span className="font-mono">{doc.fileName}</span>
                              {doc.fileSize && <span>• {doc.fileSize}</span>}
                              <span>• Uploaded: {doc.uploadDate}</span>
                              {doc.notes && <span className="italic text-slate-600">• "{doc.notes}"</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewDocModal(doc)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-slate-200 text-xs font-semibold flex items-center gap-1"
                            title="Preview Document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleVerify(doc.id)}
                            className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                              doc.verified
                                ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {doc.verified ? 'Unverify' : 'Mark Verified'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 border border-slate-200 hover:text-rose-600"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              Campus: <strong className="text-slate-800">{(data?.branches || []).find((b) => b.id === branchId)?.name || 'Beacon Garden Campus'}</strong>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{studentToEdit ? 'Save Profile Changes' : 'Enroll Student Record'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Modal for Previewing Document */}
        {previewDocModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/70 p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">{previewDocModal.title}</h3>
                </div>
                <button
                  onClick={() => setPreviewDocModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Document Type:</span>
                  <span className="font-bold text-slate-800">{previewDocModal.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">File Name:</span>
                  <span className="font-mono text-slate-800">{previewDocModal.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date Uploaded:</span>
                  <span className="font-medium text-slate-800">{previewDocModal.uploadDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Status:</span>
                  <span className={`font-bold ${previewDocModal.verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {previewDocModal.verified ? 'Official Verified Document' : 'Pending Verification'}
                  </span>
                </div>
                {previewDocModal.notes && (
                  <div className="pt-2 border-t border-slate-200 text-slate-600 italic">
                    Note: "{previewDocModal.notes}"
                  </div>
                )}
              </div>

              {previewDocModal.fileData ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 flex items-center justify-center bg-slate-100">
                  {previewDocModal.fileData.startsWith('data:image') ? (
                    <img
                      src={previewDocModal.fileData}
                      alt="Certificate Preview"
                      className="max-h-60 object-contain"
                    />
                  ) : (
                    <div className="p-6 text-center text-slate-500">
                      <FileText className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                      <p className="font-semibold">Binary Document Archive</p>
                      <p className="text-[11px]">Ready for download and verification print.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500">
                  <FileText className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                  <p className="font-bold text-slate-800">{previewDocModal.fileName}</p>
                  <p className="text-[11px] text-slate-400">
                    Official School Record Document Archive for Beacon Garden Schooling System
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewDocModal(null)}
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

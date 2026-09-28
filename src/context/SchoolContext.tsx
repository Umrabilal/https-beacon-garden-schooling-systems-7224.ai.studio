import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  SchoolDatabaseState,
  UserRole,
  UserProfile,
  Student,
  StudentDocument,
  AttendanceRecord,
  AttendanceStatus,
  GradeEntry,
  Exam,
  Invoice,
  PaymentReceipt,
  TimetableSlot,
  SchoolInfo,
} from '../types';
import { initialSchoolData } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'beacongarden_schooldesk_database_v5';
const LEGACY_STORAGE_KEY_V4 = 'beacongarden_schooldesk_database_v4';
const LEGACY_STORAGE_KEY_V3 = 'beacongarden_schooldesk_database_v3';
const LEGACY_STORAGE_KEY_V2 = 'beacongarden_schooldesk_database_v2';
const LEGACY_STORAGE_KEY = 'schooldesk_database_v1';

export type ActiveTab = 'dashboard' | 'students' | 'attendance' | 'grades' | 'fees' | 'timetable' | 'users' | 'settings';

interface SchoolContextType {
  data: SchoolDatabaseState;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: UserProfile;
  setCurrentUserRole: (role: UserRole) => void;
  globalSearch: string;
  setGlobalSearch: (term: string) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;

  // Student Actions
  addStudent: (studentData: Omit<Student, 'id' | 'admissionNumber'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  addStudentDocument: (
    studentId: string,
    doc: Omit<StudentDocument, 'id' | 'uploadDate'> & { id?: string; uploadDate?: string; verifiedStatus?: string }
  ) => void;
  deleteStudentDocument: (studentId: string, documentId: string) => void;
  updateStudentDocumentStatus: (
    studentId: string,
    documentId: string,
    status: any
  ) => void;

  // Attendance Actions
  markAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  batchMarkAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;

  // Grade Actions
  saveGrade: (entry: Omit<GradeEntry, 'id' | 'gradedDate'>) => void;
  addExam: (exam: Omit<Exam, 'id'>) => void;

  // Fee Actions
  createInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'amountPaid' | 'status'>) => void;
  recordPayment: (payment: Omit<PaymentReceipt, 'id' | 'receiptNumber'>) => void;

  // Timetable Actions
  saveTimetableSlot: (slot: Omit<TimetableSlot, 'id'> & { id?: string }) => void;
  deleteTimetableSlot: (id: string) => void;

  // Staff Actions
  addStaff: (staff: UserProfile) => void;

  // School Settings & DB Actions
  updateSchoolInfo: (info: SchoolInfo) => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonData: string) => boolean;
  resetDatabase: () => void;
  resetToInitialData: () => void;

  // Computed / Helpers
  getStudentAttendanceStats: (studentId: string) => { total: number; present: number; absent: number; late: number; excused: number; percentage: number };
  getStudentGPA: (studentId: string, examId?: string) => { gpa: number; totalCredits: number; grades: GradeEntry[] };
  getStudentBalance: (studentId: string) => { billed: number; paid: number; balance: number; overdue: number };
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

const sanitizeAndMergeState = (raw: any): SchoolDatabaseState => {
  if (!raw || typeof raw !== 'object') {
    return initialSchoolData;
  }

  const rawBranches = Array.isArray(raw.branches) && raw.branches.length > 0 ? raw.branches : initialSchoolData.branches;
  const sanitizedBranches = rawBranches.map((b: any) => {
    if (b.id === 'branch-bazar') {
      return {
        ...b,
        headTeacher: 'Niamat Ullah',
      };
    }
    return b;
  });

  const mergedStaff = Array.isArray(raw.staff) && raw.staff.length > 0 ? [...raw.staff] : [...initialSchoolData.staff];
  if (!mergedStaff.some((s: UserProfile) => s.id === 'u-principal-2' || s.name?.toLowerCase().includes('niamat'))) {
    const niamatStaff = initialSchoolData.staff.find((s) => s.id === 'u-principal-2');
    if (niamatStaff) mergedStaff.splice(2, 0, niamatStaff);
  }

  const sanitizedStaff = mergedStaff.map((s: UserProfile) => {
    if (s.role === 'admin' || s.id === 'u-admin-1') {
      return {
        ...s,
        name: 'Mujeeb Ullah',
        email: s.email && !s.email.includes('fazl') ? s.email : 'mujeebullah@beacongarden.edu.pk',
        title: 'Super Admin',
      };
    }
    if (s.id === 'u-principal-2' || s.name?.toLowerCase().includes('niamat')) {
      return {
        ...s,
        name: 'Niamat Ullah',
        title: 'Principal / Head of Campus (Umarzai Bazar Campus)',
        branchId: 'branch-bazar',
        branchName: 'Umarzai Bazar Campus',
      };
    }
    return s;
  });

  return {
    schoolInfo: {
      ...initialSchoolData.schoolInfo,
      ...(raw.schoolInfo || {}),
      ownerName: raw.schoolInfo?.ownerName || 'Fazlur Rahman',
      principalName: raw.schoolInfo?.principalName || 'Fazlur Rahman',
    },
    branches: sanitizedBranches,
    students: Array.isArray(raw.students) && raw.students.length > 0 ? raw.students : initialSchoolData.students,
    classes: Array.isArray(raw.classes) && raw.classes.length > 0 ? raw.classes : initialSchoolData.classes,
    subjects: Array.isArray(raw.subjects) && raw.subjects.length > 0 ? raw.subjects : initialSchoolData.subjects,
    staff: sanitizedStaff,
    attendance: Array.isArray(raw.attendance) ? raw.attendance : initialSchoolData.attendance,
    exams: Array.isArray(raw.exams) && raw.exams.length > 0 ? raw.exams : initialSchoolData.exams,
    grades: Array.isArray(raw.grades) ? raw.grades : initialSchoolData.grades,
    invoices: Array.isArray(raw.invoices) ? raw.invoices : initialSchoolData.invoices,
    receipts: Array.isArray(raw.receipts) ? raw.receipts : initialSchoolData.receipts,
    timetable: Array.isArray(raw.timetable) ? raw.timetable : initialSchoolData.timetable,
  };
};

export const SchoolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<SchoolDatabaseState>(() => {
    try {
      const saved =
        localStorage.getItem(LOCAL_STORAGE_KEY) ||
        localStorage.getItem(LEGACY_STORAGE_KEY_V4) ||
        localStorage.getItem(LEGACY_STORAGE_KEY_V3) ||
        localStorage.getItem(LEGACY_STORAGE_KEY_V2) ||
        localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return sanitizeAndMergeState(parsed);
      }
    } catch (e) {
      console.error('Failed to load local school database:', e);
    }
    return initialSchoolData;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist school database to localStorage:', e);
    }
  }, [data]);

  // Current active user based on currentRole
  const currentUser = useMemo(() => {
    const staffList = Array.isArray(data?.staff) ? data.staff : initialSchoolData.staff;
    const matched = staffList.find((s) => s?.role === currentRole);
    if (matched) return matched;
    return staffList[0] || initialSchoolData.staff[0];
  }, [data?.staff, currentRole]);

  const setCurrentUserRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  // Student Actions
  const addStudent = (studentData: Omit<Student, 'id' | 'admissionNumber'>) => {
    const newId = `stu-${Date.now().toString().slice(-4)}`;
    const studentList = Array.isArray(data?.students) ? data.students : [];
    const admissionNo = `BGS-${new Date().getFullYear()}-${String(studentList.length + 1).padStart(3, '0')}`;
    const newStudent: Student = {
      ...studentData,
      id: newId,
      admissionNumber: admissionNo,
    };
    setData((prev) => ({
      ...prev,
      students: [newStudent, ...(prev.students || [])],
    }));
  };

  const updateStudent = (student: Student) => {
    setData((prev) => ({
      ...prev,
      students: (prev.students || []).map((s) => (s.id === student.id ? student : s)),
    }));
  };

  const deleteStudent = (id: string) => {
    setData((prev) => ({
      ...prev,
      students: (prev.students || []).filter((s) => s.id !== id),
    }));
  };

  const addStudentDocument = (
    studentId: string,
    doc: Omit<StudentDocument, 'id' | 'uploadDate'> & { id?: string; uploadDate?: string; verifiedStatus?: string }
  ) => {
    const newDoc: StudentDocument = {
      ...doc,
      id: doc.id || `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      uploadDate: doc.uploadDate || new Date().toISOString().split('T')[0],
      verified: doc.verified ?? true,
    };

    setData((prev) => ({
      ...prev,
      students: (prev.students || []).map((s) => {
        if (s.id === studentId) {
          const currentDocs = s.documents || [];
          return {
            ...s,
            documents: [newDoc, ...currentDocs],
          };
        }
        return s;
      }),
    }));
  };

  const deleteStudentDocument = (studentId: string, documentId: string) => {
    setData((prev) => ({
      ...prev,
      students: (prev.students || []).map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            documents: (s.documents || []).filter((d) => d.id !== documentId),
          };
        }
        return s;
      }),
    }));
  };

  const updateStudentDocumentStatus = (
    studentId: string,
    documentId: string,
    status: any
  ) => {
    setData((prev) => ({
      ...prev,
      students: (prev.students || []).map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            documents: (s.documents || []).map((d) =>
              d.id === documentId ? { ...d, verified: status === 'Verified' || status === true } : d
            ),
          };
        }
        return s;
      }),
    }));
  };

  // Attendance Actions
  const markAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    setData((prev) => {
      const existingAttendance = prev.attendance || [];
      const filtered = existingAttendance.filter(
        (a) => !(a.studentId === record.studentId && a.date === record.date && (a.period || 0) === (record.period || 0))
      );
      const newRecord: AttendanceRecord = {
        ...record,
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      return {
        ...prev,
        attendance: [...filtered, newRecord],
      };
    });
  };

  const batchMarkAttendance = (records: Omit<AttendanceRecord, 'id'>[]) => {
    setData((prev) => {
      let updatedList = [...(prev.attendance || [])];
      records.forEach((rec) => {
        updatedList = updatedList.filter(
          (a) => !(a.studentId === rec.studentId && a.date === rec.date && (a.period || 0) === (rec.period || 0))
        );
        updatedList.push({
          ...rec,
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        });
      });
      return {
        ...prev,
        attendance: updatedList,
      };
    });
  };

  // Grades Actions
  const saveGrade = (entry: Omit<GradeEntry, 'id' | 'gradedDate'>) => {
    setData((prev) => {
      const existingGrades = prev.grades || [];
      const filtered = existingGrades.filter(
        (g) => !(g.examId === entry.examId && g.studentId === entry.studentId && g.subjectId === entry.subjectId)
      );
      const newGrade: GradeEntry = {
        ...entry,
        id: `gr-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        gradedDate: new Date().toISOString().split('T')[0],
      };
      return {
        ...prev,
        grades: [...filtered, newGrade],
      };
    });
  };

  const addExam = (exam: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      ...exam,
      id: `ex-${Date.now().toString().slice(-4)}`,
    };
    setData((prev) => ({
      ...prev,
      exams: [newExam, ...(prev.exams || [])],
    }));
  };

  // Fees & Invoices Actions
  const createInvoice = (inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'amountPaid' | 'status'>) => {
    const invoicesList = prevInvoicesList(data);
    const invNumber = `INV-${new Date().getFullYear()}-${String(invoicesList.length + 80).padStart(4, '0')}`;
    const newInvoice: Invoice = {
      ...inv,
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      amountPaid: 0,
      status: 'Pending',
    };
    setData((prev) => ({
      ...prev,
      invoices: [newInvoice, ...(prev.invoices || [])],
    }));
  };

  const prevInvoicesList = (currentData: SchoolDatabaseState) => {
    return Array.isArray(currentData?.invoices) ? currentData.invoices : [];
  };

  const recordPayment = (payment: Omit<PaymentReceipt, 'id' | 'receiptNumber'>) => {
    const receiptsList = Array.isArray(data?.receipts) ? data.receipts : [];
    const recNumber = `REC-${new Date().getFullYear()}-${String(receiptsList.length + 340).padStart(4, '0')}`;
    const newReceipt: PaymentReceipt = {
      ...payment,
      id: `rec-${Date.now()}`,
      receiptNumber: recNumber,
    };

    setData((prev) => {
      const updatedInvoices = (prev.invoices || []).map((inv) => {
        if (inv.id === payment.invoiceId) {
          const newPaid = (inv.amountPaid || 0) + payment.amount;
          let newStatus: Invoice['status'] = 'Pending';
          if (newPaid >= inv.totalAmount) {
            newStatus = 'Paid';
          } else if (newPaid > 0) {
            newStatus = 'Partial';
          }
          return {
            ...inv,
            amountPaid: newPaid,
            status: newStatus,
          };
        }
        return inv;
      });

      return {
        ...prev,
        receipts: [newReceipt, ...(prev.receipts || [])],
        invoices: updatedInvoices,
      };
    });
  };

  // Timetable Actions
  const saveTimetableSlot = (slot: Omit<TimetableSlot, 'id'> & { id?: string }) => {
    setData((prev) => {
      const existingTimetable = prev.timetable || [];
      if (slot.id) {
        return {
          ...prev,
          timetable: existingTimetable.map((t) => (t.id === slot.id ? (slot as TimetableSlot) : t)),
        };
      } else {
        const newSlot: TimetableSlot = {
          ...slot,
          id: `tt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        };
        return {
          ...prev,
          timetable: [...existingTimetable, newSlot],
        };
      }
    });
  };

  const deleteTimetableSlot = (id: string) => {
    setData((prev) => ({
      ...prev,
      timetable: (prev.timetable || []).filter((t) => t.id !== id),
    }));
  };

  // Staff Actions
  const addStaff = (staffMember: UserProfile) => {
    setData((prev) => ({
      ...prev,
      staff: [...(prev.staff || []), staffMember],
    }));
  };

  // School Info
  const updateSchoolInfo = (info: SchoolInfo) => {
    setData((prev) => ({
      ...prev,
      schoolInfo: info,
    }));
  };

  // Backup & Import
  const exportDatabaseJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `beacongarden-db-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDatabaseJSON = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed && typeof parsed === 'object') {
        setData(sanitizeAndMergeState(parsed));
        return true;
      }
    } catch (e) {
      console.error('Import failed:', e);
    }
    return false;
  };

  const resetDatabase = () => {
    setData(initialSchoolData);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  // Computed Helpers
  const getStudentAttendanceStats = (studentId: string) => {
    const attendanceList = Array.isArray(data?.attendance) ? data.attendance : [];
    const studentRecords = attendanceList.filter((a) => a.studentId === studentId);
    const total = studentRecords.length;
    if (total === 0) return { total: 0, present: 0, absent: 0, late: 0, excused: 0, percentage: 100 };
    const present = studentRecords.filter((a) => a.status === 'present').length;
    const late = studentRecords.filter((a) => a.status === 'late').length;
    const excused = studentRecords.filter((a) => a.status === 'excused').length;
    const absent = studentRecords.filter((a) => a.status === 'absent').length;
    const percentage = Math.round(((present + late * 0.8 + excused) / total) * 100);
    return { total, present, absent, late, excused, percentage: Math.min(percentage, 100) };
  };

  const getStudentGPA = (studentId: string, examId?: string) => {
    const gradesList = Array.isArray(data?.grades) ? data.grades : [];
    const subjectsList = Array.isArray(data?.subjects) ? data.subjects : initialSchoolData.subjects;
    const grades = gradesList.filter((g) => g.studentId === studentId && (!examId || g.examId === examId));
    if (grades.length === 0) return { gpa: 0, totalCredits: 0, grades: [] };

    let totalPoints = 0;
    let totalCredits = 0;

    grades.forEach((g) => {
      const sub = subjectsList.find((s) => s.id === g.subjectId);
      const credits = sub ? sub.credits : 3;
      totalPoints += g.gradePoint * credits;
      totalCredits += credits;
    });

    const gpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
    return { gpa, totalCredits, grades };
  };

  const getStudentBalance = (studentId: string) => {
    const invoicesList = Array.isArray(data?.invoices) ? data.invoices : [];
    const studentInvoices = invoicesList.filter((i) => i.studentId === studentId);
    const billed = studentInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const paid = studentInvoices.reduce((sum, i) => sum + (i.amountPaid || 0), 0);
    const balance = billed - paid;
    const overdue = studentInvoices
      .filter((i) => i.status === 'Overdue')
      .reduce((sum, i) => sum + (i.totalAmount - (i.amountPaid || 0)), 0);

    return { billed, paid, balance, overdue };
  };

  return (
    <SchoolContext.Provider
      value={{
        data,
        activeTab,
        setActiveTab,
        currentUser,
        setCurrentUserRole,
        globalSearch,
        setGlobalSearch,
        selectedStudentId,
        setSelectedStudentId,
        addStudent,
        updateStudent,
        deleteStudent,
        addStudentDocument,
        deleteStudentDocument,
        updateStudentDocumentStatus,
        markAttendance,
        batchMarkAttendance,
        saveGrade,
        addExam,
        createInvoice,
        recordPayment,
        saveTimetableSlot,
        deleteTimetableSlot,
        addStaff,
        updateSchoolInfo,
        exportDatabaseJSON,
        importDatabaseJSON,
        resetDatabase,
        resetToInitialData: resetDatabase,
        getStudentAttendanceStats,
        getStudentGPA,
        getStudentBalance,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};


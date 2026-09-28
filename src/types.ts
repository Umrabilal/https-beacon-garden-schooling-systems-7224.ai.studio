export type UserRole = 'admin' | 'teacher' | 'accountant' | 'student_parent';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  landmark?: string;
  phone: string;
  email: string;
  headTeacher: string;
  totalRooms: number;
  establishedYear: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title: string;
  branchId?: string;
  branchName?: string;
  assignedClass?: string;
  assignedSubjects?: string[];
  phone?: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "Playgroup-A", "Grade 10-A (Science)"
  grade: string; // e.g. "Playgroup", "Nursery", "Prep", "Grade 1", ..., "Grade 10"
  section: string; // e.g. "A", "B", "Science", "Arts"
  branchId: string; // 'branch-arat' | 'branch-bazar'
  branchName?: string;
  classTeacherId: string;
  room: string;
  capacity: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  credits: number;
  levelCategory?: 'Early Childhood' | 'Primary' | 'Middle' | 'Secondary';
}

export interface Guardian {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  occupation?: string;
  cnicOrId?: string;
  altPhone?: string;
  address?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  altPhone?: string;
  notes?: string;
}

export interface StudentDocument {
  id: string;
  title: string;
  type: 'Transfer Certificate (TC)' | 'Previous Report Card' | 'Birth Certificate / B-Form' | 'Medical Clearance' | 'Character Certificate' | 'Other';
  fileName: string;
  fileSize?: string;
  uploadDate: string;
  fileData?: string; // Data URL / Base64 / scan
  notes?: string;
  verified?: boolean;
}

export interface PreviousSchoolRecord {
  schoolName?: string;
  previousClass?: string;
  passingYear?: string;
  tcNumber?: string;
  tcIssueDate?: string;
  reasonForLeaving?: string;
  previousPercentageOrGpa?: string;
  remarks?: string;
}

export interface MedicalRecord {
  bloodGroup: string;
  conditions?: string; // e.g. Asthma, Vision impairment, etc.
  allergies?: string; // e.g. Penicillin, Peanuts, etc.
  regularMedications?: string;
  emergencyDoctorName?: string;
  emergencyDoctorPhone?: string;
  specialCareInstructions?: string;
}

export interface Student {
  id: string;
  rollNumber: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  branchId: string; // 'branch-arat' | 'branch-bazar'
  branchName?: string;
  classId: string;
  className: string;
  bloodGroup: string;
  address: string;
  guardian: Guardian;
  emergencyContact: string; // legacy / primary quick phone
  emergencyDetails?: EmergencyContact;
  allergiesOrMedical?: string; // legacy / quick string
  medicalDetails?: MedicalRecord;
  previousSchool?: PreviousSchoolRecord;
  documents?: StudentDocument[];
  enrollmentDate: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  avatarUrl?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  period?: number; // 0 for daily, 1-6 for period-wise
  subjectId?: string;
  status: AttendanceStatus;
  remarks?: string;
  recordedBy: string;
}

export interface Exam {
  id: string;
  title: string;
  academicYear: string;
  term: string; // e.g., "1st Term", "Mid-Term", "Final Assessment"
  startDate: string;
  endDate: string;
  status: 'Upcoming' | 'In Progress' | 'Completed';
}

export interface GradeEntry {
  id: string;
  examId: string;
  studentId: string;
  classId: string;
  subjectId: string;
  marksObtained: number;
  maxMarks: number;
  gradeLetter: string; // A+, A, B, C, D, F
  gradePoint: number; // 4.0, 3.7, etc.
  remarks?: string;
  gradedDate: string;
}

export type InvoiceStatus = 'Paid' | 'Partial' | 'Pending' | 'Overdue';

export interface FeeItem {
  id: string;
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  classId: string;
  branchId?: string;
  issueDate: string;
  dueDate: string;
  items: FeeItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  status: InvoiceStatus;
  notes?: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  studentId: string;
  branchId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Card' | 'Cheque' | 'Online';
  transactionReference: string;
  receivedBy: string;
  notes?: string;
}

export interface TimetableSlot {
  id: string;
  branchId?: string;
  classId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: number; // 1 to 6
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
  room: string;
}

export interface SchoolInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  academicYear: string;
  currentTerm: string;
  ownerName?: string;
  principalName: string;
  logoText: string;
  currency: string;
}

export interface SchoolDatabaseState {
  schoolInfo: SchoolInfo;
  branches: Branch[];
  students: Student[];
  classes: SchoolClass[];
  subjects: Subject[];
  staff: UserProfile[];
  attendance: AttendanceRecord[];
  exams: Exam[];
  grades: GradeEntry[];
  invoices: Invoice[];
  receipts: PaymentReceipt[];
  timetable: TimetableSlot[];
}

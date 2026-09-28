import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ReportCardModal } from './ReportCardModal';
import {
  Award,
  BookOpen,
  Plus,
  Save,
  Check,
  FileText,
} from 'lucide-react';

export const GradesModule: React.FC<{
  initialStudentReportId?: string | null;
  onClearReportId?: () => void;
}> = ({ initialStudentReportId, onClearReportId }) => {
  const { data, saveGrade, addExam } = useSchool();

  const [selectedExamId, setSelectedExamId] = useState<string>(data.exams[0]?.id || '');
  const [selectedClassId, setSelectedClassId] = useState<string>(data.classes[0]?.id || 'c-10a');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(data.subjects[0]?.id || 'sub-math');
  const [maxMarks, setMaxMarks] = useState<number>(100);

  // Local draft marks before saving
  const [draftMarks, setDraftMarks] = useState<Record<string, { marks: number; remarks: string }>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New exam modal
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamTerm, setNewExamTerm] = useState('Term 1');
  const [newExamStart, setNewExamStart] = useState('2026-10-15');
  const [newExamEnd, setNewExamEnd] = useState('2026-10-22');

  // Report card student modal
  const [reportCardStudentId, setReportCardStudentId] = useState<string | null>(initialStudentReportId || null);

  const examsList = Array.isArray(data?.exams) ? data.exams : [];
  const subjectsList = Array.isArray(data?.subjects) ? data.subjects : [];
  const classesList = Array.isArray(data?.classes) ? data.classes : [];
  const studentsList = Array.isArray(data?.students) ? data.students : [];
  const gradesList = Array.isArray(data?.grades) ? data.grades : [];

  const activeExam =
    examsList.find((e) => e.id === selectedExamId) ||
    examsList[0] || {
      id: 'ex-mid-2026',
      title: '1st Term Examination',
      academicYear: '2026-2027',
      term: '1st Term',
      startDate: '2026-10-15',
      endDate: '2026-10-22',
      status: 'In Progress' as const,
    };
  const activeSubject =
    subjectsList.find((s) => s.id === selectedSubjectId) ||
    subjectsList[0] || {
      id: 'sub-math-sec',
      name: 'Mathematics',
      code: 'MATH-10',
      credits: 4,
      teacherId: 'u-teacher-3',
    };
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

  // Existing grades for this exam + class + subject
  const existingGrades = gradesList.filter(
    (g) => g.examId === selectedExamId && g.classId === selectedClassId && g.subjectId === selectedSubjectId
  );

  // Helper scale conversion
  const calculateGrade = (marks: number, max: number): { letter: string; point: number } => {
    if (max <= 0) return { letter: 'F', point: 0 };
    const pct = (marks / max) * 100;
    if (pct >= 95) return { letter: 'A+', point: 4.0 };
    if (pct >= 90) return { letter: 'A', point: 3.8 };
    if (pct >= 85) return { letter: 'A-', point: 3.6 };
    if (pct >= 80) return { letter: 'B+', point: 3.3 };
    if (pct >= 75) return { letter: 'B', point: 3.0 };
    if (pct >= 70) return { letter: 'B-', point: 2.7 };
    if (pct >= 65) return { letter: 'C+', point: 2.3 };
    if (pct >= 60) return { letter: 'C', point: 2.0 };
    if (pct >= 50) return { letter: 'D', point: 1.0 };
    return { letter: 'F', point: 0.0 };
  };

  const getMarksForStudent = (studentId: string): number => {
    if (draftMarks[studentId] !== undefined) {
      return draftMarks[studentId].marks;
    }
    const existing = existingGrades.find((g) => g.studentId === studentId);
    return existing ? existing.marksObtained : 0;
  };

  const getRemarksForStudent = (studentId: string): string => {
    if (draftMarks[studentId] !== undefined) {
      return draftMarks[studentId].remarks;
    }
    const existing = existingGrades.find((g) => g.studentId === studentId);
    return existing ? existing.remarks || '' : '';
  };

  const handleUpdateMark = (studentId: string, marks: number, remarks?: string) => {
    const validMarks = Math.max(0, Math.min(marks, maxMarks));
    const currentRem = remarks !== undefined ? remarks : getRemarksForStudent(studentId);
    setDraftMarks((prev) => ({
      ...prev,
      [studentId]: { marks: validMarks, remarks: currentRem },
    }));
  };

  const handleSaveAllGrades = () => {
    studentsInClass.forEach((student) => {
      const marks = getMarksForStudent(student.id);
      const remarks = getRemarksForStudent(student.id);
      const grade = calculateGrade(marks, maxMarks);

      saveGrade({
        examId: selectedExamId,
        studentId: student.id,
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        marksObtained: marks,
        maxMarks: maxMarks,
        gradeLetter: grade.letter,
        gradePoint: grade.point,
        remarks,
      });
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim()) return;

    addExam({
      title: newExamTitle.trim(),
      academicYear: data.schoolInfo.academicYear,
      term: newExamTerm,
      startDate: newExamStart,
      endDate: newExamEnd,
      status: 'Upcoming',
    });

    setIsExamModalOpen(false);
    setNewExamTitle('');
  };

  // Class analytics on current marks
  const allCurrentScores = studentsInClass.map((s) => getMarksForStudent(s.id));
  const avgScore =
    allCurrentScores.length > 0
      ? (allCurrentScores.reduce((a, b) => a + b, 0) / allCurrentScores.length).toFixed(1)
      : '0';
  const highestScore = allCurrentScores.length > 0 ? Math.max(...allCurrentScores) : 0;
  const passingCount = allCurrentScores.filter((score) => (score / maxMarks) * 100 >= 50).length;
  const passingRate =
    allCurrentScores.length > 0 ? Math.round((passingCount / allCurrentScores.length) * 100) : 100;

  return (
    <div id="grades-module" className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Gradebook & Examination Assessments
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              GPA Scale 4.00
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter examination scores, calculate automated GPA letter grades, and generate student transcripts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsExamModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Schedule Assessment</span>
          </button>
          <button
            onClick={handleSaveAllGrades}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Markbook</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Exam Selection */}
          <div>
            <label className="block text-slate-500 mb-1 font-medium">Assessment Cycle</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
            >
              {data.exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.term})
                </option>
              ))}
            </select>
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-slate-500 mb-1 font-medium">Class / Section</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
            >
              {data.classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.room})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-slate-500 mb-1 font-medium">Subject & Code</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
            >
              {data.subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code} - {sub.credits} cr)
                </option>
              ))}
            </select>
          </div>

          {/* Max Marks */}
          <div>
            <label className="block text-slate-500 mb-1 font-medium">Maximum Marks</label>
            <input
              type="number"
              min={10}
              max={200}
              value={maxMarks}
              onChange={(e) => setMaxMarks(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono font-bold"
            />
          </div>
        </div>

        {/* Analytics Ticker */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-4">
            <div className="text-slate-600">
              Class Average: <strong className="text-emerald-700">{avgScore}</strong> / {maxMarks}
            </div>
            <div className="text-slate-600">
              Top Score: <strong className="text-blue-700">{highestScore}</strong>
            </div>
            <div className="text-slate-600">
              Passing Rate: <strong className="text-slate-900">{passingRate}%</strong>
            </div>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">
            Grading Scale: A+ (95%+), A (90%), B (75%), C (60%), D (50%)
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in shadow-xs">
          <Check className="w-4 h-4 text-green-600" />
          <span className="font-medium">Markbook grades successfully updated in local store!</span>
        </div>
      )}

      {/* Markbook SpreadSheet Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Markbook: {activeSubject.name} — {activeClass.name}
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Assessment: {activeExam ? activeExam.title : 'Current Assessment'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-14">Roll</th>
                <th className="py-3 px-4">Student Particulars</th>
                <th className="py-3 px-4 w-36">Marks Obtained (/{maxMarks})</th>
                <th className="py-3 px-4 text-center w-24">Grade</th>
                <th className="py-3 px-4 text-center w-20">GPA</th>
                <th className="py-3 px-4">Instructor Feedback / Remarks</th>
                <th className="py-3 px-4 text-right">Transcript</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentsInClass.map((student) => {
                const currentScore = getMarksForStudent(student.id);
                const currentRemarks = getRemarksForStudent(student.id);
                const calculatedGrade = calculateGrade(currentScore, maxMarks);

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

                    {/* Marks Input */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={maxMarks}
                          value={currentScore}
                          onChange={(e) =>
                            handleUpdateMark(student.id, Number(e.target.value))
                          }
                          className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-center font-bold text-slate-900 font-mono text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-slate-400 font-mono">/ {maxMarks}</span>
                      </div>
                    </td>

                    {/* Grade Badge */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded font-bold text-xs border ${
                          calculatedGrade.point >= 3.5
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : calculatedGrade.point >= 2.5
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : calculatedGrade.point >= 1.0
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {calculatedGrade.letter}
                      </span>
                    </td>

                    {/* Grade Point */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                      {calculatedGrade.point.toFixed(1)}
                    </td>

                    {/* Remarks Input */}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Feedback (e.g. Excellent progress)..."
                        value={currentRemarks}
                        onChange={(e) =>
                          handleUpdateMark(student.id, currentScore, e.target.value)
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    {/* Actions: Generate Report Card */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setReportCardStudentId(student.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-blue-600 hover:text-blue-700 text-xs font-semibold transition-colors border border-slate-200 ml-auto shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Report Card</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Assessment Modal */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>Schedule Examination Assessment</span>
            </h3>
            <form onSubmit={handleCreateExam} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Assessment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Term 1 Comprehensive Finals"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Term</label>
                  <select
                    value={newExamTerm}
                    onChange={(e) => setNewExamTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Finals">Finals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newExamStart}
                    onChange={(e) => setNewExamStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={newExamEnd}
                  onChange={(e) => setNewExamEnd(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Card Modal */}
      {reportCardStudentId && (
        <ReportCardModal
          studentId={reportCardStudentId}
          onClose={() => {
            setReportCardStudentId(null);
            if (onClearReportId) onClearReportId();
          }}
        />
      )}
    </div>
  );
};

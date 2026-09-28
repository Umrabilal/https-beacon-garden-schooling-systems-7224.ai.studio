import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  X,
  Printer,
  Award,
  School,
} from 'lucide-react';

interface Props {
  studentId: string;
  onClose: () => void;
}

export const ReportCardModal: React.FC<Props> = ({ studentId, onClose }) => {
  const { data, getStudentAttendanceStats, getStudentGPA } = useSchool();

  const studentsList = Array.isArray(data?.students) ? data.students : [];
  const gradesList = Array.isArray(data?.grades) ? data.grades : [];
  const subjectsList = Array.isArray(data?.subjects) ? data.subjects : [];

  const student = studentsList.find((s) => s.id === studentId);
  if (!student) return null;

  const studentGrades = gradesList.filter((g) => g.studentId === studentId);
  const attendanceStats = getStudentAttendanceStats(student.id);
  const gpaInfo = getStudentGPA(student.id);

  // Total marks computation
  const totalObtained = studentGrades.reduce((sum, g) => sum + g.marksObtained, 0);
  const totalMax = studentGrades.reduce((sum, g) => sum + g.maxMarks, 0) || 100;
  const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

  // Class rank simulation based on GPA
  const classStudents = studentsList.filter((s) => s.classId === student.classId);
  const ranked = classStudents
    .map((s) => ({ id: s.id, gpa: getStudentGPA(s.id).gpa }))
    .sort((a, b) => b.gpa - a.gpa);
  const rankIndex = ranked.findIndex((r) => r.id === student.id);
  const classRank = rankIndex !== -1 ? rankIndex + 1 : 1;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:rounded-none border border-slate-200">
        {/* Action Header (Hidden during print) */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm">Official Academic Transcript & Report Card</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Transcript</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Card Sheet */}
        <div className="p-8 overflow-y-auto space-y-6 bg-white text-slate-900 print:p-6 print:space-y-4">
          {/* School Letterhead Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-xs">
                <School className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                  {data.schoolInfo.name}
                </h1>
                <p className="text-xs text-slate-600 font-medium italic">
                  {data.schoolInfo.tagline}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {data.schoolInfo.address} • Tel: {data.schoolInfo.phone} • {data.schoolInfo.website}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded">
                Official Report Card
              </div>
              <div className="text-xs text-slate-600 font-semibold mt-1.5">
                Academic Year: {data.schoolInfo.academicYear}
              </div>
              <div className="text-xs text-slate-500">{data.schoolInfo.currentTerm}</div>
            </div>
          </div>

          {/* Student Particulars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Student Name</span>
              <span className="font-bold text-slate-900 text-sm">
                {student.firstName} {student.lastName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Roll / Adm No</span>
              <span className="font-mono font-bold text-slate-800">
                Roll #{student.rollNumber} ({student.admissionNumber})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Class & Section</span>
              <span className="font-bold text-slate-800">{student.className}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-bold">Issue Date</span>
              <span className="font-medium text-slate-800">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Subject Grade Matrix Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Subject Name</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3 text-center">Max Marks</th>
                  <th className="py-2.5 px-3 text-center">Marks Obtained</th>
                  <th className="py-2.5 px-3 text-center">Letter Grade</th>
                  <th className="py-2.5 px-3 text-center">Grade Point</th>
                  <th className="py-2.5 px-3">Instructor Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {studentGrades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                      No grades recorded for this student in current assessments.
                    </td>
                  </tr>
                ) : (
                  studentGrades.map((g) => {
                    const sub = subjectsList.find((s) => s.id === g.subjectId);
                    return (
                      <tr key={g.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-900">{sub?.name || 'Subject'}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{sub?.code || 'SUB-01'}</td>
                        <td className="py-2 px-3 text-center font-mono">{g.maxMarks}</td>
                        <td className="py-2 px-3 text-center font-bold font-mono text-slate-900">
                          {g.marksObtained}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-xs">
                            {g.gradeLetter}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-semibold">
                          {g.gradePoint.toFixed(1)}
                        </td>
                        <td className="py-2 px-3 text-slate-600 italic">{g.remarks || 'Satisfactory'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Performance Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500">Cumulative GPA</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {gpaInfo.gpa.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">on 4.00 scale</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500">Overall Score</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {overallPercentage}%
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                {totalObtained} / {totalMax} pts
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500">Class Rank</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                #{classRank}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                out of {classStudents.length} students
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500">Attendance</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {attendanceStats.percentage}%
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                {attendanceStats.present} days present
              </span>
            </div>
          </div>

          {/* Teacher Remarks & Principal Signatures */}
          <div className="pt-2 space-y-4">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
              <span className="font-bold text-slate-800 uppercase text-[10px] block mb-1">
                Class Advisor Summary Remarks
              </span>
              <p className="text-slate-700 italic leading-relaxed">
                "{student.firstName} has exhibited strong academic discipline, positive peer collaboration,
                and active engagement throughout the term curriculum."
              </p>
            </div>

            {/* Signature Stamps */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300">
              <div className="text-center">
                <div className="h-10 border-b border-dashed border-slate-400 mx-auto w-48" />
                <div className="font-bold text-xs text-slate-800 mt-1">Class Advisor Signature</div>
                <div className="text-[10px] text-slate-500">Oakridge Academic Faculty</div>
              </div>
              <div className="text-center">
                <div className="h-10 border-b border-dashed border-slate-400 mx-auto w-48 flex items-end justify-center">
                  <span className="font-serif italic font-bold text-slate-800 text-sm">{data.schoolInfo.principalName}</span>
                </div>
                <div className="font-bold text-xs text-slate-800 mt-1">Head of School / Principal</div>
                <div className="text-[10px] text-slate-500">Official Institutional Seal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors shadow-xs"
          >
            Close Transcript
          </button>
        </div>
      </div>
    </div>
  );
};

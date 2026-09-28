import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { TimetableSlot } from '../../types';
import {
  CalendarDays,
  MapPin,
  User,
  Plus,
  Trash2,
  Printer,
  AlertTriangle,
  X,
} from 'lucide-react';

export const TimetableModule: React.FC = () => {
  const { data, saveTimetableSlot, deleteTimetableSlot } = useSchool();

  const [viewBy, setViewBy] = useState<'class' | 'teacher'>('class');
  const [selectedClassId, setSelectedClassId] = useState<string>(data.classes[0]?.id || 'c-10a');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(data.staff[1]?.id || 'u-teacher-1');

  // Slot editor modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Partial<TimetableSlot> | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const days: TimetableSlot['dayOfWeek'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [
    { period: 1, time: '08:30 - 09:20' },
    { period: 2, time: '09:25 - 10:15' },
    { period: 3, time: '10:30 - 11:20' },
    { period: 4, time: '11:25 - 12:15' },
    { period: 5, time: '13:00 - 13:50' },
    { period: 6, time: '13:55 - 14:45' },
  ];

  // Active slots for selected view
  const currentSlots = data.timetable.filter((slot) => {
    if (viewBy === 'class') {
      return slot.classId === selectedClassId;
    } else {
      return slot.teacherId === selectedTeacherId;
    }
  });

  const getSlot = (day: TimetableSlot['dayOfWeek'], period: number) => {
    return currentSlots.find((s) => s.dayOfWeek === day && s.period === period);
  };

  const handleOpenSlot = (day: TimetableSlot['dayOfWeek'], period: number) => {
    const existing = getSlot(day, period);
    const periodTime = periods.find((p) => p.period === period)?.time.split(' - ') || ['08:30', '09:20'];

    setEditingSlot(
      existing || {
        classId: selectedClassId,
        dayOfWeek: day,
        period,
        startTime: periodTime[0],
        endTime: periodTime[1],
        subjectId: data.subjects[0]?.id || 'sub-math',
        teacherId: selectedTeacherId || data.staff[1]?.id || 'u-teacher-1',
        room: 'Room 201',
      }
    );
    setConflictWarning(null);
    setIsEditorOpen(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot || !editingSlot.subjectId || !editingSlot.teacherId) return;

    // Check for double booking conflicts
    const conflict = data.timetable.find(
      (s) =>
        s.id !== editingSlot.id &&
        s.dayOfWeek === editingSlot.dayOfWeek &&
        s.period === editingSlot.period &&
        (s.teacherId === editingSlot.teacherId || (s.room === editingSlot.room && s.classId !== editingSlot.classId))
    );

    if (conflict && !conflictWarning) {
      const teacher = data.staff.find((st) => st.id === conflict.teacherId);
      const confClass = data.classes.find((c) => c.id === conflict.classId);
      setConflictWarning(
        `Notice: ${teacher?.name} or ${conflict.room} is already allocated to ${confClass?.name} during ${editingSlot.dayOfWeek} Period ${editingSlot.period}. Click Save again to override.`
      );
      return;
    }

    saveTimetableSlot({
      id: editingSlot.id,
      classId: editingSlot.classId || selectedClassId,
      dayOfWeek: editingSlot.dayOfWeek || 'Monday',
      period: editingSlot.period || 1,
      startTime: editingSlot.startTime || '08:30',
      endTime: editingSlot.endTime || '09:20',
      subjectId: editingSlot.subjectId,
      teacherId: editingSlot.teacherId,
      room: editingSlot.room || 'Room 101',
    });

    setIsEditorOpen(false);
    setEditingSlot(null);
    setConflictWarning(null);
  };

  const selectedClass = data.classes.find((c) => c.id === selectedClassId);
  const selectedTeacher = data.staff.find((s) => s.id === selectedTeacherId);

  return (
    <div id="timetable-module" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Class Schedule & Faculty Timetable
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              6 Period Matrix
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Weekly class schedule matrix, teacher room allocations, and period collision detector.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Schedule</span>
          </button>
        </div>
      </div>

      {/* Control Bar: View By Class / Teacher Selector */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewBy('class')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                viewBy === 'class' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Class
            </button>
            <button
              onClick={() => setViewBy('teacher')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                viewBy === 'teacher' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Teacher
            </button>
          </div>

          {viewBy === 'class' ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Selected Class:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
              >
                {data.classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.room})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Faculty Member:</span>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
              >
                {data.staff
                  .filter((s) => s.role === 'teacher' || s.role === 'admin')
                  .map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.title})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing: <strong className="text-slate-900">{viewBy === 'class' ? selectedClass?.name : selectedTeacher?.name}</strong> • 30 Weekly Hours
        </div>
      </div>

      {/* Visual Timetable Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
                <th className="py-3.5 px-4 w-32 bg-slate-100/70 border-r border-slate-200">Day / Period</th>
                {periods.map((p) => (
                  <th key={p.period} className="py-3.5 px-3 border-r border-slate-200 text-center last:border-r-0">
                    <div className="font-bold text-slate-800">Period {p.period}</div>
                    <div className="text-[10px] text-slate-500 font-mono font-normal">{p.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {days.map((day) => (
                <tr key={day} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-800 bg-slate-50/70 border-r border-slate-200 uppercase tracking-wider text-[11px]">
                    {day}
                  </td>
                  {periods.map((p) => {
                    const slot = getSlot(day, p.period);
                    const subject = slot ? data.subjects.find((s) => s.id === slot.subjectId) : null;
                    const teacher = slot ? data.staff.find((st) => st.id === slot.teacherId) : null;
                    const slotClass = slot ? data.classes.find((c) => c.id === slot.classId) : null;

                    return (
                      <td
                        key={p.period}
                        onClick={() => handleOpenSlot(day, p.period)}
                        className="py-2.5 px-2.5 border-r border-slate-200 last:border-r-0 align-top cursor-pointer group hover:bg-slate-100/60 transition-colors"
                      >
                        {slot && subject ? (
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200 group-hover:border-blue-400 transition-all shadow-xs space-y-1">
                            <div className="font-bold text-blue-700 text-xs line-clamp-1">
                              {subject.name}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                              <MapPin className="w-2.5 h-2.5 text-slate-400" />
                              <span>{slot.room}</span>
                              {viewBy === 'teacher' && slotClass && (
                                <span>• {slotClass.name}</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-600 flex items-center gap-1">
                              <User className="w-2.5 h-2.5 text-slate-400" />
                              <span className="line-clamp-1">{teacher?.name.split(' ')[0]}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-16 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-300 transition-colors">
                            <Plus className="w-4 h-4 opacity-50" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Slot Edit / Add Modal */}
      {isEditorOpen && editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingSlot.id ? 'Edit Period Slot' : 'Assign Timetable Slot'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-500">
              {editingSlot.dayOfWeek} • Period {editingSlot.period}
            </div>

            {conflictWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{conflictWarning}</span>
              </div>
            )}

            <form onSubmit={handleSaveSlot} className="space-y-3 text-xs text-slate-700">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Subject</label>
                <select
                  value={editingSlot.subjectId}
                  onChange={(e) =>
                    setEditingSlot((prev) => ({ ...prev, subjectId: e.target.value }))
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {data.subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Teacher</label>
                  <select
                    value={editingSlot.teacherId}
                    onChange={(e) =>
                      setEditingSlot((prev) => ({ ...prev, teacherId: e.target.value }))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    {data.staff
                      .filter((s) => s.role === 'teacher' || s.role === 'admin')
                      .map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Room / Lab</label>
                  <input
                    type="text"
                    value={editingSlot.room || ''}
                    onChange={(e) =>
                      setEditingSlot((prev) => ({ ...prev, room: e.target.value }))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Start Time</label>
                  <input
                    type="text"
                    value={editingSlot.startTime || '08:30'}
                    onChange={(e) =>
                      setEditingSlot((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">End Time</label>
                  <input
                    type="text"
                    value={editingSlot.endTime || '09:20'}
                    onChange={(e) =>
                      setEditingSlot((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                {editingSlot.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (editingSlot.id) deleteTimetableSlot(editingSlot.id);
                      setIsEditorOpen(false);
                    }}
                    className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Slot</span>
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold shadow-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                  >
                    Save Slot
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

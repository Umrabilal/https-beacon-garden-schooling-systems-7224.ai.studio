/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { StudentsModule } from './components/students/StudentsModule';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { GradesModule } from './components/grades/GradesModule';
import { FeesModule } from './components/fees/FeesModule';
import { TimetableModule } from './components/timetable/TimetableModule';
import { UsersModule } from './components/users/UsersModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { StudentFormModal } from './components/students/StudentFormModal';

const MainAppLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useSchool();

  // Cross-module states
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [reportCardStudentId, setReportCardStudentId] = useState<string | null>(null);

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            onOpenAddStudent={() => setIsAddStudentOpen(true)}
            onOpenCreateInvoice={() => setIsCreateInvoiceOpen(true)}
          />
        );
      case 'students':
        return (
          <StudentsModule
            onOpenReportCard={(studentId) => {
              setReportCardStudentId(studentId);
              setActiveTab('grades');
            }}
          />
        );
      case 'attendance':
        return <AttendanceModule />;
      case 'grades':
        return (
          <GradesModule
            initialStudentReportId={reportCardStudentId}
            onClearReportId={() => setReportCardStudentId(null)}
          />
        );
      case 'fees':
        return (
          <FeesModule
            isOpenCreateModal={isCreateInvoiceOpen}
            onCloseCreateModal={() => setIsCreateInvoiceOpen(false)}
          />
        );
      case 'timetable':
        return <TimetableModule />;
      case 'users':
        return <UsersModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return (
          <Dashboard
            onOpenAddStudent={() => setIsAddStudentOpen(true)}
            onOpenCreateInvoice={() => setIsCreateInvoiceOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F1F5F9] text-slate-800 font-sans antialiased">
      {/* Top Application Header */}
      <Navbar />

      {/* Main Desktop Workspace Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Module Sidebar */}
        <Sidebar />

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F1F5F9]">
          <div className="max-w-7xl mx-auto pb-12">
            {renderActiveModule()}
          </div>
        </main>
      </div>

      {/* Quick Add Student Modal */}
      {isAddStudentOpen && (
        <StudentFormModal
          studentToEdit={null}
          onClose={() => setIsAddStudentOpen(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <MainAppLayout />
    </SchoolProvider>
  );
}

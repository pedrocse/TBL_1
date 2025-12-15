import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ExamProvider } from './context/ExamContext';
import { AuthProvider } from './context/AuthContext';
import { GradeProvider } from './context/GradeContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { TeacherExamEditor } from './pages/TeacherExamEditor';
import { TeacherExamReport } from './pages/TeacherExamReport';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentExam } from './pages/StudentExam';
import { StudentGrades } from './pages/StudentGrades';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <ExamProvider>
        {/* GradeProvider deve envolver as rotas que usam useGrade */}
        <GradeProvider>
          <BrowserRouter>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Rotas do Admin (Protegidas) */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Rotas do Professor (Protegidas) */}
              <Route 
                path="/teacher" 
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teacher/exam/:examId" 
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherExamEditor />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/teacher/exam/:examId/report" 
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherExamReport />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rotas do Aluno (Protegidas) */}
              <Route 
                path="/student" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/exam/:examId" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentExam />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/grades" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentGrades />
                  </ProtectedRoute>
                } 
              />
              
              {/* Fallback para 404 ou redirecionamento */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </GradeProvider>
      </ExamProvider>
    </AuthProvider>
  );
}

export default App;

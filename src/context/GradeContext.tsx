import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ExamResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface GradeContextType {
  results: ExamResult[];
  saveResult: (result: Omit<ExamResult, 'id' | 'submittedAt'>) => void;
  getStudentResults: (studentId: string) => ExamResult[];
  getExamResults: (examId: string) => ExamResult[];
  hasStudentTakenExam: (studentId: string, examId: string) => boolean;
}

const GradeContext = createContext<GradeContextType | undefined>(undefined);

export const GradeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [results, setResults] = useState<ExamResult[]>([]);

  // Carregar resultados do localStorage
  useEffect(() => {
    const storedResults = localStorage.getItem('dualite_app_grades');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
  }, []);

  // Salvar no localStorage sempre que houver mudança
  useEffect(() => {
    if (results.length > 0) {
      localStorage.setItem('dualite_app_grades', JSON.stringify(results));
    }
  }, [results]);

  const saveResult = (data: Omit<ExamResult, 'id' | 'submittedAt'>) => {
    // Verifica se já existe nota para este aluno nesta prova para evitar duplicidade
    const exists = results.some(r => r.examId === data.examId && r.studentId === data.studentId);
    
    if (exists) {
       // Se já existe, atualizamos (ou poderíamos bloquear). Aqui vamos atualizar.
       setResults(prev => prev.map(r => {
         if (r.examId === data.examId && r.studentId === data.studentId) {
           return { ...r, ...data, submittedAt: new Date().toISOString() };
         }
         return r;
       }));
    } else {
      const newResult: ExamResult = {
        ...data,
        id: uuidv4(),
        submittedAt: new Date().toISOString()
      };
      setResults(prev => [...prev, newResult]);
    }
  };

  const getStudentResults = (studentId: string) => {
    return results.filter(r => r.studentId === studentId);
  };

  const getExamResults = (examId: string) => {
    return results.filter(r => r.examId === examId);
  };

  const hasStudentTakenExam = (studentId: string, examId: string) => {
    return results.some(r => r.examId === examId && r.studentId === studentId);
  };

  return (
    <GradeContext.Provider value={{ 
      results, 
      saveResult, 
      getStudentResults, 
      getExamResults,
      hasStudentTakenExam
    }}>
      {children}
    </GradeContext.Provider>
  );
};

export const useGrade = () => {
  const context = useContext(GradeContext);
  if (!context) {
    throw new Error('useGrade deve ser usado dentro de um GradeProvider');
  }
  return context;
};

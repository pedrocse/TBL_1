import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Exam, Question } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ExamContextType {
  exams: Exam[];
  createExam: (title: string, description: string) => string;
  deleteExam: (id: string) => void;
  updateExamMetadata: (id: string, data: Partial<Exam>) => void; // Nova função
  addQuestionToExam: (examId: string, question: Question) => void;
  deleteQuestionFromExam: (examId: string, questionId: string) => void;
  getExam: (id: string) => Exam | undefined;
  toggleExamPublication: (id: string) => void;
  togglePhase2Release: (id: string) => void;
  refreshExams: () => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [exams, setExams] = useState<Exam[]>([]);

  // Carregar exames do localStorage ao iniciar
  useEffect(() => {
    const storedExams = localStorage.getItem('dualite_app_exams');
    if (storedExams) {
      const parsed = JSON.parse(storedExams).map((e: any) => ({
        ...e,
        createdAt: new Date(e.createdAt),
        // Garante compatibilidade com exames antigos que não tinham pesos
        phase1Weight: e.phase1Weight ?? 50,
        phase2Weight: e.phase2Weight ?? 50
      }));
      setExams(parsed);
    }
  }, []);

  // Salvar no localStorage sempre que houver mudança
  useEffect(() => {
    if (exams.length > 0) {
      localStorage.setItem('dualite_app_exams', JSON.stringify(exams));
    }
  }, [exams]);

  const refreshExams = () => {
    const storedExams = localStorage.getItem('dualite_app_exams');
    if (storedExams) {
      const parsed = JSON.parse(storedExams).map((e: any) => ({
        ...e,
        createdAt: new Date(e.createdAt),
        phase1Weight: e.phase1Weight ?? 50,
        phase2Weight: e.phase2Weight ?? 50
      }));
      setExams(parsed);
    }
  };

  const createExam = (title: string, description: string) => {
    const newExam: Exam = {
      id: uuidv4(),
      title,
      description,
      createdAt: new Date(),
      questions: [],
      isPublished: false,
      isPhase2Released: false,
      phase1Weight: 50, // Padrão 50%
      phase2Weight: 50  // Padrão 50%
    };
    setExams(prev => [...prev, newExam]);
    return newExam.id;
  };

  const updateExamMetadata = (id: string, data: Partial<Exam>) => {
    setExams(prev => prev.map(exam => {
      if (exam.id === id) {
        return { ...exam, ...data };
      }
      return exam;
    }));
  };

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
  };

  const addQuestionToExam = (examId: string, question: Question) => {
    setExams(prev => prev.map(exam => {
      if (exam.id === examId) {
        return { ...exam, questions: [...exam.questions, question] };
      }
      return exam;
    }));
  };

  const deleteQuestionFromExam = (examId: string, questionId: string) => {
    setExams(prev => prev.map(exam => {
      if (exam.id === examId) {
        return { ...exam, questions: exam.questions.filter(q => q.id !== questionId) };
      }
      return exam;
    }));
  };

  const generateAccessCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const toggleExamPublication = (id: string) => {
    setExams(prev => prev.map(exam => {
      if (exam.id === id) {
        const willBePublished = !exam.isPublished;
        return { 
          ...exam, 
          isPublished: willBePublished,
          accessCode: willBePublished ? generateAccessCode() : undefined,
          isPhase2Released: false 
        };
      }
      return exam;
    }));
  };

  const togglePhase2Release = (id: string) => {
    setExams(prev => prev.map(exam => {
      if (exam.id === id) {
        return { ...exam, isPhase2Released: !exam.isPhase2Released };
      }
      return exam;
    }));
  };

  const getExam = (id: string) => exams.find(e => e.id === id);

  return (
    <ExamContext.Provider value={{ 
      exams, 
      createExam, 
      deleteExam, 
      updateExamMetadata,
      addQuestionToExam, 
      deleteQuestionFromExam,
      getExam,
      toggleExamPublication,
      togglePhase2Release,
      refreshExams
    }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam deve ser usado dentro de um ExamProvider');
  }
  return context;
};

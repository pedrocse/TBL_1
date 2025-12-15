export interface Alternative {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  alternatives: Alternative[];
  totalPoints: number;
  correctAlternativeId: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  questions: Question[];
  isPublished: boolean;
  accessCode?: string;
  isPhase2Released?: boolean;
  phase1Weight: number; // Porcentagem (0-100)
  phase2Weight: number; // Porcentagem (0-100)
}

export interface Answer {
  questionId: string;
  distribution: Record<string, number>;
}

// Novos tipos para Resultados
export interface QuestionResult {
  questionId: string;
  phase1Score: number; // Pontos obtidos na fase 1
  phase2Score: number; // Pontos obtidos na fase 2
  maxPoints: number;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  submittedAt: string; // ISO Date
  phase1TotalScore: number; // 0-100%
  phase2TotalScore: number; // 0-100%
  finalScore: number; // Ponderado
  questionDetails: QuestionResult[];
}

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  gender: string;
  birthDate: string;
  password?: string; 
}

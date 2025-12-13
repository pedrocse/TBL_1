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
  // Novos campos de peso
  phase1Weight: number; // Porcentagem (0-100)
  phase2Weight: number; // Porcentagem (0-100)
}

export interface Answer {
  questionId: string;
  distribution: Record<string, number>;
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

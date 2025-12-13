import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, PenTool, ArrowRight } from 'lucide-react';

export const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Lado Esquerdo - Intro */}
        <div className="p-8 md:p-12 md:w-1/2 bg-indigo-600 text-white flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4">Sistema de Avaliação Ponderada</h1>
          <p className="text-indigo-100 text-lg mb-8">
            Uma nova forma de avaliar conhecimento baseada na certeza do aluno e distribuição de pesos.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 p-2 rounded-lg">
                <PenTool size={20} />
              </div>
              <span>Crie provas personalizadas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 p-2 rounded-lg">
                <GraduationCap size={20} />
              </div>
              <span>Avalie com precisão</span>
            </div>
          </div>
        </div>

        {/* Lado Direito - Seleção */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Como você deseja entrar?</h2>
          
          <Link to="/teacher" className="group block p-6 border-2 border-gray-100 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-indigo-100 text-indigo-700 p-2 rounded-lg">
                <PenTool size={24} />
              </span>
              <ArrowRight className="text-gray-300 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Sou Professor</h3>
            <p className="text-sm text-gray-500 mt-1">Criar questões, definir alternativas e gabarito.</p>
          </Link>

          <Link to="/student" className="group block p-6 border-2 border-gray-100 rounded-xl hover:border-green-600 hover:bg-green-50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-green-100 text-green-700 p-2 rounded-lg">
                <GraduationCap size={24} />
              </span>
              <ArrowRight className="text-gray-300 group-hover:text-green-600 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Sou Aluno</h3>
            <p className="text-sm text-gray-500 mt-1">Responder a prova distribuindo pesos.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

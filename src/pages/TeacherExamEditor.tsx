import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, CheckCircle2, Save, ArrowLeft, AlertCircle, Image as ImageIcon, X, Upload, Link as LinkIcon, Settings, Percent } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import { Question, Alternative } from '../types';
import { clsx } from 'clsx';

export const TeacherExamEditor = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { getExam, addQuestionToExam, deleteQuestionFromExam, updateExamMetadata } = useExam();
  
  const exam = getExam(examId || '');
  
  // Estados de Configuração da Prova
  const [showSettings, setShowSettings] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examDesc, setExamDesc] = useState('');
  const [weightP1, setWeightP1] = useState(50);
  const [weightP2, setWeightP2] = useState(50);

  // Form States (Questão)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  
  const [alternatives, setAlternatives] = useState<Alternative[]>([
    { id: uuidv4(), text: '' },
    { id: uuidv4(), text: '' },
    { id: uuidv4(), text: '' },
    { id: uuidv4(), text: '' },
  ]);
  const [correctId, setCorrectId] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!exam) {
      navigate('/teacher');
    } else {
      // Inicializa os campos de configuração com os dados atuais
      setExamTitle(exam.title);
      setExamDesc(exam.description);
      setWeightP1(exam.phase1Weight);
      setWeightP2(exam.phase2Weight);
    }
  }, [exam, navigate]);

  if (!exam) return null;

  // --- Handlers de Configuração ---
  const handleWeightP1Change = (val: number) => {
    const newP1 = Math.min(100, Math.max(0, val));
    setWeightP1(newP1);
    setWeightP2(100 - newP1); // Auto-calcula P2
  };

  const handleWeightP2Change = (val: number) => {
    const newP2 = Math.min(100, Math.max(0, val));
    setWeightP2(newP2);
    setWeightP1(100 - newP2); // Auto-calcula P1
  };

  const saveSettings = () => {
    if (weightP1 + weightP2 !== 100) {
      alert('A soma dos pesos deve ser 100%');
      return;
    }
    updateExamMetadata(exam.id, {
      title: examTitle,
      description: examDesc,
      phase1Weight: weightP1,
      phase2Weight: weightP2
    });
    setShowSettings(false);
  };

  // --- Handlers de Questão ---
  const handleAddAlternative = () => {
    if (alternatives.length >= 5) return;
    setAlternatives([...alternatives, { id: uuidv4(), text: '' }]);
  };

  const handleRemoveAlternative = (id: string) => {
    if (alternatives.length <= 4) return;
    setAlternatives(alternatives.filter(a => a.id !== id));
    if (correctId === id) setCorrectId('');
  };

  const handleAltTextChange = (id: string, text: string) => {
    setAlternatives(alternatives.map(a => a.id === id ? { ...a, text } : a));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido (JPG, PNG, etc).');
      return;
    }

    if (file.size > 800 * 1024) { 
      setError('A imagem é muito grande. Por favor, use uma imagem menor que 800KB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveQuestion = () => {
    setError('');
    
    if (!title.trim()) return setError('O título da questão é obrigatório.');
    if (alternatives.some(a => !a.text.trim())) return setError('Todas as alternativas devem ter texto.');
    if (!correctId) return setError('Você deve selecionar a alternativa correta.');
    
    const newQuestion: Question = {
      id: uuidv4(),
      title,
      description,
      imageUrl: imageUrl.trim() || undefined,
      alternatives,
      totalPoints: alternatives.length,
      correctAlternativeId: correctId
    };

    addQuestionToExam(exam.id, newQuestion);
    
    // Reset form
    setTitle('');
    setDescription('');
    setImageUrl('');
    setShowImageInput(false);
    setAlternatives([
        { id: uuidv4(), text: '' },
        { id: uuidv4(), text: '' },
        { id: uuidv4(), text: '' },
        { id: uuidv4(), text: '' },
    ]);
    setCorrectId('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Superior */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/teacher" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 text-gray-600">
              <ArrowLeft size={20} />
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {exam.title}
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 p-1.5 rounded-lg flex items-center gap-1 text-sm font-medium"
                    title="Configurações da Prova"
                  >
                    <Settings size={18} />
                    Configurar Pesos
                  </button>
                </h1>
                <p className="text-sm text-gray-500">
                  {exam.questions.length} questões • Pesos: {exam.phase1Weight}% / {exam.phase2Weight}%
                </p>
            </div>
          </div>
        </div>

        {/* Painel de Configurações (Expansível) */}
        {showSettings && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Settings size={20} className="text-indigo-600" />
                Configurações da Avaliação
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título da Prova</label>
                  <input 
                    type="text" 
                    value={examTitle}
                    onChange={e => setExamTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input 
                    type="text" 
                    value={examDesc}
                    onChange={e => setExamDesc(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Percent size={16} /> Distribuição de Pesos da Nota Final
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Fase 1 (Certeza)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        min="0" max="100"
                        value={weightP1}
                        onChange={e => handleWeightP1Change(parseInt(e.target.value) || 0)}
                        className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 font-bold">%</span>
                    </div>
                  </div>
                  <div className="text-gray-400 font-bold pt-6">+</div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Fase 2 (TBL)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        min="0" max="100"
                        value={weightP2}
                        onChange={e => handleWeightP2Change(parseInt(e.target.value) || 0)}
                        className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-bold text-purple-700"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 font-bold">%</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Total: <span className={clsx("font-bold", weightP1 + weightP2 === 100 ? "text-green-600" : "text-red-500")}>
                    {weightP1 + weightP2}%
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={saveSettings}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
              >
                <Save size={18} /> Salvar Configurações
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna da Esquerda: Formulário de Questão */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-indigo-600" />
                Nova Questão
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título da Pergunta</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Matemática Básica"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (Opcional)</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Digite o enunciado da questão..."
                    rows={2}
                  />
                </div>

                {/* Área de Imagem */}
                <div>
                  {!showImageInput && !imageUrl ? (
                    <button
                      type="button"
                      onClick={() => setShowImageInput(true)}
                      className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2"
                    >
                      <ImageIcon size={18} />
                      Adicionar Imagem à Questão
                    </button>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fade-in">
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                          <ImageIcon size={16} /> Imagem da Questão
                        </label>
                        <button 
                          onClick={() => {
                            setImageUrl('');
                            setShowImageInput(false);
                          }}
                          className="text-gray-400 hover:text-red-500"
                          title="Remover imagem"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide flex items-center gap-1">
                            <Upload size={12} /> Carregar do Computador
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                          />
                          <p className="text-xs text-gray-400 mt-1">Máx: 800KB (JPG, PNG, GIF)</p>
                        </div>

                        <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium">OU USAR LINK</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide flex items-center gap-1">
                            <LinkIcon size={12} /> Colar Link (URL)
                          </label>
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={e => setImageUrl(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="https://exemplo.com/imagem.jpg"
                          />
                        </div>
                      </div>

                      {imageUrl && (
                        <div className="mt-4">
                          <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Pré-visualização:</p>
                          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <img 
                              src={imageUrl} 
                              alt="Preview" 
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => (e.currentTarget.src = 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/600x400?text=Erro+na+Imagem')}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Alternativas</label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Total de Pontos: {alternatives.length}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {alternatives.map((alt, index) => (
                      <div key={alt.id} className="flex items-center gap-3">
                        <button
                          onClick={() => setCorrectId(alt.id)}
                          className={clsx(
                            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                            correctId === alt.id 
                              ? "border-green-500 bg-green-50 text-green-600" 
                              : "border-gray-300 text-gray-300 hover:border-gray-400"
                          )}
                          title="Marcar como correta"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        
                        <input
                          type="text"
                          value={alt.text}
                          onChange={e => handleAltTextChange(alt.id, e.target.value)}
                          className={clsx(
                            "flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500",
                            correctId === alt.id ? "border-green-300 bg-green-50/30" : "border-gray-300"
                          )}
                          placeholder={`Alternativa ${index + 1}`}
                        />

                        {alternatives.length > 4 && (
                          <button 
                            onClick={() => handleRemoveAlternative(alt.id)}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {alternatives.length < 5 && (
                    <button
                      onClick={handleAddAlternative}
                      className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                      <Plus size={16} /> Adicionar 5ª Alternativa
                    </button>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSaveQuestion}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Save size={18} />
                  Adicionar à Prova
                </button>
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Lista */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700">Questões da Prova ({exam.questions.length})</h3>
              </div>
              <div className="divide-y divide-gray-100 max-h-[calc(100vh-200px)] overflow-y-auto">
                {exam.questions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    Nenhuma questão criada ainda.
                  </div>
                ) : (
                  exam.questions.map((q, idx) => (
                    <div key={q.id} className="p-4 hover:bg-gray-50 transition-colors group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-indigo-600 uppercase">Questão {idx + 1}</span>
                        <button 
                          onClick={() => deleteQuestionFromExam(exam.id, q.id)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{q.title}</h4>
                      {q.imageUrl && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                          <ImageIcon size={12} />
                          <span>Contém imagem</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

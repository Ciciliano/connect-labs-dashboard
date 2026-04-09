import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Target, 
  TrendingUp, 
  Users, 
  ChevronRight, 
  AlertCircle,
  LayoutDashboard,
  ListTodo,
  GanttChartSquare,
  ArrowRight,
  ShieldCheck,
  RefreshCcw,
  AlertTriangle,
  Timer,
  ExternalLink,
  Bell
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';

// --- Configuração Firebase ---
const envConfig = import.meta.env.VITE_FIREBASE_CONFIG;
const firebaseConfig = envConfig ? JSON.parse(envConfig) : {
  apiKey: "mock-api-key",
  authDomain: "mock-domain.firebaseapp.com",
  projectId: "mock-project"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = import.meta.env.VITE_APP_ID || 'connect-labs-exec-v5';

// --- Definição das Fases com Deadlines (Meses) ---
const PHASES = [
  { id: 1, name: 'Fundação Comercial', period: 'M1-M2', deadlineMonth: 2, mrrTarget: 2600 },
  { id: 2, name: 'Validação Operacional', period: 'M3-M4', deadlineMonth: 4, mrrTarget: 1800 },
  { id: 3, name: 'Padronização & OAB', period: 'M5-M6', deadlineMonth: 6, mrrTarget: 6200 },
  { id: 4, name: 'Escala Disciplinada', period: 'M7-M12', deadlineMonth: 12, mrrTarget: 12000 },
];

// --- Lista de Tarefas Revisada (Componentes em falta adicionados) ---
const INITIAL_TASKS = [
  // FASE 1: FUNDAÇÃO (Abril - Maio)
  { id: 101, phaseId: 1, title: 'Definir ICP Sertãozinho e congelar preços', done: true, startMonth: 0, targetMonth: 1 },
  { id: 102, phaseId: 1, title: 'Documentar Stack n8n/Evolution/OpenAI', done: true, startMonth: 0, targetMonth: 1 },
  { id: 103, phaseId: 1, title: 'Ativar Automação Cold Call IA (200 contatos)', done: false, startMonth: 0.5, targetMonth: 1.5 },
  { id: 104, phaseId: 1, title: 'Aquisição de 2 Primeiros Clientes NL', done: false, startMonth: 1, targetMonth: 2 },
  { id: 105, phaseId: 1, title: 'Ativação de Primeiro MRR (Recorrência)', done: false, startMonth: 1.5, targetMonth: 2 },
  
  // FASE 2: VALIDAÇÃO (Junho - Julho)
  { id: 201, phaseId: 2, title: 'Documentar 1º Case de Sucesso local', done: false, startMonth: 2, targetMonth: 3 },
  { id: 202, phaseId: 2, title: 'Atingir MRR de R$ 1.800 (Ponto de Equilíbrio)', done: false, startMonth: 3, targetMonth: 4 },
  { id: 203, phaseId: 2, title: 'Refinar Scripts via OODA (Feedback Real)', done: false, startMonth: 2.5, targetMonth: 4 },

  // FASE 3: PADRONIZAÇÃO & OAB (Agosto - Setembro)
  { id: 301, phaseId: 3, title: 'Criar Checklist Compliance OAB Jurídico', done: false, startMonth: 4, targetMonth: 5 },
  { id: 302, phaseId: 3, title: 'Lançar Oferta Ativa para Advocacia', done: false, startMonth: 5, targetMonth: 6 },
  { id: 303, phaseId: 3, title: 'Bater MRR > R$ 5.000', done: false, startMonth: 5.5, targetMonth: 6 },

  // FASE 4: ESCALA (Outubro em diante)
  { id: 401, phaseId: 4, title: 'Expansão Outbound para Ribeirão Preto', done: false, startMonth: 7, targetMonth: 9 },
  { id: 402, phaseId: 4, title: 'Estruturar Suporte Nível 1 (Delegação)', done: false, startMonth: 9, targetMonth: 12 },
];

const MONTHS = ['Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar'];

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPhase, setSelectedPhase] = useState(1);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [loading, setLoading] = useState(true);
  
  // Simulação do tempo atual do projeto (Mês 1.5 - Meio de Maio)
  const currentProjectMonth = 1.2;

  // --- Lógica de Autenticação Silenciosa ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        const initialAuthToken = import.meta.env.VITE_INITIAL_AUTH_TOKEN;
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          // If mock-api-key is present, anonymous login will fail, but we catch it gracefully.
          await signInAnonymously(auth);
        }
      } catch (err) { 
        console.error("Erro Auth (using mock or missing config):", err); 
        // Stop loading state even if auth fails
        setLoading(false);
      }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        // If not authenticated, still stop loading to show offline mode
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // --- Persistência Cloud ---
  useEffect(() => {
    if (!user) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'config', 'dashboardState');
      const unsub = onSnapshot(docRef, (snap) => {
        if (snap.exists()) setTasks(snap.data().tasks);
        else setDoc(docRef, { tasks: INITIAL_TASKS });
        setLoading(false);
      }, () => setLoading(false));
      return () => unsub();
    } catch(err) {
      console.error("Firestore persistence error", err);
      setLoading(false);
    }
  }, [user]);

  // --- Gestão de Prazos e Lembretes (Regras Gantt) ---
  const getTaskHealth = (task) => {
    if (task.done) return { label: 'Concluído', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 };
    
    // 1ª Oportunidade: O início planejado é no futuro, mas o utilizador pode antecipar
    if (task.startMonth > currentProjectMonth) {
      return { label: '1ª Oportunidade', color: 'text-emerald-500', bg: 'bg-emerald-500/10', sub: 'Execução Antecipada', icon: Timer };
    }
    
    // Oportunidade Ideal: O tempo atual está entre o início e o fim planejado
    if (currentProjectMonth >= task.startMonth && currentProjectMonth <= task.targetMonth) {
      return { label: 'Oportunidade Ideal', color: 'text-blue-500', bg: 'bg-blue-500/10', sub: 'Janela de Atuação', icon: Clock };
    }
    
    // Oportunidade Tardia: O tempo atual ultrapassou o target planejado
    return { label: 'Oportunidade Tardia', color: 'text-orange-500', bg: 'bg-orange-500/10', sub: 'Risco de Atraso', icon: AlertTriangle };
  };

  const toggleTask = async (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(updated);
    
    if (user) {
      try {
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'config', 'dashboardState'), { tasks: updated }, { merge: true });
      } catch (err) {
         console.warn("Could not save to firestore, updating locally only.");
      }
    }
  };

  const phaseStats = useMemo(() => PHASES.map(p => {
    const pTasks = tasks.filter(t => t.phaseId === p.id);
    const done = pTasks.filter(t => t.done).length;
    return { ...p, progress: pTasks.length ? Math.round((done / pTasks.length) * 100) : 0 };
  }), [tasks]);

  const globalProgress = useMemo(() => Math.round((tasks.filter(t => t.done).length / tasks.length) * 100), [tasks]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-2xl"></div>
      <p className="text-blue-500 font-black tracking-widest uppercase text-xs animate-pulse">Connect Labs • Cloud Sync</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-blue-500/30">
      
      {/* Sidebar - Executive Control */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 border-r border-slate-800 p-8 gap-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-900/40">C</div>
          <div>
            <span className="text-xl font-black tracking-tighter block leading-none">CONNECT</span>
            <span className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">Executive OS</span>
          </div>
        </div>
        
        <nav className="flex flex-col gap-3">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Painel Geral' },
            { id: 'gantt', icon: GanttChartSquare, label: 'Timeline Gantt' },
            { id: 'tasks', icon: ListTodo, label: 'Roadmap' }
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20 scale-[1.02]' : 'text-slate-500 hover:bg-slate-800'}`}
            >
              <item.icon size={20} /> <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto p-6 bg-slate-800/40 rounded-[2rem] border border-slate-700/50 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sincronização</span>
            <div className={`w-2 h-2 rounded-full ${user ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-300 mb-2 uppercase">Progresso do Plano B</p>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              <div className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]" style={{ width: `${globalProgress}%` }} />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between p-5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg">C</div>
          <span className="font-black text-sm tracking-tighter uppercase">Connect Labs</span>
        </div>
        <div className="flex gap-5">
           <button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'text-blue-400' : 'text-slate-600'}><LayoutDashboard size={20} /></button>
           <button onClick={() => setActiveTab('gantt')} className={activeTab === 'gantt' ? 'text-blue-400' : 'text-slate-600'}><GanttChartSquare size={20} /></button>
           <button onClick={() => setActiveTab('tasks')} className={activeTab === 'tasks' ? 'text-blue-400' : 'text-slate-600'}><ListTodo size={20} /></button>
        </div>
      </header>

      {/* Main View */}
      <main className="flex-1 overflow-y-auto max-h-screen bg-slate-950 pb-24 md:pb-12">
        <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-12">
          
          {activeTab === 'overview' && (
            <>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase">Estratégia B</h1>
                  <p className="text-slate-500 font-medium text-lg">Execução enxuta: Validação orgânica e MRR sustentável.</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-[2rem] flex items-center gap-4 shadow-xl">
                   <div className="p-3 bg-blue-600/10 rounded-2xl"><Bell className="text-blue-500" size={20} /></div>
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Timeline Atual</p>
                     <p className="text-sm font-bold text-white uppercase tracking-tighter">Janela: {MONTHS[Math.floor(currentProjectMonth)]} / Mês 02</p>
                   </div>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'MRR Planeado', value: 'R$ 2.600', target: 'Fase 1 Final', icon: TrendingUp, color: 'text-emerald-500' },
                  { label: 'Clientes Alvo', value: '0 / 2', target: 'Fase 1', icon: Users, color: 'text-blue-500' },
                  { label: 'Estado Gantt', value: 'Saudável', target: 'Gestão', icon: Target, color: 'text-purple-500' },
                  { label: 'Oportunidade', value: 'Ideal', target: 'Timeline', icon: Clock, color: 'text-orange-500' },
                ].map((kpi, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-sm hover:border-slate-700 transition-all hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-3 rounded-2xl bg-slate-800/80 ${kpi.color} shadow-inner`}><kpi.icon size={20} /></div>
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{kpi.target}</span>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                    <p className="text-3xl font-black text-white">{kpi.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Phase Tracker */}
                <div className="space-y-4">
                  <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                    <Calendar className="text-blue-500" size={16} /> Fluxo de Execução
                  </h2>
                  {phaseStats.map((phase) => (
                    <div 
                      key={phase.id} 
                      onClick={() => setSelectedPhase(phase.id)} 
                      className={`p-6 rounded-[2.2rem] border transition-all cursor-pointer group relative overflow-hidden ${selectedPhase === phase.id ? 'bg-blue-600 border-blue-400 shadow-2xl shadow-blue-900/30' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                    >
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                          <span className={`text-[10px] font-black uppercase tracking-tighter ${selectedPhase === phase.id ? 'text-blue-200' : 'text-slate-500'}`}>Fase 0{phase.id}</span>
                          <h3 className={`text-sm font-black mt-1 ${selectedPhase === phase.id ? 'text-white' : 'text-slate-200'}`}>{phase.name}</h3>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-xl ${selectedPhase === phase.id ? 'bg-blue-500 text-white border border-blue-400' : 'bg-slate-800 text-slate-500'}`}>{phase.period}</span>
                      </div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`flex-1 h-2 rounded-full overflow-hidden ${selectedPhase === phase.id ? 'bg-blue-700/50' : 'bg-slate-800'}`}>
                          <div className={`h-full transition-all duration-1000 ${selectedPhase === phase.id ? 'bg-white' : 'bg-blue-500'}`} style={{ width: `${phase.progress}%` }} />
                        </div>
                        <span className={`text-[10px] font-mono font-bold ${selectedPhase === phase.id ? 'text-blue-100' : 'text-slate-500'}`}>{phase.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checklist with Health Logic */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl flex flex-col">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-black flex items-center gap-4 text-white">
                      <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner">{selectedPhase}</div>
                      Checklist Estratégico
                    </h2>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Meta Financeira</span>
                      <span className="text-sm font-black text-emerald-400 bg-emerald-400/5 px-4 py-1.5 rounded-full border border-emerald-400/10">MRR: R$ {PHASES.find(p=>p.id===selectedPhase).mrrTarget}</span>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    {tasks.filter(t => t.phaseId === selectedPhase).map(task => {
                      const health = getTaskHealth(task);
                      return (
                        <div 
                          key={task.id} 
                          onClick={() => toggleTask(task.id)} 
                          className={`flex items-center gap-6 p-6 rounded-[2rem] border transition-all cursor-pointer group active:scale-[0.98] ${task.done ? 'bg-slate-800/20 border-slate-800 opacity-50' : 'bg-slate-950 border-slate-800 hover:border-blue-500/40 shadow-sm'}`}
                        >
                          <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${task.done ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-900/20' : 'border-slate-700 group-hover:border-blue-500'}`}>
                            {task.done && <CheckCircle2 size={18} className="text-white" strokeWidth={3} />}
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm font-black block mb-1.5 ${task.done ? 'text-slate-600 line-through' : 'text-slate-200'}`}>{task.title}</span>
                            <div className="flex items-center gap-4">
                              <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${health.bg} ${health.color}`}>
                                <health.icon size={10} strokeWidth={3} />
                                {health.label}
                              </div>
                              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{health.sub}</span>
                            </div>
                          </div>
                          {!task.done && <ChevronRight size={14} className="text-slate-800" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'gantt' && (
            <div className="space-y-12 animate-in slide-in-from-right-4 duration-700">
               <div className="space-y-2">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Cronograma Executivo</h1>
                <p className="text-slate-500 font-medium">Orquestração detalhada de frentes para 12 meses.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 overflow-x-auto shadow-2xl relative">
                <div className="min-w-[1000px]">
                  <div className="flex mb-10 border-b border-slate-800/50 pb-8">
                    <div className="w-1/4 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Vertical Operacional</div>
                    <div className="flex-1 flex text-center">
                      {MONTHS.map((m, i) => (
                        <div key={i} className={`flex-1 text-[10px] font-black border-l border-slate-800/30 ${i+1 === Math.floor(currentProjectMonth) ? 'text-blue-500' : 'text-slate-600'}`}>
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-10">
                    {[
                      { g: 'Vendas', t: 'Aquisição Clientes Fase 1', s: 1, d: 2, st: 'in-progress', color: 'bg-blue-600' },
                      { g: 'Financeiro', t: 'Ativação MRR Recorrência', s: 1.5, d: 3, st: 'pending', color: 'bg-emerald-500' },
                      { g: 'Outbound', t: 'Automação Cold Call IA', s: 0.5, d: 2.5, st: 'in-progress', color: 'bg-blue-600' },
                      { g: 'Jurídico', t: 'Checklist OAB & Piloto', s: 4, d: 2, st: 'pending', color: 'bg-slate-700' },
                      { g: 'Expansão', t: 'Escala Ribeirão Preto', s: 7, d: 5, st: 'pending', color: 'bg-slate-700' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center group">
                        <div className="w-1/4 pr-8">
                          <p className="text-[10px] text-blue-500 font-black uppercase tracking-tighter mb-1 opacity-60">{row.g}</p>
                          <p className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors leading-tight">{row.t}</p>
                        </div>
                        <div className="flex-1 h-12 flex items-center relative">
                          <div className="absolute inset-0 flex pointer-events-none">
                             {MONTHS.map((_, j) => <div key={j} className={`flex-1 border-l border-slate-800/10 ${j+1 === Math.floor(currentProjectMonth) ? 'bg-blue-500/5 border-l-blue-500/20' : ''}`} />)}
                          </div>
                          <div 
                            className={`h-5 rounded-full relative z-10 transition-all duration-1000 shadow-xl group-hover:h-7 ${row.color}`}
                            style={{ marginLeft: `${(row.s / 12) * 100}%`, width: `${(row.d / 12) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-16 animate-in slide-in-from-bottom-8 duration-700">
               <div className="flex justify-between items-center border-b border-slate-900 pb-10">
                 <div>
                  <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Roteiro de Campo</h1>
                  <p className="text-slate-500 font-medium italic text-lg text-white">Execução radical do Plano B por micro-etapas.</p>
                 </div>
                 <ShieldCheck size={48} className="text-blue-500/20" />
               </div>

              <div className="space-y-24">
                {PHASES.map(phase => (
                  <section key={phase.id} className="relative">
                    <div className="flex items-center gap-6 mb-10">
                      <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center font-black text-2xl text-blue-500 shadow-2xl border-t-blue-500/20">{phase.id}</div>
                      <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1">{phase.name}</h3>
                        <div className="flex items-center gap-5">
                          <span className="text-xs font-black text-slate-500 font-mono uppercase tracking-[0.2em]">{phase.period}</span>
                          <span className="text-xs font-black text-blue-400 font-mono uppercase tracking-[0.2em]">{phaseStats.find(p => p.id === phase.id)?.progress}% CONCLUÍDO</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tasks.filter(t => t.phaseId === phase.id).map(task => {
                        const h = getTaskHealth(task);
                        return (
                          <div key={task.id} onClick={() => toggleTask(task.id)} className={`p-8 flex flex-col gap-6 rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden group shadow-lg ${task.done ? 'bg-slate-900/30 border-slate-900' : 'bg-slate-900 border-slate-800 hover:border-blue-600/50 hover:-translate-y-2'}`}>
                            <div className="flex justify-between items-start relative z-10">
                              <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700'}`}>
                                {task.done && <CheckCircle2 size={24} className="text-white" strokeWidth={3} />}
                              </div>
                              <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${h.bg} ${h.color}`}>{h.label}</span>
                            </div>
                            <span className={`text-[15px] font-black leading-snug h-12 relative z-10 ${task.done ? 'text-slate-600 line-through' : 'text-slate-200'}`}>{task.title}</span>
                            <div className="mt-auto flex items-center gap-2 text-slate-500 group-hover:text-blue-400 transition-colors">
                               <Timer size={14} />
                               <span className="text-[10px] font-black uppercase tracking-widest">Alvo: Mês {task.targetMonth}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Nav Mobile Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-22 bg-slate-900/95 backdrop-blur-3xl border-t border-slate-800 flex items-center justify-around px-10 z-50 pb-safe shadow-[0_-20px_40px_rgba(0,0,0,0.8)]">
        {[
          { id: 'overview', icon: LayoutDashboard, label: 'Painel' },
          { id: 'gantt', icon: GanttChartSquare, label: 'Timeline' },
          { id: 'tasks', icon: ListTodo, label: 'Tarefas' }
        ].map(nav => (
          <button key={nav.id} onClick={() => setActiveTab(nav.id)} className={`flex flex-col items-center gap-2.5 transition-all ${activeTab === nav.id ? 'text-blue-500 scale-110' : 'text-slate-600'}`}>
            <nav.icon size={24} strokeWidth={activeTab === nav.id ? 3 : 2} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{nav.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

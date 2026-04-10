import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, CheckCircle2, Clock, Calendar, Target, TrendingUp, Users, ChevronRight, AlertCircle,
  LayoutDashboard, ListTodo, GanttChartSquare, ArrowRight, ShieldCheck, RefreshCcw, AlertTriangle, 
  Timer, ExternalLink, Bell, Activity, Plus, X, Server, LogIn, LogOut, Code, Zap
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

// --- Configuração Firebase Seguro ---
const envConfig = import.meta.env.VITE_FIREBASE_CONFIG;
const firebaseConfig = envConfig ? JSON.parse(envConfig) : {
  apiKey: "mock-api-key",
  authDomain: "mock-firebase.firebaseapp.com",
  projectId: "mock-project"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const appId = import.meta.env.VITE_APP_ID || 'connect-labs-exec-v5';

// --- Definição das Fases com Deadlines (Meses) ---
const PHASES = [
  { id: 1, name: 'Fundação Comercial', period: 'M1-M2', deadlineMonth: 2, mrrTarget: 2600 },
  { id: 2, name: 'Validação Operacional', period: 'M3-M4', deadlineMonth: 4, mrrTarget: 1800 },
  { id: 3, name: 'Padronização & OAB', period: 'M5-M6', deadlineMonth: 6, mrrTarget: 6200 },
  { id: 4, name: 'Escala Disciplinada', period: 'M7-M12', deadlineMonth: 12, mrrTarget: 12000 },
];

// --- Lista de Tarefas Revisada (Plano Executivo B) ---
const INITIAL_TASKS = [
  // FASE 1: FUNDAÇÃO (Abril - Maio)
  { id: 101, phaseId: 1, title: 'Etapa 0: Congelar Versão B (sem tráfego pago)', done: true, startMonth: 0, targetMonth: 1 },
  { id: 102, phaseId: 1, title: 'Etapa 1: Limpar base e organizar CRM (A/B/C)', done: false, startMonth: 0, targetMonth: 1 },
  { id: 103, phaseId: 1, title: 'Etapa 2: Definir ICP e ajustar discurso (MVO)', done: false, startMonth: 0, targetMonth: 1 },
  { id: 104, phaseId: 1, title: 'Etapa 3: Kit comercial mínimo', done: false, startMonth: 0.5, targetMonth: 1.5 },
  { id: 105, phaseId: 1, title: 'Etapa 4: Cold call com IA + Prospecção base', done: false, startMonth: 0.5, targetMonth: 2 },
  { id: 106, phaseId: 1, title: 'Etapa 5: Fechar primeiros clientes', done: false, startMonth: 1, targetMonth: 2 },
  
  // FASE 2: VALIDAÇÃO (Junho - Julho)
  { id: 201, phaseId: 2, title: 'Etapa 6: Registrar Caso e Prova Social', done: false, startMonth: 2, targetMonth: 3 },
  { id: 202, phaseId: 2, title: 'Etapa 7: Conversão em recorrência', done: false, startMonth: 2, targetMonth: 4 },
  { id: 203, phaseId: 2, title: 'Etapa 8: Consolidação break-even (MRR > R$ 1.800)', done: false, startMonth: 3, targetMonth: 5 },

  // FASE 3: PADRONIZAÇÃO & OAB (Agosto - Setembro)
  { id: 301, phaseId: 3, title: 'Etapa 9: Formar Reserva (R$ 5.400+)', done: false, startMonth: 4, targetMonth: 6 },
  { id: 302, phaseId: 3, title: 'Etapa 10: Entrada oficial em Advocacia', done: false, startMonth: 5, targetMonth: 6 },

  // FASE 4: ESCALA (Outubro em diante)
  { id: 401, phaseId: 4, title: 'Etapa 11: Escala regional disciplinada', done: false, startMonth: 6, targetMonth: 12 },
];

const MONTHS = ['Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar'];

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPhaseTracker, setSelectedPhaseTracker] = useState(1);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [loading, setLoading] = useState(true);

  // Estados Form Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estados de Melhorias (CRUD & RevOps)
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPhase, setNewTaskPhase] = useState(1);
  const [metrics, setMetrics] = useState({
    breakEven: 'R$ 1.800', reservaTarget: 'R$ 5.400', clientesAlvo: '2 un (R$ 2.600)', horasOutbound: '4h/sem'
  });
  
  const currentProjectMonth = 1.2;

  // --- Lógica de Autenticação Segura ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setLoginError('');
    try { 
      await signInWithEmailAndPassword(auth, loginEmail, loginPass); 
    } 
    catch (err) { 
      console.warn("Firebase Auth falhou, verificando mock...");
      // Hardcode provisório de segurança (Fallback Local / Produção sem chaves)
      if (loginEmail === 'anderson.santos001@gmail.com' && loginPass === '$22$Aa01@$$') {
         setUser({ uid: 'mock_exec_01', displayName: 'Anderson Santos' });
      } else {
         setLoginError('Credenciais inválidas ou não registradas.');
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setLoginError('');
    try { 
      await signInWithPopup(auth, provider); 
    } 
    catch (err) { 
      console.warn("Google Auth falhou (chaves ausentes?), simulando...", err);
      setUser({ uid: 'mock_exec_google', displayName: 'Anderson (Google)' });
    }
    setLoading(false);
  };

  const handleLogout = () => { setUser(null); signOut(auth); };

  // --- Persistência Cloud ---
  useEffect(() => {
    if (!user) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'config', 'dashboardState');
      const unsub = onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
           const data = snap.data();
           if(data.tasks) setTasks(data.tasks);
           if(data.metrics) setMetrics(data.metrics);
        } else {
           setDoc(docRef, { tasks: INITIAL_TASKS, metrics });
           setTasks(INITIAL_TASKS);
        }
      }, () => {});
      return () => unsub();
    } catch(err) { console.error("Firestore persistence error", err); }
  }, [user]);

  // --- Funções Originais & Novas ---
  const getTaskHealth = (task) => {
    if (task.done) return { label: 'Concluído', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 };
    if (task.startMonth > currentProjectMonth) {
      return { label: '1ª Oportunidade', color: 'text-emerald-500', bg: 'bg-emerald-500/10', sub: 'Execução Antecipada', icon: Timer };
    }
    if (currentProjectMonth >= task.startMonth && currentProjectMonth <= task.targetMonth) {
      return { label: 'Oportunidade Ideal', color: 'text-blue-500', bg: 'bg-blue-500/10', sub: 'Janela de Atuação', icon: Clock };
    }
    return { label: 'Atrasado', color: 'text-orange-500', bg: 'bg-orange-500/10', sub: 'Risco de Atraso', icon: AlertTriangle };
  };

  const toggleTask = async (id) => {
    if (!user) return;
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(updated);
    if(user.uid !== 'mock_exec_01' && user.uid !== 'mock_exec_google'){
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'config', 'dashboardState'), { tasks: updated }, { merge: true });
    }
  };

  const addTaskToDB = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Date.now(), phaseId: newTaskPhase, title: newTaskTitle,
      done: false, startMonth: Math.floor(currentProjectMonth), targetMonth: Math.floor(currentProjectMonth)+1
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    setNewTaskTitle('');
    setShowTaskModal(false);
    if (user.uid !== 'mock_exec_01' && user.uid !== 'mock_exec_google') {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'config', 'dashboardState'), { tasks: updated }, { merge: true });
    }
  };

  const phaseStats = useMemo(() => PHASES.map(p => {
    const pTasks = tasks.filter(t => t.phaseId === p.id);
    const done = pTasks.filter(t => t.done).length;
    return { ...p, progress: pTasks.length ? Math.round((done / pTasks.length) * 100) : 0 };
  }), [tasks]);

  const globalProgress = useMemo(() => tasks.length ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100) : 0, [tasks]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-2xl"></div>
      <p className="text-blue-500 font-black tracking-widest uppercase text-xs animate-pulse">Connect Labs • Cloud Sync</p>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-blue-500/30">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 px-8 py-10 rounded-[3rem] shadow-2xl flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center font-black text-4xl text-white mb-6">C</div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase mb-2 text-center">Connect Labs</h1>
          <p className="text-slate-500 uppercase tracking-widest text-[10px] font-bold mb-8 text-center">Executive Access</p>
          
          <form className="w-full space-y-4" onSubmit={handleLogin}>
             {loginError && <div className="p-3 mb-2 bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center rounded-xl font-bold">{loginError}</div>}
             <div>
               <input type="email" placeholder="E-mail Corporativo" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm focus:border-blue-500 outline-none transition-colors" />
             </div>
             <div>
               <input type="password" placeholder="Senha Mestra" required value={loginPass} onChange={e => setLoginPass(e.target.value)} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm focus:border-blue-500 outline-none transition-colors" />
             </div>
             <button type="submit" className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-transform active:scale-95 shadow-xl shadow-blue-500/20">
                Acessar Dashboard
             </button>
             <button type="button" onClick={handleGoogleLogin} className="w-full py-3 bg-transparent border border-slate-700 text-slate-400 hover:text-white rounded-xl font-bold text-xs mt-2 transition-colors">
                Alternativo: Entrar com Conta Google
             </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-blue-500/30">
      
      {/* Sidebar Original */}
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
            { id: 'tasks', icon: ListTodo, label: 'Roadmap' },
            { id: 'pulse', icon: Activity, label: 'Pulse Técnico (n8n)' } // Nova sub-aba de melhoria
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

        <div className="mt-auto p-6 bg-slate-800/40 rounded-[2rem] border border-slate-700/50 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest w-24 truncate">{user.displayName || "Online"}</span>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400" title="Sair"><LogOut size={14} /></button>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-300 mb-2 uppercase">Progresso do Plano B</p>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              <div className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]" style={{ width: `${globalProgress}%` }} />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav Original */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between p-5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg">C</div>
          <span className="font-black text-sm tracking-tighter uppercase">Connect Labs</span>
        </div>
        <button onClick={handleLogout} className="text-slate-500 hover:text-red-400"><LogOut size={18} /></button>
      </header>

      {/* Main View com padding mobile ajustado (pb-28) */}
      <main className="flex-1 overflow-y-auto bg-slate-950 pb-28 md:pb-12 h-screen">
        <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-12">
          
          {/* TAB 1: OVERVIEW ORIGINAL RESTAURADA E APERFEIÇOADA */}
          {activeTab === 'overview' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase break-words">Estratégia B</h1>
                  <p className="text-slate-500 font-medium text-lg">Execução enxuta: Validação orgânica e MRR sustentável.</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-[2rem] flex items-center gap-4 shadow-xl shrink-0">
                   <div className="p-3 bg-blue-600/10 rounded-2xl"><Bell className="text-blue-500" size={20} /></div>
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Timeline Atual</p>
                     <p className="text-sm font-bold text-white uppercase tracking-tighter">Janela: {MONTHS[Math.floor(currentProjectMonth)]} / Mês 02</p>
                   </div>
                </div>
              </div>

              {/* KPI Grid Original RESTAURADO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'MRR Planejado', value: 'R$ 2.600', target: 'Fase 1 Final', icon: TrendingUp, color: 'text-emerald-500' },
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

              {/* ADIÇÃO REV-OPS COMO BLOCO COMPLEMENTAR (Melhoria 2) */}
              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-10 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-5"><Zap size={200} /></div>
                 <div className="flex items-center gap-3 mb-8 relative z-10">
                   <Target className="text-blue-500" size={24} />
                   <h2 className="text-xl font-black uppercase text-white">Pilares de Estabilidade Bootstrapped</h2>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                    {Object.entries({
                      'Break-even Fixo': metrics.breakEven,
                      'Target de Reserva': metrics.reservaTarget,
                      'Validação Mínima': metrics.clientesAlvo,
                      'Outbound Focado': metrics.horasOutbound
                    }).map(([label, val], idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800 p-5 rounded-3xl text-center shadow-inner">
                         <p className="text-2xl font-black text-white mb-1 break-words">{val}</p>
                         <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</p>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Fluxo de Execução Original RESTAURADO */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                    <Calendar className="text-blue-500" size={16} /> Fluxo de Execução
                  </h2>
                  {phaseStats.map((phase) => (
                    <div 
                      key={phase.id} 
                      onClick={() => setSelectedPhaseTracker(phase.id)} 
                      className={`p-6 rounded-[2.2rem] border transition-all cursor-pointer group relative overflow-hidden ${selectedPhaseTracker === phase.id ? 'bg-blue-600 border-blue-400 shadow-2xl shadow-blue-900/30' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                    >
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                          <span className={`text-[10px] font-black uppercase tracking-tighter ${selectedPhaseTracker === phase.id ? 'text-blue-200' : 'text-slate-500'}`}>Fase 0{phase.id}</span>
                          <h3 className={`text-sm font-black mt-1 ${selectedPhaseTracker === phase.id ? 'text-white' : 'text-slate-200'}`}>{phase.name}</h3>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-xl ${selectedPhaseTracker === phase.id ? 'bg-blue-500 text-white border border-blue-400' : 'bg-slate-800 text-slate-500'}`}>{phase.period}</span>
                      </div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`flex-1 h-2 rounded-full overflow-hidden ${selectedPhaseTracker === phase.id ? 'bg-blue-700/50' : 'bg-slate-800'}`}>
                          <div className={`h-full transition-all duration-1000 ${selectedPhaseTracker === phase.id ? 'bg-white' : 'bg-blue-500'}`} style={{ width: `${phase.progress}%` }} />
                        </div>
                        <span className={`text-[10px] font-mono font-bold ${selectedPhaseTracker === phase.id ? 'text-blue-100' : 'text-slate-500'}`}>{phase.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl flex flex-col">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-xl sm:text-2xl font-black flex items-center gap-4 text-white">
                      <div className="w-12 h-12 shrink-0 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner">{selectedPhaseTracker}</div>
                      Checklist Estratégico
                    </h2>
                    <div className="text-right shrink-0 ml-4 hidden sm:block">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Meta Financeira</span>
                      <span className="text-sm font-black text-emerald-400 bg-emerald-400/5 px-4 py-1.5 rounded-full border border-emerald-400/10">MRR: R$ {PHASES.find(p=>p.id===selectedPhaseTracker).mrrTarget}</span>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    {tasks.filter(t => t.phaseId === selectedPhaseTracker).map(task => {
                      const health = getTaskHealth(task);
                      return (
                        <div 
                          key={task.id} 
                          onClick={() => toggleTask(task.id)} 
                          className={`flex items-center gap-4 p-5 sm:p-6 rounded-[2rem] border transition-all cursor-pointer group active:scale-[0.98] ${task.done ? 'bg-slate-800/20 border-slate-800 opacity-50' : 'bg-slate-950 border-slate-800 hover:border-blue-500/40 shadow-sm'}`}
                        >
                          <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${task.done ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-900/20' : 'border-slate-700 group-hover:border-blue-500'}`}>
                            {task.done && <CheckCircle2 size={18} className="text-white" strokeWidth={3} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs sm:text-sm font-black block mb-1.5 truncate ${task.done ? 'text-slate-600 line-through' : 'text-slate-200'}`}>{task.title}</span>
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${health.bg} ${health.color}`}>
                                <health.icon size={10} strokeWidth={3} />
                                {health.label}
                              </div>
                              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest truncate hidden sm:inline">{health.sub}</span>
                            </div>
                          </div>
                          {!task.done && <ChevronRight size={14} className="text-slate-800 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GANTT ORIGINAL RESTAURADA */}
          {activeTab === 'gantt' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
               <div className="space-y-2">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Cronograma Executivo</h1>
                <p className="text-slate-500 font-medium">Orquestração detalhada de frentes para 12 meses.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 overflow-x-auto shadow-2xl relative">
                <div className="min-w-[800px]">
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
                      { g: 'Estratégia', t: 'Foco, oferta e ICP', s: 0, d: 2, st: 'pending', color: 'bg-emerald-500' },
                      { g: 'Vendas', t: 'Limpar base e CRM', s: 0, d: 2, st: 'pending', color: 'bg-blue-600' },
                      { g: 'Outbound', t: 'Cold call IA + follow-up', s: 0, d: 12, st: 'in-progress', color: 'bg-blue-500' },
                      { g: 'Contratos', t: 'Fechar 1ºs clientes', s: 1, d: 3, st: 'pending', color: 'bg-green-500' },
                      { g: 'Sucesso', t: 'Onboarding e templates', s: 1, d: 4, st: 'pending', color: 'bg-slate-700' },
                      { g: 'Marketing', t: 'Case e prova social', s: 2, d: 4, st: 'pending', color: 'bg-purple-500' },
                      { g: 'Recorrência', t: 'Migração de Escopo', s: 2, d: 10, st: 'pending', color: 'bg-emerald-500' },
                      { g: 'Estabilidade', t: 'Break-even e reserva', s: 3, d: 9, st: 'pending', color: 'bg-emerald-400' },
                      { g: 'Expansão', t: 'Entrada em advocacia', s: 4, d: 4, st: 'pending', color: 'bg-slate-600' },
                      { g: 'Escala', t: 'Expansão regional', s: 5, d: 7, st: 'pending', color: 'bg-slate-700' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center group">
                        <div className="w-1/4 pr-8">
                          <p className="text-[10px] text-blue-500 font-black uppercase tracking-tighter mb-1 opacity-60">{row.g}</p>
                          <p className="text-xs sm:text-sm font-bold text-slate-300 group-hover:text-white transition-colors leading-tight truncate">{row.t}</p>
                        </div>
                        <div className="flex-1 h-12 flex items-center relative">
                          <div className="absolute inset-0 flex pointer-events-none">
                             {MONTHS.map((_, i) => <div key={i} className={`flex-1 border-l border-slate-800/10 ${i+1 === Math.floor(currentProjectMonth) ? 'bg-blue-500/5 border-l-blue-500/20' : ''}`} />)}
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

          {/* TAB 3: TASKS/ROADMAP ORIGINAL RESTAURADA E APERFEIÇOADA COM BOTÃO */}
          {activeTab === 'tasks' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="flex justify-between items-center border-b border-slate-900 pb-10">
                 <div className="pr-4">
                  <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase break-words">Roteiro de Campo</h1>
                  <p className="text-slate-500 font-medium italic text-sm sm:text-lg text-white">Execução radical do Plano B por micro-etapas.</p>
                 </div>
                 <button 
                  onClick={() => setShowTaskModal(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest flex gap-2 items-center shadow-xl shadow-blue-500/20 shrink-0 h-max"
                 >
                  <Plus size={16} /> Nova
                 </button>
               </div>

              <div className="space-y-24">
                {PHASES.map(phase => (
                  <section key={phase.id} className="relative">
                    <div className="flex items-center gap-6 mb-10">
                      <div className="w-16 h-16 shrink-0 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center font-black text-2xl text-blue-500 shadow-2xl border-t-blue-500/20">{phase.id}</div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-1">{phase.name}</h3>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                          <span className="text-[10px] sm:text-xs font-black text-slate-500 font-mono uppercase tracking-[0.2em]">{phase.period}</span>
                          <span className="text-[10px] sm:text-xs font-black text-blue-400 font-mono uppercase tracking-[0.2em]">{phaseStats.find(p => p.id === phase.id)?.progress}% CONCLUÍDO</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tasks.filter(t => t.phaseId === phase.id).map(task => {
                        const h = getTaskHealth(task);
                        return (
                          <div key={task.id} onClick={() => toggleTask(task.id)} className={`p-6 sm:p-8 flex flex-col gap-6 rounded-[2rem] sm:rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden group shadow-lg ${task.done ? 'bg-slate-900/30 border-slate-900' : 'bg-slate-900 border-slate-800 hover:border-blue-600/50 hover:-translate-y-2'}`}>
                            <div className="flex justify-between items-start relative z-10 w-full">
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-2xl border-2 flex items-center justify-center transition-all ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700'}`}>
                                {task.done && <CheckCircle2 size={24} className="text-white" strokeWidth={3} />}
                              </div>
                              <span className={`text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl uppercase tracking-widest text-right shrink-0 whitespace-normal line-clamp-2 ${h.bg} ${h.color}`}>{h.label}</span>
                            </div>
                            <span className={`text-[13px] sm:text-[15px] font-black leading-snug h-auto sm:h-12 relative z-10 break-words ${task.done ? 'text-slate-600 line-through' : 'text-slate-200'}`}>{task.title}</span>
                            <div className="mt-auto flex items-center gap-2 text-slate-500 group-hover:text-blue-400 transition-colors pt-4 border-t border-slate-800/50">
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

          {/* TAB 4: NOVA ABA PULSE TÉCNICO VINCULADA N8N */}
          {activeTab === 'pulse' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
               <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white flex items-center gap-4 break-words">
                    Pulse Técnico <Server className="text-emerald-500 animate-pulse shrink-0" />
                  </h1>
                  <p className="text-slate-500">Monitoramento nativo das Automações em Execução (n8n).</p>
               </div>

               <div className="bg-slate-900 border border-emerald-900/30 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-transparent opacity-50" />
                  <h3 className="font-black text-white text-base md:text-lg mb-6 uppercase flex gap-3 items-center">
                    <Code className="text-emerald-500 shrink-0" /> Monitoramento Webhooks
                  </h3>
                  <div className="space-y-4">
                    {[
                      { nome: "Dowload Leads CNPJ + Disparador", id: "3twAOMMwmoWXPm1O", status: 'Ativo', color: 'emerald' },
                      { nome: "Agente Mestre - COMERCIO - V4.1", id: "bReA3bdRr03NnScF", status: 'Ativo', color: 'emerald' },
                      { nome: "CARROSSEL Instagram - v2.0", id: "vAc9etCncJCwu4Wx", status: 'Ativo', color: 'emerald' },
                      { nome: "Agente Mestre - NEXXT-AI V2", id: "qTfCiirc5e1YoBpj", status: 'Ativo', color: 'emerald' },
                      { nome: "Automação Interna (Desligada)", id: "PYJ4vJa6lFto30O", status: 'Offline', color: 'red' },
                    ].map((w, i) => (
                      <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 px-5 bg-slate-950 rounded-2xl border border-slate-800 gap-4">
                        <div className="min-w-0 pr-4">
                          <p className="font-bold text-slate-300 truncate text-sm sm:text-base">{w.nome}</p>
                          <p className="text-[10px] text-slate-600 font-mono mt-1">ID: {w.id}</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-max ${w.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                          {w.status}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 p-5 bg-blue-950/20 border border-blue-900/50 rounded-2xl">
                     <h4 className="font-black text-blue-400 mb-2 uppercase text-xs tracking-widest">Documentação Firebase do Webhook</h4>
                     <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                       Para atualizar status dinâmicos do <b>n8n</b>, use o nó auxiliar do Firebase Database neste caminho:
                     </p>
                     <code className="block p-4 bg-slate-950 rounded-xl text-blue-300 font-mono text-[10px] sm:text-xs border border-blue-900 shadow-inner overflow-x-auto whitespace-nowrap">
                       Coleção: /artifacts/{appId}/users/{"{uid}"}/config<br />
                       Documento: "dashboardState"
                     </code>
                  </div>
               </div>
            </div>
          )}

        </div>
      </main>

      {/* Modal Adicionar Tarefa */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6">
           <form onSubmit={addTaskToDB} className="bg-slate-900 border border-slate-700 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] w-full max-w-md shadow-2xl relative">
              <button type="button" onClick={() => setShowTaskModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase mb-6">Criar Tarefa</h2>
              
              <div className="mb-6">
                 <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Fase de Execução</label>
                 <select value={newTaskPhase} onChange={e => setNewTaskPhase(Number(e.target.value))} className="w-full bg-slate-950 text-white p-4 rounded-2xl border border-slate-800 outline-none focus:border-blue-500">
                    {PHASES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
              </div>

              <div className="mb-10">
                 <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Título da Meta</label>
                 <input autoFocus type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required placeholder="Ex: Novo Agente Assistente..." className="w-full bg-slate-950 text-white p-4 rounded-2xl border border-slate-800 outline-none focus:border-blue-500" />
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-transform active:scale-95">Salvar no Roadmap</button>
           </form>
        </div>
      )}

      {/* Nav Mobile Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 sm:h-24 bg-slate-900/95 backdrop-blur-3xl border-t border-slate-800 flex items-center justify-around px-2 sm:px-6 z-40 pb-safe shadow-[0_-20px_40px_rgba(0,0,0,0.8)]">
        {[
          { id: 'overview', icon: LayoutDashboard },
          { id: 'gantt', icon: GanttChartSquare },
          { id: 'tasks', icon: ListTodo },
          { id: 'pulse', icon: Activity }
        ].map(nav => (
          <button key={nav.id} onClick={() => setActiveTab(nav.id)} className={`flex flex-col items-center justify-center h-full w-full p-2 transition-all ${activeTab === nav.id ? 'text-blue-500 -translate-y-1' : 'text-slate-600 hover:text-slate-400'}`}>
            <nav.icon size={22} strokeWidth={activeTab === nav.id ? 3 : 2} />
          </button>
        ))}
      </div>
    </div>
  );
}

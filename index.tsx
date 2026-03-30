import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Trophy, 
  Play, 
  Users, 
  Clock, 
  Pause, 
  RotateCcw, 
  X, 
  Check, 
  ChevronRight,
  Plus, 
  Minus, 
  Hash, 
  Ban, 
  ArrowDown, 
  Edit2, 
  Menu, 
  BookOpen, 
  Mail, 
  Shield, 
  Send, 
  ExternalLink,
  Loader2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { Card, ALL_CARDS } from './cards';

// --- Types ---

interface TeamColor {
  name: string;
  primary: string;
  onPrimary: string;
  surface: string;
  border: string;
  text: string;
  hex: string;
  ring: string;
}

interface Team {
  name: string;
  score: number;
  colorId: number;
}

interface GameSettings {
  roundTime: number;
  numTeams: number;
  totalRounds: number;
  passLimit: number;
}

// --- Constants & Data ---

const TEAM_COLORS: TeamColor[] = [
  { 
    name: 'Azul', 
    primary: 'bg-blue-600', 
    onPrimary: 'text-white', 
    surface: 'bg-blue-500/10', 
    border: 'border-blue-500/50', 
    text: 'text-blue-400',
    hex: '#3b82f6',
    ring: 'focus:ring-blue-500'
  },
  { 
    name: 'Rojo', 
    primary: 'bg-red-600', 
    onPrimary: 'text-white', 
    surface: 'bg-red-500/10', 
    border: 'border-red-500/50', 
    text: 'text-red-400',
    hex: '#ef4444',
    ring: 'focus:ring-red-500'
  },
  { 
    name: 'Verde', 
    primary: 'bg-emerald-600', 
    onPrimary: 'text-white', 
    surface: 'bg-emerald-500/10', 
    border: 'border-emerald-500/50', 
    text: 'text-emerald-400',
    hex: '#10b981',
    ring: 'focus:ring-emerald-500'
  },
  { 
    name: 'Ambar', 
    primary: 'bg-amber-600', 
    onPrimary: 'text-black', 
    surface: 'bg-amber-500/10', 
    border: 'border-amber-500/50', 
    text: 'text-amber-400',
    hex: '#f59e0b',
    ring: 'focus:ring-amber-500'
  },
];

// --- Utilities & Canvas Effects ---

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const ConfettiCanvas = ({ colorHex }: { colorHex: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
             canvas.width = window.innerWidth;
             canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const particles: any[] = [];
        const particleCount = 150;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: Math.random() * 8 + 4,
                h: Math.random() * 8 + 4,
                speed: Math.random() * 4 + 2,
                color: Math.random() > 0.4 ? colorHex : (Math.random() > 0.5 ? '#ffffff' : '#D0BCFF'),
                angle: Math.random() * 360,
                spin: Math.random() * 0.1 - 0.05
            });
        }

        let animationId: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.y += p.speed;
                p.angle += p.spin;
                p.x += Math.sin(p.angle * Math.PI / 180) * 1.5;

                if (p.y > canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });
            animationId = requestAnimationFrame(animate);
        };
        animate();
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        }
    }, [colorHex]);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

// --- Components ---

const Button = ({ children, onClick, className = "", variant = "primary", disabled = false, type = "button" }: any) => {
  const variants: any = {
    primary: "bg-[#D0BCFF] text-[#381E72] hover:bg-[#E8DEF8] active:scale-[0.98] shadow-lg shadow-purple-900/20",
    secondary: "bg-[#2D2D35] text-[#E6E1E5] border border-[#49454F] hover:bg-[#363640]",
    success: "bg-[#B8F397] text-[#042100] hover:bg-[#C9F9AE] active:scale-[0.98] shadow-lg shadow-green-900/20",
    danger: "bg-[#F2B8B5] text-[#601410] hover:bg-[#F9DEDC] active:scale-[0.98] shadow-lg shadow-red-900/20",
    ghost: "bg-transparent text-[#E6E1E5] hover:bg-white/5",
    tonal: "bg-[#4A4458] text-[#E8DEF8]",
  };

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-3 sm:px-6 sm:py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 select-none tracking-wide text-sm sm:text-base ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed active:scale-100' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

// Control Component Extracted for Safety and Performance
const Control = ({ label, icon: Icon, value, onMinus, onPlus }: any) => (
  <div className="bg-[#121212] rounded-xl p-2 flex flex-col justify-between border border-[#2D2D35] h-full">
       <div className="flex items-center gap-1.5 mb-1 px-1">
          <Icon size={12} className="text-[#D0BCFF]" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</span>
      </div>
      <div className="flex items-center justify-between bg-[#1E1E22] rounded-lg p-1">
          <button onClick={onMinus} className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:bg-[#2D2D35] hover:text-white transition-colors">
              <Minus size={14} />
          </button>
          <span className="text-lg font-bold text-white tabular-nums">{value}</span>
          <button onClick={onPlus} className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:bg-[#2D2D35] hover:text-white transition-colors">
              <Plus size={14} />
          </button>
      </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1E1E22] w-full max-w-md max-h-[90vh] rounded-[28px] border border-[#333333] shadow-2xl flex flex-col overflow-hidden animate-scale-in">
                <div className="p-4 border-b border-[#333333] flex justify-between items-center bg-[#2D2D35]">
                    <h3 className="text-lg font-bold text-[#E6E1E5]">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-[#3E3E46] rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-5 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

const CardView = ({ card, onAction, passLimit, passesUsed, teamColor }: { 
  card: Card, 
  onAction: (type: 'correct' | 'taboo' | 'pass') => void, 
  passLimit: number, 
  passesUsed: number,
  teamColor: TeamColor
}) => {
  const [shaking, setShaking] = useState(false);
  const passesRemaining = passLimit - passesUsed;

  const triggerVibration = () => {
    if ('vibrate' in navigator) navigator.vibrate(100);
    setShaking(true);
    setTimeout(() => setShaking(false), 200);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-sm mx-auto overflow-hidden pb-2">
      {/* Game Card */}
      <div className={`flex-1 bg-[#1E1E22] rounded-[24px] border border-[#333333] flex flex-col shadow-2xl overflow-hidden card-enter ${shaking ? 'vibrate' : ''} mb-3 relative`}>
        
        {/* Decorative Background Blur */}
        <div className={`absolute top-0 left-0 w-full h-32 ${teamColor.primary} opacity-20 blur-3xl pointer-events-none`}></div>

        {/* Word Header */}
        <div className="relative p-6 flex flex-col items-center justify-center text-center shrink-0 z-10 border-b border-[#333333]/50">
          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${teamColor.text} opacity-80`}>Palabra Clave</span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight break-words uppercase text-white drop-shadow-lg leading-tight">
            {card.palabra}
          </h2>
        </div>

        {/* Taboo Words - Use flex-1 to distribute space */}
        <div className="flex-1 p-4 flex flex-col justify-center gap-2 relative z-10">
          <div className="flex items-center gap-2 text-[#EF4444] mb-1 justify-center opacity-80">
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">PROHIBIDAS</span>
            <ArrowDown size={12} strokeWidth={3} />
          </div>
          <div className="flex flex-col gap-2 h-full justify-center">
            {card.taboo.map((w, i) => (
                <div key={i} className="bg-[#2D2D35] py-3 px-2 rounded-xl text-center text-base sm:text-lg font-semibold text-[#E6E1E5] uppercase tracking-wide border border-[#333333] shadow-sm flex items-center justify-center flex-1 max-h-12">
                {w}
                </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-2 shrink-0 h-20 sm:h-24">
        <div className="flex flex-col gap-1 relative h-full">
           <Button 
            variant="tonal" 
            onClick={() => onAction('pass')} 
            disabled={passesRemaining <= 0}
            className="flex-col gap-1 h-full !rounded-[20px] !p-0"
          >
            {passesRemaining <= 0 ? <Ban size={20} /> : <ChevronRight size={24} />}
            <span className="text-[10px] uppercase font-bold">Pasar</span>
          </Button>
          <div className="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center bg-[#2D2D35] text-white text-xs font-black rounded-full border border-[#49454F] shadow-lg z-10">
            {passesRemaining}
          </div>
        </div>

        <Button 
          variant="danger" 
          onClick={() => {
            triggerVibration();
            onAction('taboo');
          }} 
          className="flex-col gap-1 h-full !rounded-[20px] !p-0"
        >
          <X size={28} strokeWidth={3} />
          <span className="text-[10px] uppercase font-bold">Tabú</span>
        </Button>

        <Button 
          variant="success" 
          onClick={() => onAction('correct')} 
          className="flex-col gap-1 h-full !rounded-[20px] !p-0"
        >
          <Check size={28} strokeWidth={3} />
          <span className="text-[10px] uppercase font-bold">Correcto</span>
        </Button>
      </div>
    </div>
  );
};

// --- MENU & MODALS ---

const MainMenu = ({ onOpenModal }: { onOpenModal: (type: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<any>(null);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="absolute top-4 right-4 z-50" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 bg-[#2D2D35] hover:bg-[#3E3E46] rounded-full flex items-center justify-center text-[#E6E1E5] border border-[#49454F] shadow-lg transition-colors"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {isOpen && (
                <div className="absolute top-12 right-0 w-48 bg-[#2D2D35] border border-[#49454F] rounded-2xl shadow-xl overflow-hidden py-1 animate-scale-in origin-top-right">
                    <button onClick={() => {onOpenModal('rules'); setIsOpen(false);}} className="w-full text-left px-4 py-3 text-sm font-medium text-[#E6E1E5] hover:bg-[#3E3E46] flex items-center gap-3">
                        <BookOpen size={16} className="text-[#D0BCFF]" /> Reglamento
                    </button>
                    <button onClick={() => {onOpenModal('contact'); setIsOpen(false);}} className="w-full text-left px-4 py-3 text-sm font-medium text-[#E6E1E5] hover:bg-[#3E3E46] flex items-center gap-3">
                        <Mail size={16} className="text-[#D0BCFF]" /> Contacto
                    </button>
                    <button onClick={() => {onOpenModal('privacy'); setIsOpen(false);}} className="w-full text-left px-4 py-3 text-sm font-medium text-[#E6E1E5] hover:bg-[#3E3E46] flex items-center gap-3">
                        <Shield size={16} className="text-[#D0BCFF]" /> Privacidad
                    </button>
                </div>
            )}
        </div>
    );
};

// --- REDESIGNED SETUP SCREEN (COMPACT) ---

const SetupScreen = ({ onStart }: { onStart: (settings: GameSettings, teams: Team[]) => void }) => {
  const DEFAULT_SETTINGS = {
    numTeams: 2,
    roundTime: 60,
    passLimit: 2,
    totalRounds: 5,
    teamNames: ['Equipo 1', 'Equipo 2', 'Equipo 3', 'Equipo 4']
  };

  const [initialSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('argentabu_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Robust merge to prevent crashes if saved data is partial/corrupt
        return { 
            ...DEFAULT_SETTINGS, 
            ...parsed,
            numTeams: parsed.numTeams || DEFAULT_SETTINGS.numTeams,
            teamNames: Array.isArray(parsed.teamNames) ? parsed.teamNames : DEFAULT_SETTINGS.teamNames
        };
      }
    } catch (e) {
      console.error("Error loading settings:", e);
    }
    return DEFAULT_SETTINGS;
  });

  // Strict clamping of numTeams to avoid crashes if bad data is in localStorage
  const [numTeams, setNumTeams] = useState(() => {
     const n = initialSettings.numTeams;
     if (typeof n !== 'number' || isNaN(n)) return 2;
     return Math.min(4, Math.max(2, n));
  });

  const [roundTime, setRoundTime] = useState(initialSettings.roundTime);
  const [passLimit, setPassLimit] = useState(initialSettings.passLimit);
  const [totalRounds, setTotalRounds] = useState(initialSettings.totalRounds);
  const [teamNames, setTeamNames] = useState<string[]>(initialSettings.teamNames);

  // Modal State
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const settingsToSave = {
      numTeams,
      roundTime,
      passLimit,
      totalRounds,
      teamNames
    };
    localStorage.setItem('argentabu_settings', JSON.stringify(settingsToSave));
  }, [numTeams, roundTime, passLimit, totalRounds, teamNames]);

  const handleStart = () => {
    const teams = teamNames.slice(0, numTeams).map((name, index) => ({ 
      name: name.trim() || `Equipo ${index + 1}`, 
      score: 0,
      colorId: index 
    }));
    onStart({ roundTime, numTeams, totalRounds, passLimit }, teams);
  };

  const submitContactForm = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSending(true);

      const formData = new FormData();
      formData.append('nombre', contactName);
      formData.append('email', contactEmail);
      formData.append('mensaje', contactMsg);

      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzcOM_QkKLPTrKoxyGR1FC0fJw-PJwqxZSsxrjS7RU1zHiNp58DD_kjnyBzhIzOiUw/exec";

      try {
          await fetch(GOOGLE_SCRIPT_URL, {
              method: 'POST',
              body: formData,
              mode: 'no-cors' // CRÍTICO: Esto es necesario para Google Apps Script
          });

          // Al usar no-cors, la respuesta es opaca. Asumimos éxito si no hay error de red.
          setShowSuccess(true);
          setContactName('');
          setContactEmail('');
          setContactMsg('');
          
          // Opcional: Guardar en sessionStorage para evitar spam masivo, pero simple
          sessionStorage.setItem('contact_sent', 'true');

          setTimeout(() => {
              setShowSuccess(false);
              setActiveModal(null);
          }, 3000);

      } catch (error) {
          console.error("Error al enviar:", error);
          alert("Hubo un error de conexión. Por favor intenta nuevamente.");
      } finally {
          setIsSending(false);
      }
  };

  return (
    <div className="h-full flex flex-col bg-[#0F0F11] text-[#E6E1E5] relative p-4">
      <MainMenu onOpenModal={setActiveModal} />

      <div className="flex flex-col items-center mt-2 mb-4 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-black text-[#D0BCFF] tracking-tight mb-0.5">ARGENTABÚ</h1>
        <p className="text-[10px] text-[#9CA3AF] uppercase tracking-widest">El juego de palabras más argento</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 min-h-0">
        <div className="bg-[#1E1E22] border border-[#333333] rounded-[20px] p-4 flex flex-col shrink-0">
            <div className="flex items-center justify-between mb-2 shrink-0">
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-[#D0BCFF]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#E6E1E5] opacity-80">Equipos</span>
                </div>
                <div className="flex items-center gap-2 bg-[#121212] rounded-lg p-0.5">
                     <button onClick={() => setNumTeams((p: number) => Math.max(2, p - 1))} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"><Minus size={12}/></button>
                     <span className="text-sm font-bold w-4 text-center">{numTeams}</span>
                     <button onClick={() => setNumTeams((p: number) => Math.min(4, p + 1))} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"><Plus size={12}/></button>
                </div>
            </div>
            
            <div className="space-y-2 pr-1">
                {Array.from({ length: numTeams }).map((_, i) => {
                    const color = TEAM_COLORS[i] || TEAM_COLORS[0]; // Fallback for safety
                    return (
                        <div key={i} className="flex items-center gap-3 bg-[#121212] p-2.5 rounded-xl border border-[#2D2D35] focus-within:border-[#D0BCFF] transition-colors">
                            <div className={`w-2 h-6 rounded-full ${color.primary} shrink-0`}></div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={teamNames[i] || ''} // Fallback for value
                                    onChange={(e) => {
                                        const newNames = [...teamNames];
                                        newNames[i] = e.target.value;
                                        setTeamNames(newNames);
                                    }}
                                    className="bg-transparent text-sm font-bold text-white placeholder-gray-600 focus:outline-none w-full"
                                    placeholder={`Equipo ${i + 1}`}
                                    maxLength={15}
                                />
                            </div>
                            <Edit2 size={12} className="text-[#4B5563]" />
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="bg-[#1E1E22] border border-[#333333] rounded-[20px] p-4 shrink-0">
             <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-1 bg-[#D0BCFF] rounded-full"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E6E1E5] opacity-80">Configuración</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                     <Control 
                        label="Tiempo (seg)" 
                        icon={Clock} 
                        value={roundTime} 
                        onMinus={() => setRoundTime(p => Math.max(10, p - 10))}
                        onPlus={() => setRoundTime(p => p + 10)}
                    />
                </div>
                 <Control 
                    label="Rondas" 
                    icon={Hash} 
                    value={totalRounds} 
                    onMinus={() => setTotalRounds(p => Math.max(1, p - 1))}
                    onPlus={() => setTotalRounds(p => p + 1)}
                />
                <Control 
                    label="Pasos" 
                    icon={Ban} 
                    value={passLimit} 
                    onMinus={() => setPassLimit(p => Math.max(0, p - 1))}
                    onPlus={() => setPassLimit(p => p + 1)}
                />
            </div>
        </div>
      </div>

      <div className="pt-3 shrink-0 safe-area-bottom">
        <Button onClick={handleStart} className="w-full !py-4 text-lg !bg-[#D0BCFF] !text-[#381E72] shadow-[0_0_20px_rgba(208,188,255,0.3)]">
            <Play fill="currentColor" size={20} />
            JUGAR AHORA
        </Button>
      </div>

      <Modal isOpen={activeModal === 'rules'} onClose={() => setActiveModal(null)} title="Reglamento">
          <div className="space-y-4 text-sm text-[#CAC4D0]">
              <div className="bg-[#2D2D35] p-3 rounded-xl border border-[#49454F]">
                  <h4 className="font-bold text-white mb-1 flex items-center gap-2"><Trophy size={14} className="text-yellow-400"/> Objetivo</h4>
                  <p>Hacer que tu equipo adivine la <strong>Palabra Clave</strong> (la de arriba) antes de que se acabe el tiempo.</p>
              </div>
              
              <div className="bg-[#2D2D35] p-3 rounded-xl border border-[#49454F]">
                   <h4 className="font-bold text-white mb-1 flex items-center gap-2"><Ban size={14} className="text-red-400"/> Prohibido</h4>
                   <ul className="list-disc pl-4 space-y-1">
                       <li>No puedes decir ninguna de las <strong>Palabras Prohibidas</strong> listadas abajo.</li>
                       <li>No valen partes de la palabra (ej: "Mesa" para "Sobremesa").</li>
                       <li>Sin gestos, ruidos o señalar objetos.</li>
                   </ul>
              </div>

              <div className="bg-[#2D2D35] p-3 rounded-xl border border-[#49454F]">
                  <h4 className="font-bold text-white mb-1 flex items-center gap-2"><Check size={14} className="text-green-400"/> Puntuación</h4>
                  <ul className="list-disc pl-4 space-y-1">
                      <li><strong>+1 punto</strong> por cada acierto.</li>
                      <li><strong>-1 punto</strong> si dices una palabra tabú.</li>
                      <li>Puedes <strong>Pasar</strong> si te trabas (limitado por config).</li>
                  </ul>
              </div>
          </div>
      </Modal>

      <Modal isOpen={activeModal === 'contact'} onClose={() => setActiveModal(null)} title="Contacto">
          <form onSubmit={submitContactForm} className="flex flex-col gap-4">
              <p className="text-sm text-[#CAC4D0]">
                  ¿Tenés alguna sugerencia o encontraste un error? ¡Escribinos directamente!
              </p>

              <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-400">Tu Nombre</label>
                  <input 
                    required 
                    type="text" 
                    value={contactName} 
                    onChange={e => setContactName(e.target.value)} 
                    className="w-full bg-[#121212] border border-[#49454F] rounded-xl p-3 text-white focus:border-[#D0BCFF] outline-none disabled:opacity-50" 
                    placeholder="Tu nombre" 
                    disabled={isSending}
                  />
              </div>

              <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-400">Tu Email</label>
                  <input 
                    required 
                    type="email" 
                    value={contactEmail} 
                    onChange={e => setContactEmail(e.target.value)} 
                    className="w-full bg-[#121212] border border-[#49454F] rounded-xl p-3 text-white focus:border-[#D0BCFF] outline-none disabled:opacity-50" 
                    placeholder="tucorreo@ejemplo.com" 
                    disabled={isSending}
                  />
              </div>

              <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-400">Mensaje</label>
                  <textarea 
                    required 
                    value={contactMsg} 
                    onChange={e => setContactMsg(e.target.value)} 
                    className="w-full bg-[#121212] border border-[#49454F] rounded-xl p-3 text-white focus:border-[#D0BCFF] outline-none h-24 resize-none disabled:opacity-50" 
                    placeholder="Hola, quería sugerir..." 
                    disabled={isSending}
                  />
              </div>
              
              {showSuccess ? (
                  <div className="bg-[#C9F9AE] text-[#042100] p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2 animate-scale-in">
                      <Check size={20} /> ¡Mensaje Enviado!
                  </div>
              ) : (
                  <Button type="submit" variant="primary" className="!py-3" disabled={isSending}>
                      {isSending ? (
                          <> <Loader2 size={18} className="animate-spin" /> Enviando... </>
                      ) : (
                          <> <Send size={18} /> Enviar Mensaje </>
                      )}
                  </Button>
              )}
          </form>
      </Modal>

      <Modal isOpen={activeModal === 'privacy'} onClose={() => setActiveModal(null)} title="Política de Privacidad">
          <div className="space-y-4 text-xs text-[#9CA3AF]">
              <p>Última actualización: 14 de Mayo, 2024</p>
              
              <h4 className="font-bold text-white text-sm">1. Introducción</h4>
              <p>Argentabú ("nosotros") respeta su privacidad. Esta Política explica cómo manejamos la información cuando utiliza nuestra aplicación web.</p>

              <h4 className="font-bold text-white text-sm">2. Recopilación de Datos</h4>
              <p>No recopilamos datos personales identificables (como nombre, dirección o teléfono) directamente. La configuración del juego se guarda localmente en su dispositivo.</p>
              
              <h4 className="font-bold text-white text-sm">3. Publicidad y Cookies (Google AdSense)</h4>
              <p>Utilizamos proveedores externos, como Google, que usan cookies para publicar anuncios basados en sus visitas anteriores. El uso de cookies de publicidad permite a Google y a sus socios mostrar anuncios basados en su navegación.</p>
              <p>Puede optar por no recibir publicidad personalizada visitando la <a href="https://myadcenter.google.com/" target="_blank" className="text-[#D0BCFF] underline">Configuración de anuncios</a>.</p>

              <h4 className="font-bold text-white text-sm">4. Almacenamiento Local</h4>
              <p>Utilizamos "LocalStorage" del navegador únicamente para guardar su progreso y configuración de juego (nombres de equipos, puntajes).</p>

              <h4 className="font-bold text-white text-sm">5. Contacto</h4>
              <p>Si tiene preguntas sobre esta política, contáctenos a través del formulario de la aplicación.</p>
          </div>
      </Modal>
    </div>
  );
};

// --- LOGIC RE-ARCHITECTURE FOR SOTA RANDOMNESS & CARD CONSUMPTION ---

const GameScreen: React.FC<{ 
  teams: Team[], 
  settings: GameSettings, 
  currentTeamIndex: number, 
  currentRound: number,
  getNextCard: () => Card, 
  onRoundEnd: (roundScore: number) => void,
  onPause: () => void
}> = ({ 
  teams, 
  settings, 
  currentTeamIndex, 
  currentRound,
  getNextCard,
  onRoundEnd,
  onPause
}) => {
  const [timeLeft, setTimeLeft] = useState(settings.roundTime);
  const [roundScore, setRoundScore] = useState(0);
  const [passesUsed, setPassesUsed] = useState(0);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);

  const timerRef = useRef<any>(null);
  const activeTeam = teams[currentTeamIndex] || { name: "Desconocido", score: 0, colorId: 0 };
  // Safety fallback for color
  const activeColor = TEAM_COLORS[activeTeam.colorId] || TEAM_COLORS[0];
  
  // Initial Card Pull: Consumes immediately on mount
  useEffect(() => {
    const card = getNextCard();
    if (card) {
        setCurrentCard(card);
    } else {
        // Fallback for extreme errors
        setCurrentCard(ALL_CARDS[0]);
    }
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      onRoundEnd(roundScore);
    }
  }, [timeLeft]);

  const handleAction = (type: 'correct' | 'taboo' | 'pass') => {
    if (type === 'pass') {
       if (passesUsed >= settings.passLimit) return; 
       setPassesUsed(p => p + 1);
    }
    
    if (type === 'correct') setRoundScore(s => s + 1);
    if (type === 'taboo') setRoundScore(s => s - 1);
    
    // Pull next card (consumes it from global deck immediately)
    const next = getNextCard();
    if (next) setCurrentCard(next);
  };

  if (!currentCard) return <div className="p-4 text-center">Cargando baraja...</div>;

  return (
    <div className="h-full flex flex-col p-4 bg-[#0F0F11] overflow-hidden text-[#E6E1E5]">
      {/* Header */}
      <div className={`flex justify-between items-center mb-4 px-4 py-2 rounded-full ${activeColor.surface} border ${activeColor.border} shrink-0 backdrop-blur-sm`}>
        <div className="flex flex-col">
          <span className={`text-[9px] font-bold uppercase tracking-widest ${activeColor.text}`}>Turno de</span>
          <span className="text-sm font-bold text-white uppercase truncate max-w-[100px]">
            {activeTeam.name}
          </span>
        </div>

        <div className="flex flex-col items-center">
            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Ronda</span>
            <div className="bg-[#121212] px-3 py-0.5 rounded-full border border-[#333333]">
                <span className="text-xs font-bold text-white">{currentRound} / {settings.totalRounds}</span>
            </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-black tabular-nums ${timeLeft <= 10 ? 'text-[#EF4444] animate-pulse' : 'text-white'}`}>{timeLeft}</span>
            <button onClick={onPause} className="p-2 bg-[#2D2D35] hover:bg-[#363640] rounded-full text-white transition-colors">
               <Pause size={12} fill="currentColor" />
            </button>
          </div>
          <span className="text-[10px] font-bold text-gray-400 mt-0.5">Puntos: {roundScore}</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center">
        <CardView 
          card={currentCard} 
          onAction={handleAction} 
          passLimit={settings.passLimit} 
          passesUsed={passesUsed}
          teamColor={activeColor}
        />
      </div>
    </div>
  );
};

const RoundEndScreen = ({ 
  teams, 
  currentTeamIndex, 
  currentRound,
  totalRounds,
  roundScore, 
  onNextRound,
  onEndGame
}: { 
  teams: Team[], 
  currentTeamIndex: number, 
  currentRound: number,
  totalRounds: number,
  roundScore: number, 
  onNextRound: () => void,
  onEndGame: () => void
}) => {
  const activeTeam = teams[currentTeamIndex] || { name: 'Desconocido', colorId: 0, score: 0 };
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  // Logic to determine if the NEXT state is the end of the game
  const isLastRoundCurrent = currentRound === totalRounds;
  const isLastTeam = currentTeamIndex === teams.length - 1;
  const isGameOver = isLastRoundCurrent && isLastTeam;
  
  // Logic to determine if the NEXT turn is in the last round (for any team)
  // We calculate what the next round/team index will be
  const nextTeamIndex = (currentTeamIndex + 1) % teams.length;
  const isNextRoundNew = nextTeamIndex === 0;
  const nextRoundNum = isNextRoundNew ? currentRound + 1 : currentRound;
  
  const isNextTurnLastRound = nextRoundNum === totalRounds;
  const nextTeam = teams[nextTeamIndex];

  let buttonText = "SIGUIENTE EQUIPO";
  let buttonVariant = "primary";

  if (isGameOver) {
      buttonText = "VER RESULTADOS FINALES";
      buttonVariant = "success";
  } else if (isNextTurnLastRound) {
      // If the NEXT turn is the last round (for any team), show red button
      buttonText = "ÚLTIMA JUGADA";
      buttonVariant = "danger";
  }

  // Determine Score Color
  let scoreColor = "text-[#D0BCFF]";
  if (roundScore > 0) scoreColor = "text-[#B8F397]";
  if (roundScore < 0) scoreColor = "text-[#F2B8B5]";

  // Safe color access
  const activeColor = TEAM_COLORS[activeTeam.colorId] || TEAM_COLORS[0];

  return (
    <div className="p-6 h-full flex flex-col bg-[#0F0F11] text-[#E6E1E5] overflow-hidden">
      <div className="flex flex-col items-center justify-center mt-4 mb-4">
        <div className="w-12 h-12 bg-[#2D2D35] rounded-full flex items-center justify-center mb-2 border border-[#333333]">
          <Clock className="text-[#D0BCFF]" size={24} />
        </div>
        <h2 className="text-lg font-bold text-white uppercase tracking-wide">¡Tiempo cumplido!</h2>
        <p className="text-xs text-gray-400 mt-1">
          Fin del turno de <span className={`font-bold ${activeColor.text}`}>{activeTeam.name}</span>
        </p>
      </div>
      
      {/* Partial Score Card */}
      <div className="bg-[#1E1E22] rounded-[32px] p-6 text-center mb-4 shadow-xl border border-[#333333] shrink-0">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Puntos en esta ronda</span>
        <div className={`text-5xl font-black ${scoreColor} drop-shadow-md`}>
          {roundScore > 0 ? `+${roundScore}` : roundScore}
        </div>
      </div>

      {/* Scoreboard */}
      <div className="flex-1 min-h-0 bg-[#1E1E22] rounded-[24px] p-5 border border-[#333333] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tabla Parcial</h3>
            <span className="text-[10px] px-2 py-1 rounded-md font-bold bg-[#2D2D35] text-gray-400">
                Ronda {currentRound} / {totalRounds}
            </span>
        </div>
        
        <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {sortedTeams.map((t, i) => {
                const color = TEAM_COLORS[t.colorId] || TEAM_COLORS[0];
                return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#121212] border border-[#2D2D35]">
                        <div className="flex items-center gap-3">
                             <div className={`w-2 h-8 rounded-full ${color.primary}`}></div>
                             <span className="text-sm font-bold text-gray-200">{t.name}</span>
                        </div>
                        <span className="text-lg font-black text-[#D0BCFF]">{t.score}</span>
                    </div>
                )
            })}
        </div>
      </div>

      <div className="pt-4 space-y-3 shrink-0 safe-area-bottom">
        {!isGameOver && nextTeam && (
            <p className="text-xs text-center text-gray-400 mb-1">
                Viene el turno de <span className={`font-bold ${TEAM_COLORS[nextTeam.colorId]?.text || 'text-white'}`}>{nextTeam.name}</span>
            </p>
        )}
        <Button 
            onClick={isGameOver ? onEndGame : onNextRound} 
            className="w-full shadow-lg !py-4" 
            variant={buttonVariant}
        >
          {buttonText} {isGameOver ? <Trophy size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>
    </div>
  );
};

const FinalScreen = ({ teams, onRestart }: { teams: Team[], onRestart: () => void }) => {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0] || { name: 'Nadie', score: 0, colorId: 0 };
  const winnerColor = TEAM_COLORS[winner.colorId] || TEAM_COLORS[0];

  useEffect(() => {
    // Vibration effect on mount
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 400]);
    }
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0F0F11] relative text-[#E6E1E5]">
      <ConfettiCanvas colorHex={winnerColor.hex} />
      
      <div className="p-6 flex flex-col h-full z-10">
        <div className="flex flex-col items-center mt-6 mb-6 shrink-0">
            <div className="relative mb-4">
                <div className="absolute inset-0 bg-[#D0BCFF] blur-3xl opacity-20 rounded-full"></div>
                <div className="w-24 h-24 bg-[#D0BCFF] rounded-[32px] flex items-center justify-center shadow-2xl relative z-10 rotate-6 animate-bounce border-4 border-[#381E72]">
                    <Trophy className="text-[#381E72]" size={48} fill="currentColor" />
                </div>
            </div>
            <h1 className="text-3xl font-black text-white text-center tracking-tighter mb-2">¡VICTORIA!</h1>
            <div className={`px-6 py-2 rounded-full border ${winnerColor.border} ${winnerColor.surface} animate-pulse`}>
                <p className={`font-black text-xl uppercase ${winnerColor.text}`}>{winner.name}</p>
            </div>
        </div>

        <div className="flex-1 bg-[#1E1E22]/80 backdrop-blur-md rounded-[32px] p-6 border border-[#333333] overflow-y-auto mb-6 shadow-2xl">
            {sortedTeams.map((t, i) => {
                const color = TEAM_COLORS[t.colorId] || TEAM_COLORS[0];
                const isWinner = i === 0;
                return (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-2xl mb-3 ${isWinner ? 'bg-[#2D2D35] border border-[#D0BCFF]/50 shadow-lg' : 'bg-[#121212] border border-[#333333]'}`}>
                        <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${isWinner ? 'bg-[#D0BCFF] text-[#381E72]' : 'bg-[#333333] text-gray-500'}`}>
                            {i + 1}
                        </span>
                        <span className={`font-bold text-lg ${isWinner ? 'text-white' : 'text-gray-400'}`}>{t.name}</span>
                        </div>
                        <span className={`text-2xl font-black ${isWinner ? 'text-[#D0BCFF]' : 'text-gray-500'}`}>{t.score}</span>
                    </div>
                );
            })}
        </div>

        <div className="py-2 shrink-0 safe-area-bottom">
            <Button onClick={onRestart} className="w-full !py-5 shadow-xl text-lg !bg-[#D0BCFF] !text-[#381E72]">
              <RotateCcw size={20} /> JUGAR OTRA VEZ
            </Button>
        </div>
      </div>
    </div>
  );
};

// --- Main App (Deck Logic Hub) ---

const App = () => {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'roundEnd' | 'gameOver'>('setup');
  const [settings, setSettings] = useState<GameSettings>({ roundTime: 60, numTeams: 2, totalRounds: 5, passLimit: 2 });
  const [teams, setTeams] = useState<Team[]>([]);
  
  // Game State Logic
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [currentRoundNumber, setCurrentRoundNumber] = useState(1);
  const [lastRoundScore, setLastRoundScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // --- SOTA DECK MANAGEMENT ---
  const [deckOrder, setDeckOrder] = useState<number[]>([]);
  const [deckPointer, setDeckPointer] = useState<number>(0);

  useEffect(() => {
    try {
      // 1. Load deck state from localStorage safely
      const savedOrder = localStorage.getItem('argentabu_deck_order');
      const savedPointer = localStorage.getItem('argentabu_deck_pointer');

      if (savedOrder && savedPointer) {
          const parsedOrder = JSON.parse(savedOrder);
          const parsedPointer = parseInt(savedPointer, 10);
          
          // Safety Check: Ensure data integrity
          if (Array.isArray(parsedOrder) && parsedOrder.length > 0 && !isNaN(parsedPointer)) {
              // Extra safety: Check bounds
              const isValid = parsedOrder.every(idx => typeof idx === 'number' && idx >= 0 && idx < ALL_CARDS.length);
              
              if (isValid) {
                  setDeckOrder(parsedOrder);
                  setDeckPointer(parsedPointer);
                  return;
              }
          }
      }
    } catch (e) {
      console.warn("Error restoring deck state, resetting:", e);
    }
    
    // Fallback: Initial Shuffle if load fails or data is corrupt
    initNewDeck();
  }, []);

  const initNewDeck = () => {
    const indices = Array.from({ length: ALL_CARDS.length }, (_, i) => i);
    const shuffled = shuffleArray(indices);
    setDeckOrder(shuffled);
    setDeckPointer(0);
    saveDeckState(shuffled, 0);
  };

  const saveDeckState = (order: number[], pointer: number) => {
    localStorage.setItem('argentabu_deck_order', JSON.stringify(order));
    localStorage.setItem('argentabu_deck_pointer', pointer.toString());
  };

  // Crucial Function: Get next card and advance pointer immediately
  const getNextCard = (): Card => {
    let currentPtr = deckPointer;
    
    // If we reached the end of the deck (or deck is empty), reshuffle
    if (currentPtr >= deckOrder.length || deckOrder.length === 0) {
        const indices = Array.from({ length: ALL_CARDS.length }, (_, i) => i);
        const shuffled = shuffleArray(indices);
        setDeckOrder(shuffled);
        setDeckPointer(1);
        saveDeckState(shuffled, 1);
        return ALL_CARDS[shuffled[0]];
    }

    const cardIndex = deckOrder[currentPtr];
    const newPointer = currentPtr + 1;
    
    setDeckPointer(newPointer);
    saveDeckState(deckOrder, newPointer);
    
    // Safety fallback if index is out of bounds (should not happen with check above)
    return ALL_CARDS[cardIndex] || ALL_CARDS[0];
  };

  const startGame = (s: GameSettings, t: Team[]) => {
    setSettings(s);
    setTeams(t);
    setCurrentTeamIndex(0);
    setCurrentRoundNumber(1);
    setGameState('playing');
  };

  const handleRoundEnd = (roundScore: number) => {
    setLastRoundScore(roundScore);
    const updatedTeams = [...teams];
    updatedTeams[currentTeamIndex].score += roundScore;
    setTeams(updatedTeams);
    setGameState('roundEnd');
  };

  const nextRound = () => {
    const nextTeamIndex = (currentTeamIndex + 1) % teams.length;
    
    if (nextTeamIndex === 0) {
      const nextRoundNum = currentRoundNumber + 1;
      if (nextRoundNum > settings.totalRounds) {
        setGameState('gameOver');
        return;
      }
      setCurrentRoundNumber(nextRoundNum);
    }
    
    setCurrentTeamIndex(nextTeamIndex);
    setGameState('playing');
  };

  const restart = () => {
    setGameState('setup');
  };

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto relative overflow-hidden bg-[#0F0F11] flex flex-col font-sans">
      {gameState === 'setup' && <SetupScreen onStart={startGame} />}
      
      {gameState === 'playing' && !isPaused && (
        <GameScreen 
          key={`${currentRoundNumber}-${currentTeamIndex}`} // Forces complete remount to trigger getNextCard
          teams={teams} 
          settings={settings} 
          currentTeamIndex={currentTeamIndex} 
          currentRound={currentRoundNumber}
          getNextCard={getNextCard}
          onRoundEnd={handleRoundEnd}
          onPause={() => setIsPaused(true)}
        />
      )}

      {isPaused && (
        <div className="absolute inset-0 bg-[#0F0F11]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 bg-[#2D2D35] rounded-full flex items-center justify-center mb-6 border border-[#333333] shadow-2xl">
            <Pause className="text-[#D0BCFF]" size={48} />
          </div>
          <h2 className="text-4xl font-black text-white mb-8 tracking-tighter">PAUSA</h2>
          <div className="w-full space-y-4">
             <Button onClick={() => setIsPaused(false)} className="w-full !py-5 text-lg shadow-lg">Reanudar</Button>
             <Button onClick={() => { setIsPaused(false); setGameState('setup'); }} variant="secondary" className="w-full !py-4 text-lg">Salir al Menú</Button>
          </div>
        </div>
      )}

      {gameState === 'roundEnd' && (
        <RoundEndScreen 
          teams={teams} 
          currentTeamIndex={currentTeamIndex} 
          currentRound={currentRoundNumber}
          totalRounds={settings.totalRounds}
          roundScore={lastRoundScore} 
          onNextRound={nextRound}
          onEndGame={() => setGameState('gameOver')}
        />
      )}
      
      {gameState === 'gameOver' && <FinalScreen teams={teams} onRestart={restart} />}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
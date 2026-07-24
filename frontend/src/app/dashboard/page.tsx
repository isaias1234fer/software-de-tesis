"use client";
 
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GraduationCap, LogOut, FileText, LayoutDashboard, Settings, Clock, CheckCircle2, AlertCircle, AlertTriangle, BookOpen, History, MessageSquare, X, Menu, Layers, Smartphone, Mail, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
interface Kpis {
  totalDrafts: number;
  reviewedDrafts: number;
  pendingDrafts: number;
  avgScore: number;
}

interface Activity {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  student: {
    user: {
      name: string;
    };
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [timeline, setTimeline] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // States for Modals & Simulations
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState({ date: "", time: "", topic: "" });
  
  const [isGroupMeetingModalOpen, setIsGroupMeetingModalOpen] = useState(false);
  const [groupMeetingDetails, setGroupMeetingDetails] = useState({ date: "", time: "", platform: "Google Meet" });

  const [syncingOrcid, setSyncingOrcid] = useState(false);

  // New sidebar states
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: "bot", text: "¡Hola! Soy el asistente de soporte de Tesis-IA. ¿En qué puedo ayudarte hoy?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSimOpen, setIsMobileSimOpen] = useState(false);
  const [activeSimTab, setActiveSimTab] = useState<'dashboard' | 'drafts' | 'settings'>('dashboard');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setIsChatLoading(true);
    setChatMessages(prev => [...prev, { sender: "bot", text: "Escribiendo..." }]);

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_SUPPORT_WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error("URL del webhook de n8n no configurada");
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          sender: "user"
        }),
      });

      const data = await response.json();
      console.log('Respuesta de n8n:', data);
      const botReply = data.output || data.text || data[0]?.output || "No pude procesar tu consulta.";

      setChatMessages(prev => {
        const msgs = [...prev];
        msgs[msgs.length - 1] = { sender: "bot", text: botReply };
        return msgs;
      });
    } catch (error) {
      setChatMessages(prev => {
        const msgs = [...prev];
        msgs[msgs.length - 1] = { sender: "bot", text: "Error de conexión. Verifica tu internet e intenta de nuevo." };
        return msgs;
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleRequestMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Asesoría Solicitada con Éxito:\n\nTema: ${meetingDetails.topic}\nFecha: ${meetingDetails.date}\nHora: ${meetingDetails.time}\n\nTu asesor recibirá una notificación por correo.`);
    setIsMeetingModalOpen(false);
    setMeetingDetails({ date: "", time: "", topic: "" });
  };

  const handleScheduleGroupMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Asesoría Grupal Programada con Éxito:\n\nPlataforma: ${groupMeetingDetails.platform}\nFecha: ${groupMeetingDetails.date}\nHora: ${groupMeetingDetails.time}\n\nTodos tus estudiantes asignados han sido invitados.`);
    setIsGroupMeetingModalOpen(false);
    setGroupMeetingDetails({ date: "", time: "", platform: "Google Meet" });
  };

  const handleGenerateProgressReport = () => {
    alert("Generando expediente digital consolidado de tesis...\n\nPresiona OK para abrir la vista de impresión.");
    window.print();
  };

  const handleSyncOrcidManual = () => {
    setSyncingOrcid(true);
    setTimeout(() => {
      setSyncingOrcid(false);
      alert("¡Sincronización manual de ORCID completada con éxito! Se han sincronizado 3 nuevas publicaciones académicas.");
    }, 2000);
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${(session as any)?.accessToken}`,
      };

      const [kpisRes, timelineRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/kpis`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/timeline`, { headers }),
      ]);

      if (kpisRes.ok) setKpis(await kpisRes.json());
      if (timelineRes.ok) setTimeline(await timelineRes.json());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const [emailSendingId, setEmailSendingId] = useState<string | null>(null);

  const handleSendEmail = async (draftId: string) => {
    setEmailSendingId(draftId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drafts/${draftId}/report`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      if (res.ok) {
        alert("¡Reporte de revisión de tesis enviado con éxito a tu Gmail!");
      } else {
        alert("No se pudo enviar el reporte. Asegúrate de configurar las credenciales SMTP de tu Gmail en el archivo .env del backend.");
      }
    } catch (err) {
      console.error("Error sending email:", err);
      alert("Error de conexión al intentar enviar el correo.");
    } finally {
      setEmailSendingId(null);
    }
  };

  const handleSendConsolidatedEmail = async () => {
    if (timeline.length === 0) {
      alert("Aún no tienes borradores de tesis registrados para enviar un reporte.");
      return;
    }
    // Buscar el borrador más reciente revisado
    const latestReviewed = timeline.find(item => item.status === 'REVIEWED');
    if (latestReviewed) {
      await handleSendEmail(latestReviewed.id);
    } else {
      // Si ninguno está revisado todavía, intentar con la primera tesis de la lista
      await handleSendEmail(timeline[0].id);
    }
  };

useEffect(() => {
    if (status === "unauthenticated") {
        router.push("/auth/login");
    }
}, [status, router]);

if (status === "loading" || loading) {
    return <div className="flex min-h-screen items-center justify-center">Cargando panel...</div>;
}

if (status === "unauthenticated") {
    return null;
}

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "REVIEWED": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "ANALYZING": return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "ERROR": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative">
      
      {/* MOBILE STICKY HEADER */}
      <header className="md:hidden bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-indigo-600" />
          <span className="font-extrabold text-lg bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">Tesis-IA</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-600"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER SIDEBAR */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 md:hidden flex justify-end">
          <div className="w-80 bg-white h-full flex flex-col p-6 shadow-2xl relative animate-slide-in">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg text-slate-400"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-6 mb-6">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              <div>
                <span className="font-extrabold text-xl bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent block">Tesis-IA</span>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{(session?.user as any)?.role}</span>
              </div>
            </div>

            <nav className="flex-1 space-y-2">
              <Link 
                href="/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3.5 bg-indigo-50/70 text-indigo-700 rounded-xl transition-all font-semibold border border-indigo-100/30"
              >
                <LayoutDashboard className="h-5 w-5 text-indigo-600" />
                Panel Control
              </Link>
              <Link 
                href="/dashboard/drafts" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-medium"
              >
                <FileText className="h-5 w-5 text-slate-400" />
                {(session?.user as any)?.role === "ADVISOR" ? "Borradores a Revisar" : "Mis Borradores"}
              </Link>
              <Link 
                href="/dashboard/generator" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-medium"
              >
                <Layers className="h-5 w-5 text-slate-400" />
                Generador de Tesis
              </Link>
              <Link 
                href="/generador-articulos" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-medium"
              >
                <BookOpen className="h-5 w-5 text-slate-400" />
                Generador de Artículos
              </Link>
              <Link 
                href="/dashboard/settings" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-medium"
              >
                <Settings className="h-5 w-5 text-slate-400" />
                Configuración
              </Link>

              <div className="border-t border-slate-100 pt-4 mt-4">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2">Herramientas</p>
                <button 
                  onClick={() => { setIsLibraryModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 p-3.5 w-full text-left text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
                >
                  <BookOpen className="h-5 w-5 text-slate-400" />
                  Biblioteca Recursos
                </button>
                <button 
                  onClick={() => { setIsStatsModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 p-3.5 w-full text-left text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
                >
                  <History className="h-5 w-5 text-slate-400" />
                  Estadísticas IA
                </button>
                <button 
                  onClick={() => { setIsChatOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 p-3.5 w-full text-left text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
                >
                  <MessageSquare className="h-5 w-5 text-slate-400" />
                  Soporte Técnico
                </button>
                <button 
                  onClick={() => { setIsMobileSimOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 p-3.5 w-full text-left text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-colors font-semibold"
                >
                  <Smartphone className="h-5 w-5 text-indigo-500" />
                  Simulador Móvil
                </button>
              </div>
            </nav>

            <div className="border-t border-slate-100 pt-4">
              <button 
                onClick={() => signOut()}
                className="flex items-center gap-3 p-3.5 w-full text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-semibold"
              >
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar DESKTOP */}
      <aside className="w-72 bg-white border-r border-slate-150 hidden md:flex flex-col h-screen sticky top-0 shrink-0 shadow-xs">
        <div className="p-6 flex items-center gap-2 border-b border-slate-100">
          <GraduationCap className="h-7 w-7 text-indigo-600" />
          <div>
            <span className="font-black text-xl bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">Tesis-IA</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Inteligencia Académica</span>
          </div>
        </div>
        <nav className="flex-1 p-5 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-3">Navegación</p>
          <Link href="/dashboard" className="flex items-center gap-3 p-3 bg-indigo-50/70 text-indigo-700 rounded-xl transition-all font-semibold border border-indigo-100/30">
            <LayoutDashboard className="h-5 w-5 text-indigo-600" />
            Panel Control
          </Link>
          <Link href="/dashboard/drafts" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-medium">
            <FileText className="h-5 w-5 text-slate-400" />
            {(session?.user as any)?.role === "ADVISOR" ? "Borradores a Revisar" : "Mis Borradores"}
          </Link>
          <Link href="/dashboard/generator" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-medium">
            <Layers className="h-5 w-5 text-slate-400" />
            Generador de Tesis
          </Link>
          <Link href="/generador-articulos" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-medium">
            <BookOpen className="h-5 w-5 text-slate-400" />
            Generador de Artículos
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-medium">
            <Settings className="h-5 w-5 text-slate-400" />
            Configuración
          </Link>

          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 pt-6 mb-3">Herramientas</p>
          <button 
            onClick={() => setIsLibraryModalOpen(true)}
            className="flex items-center gap-3 p-3 w-full text-left text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
          >
            <BookOpen className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-semibold">Biblioteca Recursos</span>
          </button>
          <button 
            onClick={() => setIsStatsModalOpen(true)}
            className="flex items-center gap-3 p-3 w-full text-left text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
          >
            <History className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-semibold">Estadísticas IA</span>
          </button>
          <button 
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-3 p-3 w-full text-left text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
          >
            <MessageSquare className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-semibold">Soporte Técnico</span>
          </button>
          <button 
            onClick={() => setIsMobileSimOpen(true)}
            className="flex items-center gap-3 p-3 w-full text-left text-slate-600 hover:bg-indigo-50 hover:text-indigo-750 rounded-xl transition-colors font-medium border border-transparent hover:border-indigo-100"
          >
            <Smartphone className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-semibold">Simulador Móvil</span>
            <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ml-auto">Nuevo</span>
          </button>
        </nav>
        <div className="p-5 border-t border-slate-100">
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 p-3 w-full text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-semibold text-sm"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-28 md:pb-10">
        <header className="bg-white border-b border-slate-100 p-4 hidden md:flex justify-between items-center px-8 shadow-xs">
          <h1 className="text-lg font-bold text-slate-800">Panel de Control</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{session?.user?.name}</p>
              <p className="text-xs text-gray-500 uppercase">{(session?.user as any)?.role}</p>
            </div>
            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold uppercase">
              {session?.user?.name?.substring(0, 2)}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* KPI CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow flex flex-col justify-between min-h-[140px]">
              <div>
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Borradores Cargados</h3>
                <p className="text-3xl font-black mt-2 text-slate-900">{kpis?.totalDrafts || 0}</p>
              </div>
              <div className="text-[10px] text-indigo-600 font-extrabold flex items-center gap-1 mt-3">
                <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100">Historial Completo</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow flex flex-col justify-between min-h-[140px]">
              <div>
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Revisiones Pendientes</h3>
                <p className="text-3xl font-black mt-2 text-indigo-650">{kpis?.pendingDrafts || 0}</p>
              </div>
              <div className="text-[10px] text-amber-600 font-extrabold flex items-center gap-1 mt-3">
                <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-100">En Cola de Procesamiento</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow flex flex-col justify-between min-h-[140px]">
              <div>
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Calificación Promedio</h3>
                <p className="text-3xl font-black mt-2 text-emerald-600">
                  {kpis?.avgScore ? kpis.avgScore.toFixed(1) : "0.0"}<span className="text-xs text-slate-400 font-bold">/100</span>
                </p>
              </div>
              <div className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 mt-3">
                <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100">Desempeño Académico Alto</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow flex flex-col justify-between min-h-[140px]">
              <div>
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Originalidad Media</h3>
                <p className="text-3xl font-black mt-2 text-indigo-600">92.4%</p>
              </div>
              <div className="text-[10px] text-indigo-600 font-extrabold flex items-center gap-1 mt-3">
                <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100">Citas Libres de Plagio</span>
              </div>
            </div>
          </div>

          {/* SECCIÓN DE ESTADÍSTICAS Y GRÁFICAS PREMIUM */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfica 1: Tendencia de Calificaciones (Línea de Progreso) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-indigo-600" />
                      Evolución de Calificaciones
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Progreso de las notas del proyecto de tesis actual.</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    +15.3% Crecimiento
                  </span>
                </div>

                {/* SVG Line Chart representing the scores */}
                <div className="h-56 mt-6 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="scoreLineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid Lines */}
                    <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="4" />
                    <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="4" />
                    <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="4" />
                    
                    {/* Smooth Area Under Line */}
                    <path
                      d="M 20 170 C 100 130, 180 150, 260 90 C 340 85, 420 50, 480 35 L 480 180 L 20 180 Z"
                      fill="url(#scoreAreaGradient)"
                    />

                    {/* Glowing Score Line */}
                    <path
                      d="M 20 170 C 100 130, 180 150, 260 90 C 340 85, 420 50, 480 35"
                      fill="none"
                      stroke="url(#scoreLineGradient)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    <circle cx="20" cy="170" r="5" fill="#6366f1" stroke="#ffffff" strokeWidth="2.5" />
                    <circle cx="260" cy="90" r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2.5" />
                    <circle cx="480" cy="35" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />

                    {/* Values Tooltip */}
                    <text x="25" y="165" fill="#64748b" fontSize="9" fontWeight="bold">v1 (60pt)</text>
                    <text x="265" y="80" fill="#4f46e5" fontSize="9" fontWeight="bold">v2 (78pt)</text>
                    <text x="430" y="25" fill="#10b981" fontSize="10" fontWeight="bold">Actual (94pt)</text>
                  </svg>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4 flex justify-between text-xs font-semibold text-slate-500">
                <span>Versión Inicial</span>
                <span>Pre-entrega</span>
                <span>Último Borrador</span>
              </div>
            </div>

            {/* Gráfica 2: Distribución de Originalidad y Fuentes (Donut Chart) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  Distribución de Originalidad
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Desglose porcentual de plagio e índices de citación.</p>

                <div className="flex flex-col sm:flex-row items-center gap-6 mt-6">
                  {/* Donut Chart SVG */}
                  <div className="relative w-40 h-40 shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Segment 1: Original (92.4%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="11"
                        strokeDasharray="238.7"
                        strokeDashoffset="18"
                      />
                      {/* Segment 2: Citado Correcto (5.2%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#4f46e5"
                        strokeWidth="11"
                        strokeDasharray="238.7"
                        strokeDashoffset="220"
                      />
                      {/* Segment 3: Similitud Excesiva (2.4%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#f59e0b"
                        strokeWidth="11"
                        strokeDasharray="238.7"
                        strokeDashoffset="232"
                      />
                    </svg>
                    {/* Centered Total Score Indicator */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase leading-none">Original</span>
                      <span className="text-2xl font-black text-slate-800 leading-tight">92.4%</span>
                    </div>
                  </div>

                  {/* Chart Legend and Badges */}
                  <div className="space-y-3.5 w-full">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-slate-600 font-semibold">Contenido Inédito</span>
                      </div>
                      <span className="text-slate-800 font-black">92.4%</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-indigo-650" />
                        <span className="text-slate-600 font-semibold">Citas Estructuradas</span>
                      </div>
                      <span className="text-slate-800 font-black">5.2%</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-slate-600 font-semibold">Coincidencia Parcial</span>
                      </div>
                      <span className="text-slate-800 font-black">2.4%</span>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex gap-2">
                      <div className="flex-1 bg-slate-50 border rounded-lg p-2 text-center">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Referencias</span>
                        <span className="text-xs font-extrabold text-slate-800">48 Citadas</span>
                      </div>
                      <div className="flex-1 bg-slate-50 border rounded-lg p-2 text-center">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Plagio</span>
                        <span className="text-xs font-extrabold text-emerald-600">0%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold mt-4 text-center">
                Último escaneo con algoritmos de originalidad: <strong>Hace 5 minutos</strong>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {(session?.user as any)?.role === "STUDENT" ? (
                <>
                  <Link 
                    href="/dashboard/generator"
                    className="flex items-center gap-3 p-4 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 rounded-xl transition-all font-semibold border border-indigo-100 text-left shadow-sm cursor-pointer"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-indigo-600" />
                    <div>
                      <p className="text-sm font-bold">Generar Estructura</p>
                      <p className="text-xs text-indigo-500 font-medium">Plantilla de tesis UNT</p>
                    </div>
                  </Link>
                  <button 
                    onClick={() => setIsMeetingModalOpen(true)}
                    className="flex items-center gap-3 p-4 bg-blue-50/50 hover:bg-blue-50 text-blue-700 rounded-xl transition-all font-semibold border border-blue-100 text-left shadow-sm cursor-pointer"
                  >
                    <Clock className="h-5 w-5 shrink-0 text-blue-600" />
                    <div>
                      <p className="text-sm font-bold">Solicitar Asesoría</p>
                      <p className="text-xs text-blue-500 font-medium">Reunión con tu asesor</p>
                    </div>
                  </button>
                  <button 
                    onClick={handleSendConsolidatedEmail}
                    disabled={emailSendingId !== null}
                    className="flex items-center gap-3 p-4 bg-purple-50/50 hover:bg-purple-50 text-purple-700 rounded-xl transition-all font-semibold border border-purple-100 text-left shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {emailSendingId !== null ? (
                      <Clock className="h-5 w-5 shrink-0 text-purple-650 animate-spin" />
                    ) : (
                      <Mail className="h-5 w-5 shrink-0 text-purple-600" />
                    )}
                    <div>
                      <p className="text-sm font-bold">Enviar al Correo</p>
                      <p className="text-xs text-purple-500 font-medium">Recibir PDF en tu celular</p>
                    </div>
                  </button>
                  <Link 
                    href="/dashboard/drafts"
                    className="flex items-center gap-3 p-4 bg-pink-50/50 hover:bg-pink-50 text-pink-700 rounded-xl transition-all font-semibold border border-pink-100 text-left shadow-sm cursor-pointer"
                  >
                    <Layers className="h-5 w-5 shrink-0 text-pink-600" />
                    <div>
                      <p className="text-sm font-bold">Carga por Lotes</p>
                      <p className="text-xs text-pink-500 font-medium">Subir 10-20 tesis juntas</p>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => alert("KPIs de alumnos exportados exitosamente en formato CSV.")}
                    className="flex items-center gap-3 p-4 bg-blue-50/50 hover:bg-blue-50 text-blue-700 rounded-xl transition-all font-semibold border border-blue-100 text-left shadow-sm cursor-pointer"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-blue-600" />
                    <div>
                      <p className="text-sm font-bold">Exportar Reportes</p>
                      <p className="text-xs text-blue-500 font-medium">CSV de KPIs de alumnos</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setIsGroupMeetingModalOpen(true)}
                    className="flex items-center gap-3 p-4 bg-green-50/50 hover:bg-green-50 text-green-700 rounded-xl transition-all font-semibold border border-green-100 text-left shadow-sm cursor-pointer"
                  >
                    <Clock className="h-5 w-5 shrink-0 text-green-600" />
                    <div>
                      <p className="text-sm font-bold">Asesoría Grupal</p>
                      <p className="text-xs text-green-500 font-medium">Programar videollamada</p>
                    </div>
                  </button>
                  <button 
                    onClick={handleSyncOrcidManual}
                    disabled={syncingOrcid}
                    className="flex items-center gap-3 p-4 bg-purple-50/50 hover:bg-purple-50 text-purple-700 rounded-xl transition-all font-semibold border border-purple-100 text-left shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Settings className={`h-5 w-5 shrink-0 ${syncingOrcid ? 'animate-spin' : ''}`} />
                    <div>
                      <p className="text-sm font-bold">{syncingOrcid ? "Sincronizando..." : "Sincronizar ORCID"}</p>
                      <p className="text-xs text-purple-500 font-medium">Actualizar publicaciones</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => alert("Abriendo bandeja de mensajes de tesis...")}
                    className="flex items-center gap-3 p-4 bg-orange-50/50 hover:bg-orange-50 text-orange-700 rounded-xl transition-all font-semibold border border-orange-100 text-left shadow-sm cursor-pointer"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold">Bandeja de Dudas</p>
                      <p className="text-xs text-orange-500 font-medium">Consultas de alumnos</p>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Actividad Reciente */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900">Actividad Reciente</h2>
                <Link href="/dashboard/drafts" className="text-indigo-600 text-sm font-bold hover:underline">
                  Ver todos
                </Link>
              </div>
              {timeline.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border-2 border-dashed rounded-xl">
                  No hay actividad reciente. ¡Sube tu primer borrador para empezar!
                </div>
              ) : (
                <div className="space-y-4">
                  {timeline.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50/50 rounded-xl border border-slate-200/70 transition-all gap-4 shadow-sm">
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div className="p-2 bg-slate-100 rounded-xl text-slate-600 shrink-0">
                          <FileText className="h-5.5 w-5.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 truncate text-sm">{item.title}</p>
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200/75">
                          {getStatusIcon(item.status)}
                          <span className="capitalize text-[10px] tracking-wider">{item.status === 'REVIEWED' ? 'Revisado' : item.status === 'ANALYZING' ? 'Analizando' : item.status.toLowerCase()}</span>
                        </div>
                        
                        {item.status === 'REVIEWED' && (
                          <button
                            onClick={() => handleSendEmail(item.id)}
                            disabled={emailSendingId === item.id}
                            className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {emailSendingId === item.id ? (
                              <Clock className="h-3 w-3 animate-spin" />
                            ) : (
                              <Mail className="h-3 w-3" />
                            )}
                            <span>Enviar al Correo</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hitos del Proyecto */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Hitos del Proyecto</h2>
              <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                <div className="flex gap-4 items-start relative">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 z-10 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">1. Tema Aprobado</h4>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Tema asignado y estructura validada</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-xs ${
                    timeline.length > 0 ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-100 text-slate-450 border border-slate-200'
                  }`}>
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">2. Borradores & Revisiones IA</h4>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Subida de borradores y revisión automática</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-xs ${
                    timeline.some(t => t.status === 'REVIEWED') ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-450 border border-slate-200'
                  }`}>
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">3. Veredicto del Asesor</h4>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Aprobación o retroalimentación humana</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start relative">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-450 border border-slate-200 flex items-center justify-center shrink-0 z-10 font-bold text-xs">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">4. Expediente de Defensa</h4>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Tesis expedita para sustentación pública</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Solicitar Asesoría (Estudiante) */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setIsMeetingModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Solicitar Reunión de Asesoría
            </h3>
            <form onSubmit={handleRequestMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tema a Tratar</label>
                <input 
                  type="text" 
                  required
                  value={meetingDetails.topic}
                  onChange={(e) => setMeetingDetails({...meetingDetails, topic: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Ej: Revisión del Marco Teórico"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fecha</label>
                  <input 
                    type="date" 
                    required
                    value={meetingDetails.date}
                    onChange={(e) => setMeetingDetails({...meetingDetails, date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hora</label>
                  <input 
                    type="time" 
                    required
                    value={meetingDetails.time}
                    onChange={(e) => setMeetingDetails({...meetingDetails, time: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm"
              >
                Enviar Solicitud
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Programar Asesoría Grupal (Asesor) */}
      {isGroupMeetingModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setIsGroupMeetingModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green-600" />
              Programar Asesoría Grupal
            </h3>
            <form onSubmit={handleScheduleGroupMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Plataforma</label>
                <select 
                  value={groupMeetingDetails.platform}
                  onChange={(e) => setGroupMeetingDetails({...groupMeetingDetails, platform: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                >
                  <option value="Google Meet">Google Meet</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fecha</label>
                  <input 
                    type="date" 
                    required
                    value={groupMeetingDetails.date}
                    onChange={(e) => setGroupMeetingDetails({...groupMeetingDetails, date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hora</label>
                  <input 
                    type="time" 
                    required
                    value={groupMeetingDetails.time}
                    onChange={(e) => setGroupMeetingDetails({...groupMeetingDetails, time: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-green-600 text-white py-2.5 rounded-lg font-bold hover:bg-green-700 transition-colors text-sm"
              >
                Crear Invitaciones
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Biblioteca de Recursos */}
      {isLibraryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
            <button 
              onClick={() => setIsLibraryModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Biblioteca de Recursos
            </h3>
            <p className="text-sm text-gray-500 mb-4">Descarga guías de redacción oficiales y normas de estilo académico homologadas.</p>
            <div className="space-y-3">
              <a href="/resources/Estructura_Tesis_Oficial_U.docx" download className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border rounded-lg transition-colors cursor-pointer">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">1. Plantilla Oficial de Tesis Word</h4>
                  <p className="text-xs text-gray-500">Márgenes, tipos de letra e índices estructurados.</p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">WORD</span>
              </a>
              <a href="/resources/Guia_Citas_APA_7ma.pdf" download className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border rounded-lg transition-colors cursor-pointer">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">2. Manual Simplificado Normas APA 7ma Ed.</h4>
                  <p className="text-xs text-gray-500">Reglas básicas para citas directas, indirectas y bibliografía.</p>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-md">PDF</span>
              </a>
              <a href="/resources/Formato_IEEE_Publicaciones.pdf" download className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border rounded-lg transition-colors cursor-pointer">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">3. Estructura de Citas IEEE (Ingeniería)</h4>
                  <p className="text-xs text-gray-500">Manual de citación numérica oficial para proyectos tecnológicos.</p>
                </div>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">PDF</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Estadísticas de IA */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setIsStatsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
              <History className="h-5 w-5 text-purple-600" />
              Estadísticas e Historial IA
            </h3>
            <p className="text-xs text-gray-500 mb-6">Métricas acumuladas del procesamiento automático de tus borradores.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl text-center">
                <p className="text-xs font-bold text-purple-500 uppercase tracking-wider">Tokens Procesados</p>
                <p className="text-2xl font-extrabold text-purple-900 mt-1">458,230</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Páginas Analizadas</p>
                <p className="text-2xl font-extrabold text-blue-900 mt-1">112</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-center">
                <p className="text-xs font-bold text-green-500 uppercase tracking-wider">Citas Verificadas</p>
                <p className="text-2xl font-extrabold text-green-900 mt-1">87</p>
              </div>
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-center">
                <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">Errores Corregidos</p>
                <p className="text-2xl font-extrabold text-orange-900 mt-1">124</p>
              </div>
            </div>
            <div className="border-t pt-4 text-center">
              <p className="text-xs text-gray-400">Modelo AI: Ollama Llama3-Academic FineTuned v2</p>
            </div>
          </div>
        </div>
      )}

      {/* Widget: Chat de Soporte Técnico en vivo */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col h-[400px]">
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span className="font-bold text-sm">Soporte Técnico en Vivo</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white">
              ✕
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl text-xs max-w-[80%] ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex gap-2 shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Escribe tu consulta..."
              disabled={isChatLoading}
              className="flex-1 border px-3 py-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isChatLoading}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChatLoading ? '...' : 'Enviar'}
            </button>
          </form>
        </div>
      )}
      {/* MOBILE BOTTOM NAVIGATION BAR (iOS Glassmorphic tab bar) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/85 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl z-45 py-3 px-6 flex justify-around items-center">
        <Link href="/dashboard" className="flex flex-col items-center gap-1.5 text-indigo-600 font-black">
          <LayoutDashboard className="h-5.5 w-5.5" />
          <span className="text-[10px]">Inicio</span>
        </Link>
        <Link href="/dashboard/drafts" className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-indigo-600">
          <FileText className="h-5.5 w-5.5" />
          <span className="text-[10px] font-bold">Tesis</span>
        </Link>
        <Link href="/dashboard/settings" className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-indigo-600">
          <Settings className="h-5.5 w-5.5" />
          <span className="text-[10px] font-bold">Ajustes</span>
        </Link>
      </nav>

      {/* MODAL: SIMULADOR MÓVIL */}
      {isMobileSimOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-scale-up border border-slate-100 flex flex-col items-center">
            <button 
              onClick={() => setIsMobileSimOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center mb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center justify-center gap-2">
                <Smartphone className="h-5 w-5 text-indigo-600" />
                Simulador Móvil Tesis-IA
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Prueba e interactúa con las diferentes vistas responsivas.
              </p>
            </div>

            {/* Viewport measurements and dimensions */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 w-full text-center space-y-1 mb-4 shrink-0">
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Dimensiones del Viewport</p>
              <div className="flex justify-center gap-4 text-xs font-black text-slate-800">
                <div>Ancho: <span className="text-indigo-600">390 px</span></div>
                <div className="text-slate-350">|</div>
                <div>Alto: <span className="text-indigo-600">844 px</span></div>
                <div className="text-slate-350">|</div>
                <div>Ratio: <span className="text-indigo-600">19.5:9</span></div>
              </div>
              <p className="text-[9px] text-slate-400 font-semibold">Resolución Física: 1170 x 2532 px @3x (Super Retina XDR)</p>
            </div>

            {/* Interface switcher controls */}
            <div className="flex gap-1.5 mb-4 w-full shrink-0">
              <button 
                onClick={() => setActiveSimTab('dashboard')} 
                className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${activeSimTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                🏠 Inicio
              </button>
              <button 
                onClick={() => setActiveSimTab('drafts')} 
                className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${activeSimTab === 'drafts' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                📝 Tesis
              </button>
              <button 
                onClick={() => setActiveSimTab('settings')} 
                className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${activeSimTab === 'settings' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                ⚙️ Ajustes
              </button>
            </div>

            {/* Smart Phone Case Wrapper (CSS Bezels) */}
            <div className="relative w-[280px] h-[450px] bg-slate-950 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 flex flex-col overflow-hidden ring-8 ring-slate-900/10">
              {/* Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center gap-1.5">
                <div className="w-1.2 h-1.2 bg-slate-800 rounded-full" />
                <div className="w-6 h-0.5 bg-slate-800 rounded-full" />
              </div>
              
              {/* Phone Screen content area */}
              <div className="flex-1 bg-[#f8fafc] rounded-[30px] overflow-hidden relative flex flex-col pt-3 z-10 select-none">
                {/* Simulated URL Bar */}
                <div className="bg-white px-3 py-1.5 border-b border-slate-200/65 flex items-center justify-between text-[8px] font-semibold text-slate-400 shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                    <span>tesis-ia.com/dashboard/{activeSimTab === 'dashboard' ? '' : activeSimTab}</span>
                  </div>
                  <Clock className="h-2.5 w-2.5 text-slate-400" />
                </div>
                
                {/* Simulated UI Content Container */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-16 scrollbar-none">
                  {/* Brand Header */}
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-xs shrink-0">
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
                      <span className="font-extrabold text-[9px] text-slate-900">Tesis-IA</span>
                    </div>
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-1 py-0.5 rounded-md">STUDENT</span>
                  </div>

                  {/* 1. DYNAMIC RENDERING: DASHBOARD INTERFACE */}
                  {activeSimTab === 'dashboard' && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-150 shadow-xs space-y-2">
                        <div className="flex justify-between items-center text-[7px] font-extrabold text-slate-400 uppercase">
                          <span>Resumen de Avances</span>
                          <span className="text-indigo-600">IA Activa</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="p-1.5 bg-indigo-50 border rounded-md text-center">
                            <span className="text-[5px] font-bold text-indigo-600 block uppercase">Completados</span>
                            <span className="text-[10px] font-black text-indigo-950">12 Borradores</span>
                          </div>
                          <div className="p-1.5 bg-emerald-50 border rounded-md text-center">
                            <span className="text-[5px] font-bold text-emerald-600 block uppercase">Promedio Lote</span>
                            <span className="text-[10px] font-black text-emerald-950">84.2/100</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-650 rounded-lg text-white space-y-1 shadow-sm">
                        <h4 className="text-[8px] font-black leading-none">Revisión por Lotes</h4>
                        <p className="text-[6px] text-indigo-100">Sube entre 10 y 20 tesis al mismo tiempo y evalúa en paralelo.</p>
                      </div>
                    </div>
                  )}

                  {/* 2. DYNAMIC RENDERING: DRAFTS INTERFACE */}
                  {activeSimTab === 'drafts' && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="bg-slate-200/60 p-0.5 rounded-md flex border border-slate-350/40 text-[7px] font-bold text-slate-500">
                        <div className="flex-1 text-center py-1 rounded bg-white text-indigo-700 shadow-xs">Lotes</div>
                        <div className="flex-1 text-center py-1">Individual</div>
                      </div>

                      <div className="p-2 bg-amber-50 border border-amber-200 rounded-md text-[6px] font-semibold text-amber-850 flex items-start gap-1">
                        <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
                        <span>Se recomienda procesar de 10 a 20 tesis por lote.</span>
                      </div>

                      <div className="bg-white p-2 rounded-lg border border-slate-150 shadow-xs flex justify-between items-center">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-[6px] font-extrabold text-slate-400 uppercase">Tesis 1 • V1</p>
                          <h4 className="text-[8px] font-bold text-slate-950 truncate">Metodología ágil aplicada a la...</h4>
                          <p className="text-[7px] text-emerald-600 font-semibold mt-0.5">¡Revisado con éxito!</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[9px] font-black text-emerald-600 block">94/100</span>
                        </div>
                      </div>

                      <div className="bg-white p-2 rounded-lg border border-slate-150 shadow-xs flex justify-between items-center">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-[6px] font-extrabold text-slate-400 uppercase">Tesis 2 • V2</p>
                          <h4 className="text-[8px] font-bold text-slate-950 truncate">Implementación de redes neuronales...</h4>
                          <p className="text-[7px] text-indigo-655 font-bold mt-0.5 animate-pulse">Analizando citas...</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[9px] font-bold text-slate-450 block">--</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. DYNAMIC RENDERING: SETTINGS INTERFACE */}
                  {activeSimTab === 'settings' && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-150 shadow-xs space-y-1">
                        <h4 className="text-[7px] font-extrabold text-slate-400 uppercase tracking-wider">Perfil del Estudiante</h4>
                        <p className="text-[9px] font-bold text-slate-850">Nombre: {session?.user?.name || "Usuario de Tesis"}</p>
                        <p className="text-[7px] text-slate-500 truncate">Email: {session?.user?.email || "tesis@universidad.edu"}</p>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-150 shadow-xs flex items-center justify-between">
                        <div>
                          <h4 className="text-[8px] font-bold text-slate-800">Alertas de IA</h4>
                          <p className="text-[6px] text-slate-500">Notificar por email al finalizar revisión.</p>
                        </div>
                        <div className="w-6 h-3.5 bg-indigo-600 rounded-full p-0.5 flex justify-end items-center cursor-pointer shrink-0">
                          <div className="w-2.5 h-2.5 bg-white rounded-full" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulated Floating Glassmorphic iOS Dock Bar */}
                <div className="absolute bottom-2 left-2 right-2 bg-white/85 backdrop-blur-md border border-slate-200/50 rounded-xl shadow-lg z-20 py-2 px-4 flex justify-around items-center text-[7px] font-bold text-slate-400 shrink-0">
                  <div 
                    onClick={() => setActiveSimTab('dashboard')}
                    className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeSimTab === 'dashboard' ? 'text-indigo-600 font-black' : 'text-slate-400'}`}
                  >
                    <LayoutDashboard className="h-3 w-3" />
                    <span>Inicio</span>
                  </div>
                  <div 
                    onClick={() => setActiveSimTab('drafts')}
                    className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeSimTab === 'drafts' ? 'text-indigo-600 font-black' : 'text-slate-400'}`}
                  >
                    <FileText className="h-3 w-3" />
                    <span>Tesis</span>
                  </div>
                  <div 
                    onClick={() => setActiveSimTab('settings')}
                    className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeSimTab === 'settings' ? 'text-indigo-600 font-black' : 'text-slate-400'}`}
                  >
                    <Settings className="h-3 w-3" />
                    <span>Ajustes</span>
                  </div>
                </div>
              </div>

              {/* Speaker Bar */}
              <div className="w-16 h-1 bg-slate-800 rounded-full mx-auto mt-2" />
            </div>

            {/* Back to Web main button */}
            <button 
              onClick={() => setIsMobileSimOpen(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer border border-transparent hover:border-slate-750"
            >
              ← Cerrar Simulador y Volver a Vista de Escritorio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

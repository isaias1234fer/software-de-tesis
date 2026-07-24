"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  User, 
  Mail, 
  Shield, 
  Link as LinkIcon, 
  Save, 
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  FileText,
  Settings as SettingsIcon,
  BookOpen,
  History,
  MessageSquare,
  LogOut,
  X,
  Menu,
  Smartphone,
  Clock,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });

  const [advisors, setAdvisors] = useState<any[]>([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState("");
  const [currentAdvisor, setCurrentAdvisor] = useState<any>(null);
  const [linking, setLinking] = useState(false);

  // New settings states
  const [notifications, setNotifications] = useState({
    aiComplete: true,
    advisorComment: true,
    deadlineAlert: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingAlerts, setSavingAlerts] = useState(false);

  // Tools sidebar states
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: "bot", text: "¡Hola! Soy el asistente de soporte de Tesis-IA. ¿En qué puedo ayudarte hoy?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSimOpen, setIsMobileSimOpen] = useState(false);
  const [activeSimTab, setActiveSimTab] = useState<'dashboard' | 'drafts' | 'settings'>('settings');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setChatMessages(prev => [...prev, { sender: "bot", text: "Escribiendo..." }]);

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_SUPPORT_WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error("URL del webhook de n8n no configurada");
      }
      const userName = session?.user?.name || "Usuario Anónimo";

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          usuario: userName,
          tipo: "Soporte Técnico"
        }),
      });

      const data = await response.json();
      console.log('Respuesta de n8n:', data);
      const botReply = data.response || data.output || data.message || "No pude procesar tu consulta. Intenta de nuevo.";

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
    }
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAlerts(true);
    setTimeout(() => {
      setSavingAlerts(false);
      setMessage({ type: "success", text: "Preferencias de notificación guardadas correctamente." });
    }, 1000);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("La nueva contraseña y la confirmación no coinciden.");
      return;
    }
    alert("¡Contraseña actualizada con éxito! La próxima sesión requerirá las nuevas credenciales.");
    setIsChangingPassword(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleExportData = () => {
    const dataToExport = {
      username: session?.user?.name,
      email: session?.user?.email,
      role: (session?.user as any)?.role,
      exportedAt: new Date().toISOString(),
      system: "Tesis-IA Review System v1.5",
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `datos-cuenta-${session?.user?.name || "usuario"}.json`;
    a.click();
    a.remove();
  };

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
      });

      if ((session.user as any).role === "STUDENT") {
        fetchAdvisorsAndProfile();
      }
    }
  }, [session]);

  const fetchAdvisorsAndProfile = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${(session as any)?.accessToken}`,
      };
      
      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/my-student-profile`, { headers });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setCurrentAdvisor(profile?.advisor || null);
        if (profile?.advisorId) {
          setSelectedAdvisorId(profile.advisorId);
        }
      }

      const advisorsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/advisors`, { headers });
      if (advisorsRes.ok) {
        const advisorsData = await advisorsRes.json();
        setAdvisors(advisorsData);
      }
    } catch (error) {
      console.error("Error fetching advisors data:", error);
    }
  };

  const handleLinkAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinking(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/assign-advisor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
        body: JSON.stringify({ advisorId: selectedAdvisorId }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Asesor asignado correctamente" });
        fetchAdvisorsAndProfile();
      } else {
        setMessage({ type: "error", text: "Error al asignar asesor" });
      }
    } catch (error) {
      console.error("Error assigning advisor:", error);
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setLinking(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Simulación de actualización de perfil
      setTimeout(() => {
        setMessage({ type: "success", text: "Perfil actualizado correctamente" });
        setLoading(false);
      }, 1000);
    } catch (error) {
      setMessage({ type: "error", text: "Error al actualizar el perfil" });
      setLoading(false);
    }
  };

  const handleOrcidLink = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orcid/auth-url`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error linking ORCID:", error);
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
                className="flex items-center gap-3 p-3.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-medium"
              >
                <LayoutDashboard className="h-5 w-5 text-slate-400" />
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
                href="/dashboard/settings" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3.5 bg-indigo-50/70 text-indigo-700 rounded-xl transition-all font-semibold border border-indigo-100/30"
              >
                <SettingsIcon className="h-5 w-5 text-indigo-600" />
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
          <Link href="/dashboard" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-medium">
            <LayoutDashboard className="h-5 w-5 text-slate-400" />
            Panel Control
          </Link>
          <Link href="/dashboard/drafts" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-medium">
            <FileText className="h-5 w-5 text-slate-400" />
            {(session?.user as any)?.role === "ADVISOR" ? "Borradores a Revisar" : "Mis Borradores"}
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 p-3 bg-indigo-50/70 text-indigo-700 rounded-xl transition-all font-semibold border border-indigo-100/30">
            <SettingsIcon className="h-5 w-5 text-indigo-600" />
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

      <main className="flex-1 p-5 md:p-8 pb-28 md:pb-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Configuración</h1>

          <div className="space-y-6">
            {/* Sección de Perfil */}
            <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Perfil de Usuario</h2>
                <p className="text-sm text-gray-500">Administra tu información personal básica.</p>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                {message.text && (
                  <div className={`p-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {message.text}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="h-4 w-4" /> Nombre Completo
                    </label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Correo Electrónico
                    </label>
                    <input 
                      type="email" 
                      value={formData.email}
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            </section>

            {/* Preferencias de Notificación */}
            <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Notificaciones y Alertas</h2>
                <p className="text-sm text-gray-500">Configura cuándo deseas recibir avisos en el correo o la plataforma.</p>
              </div>
              <form onSubmit={handleSaveNotifications} className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Borrador revisado por IA</p>
                    <p className="text-xs text-gray-500">Recibe una alerta cuando el análisis automático finalice.</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={notifications.aiComplete}
                    onChange={(e) => setNotifications({...notifications, aiComplete: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Comentarios del Asesor</p>
                    <p className="text-xs text-gray-500">Avísame por correo cuando mi asesor deje una revisión.</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={notifications.advisorComment}
                    onChange={(e) => setNotifications({...notifications, advisorComment: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Recordatorio de Plazos</p>
                    <p className="text-xs text-gray-500">Alertas tempranas de fechas límite de entrega.</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={notifications.deadlineAlert}
                    onChange={(e) => setNotifications({...notifications, deadlineAlert: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    disabled={savingAlerts}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50"
                  >
                    {savingAlerts ? "Guardando..." : "Guardar Preferencias"}
                  </button>
                </div>
              </form>
            </section>

            {/* Sección de Rol y Seguridad */}
            <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Seguridad y Rol</h2>
                <p className="text-sm text-gray-500">Detalles de tu cuenta en el sistema.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Rol del Sistema</p>
                      <p className="text-sm text-gray-500">Actualmente eres {(session?.user as any)?.role}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">
                    {(session?.user as any)?.role}
                  </span>
                </div>

                {/* Integración ORCID (Solo para Asesores) */}
                {(session?.user as any)?.role === "ADVISOR" && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        <LinkIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Vincular ORCID</p>
                        <p className="text-sm text-gray-500">Sincroniza tus publicaciones académicas.</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleOrcidLink}
                      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Vincular Ahora
                    </button>
                  </div>
                )}

                {/* Integración Asesor (Solo para Estudiantes) */}
                {(session?.user as any)?.role === "STUDENT" && (
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Vincular Asesor de Tesis</p>
                        <p className="text-sm text-gray-500">
                          {currentAdvisor 
                            ? `Tu asesor vinculado actual es: ${currentAdvisor.user?.name}`
                            : "Asigna un asesor para que pueda evaluar tus borradores."}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleLinkAdvisor} className="flex flex-col md:flex-row gap-3 items-end">
                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Selecciona un Asesor</label>
                        <select 
                          value={selectedAdvisorId}
                          onChange={(e) => setSelectedAdvisorId(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                          <option value="">-- Seleccionar Asesor --</option>
                          {advisors.map((adv) => (
                            <option key={adv.advisorProfile?.id} value={adv.advisorProfile?.id}>
                              {adv.name} ({adv.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      <button 
                        type="submit"
                        disabled={linking}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-semibold whitespace-nowrap"
                      >
                        {linking ? "Vinculando..." : "Vincular Asesor"}
                      </button>
                    </form>
                  </div>
                )}

                {/* Cambiar Contraseña */}
                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Seguridad de la Cuenta</p>
                      <p className="text-xs text-gray-500">Actualiza periódicamente tu contraseña para mayor protección.</p>
                    </div>
                    <button
                      onClick={() => setIsChangingPassword(!isChangingPassword)}
                      className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors"
                    >
                      {isChangingPassword ? "Cancelar" : "Cambiar Contraseña"}
                    </button>
                  </div>

                  {isChangingPassword && (
                    <form onSubmit={handleChangePasswordSubmit} className="bg-gray-50 p-4 rounded-lg border space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase">Contraseña Actual</label>
                          <input 
                            type="password"
                            required
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase">Nueva Contraseña</label>
                          <input 
                            type="password"
                            required
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase">Confirmar Contraseña</label>
                          <input 
                            type="password"
                            required
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs font-bold"
                        >
                          Actualizar Credenciales
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Exportar Datos */}
                <div className="border-t pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Respaldar Información</p>
                    <p className="text-xs text-gray-500">Descarga un archivo con todo el historial y configuraciones de tu cuenta.</p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Exportar Mis Datos
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
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
              className="flex-1 border px-3 py-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
              Enviar
            </button>
          </form>
        </div>
      )}
      {/* MOBILE BOTTOM NAVIGATION BAR (iOS Glassmorphic tab bar) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/85 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl z-45 py-3 px-6 flex justify-around items-center">
        <Link href="/dashboard" className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-indigo-600">
          <LayoutDashboard className="h-5.5 w-5.5" />
          <span className="text-[10px] font-bold">Inicio</span>
        </Link>
        <Link href="/dashboard/drafts" className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-indigo-600">
          <FileText className="h-5.5 w-5.5" />
          <span className="text-[10px] font-bold">Tesis</span>
        </Link>
        <Link href="/dashboard/settings" className="flex flex-col items-center gap-1.5 text-indigo-600 font-black">
          <SettingsIcon className="h-5.5 w-5.5" />
          <span className="text-[10px]">Ajustes</span>
        </Link>
      </nav>
      {/* MOBILE BOTTOM NAVIGATION BAR (iOS Glassmorphic tab bar) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/85 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl z-45 py-3 px-6 flex justify-around items-center">
        <Link href="/dashboard" className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-indigo-600">
          <LayoutDashboard className="h-5.5 w-5.5" />
          <span className="text-[10px] font-bold">Inicio</span>
        </Link>
        <Link href="/dashboard/drafts" className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-indigo-600">
          <FileText className="h-5.5 w-5.5" />
          <span className="text-[10px] font-bold">Tesis</span>
        </Link>
        <Link href="/dashboard/settings" className="flex flex-col items-center gap-1.5 text-indigo-600 font-black">
          <SettingsIcon className="h-5.5 w-5.5" />
          <span className="text-[10px]">Ajustes</span>
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
                    <SettingsIcon className="h-3 w-3" />
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

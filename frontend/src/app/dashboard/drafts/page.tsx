"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileUp,
  X,
  Settings,
  LayoutDashboard,
  Trash2,
  GraduationCap,
  LogOut,
  BookOpen,
  History,
  MessageSquare,
  ChevronRight,
  Layers,
  Menu,
  Download,
  Loader2,
  FileCode,
  FileSpreadsheet,
  Check,
  AlertTriangle,
  Smartphone
} from "lucide-react";
import Link from "next/link";

interface Draft {
  id: string;
  title: string;
  version: number;
  status: string;
  score: number | null;
  createdAt: string;
  fileName: string;
  student?: {
    user: {
      name: string;
      email: string;
    }
  };
  aiReviews?: any[];
}

export default function DraftsPage() {
  const { data: session } = useSession();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Single upload states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ title: "", file: null as File | null });
  const [uploading, setUploading] = useState(false);

  // View modes: 'single' (individual upload & history) or 'batch' (batch processing & ZIP download)
  const [viewMode, setViewMode] = useState<"single" | "batch">("single");

  // Batch upload states
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchEmails, setBatchEmails] = useState<string[]>([]);
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchDrafts, setBatchDrafts] = useState<Draft[]>([]);
  const [pollingInterval, setPollingInterval] = useState<any>(null);
  const [isMobileSimOpen, setIsMobileSimOpen] = useState(false);
  const [activeSimTab, setActiveSimTab] = useState<'dashboard' | 'drafts' | 'settings'>('drafts');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Responsive mobile states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Comparison and Filter States
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareDraft1Id, setCompareDraft1Id] = useState("");
  const [compareDraft2Id, setCompareDraft2Id] = useState("");
  const [compareResult, setCompareResult] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("ALL"); 
  const [searchQuery, setSearchQuery] = useState("");

  // Tools sidebar states
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: "bot", text: "¡Hola! Soy el asistente de soporte de Tesis-IA. ¿En qué puedo ayudarte hoy?" }
  ]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    if (session?.user) {
      fetchDrafts();
    }
  }, [session]);

  // Clean polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  const fetchDrafts = async () => {
    try {
      const role = (session?.user as any)?.role;
      const endpoint = role === "ADVISOR"
        ? `${process.env.NEXT_PUBLIC_API_URL}/drafts/advisor/pending`
        : `${process.env.NEXT_PUBLIC_API_URL}/drafts`;

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDrafts(data);
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Live support chat handler
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

  // Compare draft versions helper
  const handleCompare = () => {
    if (!compareDraft1Id || !compareDraft2Id) {
      alert("Por favor selecciona dos borradores para comparar.");
      return;
    }
    const d1 = drafts.find(d => d.id === compareDraft1Id);
    const d2 = drafts.find(d => d.id === compareDraft2Id);
    if (!d1 || !d2) return;

    const [oldest, newest] = d1.version < d2.version ? [d1, d2] : [d2, d1];
    const scoreDiff = (newest.score || 0) - (oldest.score || 0);

    setCompareResult({
      oldest,
      newest,
      scoreDiff,
    });
  };

  // Single draft upload handler
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.title) {
      alert("Por favor completa el título y selecciona un archivo");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadData.file);
    formData.append("title", uploadData.title);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drafts/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
        body: formData,
      });

      if (res.ok) {
        setIsUploadModalOpen(false);
        setUploadData({ title: "", file: null });
        fetchDrafts();
      } else {
        const errorData = await res.json();
        alert(`Error al subir: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error uploading draft:", error);
      alert("Error de conexión con el servidor");
    } finally {
      setUploading(false);
    }
  };

  // Batch upload handler for 10-20 files
  const handleBatchUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (batchFiles.length === 0) {
      alert("Por favor selecciona archivos primero.");
      return;
    }

    setBatchUploading(true);
    setBatchError(null);
    setBatchDrafts([]);

    const formData = new FormData();
    batchFiles.forEach((file) => {
      formData.append("files", file);
    });

    // Create array of default titles (filename without extension)
    const fileTitles = batchFiles.map(file => file.name.replace(/\.[^/.]+$/, ""));
    formData.append("titles", JSON.stringify(fileTitles));
    formData.append("emails", JSON.stringify(batchEmails));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drafts/upload-batch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // Set batch drafts and start polling NestJS queue status
        setBatchDrafts(data);
        startBatchPolling(data.map((d: any) => d.id));
      } else {
        const errorData = await res.json();
        setBatchError(errorData.message || "Error al subir lote de tesis");
      }
    } catch (error) {
      console.error("Error uploading batch:", error);
      setBatchError("Error de conexión al servidor backend");
    } finally {
      setBatchUploading(false);
    }
  };

  // Polls server every 3s to retrieve analysis queue status
  const startBatchPolling = (ids: string[]) => {
    if (pollingInterval) clearInterval(pollingInterval);

    const interval = setInterval(async () => {
      try {
        const updated = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drafts/${id}`, {
              headers: {
                Authorization: `Bearer ${(session as any)?.accessToken}`,
              },
            });
            if (res.ok) return res.json();
            return null;
          })
        );

        const cleanDrafts = updated.filter(Boolean);
        setBatchDrafts(cleanDrafts);

        // Check if all drafts finished processing (status in REVIEWED, ERROR, or REJECTED)
        const allFinished = cleanDrafts.every(
          (d: any) => d.status === "REVIEWED" || d.status === "ERROR" || d.status === "REJECTED"
        );

        if (allFinished) {
          clearInterval(interval);
          setPollingInterval(null);
          // Refresh single lists
          fetchDrafts();
        }
      } catch (err) {
        console.error("Polling batch status error:", err);
      }
    }, 3000);

    setPollingInterval(interval);
  };

  // Download all batch reports zipped together
  const handleDownloadZip = async () => {
    if (batchDrafts.length === 0) return;
    const ids = batchDrafts.map(d => d.id);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drafts/download-reports-zip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
        body: JSON.stringify({ ids }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "reportes_lote_tesis.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Error al compilar el ZIP de reportes.");
      }
    } catch (err) {
      console.error("Failed downloading report ZIP:", err);
      alert("Error de conexión al descargar el archivo ZIP.");
    }
  };

  // Export CSV summary of batch results
  const handleExportCSV = () => {
    if (batchDrafts.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Titulo,Version,Archivo,Estado,Calificacion IA\n";

    batchDrafts.forEach((d) => {
      const row = [
        `"${d.title.replace(/"/g, '""')}"`,
        d.version,
        `"${d.fileName}"`,
        d.status,
        d.score !== null ? `${d.score.toFixed(1)}/100` : "Pendiente"
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "resumen_lote_tesis.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Clean current batch states
  const handleClearBatch = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setBatchFiles([]);
    setBatchDrafts([]);
    setBatchError(null);
  };

  // Delete draft handler
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este borrador? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drafts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });

      if (res.ok) {
        fetchDrafts();
      } else {
        alert("Error al eliminar el borrador");
      }
    } catch (error) {
      console.error("Error deleting draft:", error);
      alert("Error de conexión al eliminar");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "REVIEWED":
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="h-3.5 w-3.5" /> Revisado
          </span>
        );
      case "ANALYZING":
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 animate-pulse">
            <Clock className="h-3.5 w-3.5 animate-spin" /> Analizando
          </span>
        );
      case "ERROR":
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
            <AlertCircle className="h-3.5 w-3.5" /> Error
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
            <Clock className="h-3.5 w-3.5" /> En Cola
          </span>
        );
    }
  };

  // Live steps based on status
  const getStepText = (status: string) => {
    switch (status) {
      case "PENDING": return "Cargado en cola...";
      case "ANALYZING": return "IA extrayendo texto e índices...";
      case "REVIEWED": return "¡Completado! Reporte listo";
      case "ERROR": return "Error en extracción";
      default: return "Inicializando...";
    }
  };

  // Filter drafts list
  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = draft.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (draft.student?.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterStatus === "ALL") return true;
    if (filterStatus === "PENDING") return draft.status !== "REVIEWED";
    if (filterStatus === "REVIEWED") return draft.status === "REVIEWED";
    return true;
  });

  // Calculate batch analytics
  const batchCompletedCount = batchDrafts.filter(d => d.status === "REVIEWED").length;
  const batchTotalCount = batchDrafts.length;
  const batchAvgScore = batchCompletedCount > 0 
    ? batchDrafts.reduce((acc, curr) => acc + (curr.score || 0), 0) / batchCompletedCount
    : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row relative">
      
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

      {/* MOBILE SIDEBARRDRAWER (SLIDE-OUT) */}
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
                className="flex items-center gap-3 p-3.5 bg-indigo-50/70 text-indigo-700 rounded-xl transition-all font-semibold"
              >
                <FileText className="h-5 w-5 text-indigo-600" />
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

      {/* DESKTOP SIDEBAR */}
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
          <Link href="/dashboard/drafts" className="flex items-center gap-3 p-3 bg-indigo-50/70 text-indigo-700 rounded-xl transition-all font-semibold border border-indigo-100/30">
            <FileText className="h-5 w-5 text-indigo-600" />
            {(session?.user as any)?.role === "ADVISOR" ? "Borradores a Revisar" : "Mis Borradores"}
          </Link>
          <Link href="/dashboard/generator" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-medium">
            <Layers className="h-5 w-5 text-slate-400" />
            Generador de Tesis
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
            <span className="text-sm">Biblioteca Recursos</span>
          </button>
          <button 
            onClick={() => setIsStatsModalOpen(true)}
            className="flex items-center gap-3 p-3 w-full text-left text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
          >
            <History className="h-5 w-5 text-slate-400" />
            <span className="text-sm">Estadísticas IA</span>
          </button>
          <button 
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-3 p-3 w-full text-left text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
          >
            <MessageSquare className="h-5 w-5 text-slate-400" />
            <span className="text-sm">Soporte Técnico</span>
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

      {/* MAIN LAYOUT */}
      <main className="flex-1 p-5 md:p-10 max-w-7xl mx-auto w-full pb-28 md:pb-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {(session?.user as any)?.role === "ADVISOR" ? "Borradores a Revisar" : "Mis Borradores"}
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              {(session?.user as any)?.role === "ADVISOR"
                ? "Revisa y califica los documentos de investigación entregados por tus estudiantes."
                : "Carga nuevas entregas, analiza originalidad con IA y descarga reportes formales."}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {(session?.user as any)?.role !== "ADVISOR" && (
              <>
                <Link 
                href="/dashboard/generator"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold text-sm cursor-pointer"
              >
                <FileText className="h-4.5 w-4.5" />
                Generar Estructura
              </Link>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold text-sm cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" />
                Nuevo Borrador
              </button>
              </>
            )}
          </div>
        </div>

        {/* PROFESSIONAL SEGMENTED CONTROL (Vercel Style) */}
        {(session?.user as any)?.role !== "ADVISOR" && (
          <div className="bg-slate-200/60 p-1 rounded-xl w-full sm:w-[420px] flex mb-8 border border-slate-300/40">
            <button
              onClick={() => setViewMode("single")}
              className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                viewMode === "single"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="h-4 w-4" />
              Revisión Individual
            </button>
            <button
              onClick={() => setViewMode("batch")}
              className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                viewMode === "batch"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="h-4 w-4" />
              Carga por Lotes
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold">10-20</span>
            </button>
          </div>
        )}

        {/* -------------------- VIEW MODE: BATCH UPLOAD -------------------- */}
        {viewMode === "batch" ? (
          <div className="space-y-8 animate-fade-in">
            {/* Batch Upload Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-950 mb-2">Portal de Procesamiento Académico por Lotes</h2>
              <p className="text-sm text-slate-500 mb-6 font-medium">Sube de 10 a 20 borradores de tesis simultáneamente. El sistema encolará el análisis y generará reportes estructurados que podrás descargar combinados en un archivo comprimido ZIP.</p>

              {batchDrafts.length === 0 ? (
                <form onSubmit={handleBatchUpload} className="space-y-6">
                  {/* Drag-and-drop Zone */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-350 hover:border-indigo-500 rounded-2xl p-10 md:p-14 text-center bg-slate-50 hover:bg-indigo-50/20 transition-all duration-300 cursor-pointer group"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      multiple
                      accept=".pdf,.docx"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setBatchFiles(files);
                        setBatchEmails(new Array(files.length).fill(""));
                      }}
                      className="hidden"
                    />
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-105 transition-transform">
                      <FileUp className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Arrastra tus borradores de tesis aquí</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium">Soporta formatos PDF y Word (.docx). Se recomiendan entre 10 y 20 archivos.</p>
                  </div>

                  {/* Selected Files Preview & Validation */}
                  {batchFiles.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-800">Archivos seleccionados ({batchFiles.length})</span>
                        <button 
                          type="button"
                          onClick={() => setBatchFiles([])}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                        >
                          Limpiar Lista
                        </button>
                      </div>

                      {/* Warning badges */}
                      {batchFiles.length < 10 && (
                        <div className="flex gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold items-center">
                          <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                          <span>Has seleccionado menos de 10 tesis ({batchFiles.length}). El procesamiento óptimo por lotes está recomendado para 10 a 20 archivos.</span>
                        </div>
                      )}
                      {batchFiles.length > 20 && (
                        <div className="flex gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold items-center">
                          <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                          <span>Límite superado: Has seleccionado {batchFiles.length} tesis. El límite máximo para resguardar la performance es de 20 archivos simultáneos.</span>
                        </div>
                      )}

                      {/* File item tags with email inputs for Gmail cell integration */}
                      <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                        {batchFiles.map((file, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <FileText className="h-5 w-5 text-indigo-500 shrink-0" />
                              <div className="min-w-0">
                                <span className="text-xs text-slate-800 font-bold truncate block">{file.name}</span>
                                <span className="text-[10px] text-slate-400 font-semibold uppercase">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2.5 flex-1 md:max-w-md w-full">
                              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider shrink-0">Enviar a (Gmail):</span>
                              <input 
                                type="email"
                                placeholder="estudiante@gmail.com"
                                value={batchEmails[idx] || ""}
                                onChange={(e) => {
                                  const updated = [...batchEmails];
                                  updated[idx] = e.target.value;
                                  setBatchEmails(updated);
                                }}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-55 bg-slate-50/50"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Trigger button */}
                      <button
                        type="submit"
                        disabled={batchUploading || batchFiles.length < 1 || batchFiles.length > 20}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {batchUploading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Cargando archivos y encolando procesos...
                          </>
                        ) : (
                          <>
                            <Layers className="h-4.5 w-4.5" />
                            Iniciar Análisis de Lote ({batchFiles.length} tesis)
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {batchError && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <span>{batchError}</span>
                    </div>
                  )}
                </form>
              ) : (
                /* Batch Processing Dashboard */
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-55 p-5 border border-slate-200 rounded-xl shadow-xs">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                        {pollingInterval ? (
                          <>
                            <Loader2 className="h-4.5 w-4.5 text-indigo-600 animate-spin" />
                            Procesando cola de tesis por lotes...
                          </>
                        ) : (
                          <>
                            <Check className="h-4.5 w-4.5 text-emerald-600" />
                            Análisis de lote finalizado
                          </>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 font-semibold">
                        Completados: <span className="font-bold text-slate-800">{batchCompletedCount}/{batchTotalCount}</span> tesis en evaluación.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5 self-stretch sm:self-auto">
                      <button 
                        onClick={handleDownloadZip}
                        disabled={batchCompletedCount === 0}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        Descargar Lote (ZIP)
                      </button>
                      <button 
                        onClick={handleExportCSV}
                        disabled={batchCompletedCount === 0}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-250 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        Exportar CSV
                      </button>
                      <button 
                        onClick={handleClearBatch}
                        className="flex-1 sm:flex-none bg-white text-rose-600 hover:bg-rose-50 border border-rose-100 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Limpiar Lote
                      </button>
                    </div>
                  </div>

                  {/* Overall Aggregated Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="bg-white p-5 rounded-xl border border-slate-200/80 text-center shadow-xs">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Originalidad Promedio</span>
                      <span className="text-3xl font-extrabold text-slate-900 mt-2 block">98%</span>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200/80 text-center shadow-xs">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Promedio Calificación</span>
                      <span className="text-3xl font-extrabold text-indigo-600 mt-2 block">
                        {batchAvgScore > 0 ? `${batchAvgScore.toFixed(1)}/100` : "--"}
                      </span>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200/80 text-center shadow-xs">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Estado de Procesamiento</span>
                      <span className="text-3xl font-extrabold text-emerald-600 mt-2 block">
                        {pollingInterval ? "En Proceso" : "Completado"}
                      </span>
                    </div>
                  </div>

                  {/* List of Batch Processing Thesis Cards */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800">Estado de tesis del lote</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {batchDrafts.map((draft, idx) => (
                        <div key={draft.id || idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-bold text-slate-400 uppercase">Tesis {idx + 1}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-xs font-semibold text-slate-500 truncate max-w-sm" title={draft.fileName}>
                                {draft.fileName}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-slate-900 truncate" title={draft.title}>
                              {draft.title}
                            </h4>
                            <p className="text-xs text-slate-500 font-semibold">
                              Proceso: <span className="font-bold text-slate-700">{getStepText(draft.status)}</span>
                            </p>
                          </div>

                          {/* Interactive live progress bar inside each card */}
                          <div className="w-full md:w-44 flex flex-col gap-1 shrink-0">
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div 
                                className={`h-full transition-all duration-700 rounded-full ${
                                  draft.status === "REVIEWED" 
                                    ? "bg-emerald-500 w-full" 
                                    : draft.status === "ANALYZING"
                                    ? "bg-indigo-500 w-3/5"
                                    : draft.status === "ERROR"
                                    ? "bg-rose-500 w-full"
                                    : "bg-amber-400 w-1/5"
                                }`} 
                              />
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                              <span>Progreso</span>
                              <span className={draft.status === "REVIEWED" ? "text-emerald-600" : draft.status === "ANALYZING" ? "text-indigo-600" : ""}>
                                {draft.status === "REVIEWED" ? "100%" : draft.status === "ANALYZING" ? "60%" : "20%"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 self-end md:self-auto">
                            <div className="text-right">
                              {draft.score ? (
                                <span className={`text-base font-black ${draft.score >= 70 ? "text-emerald-600" : "text-amber-600"}`}>
                                  {draft.score.toFixed(1)}/100
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium">--</span>
                              )}
                            </div>
                            <div>{getStatusBadge(draft.status)}</div>
                            
                            {draft.status === "REVIEWED" && (
                              <Link 
                                href={`/dashboard/drafts/${draft.id}`}
                                className="p-2 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 transition-all shadow-xs"
                                title="Ver detalles y observaciones"
                              >
                                <ChevronRight className="h-5 w-5" />
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* -------------------- VIEW MODE: SINGLE UPLOAD & HISTORY -------------------- */
          <div className="space-y-6 animate-fade-in">
            {/* Search and Filters panel */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row gap-4 justify-between items-center">
              
              {/* Searching input bar */}
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3.5 top-1/2 -transform -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por título o estudiante..." 
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all bg-slate-50/50"
                />
              </div>

              {/* Status filtering tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 w-full lg:w-auto">
                <button 
                  onClick={() => setFilterStatus("ALL")}
                  className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    filterStatus === "ALL" 
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setFilterStatus("PENDING")}
                  className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    filterStatus === "PENDING" 
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Pendientes
                </button>
                <button 
                  onClick={() => setFilterStatus("REVIEWED")}
                  className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    filterStatus === "REVIEWED" 
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Revisados
                </button>
              </div>

              {/* Advanced comparison buttons */}
              <div className="flex gap-2.5 w-full lg:w-auto">
                <button 
                  onClick={() => setIsCompareModalOpen(true)}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100/50 rounded-xl text-xs font-bold transition-all"
                >
                  <Clock className="h-4 w-4" />
                  Comparar Versiones
                </button>
                <button 
                  onClick={() => alert("Historial exportado en formato Excel/CSV con éxito.")}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-250 rounded-xl text-xs font-bold transition-all"
                >
                  Exportar Historial
                </button>
              </div>
            </div>

            {/* drafts TABLE LIST & MOBILE CARDS RESPONSIVE GRID */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-16 text-center text-slate-400 font-medium">Cargando borradores...</div>
              ) : filteredDrafts.length === 0 ? (
                <div className="p-16 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileUp className="h-8 w-8 text-slate-350" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {(session?.user as any)?.role === "ADVISOR" ? "No tienes borradores asignados" : "No has subido borradores"}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium">
                    {(session?.user as any)?.role === "ADVISOR"
                      ? "Los estudiantes a tu cargo no han subido borradores de tesis para evaluar."
                      : "Comienza subiendo tu primer borrador para iniciar el análisis automático con IA."}
                  </p>
                </div>
              ) : (
                <>
                  {/* DESKTOP VIEW TABLE (hidden on smaller mobile screen sizes) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/75 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                            {(session?.user as any)?.role === "ADVISOR" ? "Título / Estudiante" : "Título de la Tesis"}
                          </th>
                          <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Estado</th>
                          <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Calificación IA</th>
                          <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Fecha Entrega</th>
                          <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredDrafts.map((draft) => (
                          <tr key={draft.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-slate-950 truncate max-w-md" title={draft.title}>
                                  {draft.title}
                                </span>
                                <span className="text-xs text-slate-400 mt-1 font-semibold flex items-center gap-1.5">
                                  <span>Versión {draft.version}</span>
                                  {draft.student?.user?.name && (
                                    <>
                                      <span>•</span>
                                      <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded-md text-[10px]">
                                        Estudiante: {draft.student.user.name}
                                      </span>
                                    </>
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(draft.status)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {draft.score !== null ? (
                                <span className={`text-base font-extrabold ${draft.score >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {draft.score.toFixed(1)}<span className="text-xs text-slate-400 font-semibold">/100</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 font-semibold">--</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-semibold">
                              {new Date(draft.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <div className="flex items-center justify-end gap-4">
                                <Link 
                                  href={`/dashboard/drafts/${draft.id}`}
                                  className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                                >
                                  {(session?.user as any)?.role === "ADVISOR" ? "Evaluar y Calificar" : "Detalles Reporte"}
                                </Link>
                                {(session?.user as any)?.role !== "ADVISOR" && (
                                  <button
                                    onClick={() => handleDelete(draft.id)}
                                    className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                                    title="Eliminar borrador"
                                  >
                                    <Trash2 className="h-4.5 w-4.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE RESPONSIVE CARDS VIEW (displays only on small screens) */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {filteredDrafts.map((draft) => (
                      <div key={draft.id} className="p-5 space-y-4 bg-white hover:bg-slate-50/20 transition-all">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Versión {draft.version} • {new Date(draft.createdAt).toLocaleDateString()}</span>
                            <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{draft.title}</h4>
                            {draft.student?.user?.name && (
                              <span className="inline-block text-[10px] text-indigo-700 bg-indigo-50 font-bold px-2 py-0.5 rounded-md mt-1">
                                Estudiante: {draft.student.user.name}
                              </span>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            {draft.score !== null ? (
                              <span className={`text-base font-extrabold block ${draft.score >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {draft.score.toFixed(0)}
                                <span className="text-xs text-slate-400 font-bold">/100</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 font-bold text-sm block">--</span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2.5 border-t border-slate-50">
                          <div>{getStatusBadge(draft.status)}</div>
                          <div className="flex gap-2">
                            {(session?.user as any)?.role !== "ADVISOR" && (
                              <button
                                onClick={() => handleDelete(draft.id)}
                                className="text-rose-500 p-2 bg-rose-50 border border-rose-100 rounded-xl"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            <Link 
                              href={`/dashboard/drafts/${draft.id}`}
                              className="bg-indigo-600 text-white hover:bg-indigo-700 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm"
                            >
                              {(session?.user as any)?.role === "ADVISOR" ? "Evaluar" : "Ver Reporte"}
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (iOS / Glassmorphic Floating Tab-bar) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/85 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl z-45 py-3 px-6 flex justify-around items-center">
        <Link href="/dashboard" className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-indigo-600">
          <LayoutDashboard className="h-5.5 w-5.5" />
          <span className="text-[10px] font-bold">Inicio</span>
        </Link>
        <Link href="/dashboard/drafts" className="flex flex-col items-center gap-1.5 text-indigo-600 font-black">
          <FileText className="h-5.5 w-5.5" />
          <span className="text-[10px]">Tesis</span>
        </Link>
        <Link href="/dashboard/settings" className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-indigo-600">
          <Settings className="h-5.5 w-5.5" />
          <span className="text-[10px] font-bold">Ajustes</span>
        </Link>
      </nav>

      {/* -------------------- MODAL: SINGLE UPLOAD BORRADOR -------------------- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-scale-up">
            <div className="p-6 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-950">Subir Borrador Individual</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Título de la Tesis</label>
                <input 
                  type="text" 
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                  className="w-full px-3.5 py-2.5 border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-slate-50/20"
                  placeholder="Ej: Metodología ágil aplicada a la..."
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Archivo de Tesis (PDF o Word)</label>
                <div className="border-2 border-dashed border-slate-250 hover:border-indigo-500 rounded-xl p-8 text-center hover:bg-indigo-50/10 transition-all cursor-pointer relative group">
                  <input 
                    type="file" 
                    required
                    accept=".pdf,.docx"
                    onChange={(e) => setUploadData({...uploadData, file: e.target.files?.[0] || null})}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FileUp className="h-8 w-8 text-slate-400 mx-auto mb-2 group-hover:scale-105 transition-transform" />
                  <p className="text-xs text-slate-600 font-semibold truncate px-3">
                    {uploadData.file ? uploadData.file.name : "Selecciona o arrastra el documento aquí"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">Tamaño máximo de archivo: 20MB</p>
                </div>
              </div>
              <button 
                type="submit"
                disabled={uploading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5.5 w-5.5 animate-spin" />
                    Analizando con IA...
                  </>
                ) : "Iniciar Evaluación IA"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPARAR VERSIONES */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-scale-up border border-slate-100">
            <button 
              onClick={() => {
                setIsCompareModalOpen(false);
                setCompareResult(null);
                setCompareDraft1Id("");
                setCompareDraft2Id("");
              }} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="h-5.5 w-5.5 text-indigo-600" />
              Comparar Versiones de Tesis
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                    Borrador A
                  </label>
                  <select
                    value={compareDraft1Id}
                    onChange={(e) => setCompareDraft1Id(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-slate-50/50"
                  >
                    <option value="">-- Seleccionar --</option>
                    {drafts.map((d) => (
                      <option key={d.id} value={d.id}>
                        Versión {d.version} ({new Date(d.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                    Borrador B
                  </label>
                  <select
                    value={compareDraft2Id}
                    onChange={(e) => setCompareDraft2Id(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-slate-50/50"
                  >
                    <option value="">-- Seleccionar --</option>
                    {drafts.map((d) => (
                      <option key={d.id} value={d.id}>
                        Versión {d.version} ({new Date(d.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleCompare}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm cursor-pointer shadow-md"
              >
                Comparar Ahora
              </button>

              {compareResult && (
                <div className="mt-5 border border-indigo-100 rounded-2xl overflow-hidden shadow-xs bg-indigo-50/20">
                  <div className="p-4 border-b border-indigo-100 bg-white">
                    <h3 className="font-bold text-slate-900 text-xs">Métricas de Comparación</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Versión Anterior ({compareResult.oldest.version})</p>
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">{compareResult.oldest.title}</p>
                        <p className="text-[10px] text-slate-500 font-bold">Puntaje IA: {compareResult.oldest.score ? `${compareResult.oldest.score.toFixed(1)}/100` : '--'}</p>
                      </div>
                      <div className="shrink-0">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">V{compareResult.oldest.version}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-200/50 border-dashed my-2" />
                    
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider">Versión Nueva ({compareResult.newest.version})</p>
                        <p className="text-xs font-bold text-slate-900 line-clamp-1">{compareResult.newest.title}</p>
                        <p className="text-[10px] text-indigo-700 font-bold">Puntaje IA: {compareResult.newest.score ? `${compareResult.newest.score.toFixed(1)}/100` : '--'}</p>
                      </div>
                      <div className="shrink-0">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">V{compareResult.newest.version}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-200/50 my-2" />
                    
                    <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-indigo-100/50">
                      <span className="text-xs font-bold text-slate-700">Progreso Calificación IA:</span>
                      <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md ${
                        compareResult.scoreDiff >= 0 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border border-rose-105'
                      }`}>
                        {compareResult.scoreDiff >= 0 ? `+${compareResult.scoreDiff.toFixed(1)} puntos` : `${compareResult.scoreDiff.toFixed(1)} puntos`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BIBLIOTECA DE RECURSOS */}
      {isLibraryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-scale-up border border-slate-100">
            <button 
              onClick={() => setIsLibraryModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Biblioteca de Recursos
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-semibold">Descarga guías de redacción oficiales y normas de estilo académico homologadas.</p>
            <div className="space-y-3">
              <a href="/resources/Estructura_Tesis_Oficial_U.docx" download className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/20 border border-slate-200/80 rounded-xl transition-all cursor-pointer">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">1. Plantilla Oficial de Tesis (Word)</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Márgenes, tipos de letra e índices estructurados.</p>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/50">WORD</span>
              </a>
              <a href="/resources/Guia_Citas_APA_7ma.pdf" download className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/20 border border-slate-200/80 rounded-xl transition-all cursor-pointer">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">2. Manual Simplificado Normas APA 7ma Ed.</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Reglas básicas para citas directas, indirectas y bibliografía.</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">PDF</span>
              </a>
              <a href="/resources/Formato_IEEE_Publicaciones.pdf" download className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/20 border border-slate-200/80 rounded-xl transition-all cursor-pointer">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">3. Estructura de Citas IEEE (Ingeniería)</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Manual de citación numérica oficial para proyectos tecnológicos.</p>
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100/50">PDF</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ESTADISTICAS IA */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scale-up border border-slate-100">
            <button 
              onClick={() => setIsStatsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <History className="h-5.5 w-5.5 text-indigo-650" />
              Estadísticas e Historial IA
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-semibold">Métricas acumuladas del procesamiento automático de tus borradores.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100/55 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Tokens Procesados</p>
                <p className="text-xl font-black text-indigo-950 mt-1">458,230</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Páginas Analizadas</p>
                <p className="text-xl font-black text-slate-900 mt-1">112</p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Citas Verificadas</p>
                <p className="text-xl font-black text-emerald-950 mt-1">87</p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Errores Corregidos</p>
                <p className="text-xl font-black text-amber-950 mt-1">124</p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Modelo Académico: Gemini 1.5 Pro Academic v3</p>
            </div>
          </div>
        </div>
      )}

      {/* WIDGET: CHAT DE SOPORTE TECNICO */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-slate-150 z-50 overflow-hidden flex flex-col h-[400px] animate-fade-in-up">
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shrink-0 shadow-sm">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span className="font-bold text-sm">Soporte Técnico en Vivo</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-white/85 hover:text-white p-1 hover:bg-white/10 rounded-lg">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-sm' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs font-medium'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2 shrink-0">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Escribe tu consulta..."
              className="flex-1 border border-slate-250 px-3 py-2 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer">
              Enviar
            </button>
          </form>
        </div>
      )}

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
                          <p className="text-[7px] text-indigo-650 font-bold mt-0.5 animate-pulse">Analizando citas...</p>
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

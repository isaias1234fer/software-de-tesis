'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { GraduationCap, Download, FileText, Loader2 } from 'lucide-react';

export default function PublicThesisGenerator() {
  const { data: session } = useSession();
  const [thesisData, setThesisData] = useState({
    title: '',
    authorFirstName: '',
    authorLastName: '',
    advisorFirstName: '',
    advisorLastName: '',
    advisorDegree: 'Doctor',
    researchLine: 'Gestión de Gobierno y Servicios de TIC',
    city: 'Trujillo',
    year: new Date().getFullYear().toString(),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'pdf' | 'word' | null>(null);

  const handleGenerateThesis = () => {
    const thesisStructure = `UNIVERSIDAD NACIONAL DE TRUJILLO\n${thesisData.title}\nAutor: ${thesisData.authorLastName} ${thesisData.authorFirstName}\nAsesor: ${thesisData.advisorDegree} ${thesisData.advisorLastName} ${thesisData.advisorFirstName}\nLínea: ${thesisData.researchLine}\n${thesisData.city}, ${thesisData.year}`;
    const blob = new Blob([thesisStructure], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estructura-tesis-${thesisData.title.replace(/\s+/g, '-') || 'sin-titulo'}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleGenerateWithAI = async (type: 'pdf' | 'word') => {
    if (!thesisData.title.trim()) {
      alert('Por favor, ingresa el título de la tesis');
      return;
    }
    
    if (!session) {
      alert('Debes estar autenticado para generar tesis con IA');
      return;
    }
    
    setIsLoading(true);
    setLoadingType(type);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const endpoint = type === 'pdf' ? '/ai/generate-thesis-pdf' : '/ai/generate-thesis-word';
      const token = (session as any).accessToken;
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(thesisData),
      });
      if (!response.ok) {
        console.error('Error response:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error body:', errorText);
        throw new Error('Error al generar el documento');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tesis-${thesisData.title.replace(/\s+/g, '-')}.${type === 'pdf' ? 'pdf' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating thesis:', error);
      alert('Error al generar. Verifica que el backend esté corriendo en http://localhost:3001');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <GraduationCap className="mx-auto h-16 w-16 text-indigo-600 mb-4" />
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Generador de Tesis con IA</h1>
          <p className="text-slate-600 text-lg">Crea tu plantilla según las normas de la UNT o genera contenido completo con IA</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Título de la Tesis</label>
              <input type="text" value={thesisData.title} onChange={(e) => setThesisData({...thesisData, title: e.target.value})} placeholder="Ingresa el título de tu tesis" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nombres del Autor</label>
              <input type="text" value={thesisData.authorFirstName} onChange={(e) => setThesisData({...thesisData, authorFirstName: e.target.value})} placeholder="Nombres" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Apellidos del Autor</label>
              <input type="text" value={thesisData.authorLastName} onChange={(e) => setThesisData({...thesisData, authorLastName: e.target.value})} placeholder="Apellidos" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Grado del Asesor</label>
              <select value={thesisData.advisorDegree} onChange={(e) => setThesisData({...thesisData, advisorDegree: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900">
                <option>Doctor</option><option>Maestro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nombres del Asesor</label>
              <input type="text" value={thesisData.advisorFirstName} onChange={(e) => setThesisData({...thesisData, advisorFirstName: e.target.value})} placeholder="Nombres" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Apellidos del Asesor</label>
              <input type="text" value={thesisData.advisorLastName} onChange={(e) => setThesisData({...thesisData, advisorLastName: e.target.value})} placeholder="Apellidos" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Línea de Investigación</label>
              <select value={thesisData.researchLine} onChange={(e) => setThesisData({...thesisData, researchLine: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900">
                <option>Gestión de Gobierno y Servicios de TIC</option>
                <option>Gestión de Proyectos de TIC</option>
                <option>Gestión de Desarrollo de Software</option>
                <option>Gestión de Infraestructura y Comunicaciones</option>
                <option>Gestión de la Seguridad de la Información</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ciudad</label>
              <select value={thesisData.city} onChange={(e) => setThesisData({...thesisData, city: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900">
                <option>Trujillo</option><option>Guadalupe</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Año</label>
              <input type="text" value={thesisData.year} onChange={(e) => setThesisData({...thesisData, year: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" />
            </div>
          </div>

          <div className="space-y-4">
            <button onClick={handleGenerateThesis} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3">
              <Download className="h-6 w-6" />
              Generar y Descargar Estructura (TXT)
            </button>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-1 text-center">Generar con IA (Contenido Completo)</h3>
              <p className="text-sm text-slate-500 mb-5 text-center">La IA generará contenido completo de al menos 9 páginas A4.</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleGenerateWithAI('pdf')} disabled={isLoading} className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3">
                  {isLoading && loadingType === 'pdf' ? <><Loader2 className="h-5 w-5 animate-spin" />Generando PDF...</> : <><FileText className="h-5 w-5" />Generar PDF</>}
                </button>
                <button onClick={() => handleGenerateWithAI('word')} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3">
                  {isLoading && loadingType === 'word' ? <><Loader2 className="h-5 w-5 animate-spin" />Generando Word...</> : <><FileText className="h-5 w-5" />Generar Word</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
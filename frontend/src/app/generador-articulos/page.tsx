'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { BookOpen, Download, FileText, Loader2, Plus, X, Mail } from 'lucide-react';

interface CoAuthor {
  firstName: string;
  lastName: string;
  email: string;
}

export default function ArticleGenerator() {
  const { data: session } = useSession();
  const [articleData, setArticleData] = useState({
    title: '',
    authorFirstName: session?.user?.name?.split(' ')[0] || 'Juan',
    authorLastName: session?.user?.name?.split(' ').slice(1).join(' ') || 'Pérez',
    authorEmail: session?.user?.email || 'juan.perez@unt.edu.pe',
    coAuthors: [] as CoAuthor[],
    journal: '',
    keywords: '',
    abstract: '',
    researchArea: 'Ingeniería de Sistemas',
    city: 'Trujillo',
    year: new Date().getFullYear().toString(),
    universityTemplate: 'UNT',
    tablesCount: 2,
    figuresCount: 2,
  });

  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [sendEmail, setSendEmail] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'pdf' | 'word' | null>(null);

  const addCoAuthor = () => {
    setArticleData({
      ...articleData,
      coAuthors: [...articleData.coAuthors, { firstName: '', lastName: '', email: '' }],
    });
  };

  const removeCoAuthor = (index: number) => {
    setArticleData({
      ...articleData,
      coAuthors: articleData.coAuthors.filter((_, i) => i !== index),
    });
  };

  const updateCoAuthor = (index: number, field: keyof CoAuthor, value: string) => {
    const updatedCoAuthors = [...articleData.coAuthors];
    updatedCoAuthors[index][field] = value;
    setArticleData({
      ...articleData,
      coAuthors: updatedCoAuthors,
    });
  };

  const handleGenerateWithAI = async (type: 'pdf' | 'word') => {
    if (!articleData.title.trim()) {
      alert('Por favor, ingresa el título del artículo');
      return;
    }

    setIsLoading(true);
    setLoadingType(type);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const endpoint = type === 'pdf' ? '/articles/generate-article-pdf' : '/articles/generate-article-word';
      const token = (session as any)?.accessToken;

      let response: Response;

      if (templateFile) {
        // Usar FormData si hay un archivo de plantilla
        const formData = new FormData();
        formData.append('file', templateFile);
        formData.append('data', JSON.stringify(articleData));
        formData.append('sendEmail', sendEmail.toString());

        response = await fetch(`${apiUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: formData,
        });
      } else {
        // Usar JSON si no hay archivo
        const payload = {
          ...articleData,
          sendEmail: sendEmail.toString(),
        };

        response = await fetch(`${apiUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Error al generar el documento');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `articulo-${articleData.title.replace(/\s+/g, '-')}.${type === 'pdf' ? 'pdf' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      if (sendEmail) {
        alert('¡Artículo generado y enviado a tu correo electrónico!');
      }
    } catch (error) {
      console.error('Error generating article:', error);
      alert('Error al generar el artículo. Por favor, verifica que: 1) El backend esté corriendo, 2) La API key de Gemini esté configurada en el backend (.env)');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <BookOpen className="mx-auto h-16 w-16 text-emerald-600 mb-4" />
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Generador de Artículos con IA</h1>
          <p className="text-slate-600 text-lg">Genera artículos académicos completos basados en plantillas Word utilizando IA</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Título del Artículo</label>
              <input 
                type="text" 
                value={articleData.title}
                onChange={(e) => setArticleData({...articleData, title: e.target.value})}
                placeholder="Ingresa el título de tu artículo"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Plantilla Universitaria</label>
              <select
                value={articleData.universityTemplate}
                onChange={(e) => setArticleData({...articleData, universityTemplate: e.target.value})}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              >
                <option value="UNT">Universidad Nacional de Trujillo (UNT)</option>
                <option value="UNMSM">Universidad Nacional Mayor de San Marcos (UNMSM)</option>
                <option value="UNI">Universidad Nacional de Ingeniería (UNI)</option>
                <option value="UNALM">Universidad Nacional Agraria La Molina (UNALM)</option>
                <option value="UPC">Universidad Peruana de Ciencias Aplicadas (UPC)</option>
                <option value="PUCP">Pontificia Universidad Católica del Perú (PUCP)</option>
                <option value="USIL">Universidad San Ignacio de Loyola (USIL)</option>
                <option value="UNFV">Universidad Nacional Federico Villarreal (UNFV)</option>
                <option value="UNAC">Universidad Nacional del Callao (UNAC)</option>
                <option value="GENERAL">Formato General IEEE/APA</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Selecciona la plantilla de la universidad para seguir su formato específico</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Plantilla Personalizada (Opcional)</label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  accept=".docx,.pdf,.doc"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setTemplateFile(file);
                    }
                  }}
                  className="hidden"
                  id="template-file"
                />
                <label
                  htmlFor="template-file"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <FileText className="h-8 w-8 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {templateFile ? templateFile.name : 'Haz clic para subir un documento Word o PDF'}
                  </span>
                  <span className="text-xs text-slate-400">
                    El documento se usará como referencia para el formato y estructura
                  </span>
                </label>
                {templateFile && (
                  <button
                    type="button"
                    onClick={() => setTemplateFile(null)}
                    className="mt-2 text-xs text-red-600 hover:text-red-700"
                  >
                    Eliminar archivo
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="send-email"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="send-email" className="text-sm text-slate-700 font-medium cursor-pointer flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600" />
                Enviar el artículo generado a mi correo electrónico
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nombres del Autor Principal</label>
              <input 
                type="text" 
                value={articleData.authorFirstName}
                onChange={(e) => setArticleData({...articleData, authorFirstName: e.target.value})}
                placeholder="Nombres"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Apellidos del Autor Principal</label>
              <input 
                type="text" 
                value={articleData.authorLastName}
                onChange={(e) => setArticleData({...articleData, authorLastName: e.target.value})}
                placeholder="Apellidos"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico del Autor Principal</label>
              <input
                type="email"
                value={articleData.authorEmail}
                onChange={(e) => setArticleData({...articleData, authorEmail: e.target.value})}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Número de Tablas</label>
              <input
                type="number"
                min="0"
                max="10"
                value={articleData.tablesCount}
                onChange={(e) => setArticleData({...articleData, tablesCount: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
              <p className="text-xs text-slate-500 mt-1">Cantidad de tablas a incluir en el artículo (0-10)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Número de Figuras/Imágenes</label>
              <input
                type="number"
                min="0"
                max="10"
                value={articleData.figuresCount}
                onChange={(e) => setArticleData({...articleData, figuresCount: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
              <p className="text-xs text-slate-500 mt-1">Cantidad de figuras a incluir en el artículo (0-10)</p>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-slate-700">Coautores</label>
                <button
                  type="button"
                  onClick={addCoAuthor}
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Coautor
                </button>
              </div>
              
              {articleData.coAuthors.map((coAuthor, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <input
                    type="text"
                    value={coAuthor.firstName}
                    onChange={(e) => updateCoAuthor(index, 'firstName', e.target.value)}
                    placeholder="Nombres del coautor"
                    className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                  />
                  <input
                    type="text"
                    value={coAuthor.lastName}
                    onChange={(e) => updateCoAuthor(index, 'lastName', e.target.value)}
                    placeholder="Apellidos del coautor"
                    className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                  />
                  <input
                    type="email"
                    value={coAuthor.email}
                    onChange={(e) => updateCoAuthor(index, 'email', e.target.value)}
                    placeholder="Correo del coautor"
                    className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => removeCoAuthor(index)}
                    className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 font-medium py-3 border border-red-200 rounded-xl hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Revista Objetivo</label>
              <input 
                type="text" 
                value={articleData.journal}
                onChange={(e) => setArticleData({...articleData, journal: e.target.value})}
                placeholder="Nombre de la revista (opcional)"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Área de Investigación</label>
              <select 
                value={articleData.researchArea}
                onChange={(e) => setArticleData({...articleData, researchArea: e.target.value})}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              >
                <option>Ingeniería de Sistemas</option>
                <option>Ingeniería de Software</option>
                <option>Ciencia de Datos</option>
                <option>Inteligencia Artificial</option>
                <option>Ciberseguridad</option>
                <option>Redes y Telecomunicaciones</option>
                <option>Otra</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Palabras Clave</label>
              <input 
                type="text" 
                value={articleData.keywords}
                onChange={(e) => setArticleData({...articleData, keywords: e.target.value})}
                placeholder="Separadas por comas (ej: IA, machine learning, sistemas)"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Resumen (Abstract)</label>
              <textarea 
                value={articleData.abstract}
                onChange={(e) => setArticleData({...articleData, abstract: e.target.value})}
                placeholder="Escribe un resumen breve de tu artículo (opcional, la IA lo generará si lo dejas vacío)"
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ciudad</label>
              <select 
                value={articleData.city}
                onChange={(e) => setArticleData({...articleData, city: e.target.value})}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              >
                <option>Trujillo</option>
                <option>Lima</option>
                <option>Arequipa</option>
                <option>Cusco</option>
                <option>Otra</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Año</label>
              <input 
                type="text" 
                value={articleData.year}
                onChange={(e) => setArticleData({...articleData, year: e.target.value})}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">Generar Artículo con IA</h3>
              <p className="text-sm text-slate-600 mb-4 text-center">La IA (Gemini de Google) generará contenido completo siguiendo la estructura estándar IMRYD (Introducción, Métodos, Resultados y Discusión).</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => handleGenerateWithAI('pdf')}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  {isLoading && loadingType === 'pdf' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5" />
                      Generar PDF
                    </>
                  )}
                </button>
                
                <button 
                  onClick={() => handleGenerateWithAI('word')}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  {isLoading && loadingType === 'word' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generando Word...
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5" />
                      Generar Word
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Información sobre la generación</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• El artículo seguirá la estructura de la plantilla seleccionada</li>
            <li>• Incluirá resumen en español e inglés según la plantilla</li>
            <li>• Las referencias seguirán el estilo de citación de la universidad (APA, IEEE, Chicago)</li>
            <li>• Incluirá 30 referencias bibliográficas de alto impacto</li>
            <li>• Generará {articleData.tablesCount} tablas y {articleData.figuresCount} figuras según lo especificado</li>
            <li>• El contenido es generado por IA (Gemini 2.5 Flash)</li>
            <li>• Revisa y edita el contenido antes de someterlo a una revista</li>
          </ul>
        </div>

        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-emerald-900 mb-3">Plantilla seleccionada: {articleData.universityTemplate}</h3>
          <div className="text-sm text-emerald-800 space-y-2">
            <p><strong>Universidad:</strong> {
              articleData.universityTemplate === 'UNT' ? 'Universidad Nacional de Trujillo' :
              articleData.universityTemplate === 'UNMSM' ? 'Universidad Nacional Mayor de San Marcos' :
              articleData.universityTemplate === 'UNI' ? 'Universidad Nacional de Ingeniería' :
              articleData.universityTemplate === 'UNALM' ? 'Universidad Nacional Agraria La Molina' :
              articleData.universityTemplate === 'UPC' ? 'Universidad Peruana de Ciencias Aplicadas' :
              articleData.universityTemplate === 'PUCP' ? 'Pontificia Universidad Católica del Perú' :
              articleData.universityTemplate === 'USIL' ? 'Universidad San Ignacio de Loyola' :
              articleData.universityTemplate === 'UNFV' ? 'Universidad Nacional Federico Villarreal' :
              articleData.universityTemplate === 'UNAC' ? 'Universidad Nacional del Callao' :
              'Formato General IEEE/APA'
            }</p>
            <p><strong>Estilo de citación:</strong> {
              articleData.universityTemplate === 'UNI' ? 'IEEE' :
              articleData.universityTemplate === 'PUCP' ? 'Chicago o APA 7ma edición' :
              'APA 7ma edición'
            }</p>
            <p><strong>Estructura:</strong> IMRYD adaptado a los requisitos de la universidad</p>
          </div>
        </div>
      </div>
    </div>
  );
}

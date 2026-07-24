import Link from "next/link";
import { GraduationCap, FileText, CheckCircle, ShieldCheck, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header/Navbar */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">Revision de Tesis</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="/auth/login">
            Iniciar Sesión
          </Link>
          <Link className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors" href="/auth/register">
            Registrarse
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-gray-900">
                  Sistema de Inteligencia para la Revisión de Tesis
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Optimiza el proceso de revisión académica con IA. Evaluación automática de estructura, calidad y cumplimiento de normas institucionales.
                </p>
              </div>
              <div className="space-x-4">
                <Link
                  href="/auth/register"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-8 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700"
                >
                  Empezar Ahora
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-8 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950"
                >
                  Ver Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg shadow-sm">
                <FileText className="h-12 w-12 text-blue-600 mb-2" />
                <h2 className="text-xl font-bold">Análisis Estructural</h2>
                <p className="text-center text-gray-500">
                  Verificación automática de secciones obligatorias y cumplimiento de plantillas institucionales.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg shadow-sm">
                <CheckCircle className="h-12 w-12 text-green-600 mb-2" />
                <h2 className="text-xl font-bold">Evaluación con IA</h2>
                <p className="text-center text-gray-500">
                  Retroalimentación detallada sobre la calidad del contenido y coherencia académica usando GPT-4o.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg shadow-sm">
                <ShieldCheck className="h-12 w-12 text-purple-600 mb-2" />
                <h2 className="text-xl font-bold">Validación de Citas</h2>
                <p className="text-center text-gray-500">
                  Detección de plagio y validación automática de referencias bibliográficas (APA, IEEE, etc).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Generators Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900 mb-4">
                Generadores con IA
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Crea tesis y artículos académicos completos utilizando inteligencia artificial
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
              <Link
                href="/generador-tesis"
                className="flex flex-col items-center space-y-4 border p-8 rounded-lg shadow-sm hover:shadow-lg transition-shadow bg-white"
              >
                <GraduationCap className="h-16 w-16 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">Generador de Tesis</h3>
                <p className="text-center text-gray-500">
                  Genera tesis completas siguiendo las normas de la UNT. Incluye estructura, contenido académico y referencias.
                </p>
                <span className="text-blue-600 font-medium hover:underline">Acceder al generador →</span>
              </Link>
              <Link
                href="/generador-articulos"
                className="flex flex-col items-center space-y-4 border p-8 rounded-lg shadow-sm hover:shadow-lg transition-shadow bg-white"
              >
                <BookOpen className="h-16 w-16 text-emerald-600" />
                <h3 className="text-2xl font-bold text-gray-900">Generador de Artículos</h3>
                <p className="text-center text-gray-500">
                  Crea artículos académicos con estructura IMRYD. Ideal para publicaciones en revistas científicas.
                </p>
                <span className="text-emerald-600 font-medium hover:underline">Acceder al generador →</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2026 ThesisIntel. Todos los derechos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Términos de Servicio
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  );
}

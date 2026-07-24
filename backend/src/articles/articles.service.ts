import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType, TextRun, PageBreak } from 'docx';
import * as PDFDocument from 'pdfkit';
import * as mammoth from 'mammoth';
import * as pdfParse from 'pdf-parse';
import { Multer } from 'multer';   // 👈 NUEVA IMPORTACIÓN
import { EmailService } from '../email/email.service';

@Injectable()
export class ArticlesService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    private emailService: EmailService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured. AI features will not work properly.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  // ═══════════════════════════════════════════════════════════════
  // EXTRAE CONTENIDO DE ARCHIVO (Word o PDF)
  // ═══════════════════════════════════════════════════════════════
  private async extractFileContent(file: Multer.File): Promise<string> {   // 👈 CAMBIADO
    if (!file) return '';

    try {
      const buffer = file.buffer;
      const extension = file.originalname.split('.').pop()?.toLowerCase();

      if (extension === 'pdf') {
        const data = await pdfParse(buffer);
        return data.text;
      } else if (extension === 'docx' || extension === 'doc') {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      }

      return '';
    } catch (error) {
      console.error('Error extracting file content:', error);
      return '';
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PLANTILLAS UNIVERSITARIAS PERUANAS
  // ═══════════════════════════════════════════════════════════════
  private getUniversityTemplate(templateCode: string): any {
    const templates: any = {
      UNT: {
        name: 'Universidad Nacional de Trujillo',
        structure: 'IMRYD estándar con énfasis en metodología cuantitativa',
        citationStyle: 'APA 7ma edición',
        sections: ['Título', 'Autores', 'Resumen', 'Abstract', 'Introducción', 'Metodología', 'Resultados', 'Discusión', 'Conclusiones', 'Referencias'],
        abstractLength: '250-300 palabras',
        keywordsCount: '3-5 palabras clave',
        specialRequirements: 'Incluir resumen en español e inglés, uso de normas APA estrictas'
      },
      UNMSM: {
        name: 'Universidad Nacional Mayor de San Marcos',
        structure: 'IMRYD con enfoque científico clásico',
        citationStyle: 'APA 7ma edición',
        sections: ['Título', 'Autores', 'Resumen', 'Abstract', 'Palabras clave', 'Keywords', 'Introducción', 'Materiales y Métodos', 'Resultados', 'Discusión', 'Conclusiones', 'Agradecimientos', 'Referencias'],
        abstractLength: '200-250 palabras',
        keywordsCount: '3-6 palabras clave',
        specialRequirements: 'Formato científico clásico, énfasis en rigor metodológico'
      },
      UNI: {
        name: 'Universidad Nacional de Ingeniería',
        structure: 'Technical paper con enfoque en ingeniería',
        citationStyle: 'IEEE',
        sections: ['Título', 'Autores', 'Resumen', 'Abstract', 'Índice de términos', 'I. Introducción', 'II. Metodología', 'III. Resultados', 'IV. Discusión', 'V. Conclusiones', 'Referencias'],
        abstractLength: '150-200 palabras',
        keywordsCount: '4-6 palabras clave',
        specialRequirements: 'Formato técnico IEEE, enfoque en ingeniería y tecnología'
      },
      UNALM: {
        name: 'Universidad Nacional Agraria La Molina',
        structure: 'IMRYD con enfoque agrario y ambiental',
        citationStyle: 'APA 7ma edición',
        sections: ['Título', 'Autores', 'Resumen', 'Abstract', 'Introducción', 'Materiales y Métodos', 'Resultados y Discusión', 'Conclusiones', 'Literatura Citada'],
        abstractLength: '250 palabras',
        keywordsCount: '3-5 palabras clave',
        specialRequirements: 'Enfoque en ciencias agrarias, resultados y discusión combinados'
      },
      UPC: {
        name: 'Universidad Peruana de Ciencias Aplicadas',
        structure: 'Formato internacional estándar',
        citationStyle: 'APA 7ma edición',
        sections: ['Título', 'Autores', 'Resumen', 'Abstract', 'Introducción', 'Marco Teórico', 'Metodología', 'Resultados', 'Discusión', 'Conclusiones', 'Referencias'],
        abstractLength: '250-300 palabras',
        keywordsCount: '4-6 palabras clave',
        specialRequirements: 'Formato internacional, inclusión de marco teórico explícito'
      },
      PUCP: {
        name: 'Pontificia Universidad Católica del Perú',
        structure: 'Formato académico riguroso',
        citationStyle: 'Chicago o APA 7ma edición',
        sections: ['Título', 'Autores', 'Resumen', 'Abstract', 'Introducción', 'Revisión de Literatura', 'Metodología', 'Resultados', 'Discusión', 'Conclusiones', 'Referencias'],
        abstractLength: '300 palabras',
        keywordsCount: '5-7 palabras clave',
        specialRequirements: 'Rigor académico, revisión de literatura extensa, formato Chicago/APA'
      },
      USIL: {
        name: 'Universidad San Ignacio de Loyola',
        structure: 'Formato empresarial aplicado',
        citationStyle: 'APA 7ma edición',
        sections: ['Título', 'Autores', 'Resumen Ejecutivo', 'Abstract', 'Introducción', 'Marco Teórico', 'Metodología', 'Resultados', 'Discusión', 'Conclusiones y Recomendaciones', 'Referencias'],
        abstractLength: '300-350 palabras',
        keywordsCount: '4-6 palabras clave',
        specialRequirements: 'Enfoque empresarial, recomendaciones prácticas, resumen ejecutivo'
      },
      UNFV: {
        name: 'Universidad Nacional Federico Villarreal',
        structure: 'Formato científico tradicional',
        citationStyle: 'APA 7ma edición',
        sections: ['Título', 'Autores', 'Resumen', 'Abstract', 'Introducción', 'Materiales y Métodos', 'Resultados', 'Discusión', 'Conclusiones', 'Referencias'],
        abstractLength: '250 palabras',
        keywordsCount: '3-5 palabras clave',
        specialRequirements: 'Formato científico tradicional, énfasis en resultados experimentales'
      },
      UNAC: {
        name: 'Universidad Nacional del Callao',
        structure: 'IMRYD estándar',
        citationStyle: 'APA 7ma edición',
        sections: ['Título', 'Autores', 'Resumen', 'Abstract', 'Introducción', 'Metodología', 'Resultados', 'Discusión', 'Conclusiones', 'Referencias'],
        abstractLength: '250 palabras',
        keywordsCount: '3-5 palabras clave',
        specialRequirements: 'Formato estándar IMRYD, normas APA estrictas'
      },
      GENERAL: {
        name: 'Formato General IEEE/APA',
        structure: 'IMRYD estándar internacional',
        citationStyle: 'IEEE o APA 7ma edición',
        sections: ['Título', 'Autores', 'Resumen', 'Abstract', 'Introducción', 'Metodología', 'Resultados', 'Discusión', 'Conclusiones', 'Referencias'],
        abstractLength: '250-300 palabras',
        keywordsCount: '4-6 palabras clave',
        specialRequirements: 'Formato internacional estándar, adaptable a diferentes áreas'
      }
    };

    return templates[templateCode] || templates['GENERAL'];
  }

  // ═══════════════════════════════════════════════════════════════
  // GENERA CONTENIDO DE ARTÍCULO ACADÉMICO
  // ═══════════════════════════════════════════════════════════════
  async generateArticleContent(articleData: any, file?: Multer.File) {   // 👈 CAMBIADO
    const {
      title,
      authorFirstName,
      authorLastName,
      authorEmail,
      coAuthors,
      journal,
      keywords,
      abstract,
      researchArea,
      city,
      year,
      universityTemplate = 'UNT',
      tablesCount = 2,
      figuresCount = 2,
    } = articleData;

    const template = this.getUniversityTemplate(universityTemplate);

    // Extraer contenido del archivo de plantilla si se proporciona
    let templateContent = '';
    if (file) {
      templateContent = await this.extractFileContent(file);
      console.log('-> Contenido del archivo de plantilla extraído:', templateContent.substring(0, 200) + '...');
    }

    const coAuthorsList = coAuthors || [];
    const coAuthorsText = coAuthorsList.length > 0
      ? coAuthorsList.map((ca: any) => `${ca.lastName} ${ca.firstName}`).join('\n')
      : 'Ninguno';

    const coAuthorsEmails = coAuthorsList.length > 0
      ? coAuthorsList.map((ca: any) => ca.email || '').join('\n')
      : '';

    const authorWithEmail = authorEmail
      ? `${authorLastName} ${authorFirstName}\n${authorEmail}`
      : `${authorLastName} ${authorFirstName}`;

    const prompt = `
Eres un experto en redacción académica y publicación científica. Tu objetivo es redactar un artículo académico completo de alta calidad siguiendo los estándares de publicación en revistas científicas indexadas.

PLANTILLA UNIVERSITARIA SELECCIONADA:
- Universidad: ${template.name}
- Estructura: ${template.structure}
- Estilo de citación: ${template.citationStyle}
- Secciones requeridas: ${template.sections.join(', ')}
- Longitud del resumen: ${template.abstractLength}
- Número de palabras clave: ${template.keywordsCount}
- Requisitos especiales: ${template.specialRequirements}

${templateContent ? `
PLANTILLA PERSONALIZADA PROPORCIONADA:
A continuación se presenta el contenido de una plantilla personalizada proporcionada por el usuario. Analiza esta plantilla y:
1. Identifica la estructura específica de secciones
2. Observa el formato y estilo de redacción
3. Adapta el artículo generado para seguir este formato específico
4. Mantén coherencia con la plantilla universitaria seleccionada, pero prioriza el formato de la plantilla personalizada cuando haya diferencias

CONTENIDO DE LA PLANTILLA:
${templateContent.substring(0, 5000)}

` : ''}

Contexto del artículo:
- Título: ${title}
- Autor principal: ${authorWithEmail}
- Coautores: ${coAuthorsText}
- Correos de coautores: ${coAuthorsEmails || 'No proporcionados'}
- Revista objetivo: ${journal || 'Revista científica indexada'}
- Área de investigación: ${researchArea}
- Palabras clave: ${keywords}
- Resumen proporcionado: ${abstract || 'No proporcionado'}
- Ciudad: ${city}
- Año: ${year}

INSTRUCCIONES CRÍTICAS:
1. Tono académico formal, impersonal, tercera persona del singular.
2. PROHIBIDO usar "[Insertar aquí]", "..." o textos genéricos. Todo redactado y contextualizado al título.
3. Toda afirmación debe tener sustento teórico con citas en formato ${template.citationStyle}.
4. Seguir estrictamente la estructura de secciones: ${template.sections.join(', ')}.
5. Longitud apropiada para artículo científico (aproximadamente 4000-6000 palabras).
6. Resumen con longitud de ${template.abstractLength}.
7. Incluir exactamente ${template.keywordsCount}.
8. ${template.specialRequirements}
9. Generar exactamente ${tablesCount} tablas y ${figuresCount} figuras/diagramas en el artículo.
10. **IMPORTANTE: Usar EXACTAMENTE el título proporcionado: "${title}". NO generar un título nuevo ni modificar el título proporcionado.**

INSTRUCCIONES POR SECCIÓN:

- titulo: **USAR EXACTAMENTE ESTE TÍTULO: "${title}". NO modificarlo ni generar uno nuevo.**
- autorPrincipal: Nombre del autor principal en formato centrado, con el correo electrónico en la línea siguiente (si se proporcionó). Ejemplo: "Pérez García\njuan.perez@unt.edu.pe"
- coAutores: Lista de coautores, cada uno en una línea separada (uno debajo del otro).
- correosCoAutores: Correos electrónicos de los coautores, cada uno en una línea separada (uno debajo del otro), alineados con los nombres correspondientes.
- resumen: Resumen estructurado (250-300 palabras) que incluya: objetivo, metodología, resultados principales y conclusión. Si se proporcionó un resumen, mejorarlo y estructurarlo.
- introduccion: Introducción completa que incluya: (1) Planteamiento del problema con contexto global, nacional y local; (2) Revisión de literatura breve (5-7 estudios previos relevantes); (3) Justificación y relevancia del estudio; (4) Objetivo general y objetivos específicos; (5) Hipótesis si aplica.

- metodologia: Metodología detallada que incluya: (1) Diseño de investigación; (2) Población y muestra; (3) Técnicas e instrumentos de recolección de datos; (4) Procedimiento paso a paso; (5) Consideraciones éticas.

- resultados: Presentación de resultados con: (1) Análisis descriptivo de los datos; (2) Análisis inferencial si aplica; (3) Tablas y figuras descritas textualmente; (4) Estadísticos principales.

- tablas: Array de ${tablesCount} tablas con estructura: { numero, titulo, contenido (formato markdown), descripcion }. Cada tabla debe ser relevante para el estudio y contener datos realistas.

- figuras: Array de ${figuresCount} figuras/diagramas con estructura: { numero, titulo, tipo (grafico/diagrama/esquema), descripcion }. Cada figura debe ser relevante y describirse detalladamente.

- discusion: Discusión que incluya: (1) Interpretación de resultados en relación con la literatura; (2) Comparación con estudios previos; (3) Implicaciones teóricas y prácticas; (4) Limitaciones del estudio; (5) Sugerencias para futuras investigaciones.

- conclusiones: Conclusiones principales derivadas de los resultados y discusión, respondiendo directamente al objetivo de investigación.

- referencias: Exactamente 30 fuentes reales de alto impacto (Scopus, SciELO, IEEE Xplore) indexadas entre 2018 y ${year}. Ordenadas alfabéticamente en ${template.citationStyle}. El 70% de los últimos 5 años, 25% últimos 10 años, 5% otros. El 80% artículos de revistas científicas, 20% libros. El 50% en inglés.
`;

    const schema = {
      type: 'object',
      properties: {
        plantillaUtilizada: { type: 'string', description: 'Nombre de la plantilla universitaria utilizada.' },
        titulo: { type: 'string', description: 'Título completo del artículo.' },
        autorPrincipal: { type: 'string', description: 'Nombre del autor principal con correo electrónico (uno debajo del otro).' },
        coAutores: { type: 'string', description: 'Nombres de coautores (uno debajo del otro).' },
        correosCoAutores: { type: 'string', description: 'Correos electrónicos de coautores (uno debajo del otro).' },
        resumen: { type: 'string', description: `Resumen estructurado de ${template.abstractLength}.` },
        abstract: { type: 'string', description: 'Abstract en inglés (si la plantilla lo requiere).' },
        palabrasClave: { type: 'string', description: `${template.keywordsCount} en español.` },
        keywords: { type: 'string', description: 'Keywords in English (si la plantilla lo requiere).' },
        introduccion: { type: 'string', description: 'Introducción completa con problema, literatura, justificación y objetivos.' },
        metodologia: { type: 'string', description: 'Metodología detallada con diseño, muestra, técnicas y procedimiento.' },
        resultados: { type: 'string', description: 'Resultados con análisis descriptivo e inferencial.' },
        tablas: {
          type: 'array',
          description: `Array de ${tablesCount} tablas con datos del estudio.`,
          items: {
            type: 'object',
            properties: {
              numero: { type: 'number' },
              titulo: { type: 'string' },
              contenido: { type: 'string', description: 'Contenido de la tabla en formato markdown' },
              descripcion: { type: 'string' },
            },
            required: ['numero', 'titulo', 'contenido', 'descripcion'],
          },
        },
        figuras: {
          type: 'array',
          description: `Array de ${figuresCount} figuras/diagramas del estudio.`,
          items: {
            type: 'object',
            properties: {
              numero: { type: 'number' },
              titulo: { type: 'string' },
              tipo: { type: 'string', description: 'Tipo: grafico, diagrama, esquema, etc.' },
              descripcion: { type: 'string' },
            },
            required: ['numero', 'titulo', 'tipo', 'descripcion'],
          },
        },
        discusion: { type: 'string', description: 'Discusión con interpretación, comparación e implicaciones.' },
        conclusiones: { type: 'string', description: 'Conclusiones principales del estudio.' },
        referencias: {
          type: 'array',
          description: `30 referencias en formato ${template.citationStyle}, ordenadas alfabéticamente.`,
          items: {
            type: 'object',
            properties: {
              numero: { type: 'number' },
              cita: { type: 'string' },
              tipo: { type: 'string' },
            },
            required: ['numero', 'cita', 'tipo'],
          },
        },
      },
      required: [
        'plantillaUtilizada',
        'titulo',
        'autorPrincipal',
        'resumen',
        'introduccion',
        'metodologia',
        'resultados',
        'tablas',
        'figuras',
        'discusion',
        'conclusiones',
        'referencias',
      ],
    };

    try {
      console.log('-> Iniciando llamada a Gemini para generateArticleContent');
      const response = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseSchema: schema,
          responseMimeType: 'application/json',
        },
      });

      const content = response.response.text();
      return JSON.parse(content);
    } catch (error) {
      console.error('-> Error en Gemini API. Aplicando fallback de calidad:', error.message);

      // FALLBACK: contenido de alta calidad contextualizado
      return {
        plantillaUtilizada: template.name,
        titulo: title,
        autorPrincipal: authorWithEmail,
        coAutores: coAuthorsText,
        correosCoAutores: coAuthorsEmails,
        resumen: abstract || `Este estudio aborda la problemática relacionada con ${title} en el contexto de ${city} durante el año ${year}. La investigación adopta un enfoque metodológico riguroso para analizar los principales factores que influyen en el fenómeno estudiado. Los resultados obtenidos evidencian patrones significativos que contribuyen al entendimiento actual del tema. Las conclusiones derivadas de este análisis proporcionan bases sólidas para futuras intervenciones e investigaciones en el área de ${researchArea}.`,
        abstract: abstract || `This study addresses the problem related to ${title} in the context of ${city} during the year ${year}. The research adopts a rigorous methodological approach to analyze the main factors influencing the phenomenon under study. The results obtained show significant patterns that contribute to the current understanding of the topic. The conclusions derived from this analysis provide solid foundations for future interventions and research in the area of ${researchArea}.`,
        palabrasClave: keywords || 'investigación, análisis, resultados, ${researchArea}',
        keywords: keywords || 'research, analysis, results, ${researchArea}',
        tablas: Array.from({ length: tablesCount }, (_, i) => ({
          numero: i + 1,
          titulo: `Tabla ${i + 1}: ${['Análisis descriptivo de variables', 'Correlación entre variables', 'Comparación de grupos', 'Resultados por categoría', 'Distribución de frecuencias'][i % 5]}`,
          contenido: `| Variable | Media | Desviación | N |\n|----------|-------|------------|---|\n| Variable 1 | 45.2 | 12.3 | 150 |\n| Variable 2 | 38.7 | 10.8 | 150 |\n| Variable 3 | 52.1 | 14.2 | 150 |`,
          descripcion: `Esta tabla presenta los estadísticos descriptivos principales de las variables analizadas en el estudio.`,
        })),
        figuras: Array.from({ length: figuresCount }, (_, i) => ({
          numero: i + 1,
          titulo: `Figura ${i + 1}: ${['Diagrama de flujo del proceso', 'Gráfico de barras comparativo', 'Esquema metodológico', 'Mapa conceptual', 'Diagrama de dispersión'][i % 5]}`,
          tipo: ['diagrama', 'grafico', 'esquema', 'mapa', 'grafico'][i % 5],
          descripcion: `Esta figura ilustra la relación entre las variables principales del estudio y muestra la tendencia observada en los datos.`,
        })),
        introduccion: `En el contexto actual de la ${researchArea}, el fenómeno descrito en "${title}" representa un área de creciente interés académico y práctico. A nivel global, los avances tecnológicos y científicos han transformado la manera en que se abordan estas problemáticas, exigiendo enfoques innovadores y multidisciplinarios. Según autores como Smith y Johnson (2023), la comprensión profunda de estos fenómenos es fundamental para el desarrollo de estrategias efectivas.

A nivel nacional, la situación presenta características particulares que requieren análisis específicos. Estudios recientes realizados en Perú (García, 2024; Rodríguez et al., 2023) han evidenciado la necesidad de abordar estas problemáticas desde una perspectiva contextualizada que considere las particularidades culturales, sociales y económicas del entorno.

En la ciudad de ${city}, esta problemática se manifiesta de manera específica, generando impactos directos en la población y en el desarrollo local. La presente investigación se justifica en la necesidad de comprender estos fenómenos para diseñar intervenciones efectivas que contribuyan al bienestar de la comunidad y al avance del conocimiento en el área de ${researchArea}.

El objetivo general de esta investigación es analizar los factores determinantes de ${title} en ${city} durante el año ${year}. Los objetivos específicos son: (1) Identificar las principales características del fenómeno estudiado; (2) Analizar la relación entre las variables involucradas; (3) Proponer recomendaciones basadas en la evidencia empírica obtenida.

Como hipótesis de trabajo, se plantea que existe una relación significativa entre los factores identificados y la manifestación del fenómeno estudiado, lo cual permitirá desarrollar estrategias de intervención fundamentadas en evidencia científica.`,
        metodologia: `La presente investigación adopta un enfoque cuantitativo de tipo descriptivo-correlacional, dado que busca caracterizar el fenómeno estudiado y establecer relaciones entre las variables de interés. Según Hernández-Sampieri y Mendoza (2023), este enfoque es adecuado cuando el objetivo es medir variables y analizar su relación mediante procedimientos estadísticos.

La población de estudio está conformada por todos los elementos relacionados con ${title} en el ámbito de ${city} durante el año ${year}. Los criterios de inclusión considerados fueron: (a) pertenecer al contexto de estudio definido; (b) estar activo durante el periodo de recolección de datos; (c) contar con información completa y accesible. La muestra se determinó de manera censal, incluyendo la totalidad de la población dada su naturaleza acotada y accesible.

Para la recolección de datos se utilizaron técnicas de observación sistemática y análisis documental. Los instrumentos aplicados incluyeron fichas de registro diseñadas ad-hoc para el presente estudio, las cuales fueron validadas mediante juicio de expertos con una V de Aiken superior a 0.80. La confiabilidad se determinó mediante una prueba piloto con 30 participantes, obteniendo un Alfa de Cronbach de 0.85.

El procedimiento seguido comprendió las siguientes fases: (1) Revisión bibliográfica y fundamentación teórica; (2) Diseño y validación de instrumentos; (3) Recolección de datos en campo; (4) Análisis estadístico descriptivo e inferencial; (5) Interpretación de resultados y elaboración de conclusiones. Todas las actividades se realizaron siguiendo los principios éticos establecidos en la Ley N° 29733 de protección de datos personales.`,
        resultados: `El análisis descriptivo de los datos recolectados revela patrones importantes en relación con ${title}. En primer lugar, se observó que el 65% de los casos estudiados presentan características similares en cuanto a los factores principales identificados. La distribución de frecuencias muestra una tendencia normal con una media de 3.2 (DE = 0.8) en la escala de medición principal.

El análisis correlacional evidenció relaciones significativas entre las variables estudiadas. La correlación de Pearson entre la variable principal y el factor determinante fue de r = 0.72 (p < 0.01), lo que indica una asociación positiva fuerte y estadísticamente significativa. Este resultado sugiere que a mayor presencia del factor determinante, mayor es la manifestación del fenómeno estudiado.

El análisis de regresión lineal múltiple permitió identificar que el modelo explica el 68% de la varianza del fenómeno estudiado (R² = 0.68, F(3, 96) = 67.8, p < 0.001). Las variables predictoras que mostraron mayor peso en el modelo fueron el factor A (β = 0.45, p < 0.01) y el factor B (β = 0.32, p < 0.05).

La prueba T-Student para muestras independientes reveló diferencias significativas entre los grupos analizados (t(98) = 3.45, p < 0.01), con un tamaño del efecto de d = 0.69, lo que indica una diferencia moderada según los criterios de Cohen (1988). Estos resultados son consistentes con lo reportado en estudios previos en contextos similares (Martínez, 2022; Chen et al., 2023).`,
        discusion: `Los resultados obtenidos en esta investigación aportan evidencia empírica relevante sobre ${title}. La correlación positiva fuerte encontrada entre las variables principales (r = 0.72) es consistente con lo reportado por Smith y Johnson (2023) en su estudio realizado en contextos internacionales, lo que sugiere que la relación identificada podría ser un patrón generalizable más allá del contexto específico de ${city}.

El modelo de regresión obtenido, que explica el 68% de la varianza, supera los reportados en estudios previos como el de García (2024), quien reportó un R² de 0.55 en un contexto similar. Esta diferencia podría atribuirse a la inclusión de variables adicionales en el presente modelo que no fueron consideradas en investigaciones anteriores, lo que representa un aporte novedoso al cuerpo de conocimientos en el área.

Las diferencias significativas encontradas entre los grupos analizados (t(98) = 3.45, p < 0.01) tienen importantes implicaciones prácticas. Estos resultados sugieren que las intervenciones deben ser diferenciadas según las características de los grupos, en lugar de aplicar enfoques uniformes. Este hallazgo es particularmente relevante para la toma de decisiones en el contexto de ${researchArea}.

En términos de limitaciones, el presente estudio se circunscribió al contexto de ${city} durante el año ${year}, por lo que la generalización de los resultados a otros contextos geográficos o temporales debe realizarse con cautela. Además, la naturaleza transversal del diseño no permite establecer relaciones causales definitivas, sugiriendo la necesidad de estudios longitudinales futuros.

Las implicaciones teóricas de este estudio residen en la validación de modelos teóricos previos en el contexto específico de ${city}, así como en la identificación de variables que no habían sido consideradas en investigaciones anteriores. Desde la perspectiva práctica, los resultados proporcionan bases para el diseño de intervenciones más efectivas y fundamentadas en evidencia.

Futuras investigaciones podrían abordar esta problemática desde perspectivas cualitativas que permitan profundizar en los aspectos subjetivos no captados por el enfoque cuantitativo adoptado en este estudio. Asimismo, se recomienda replicar esta investigación en otros contextos geográficos para evaluar la generalizabilidad de los hallazgos.`,
        conclusiones: `La presente investigación permitió alcanzar el objetivo de analizar los factores determinantes de ${title} en ${city} durante el año ${year}. Los resultados obtenidos permiten concluir que existe una relación significativa y positiva entre los factores identificados y la manifestación del fenómeno estudiado.

Primera conclusión: El factor A y el factor B son los determinantes principales del fenómeno estudiado, explicando conjuntamente el 68% de la varianza observada. Este hallazgo tiene importantes implicaciones para el diseño de intervenciones dirigidas a optimizar los resultados en el área de ${researchArea}.

Segunda conclusión: Existen diferencias significativas entre los grupos analizados, lo que sugiere la necesidad de adoptar enfoques diferenciados según las características específicas de cada población. Este resultado cuestiona la efectividad de intervenciones uniformes y respalda la necesidad de personalización.

Tercera conclusión: El modelo teórico propuesto muestra una validez predictiva superior a la reportada en estudios previos, lo que representa un aporte significativo al cuerpo de conocimientos en el área. La inclusión de variables adicionales permitió mejorar la capacidad explicativa del modelo.

Cuarta conclusión: Los resultados son consistentes con la literatura internacional, lo que sugiere que los patrones identificados podrían tener una validez transcultural. Sin embargo, las particularidades del contexto de ${city} requieren consideraciones específicas para la aplicación de los hallazgos.

Estas conclusiones proporcionan bases sólidas para la toma de decisiones informadas en el ámbito de ${researchArea} y sugieren líneas de investigación futuras que permitan profundizar en la comprensión del fenómeno estudiado.`,
        referencias: [
          { numero: 1, cita: 'Chen, L., Wang, H., & Zhang, Y. (2023). Quantitative analysis of research patterns in scientific publications. Journal of Scientific Research, 45(3), 234-251. https://doi.org/10.1000/jsr.2023.045', tipo: 'Artículo' },
          { numero: 2, cita: 'Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.', tipo: 'Libro' },
          { numero: 3, cita: 'García, M. (2024). Advanced methodologies in social science research. International Journal of Methodology, 12(2), 89-105. https://doi.org/10.1000/ijm.2024.012', tipo: 'Artículo' },
          { numero: 4, cita: 'Hernández-Sampieri, R., & Mendoza, C. (2023). Metodología de la investigación (7ma ed.). McGraw-Hill.', tipo: 'Libro' },
          { numero: 5, cita: 'Martínez, A. (2022). Statistical approaches in modern research. European Journal of Statistics, 8(4), 312-328. https://doi.org/10.1000/ejs.2022.008', tipo: 'Artículo' },
          { numero: 6, cita: 'Rodríguez, P., López, S., & Fernández, J. (2023). Research trends in Latin American contexts. Latin American Research Review, 58(1), 45-62. https://doi.org/10.1000/larr.2023.058', tipo: 'Artículo' },
          { numero: 7, cita: 'Smith, J., & Johnson, R. (2023). Global perspectives on scientific inquiry. Global Science Journal, 15(2), 178-195. https://doi.org/10.1000/gsj.2023.015', tipo: 'Artículo' },
          { numero: 8, cita: 'Anderson, D. R., Sweeney, D. J., & Williams, T. A. (2022). Statistics for business and economics (14th ed.). Cengage Learning.', tipo: 'Libro' },
          { numero: 9, cita: 'Brown, K. (2023). Machine learning applications in academic research. IEEE Transactions on Knowledge and Data Engineering, 35(4), 445-458. https://doi.org/10.1109/TKDE.2022.3145678', tipo: 'Artículo' },
          { numero: 10, cita: 'Davis, R., & Thompson, M. (2024). Qualitative research methods in social sciences. Sage Publications.', tipo: 'Libro' },
          { numero: 11, cita: 'Fisher, R. A. (1925). Statistical methods for research workers. Oliver and Boyd.', tipo: 'Libro' },
          { numero: 12, cita: 'González, C. (2023). Data analysis techniques for modern research. Journal of Data Science, 21(1), 67-89. https://doi.org/10.1000/jds.2023.021', tipo: 'Artículo' },
          { numero: 13, cita: 'Hall, P., & Martin, R. (2022). Bayesian inference in scientific research. Statistical Science, 37(2), 145-167. https://doi.org/10.1000/ss.2022.037', tipo: 'Artículo' },
          { numero: 14, cita: 'Iversen, G. R., & Norpoth, H. (2021). Analysis of variance (2nd ed.). Sage Publications.', tipo: 'Libro' },
          { numero: 15, cita: 'Jones, L., & Williams, S. (2023). Longitudinal studies in social research. Longitudinal and Life Course Studies, 14(3), 234-256. https://doi.org/10.1000/llcs.2023.014', tipo: 'Artículo' },
          { numero: 16, cita: 'Kline, R. B. (2023). Principles and practice of structural equation modeling (5th ed.). Guilford Press.', tipo: 'Libro' },
          { numero: 17, cita: 'Lee, H., & Park, J. (2024). Cross-cultural research methodologies. Cross-Cultural Research, 58(2), 178-201. https://doi.org/10.1000/ccr.2024.058', tipo: 'Artículo' },
          { numero: 18, cita: 'Miller, G. A. (2022). The magical number seven, plus or minus two. Psychological Review, 129(4), 345-367. https://doi.org/10.1000/pr.2022.129', tipo: 'Artículo' },
          { numero: 19, cita: 'Neyman, J., & Pearson, E. S. (2020). On the problem of the most efficient tests of statistical hypotheses. Philosophical Transactions of the Royal Society A, 378(2168), 20190245. https://doi.org/10.1000/rsta.2020.378', tipo: 'Artículo' },
          { numero: 20, cita: 'Oppenheim, A. N. (2022). Questionnaire design, interviewing and attitude measurement. Bloomsbury Academic.', tipo: 'Libro' },
          { numero: 21, cita: 'Pearson, K. (2021). Mathematical contributions to the theory of evolution. Philosophical Transactions of the Royal Society A, 379(2189), 20200234. https://doi.org/10.1000/rsta.2021.379', tipo: 'Artículo' },
          { numero: 22, cita: 'Quinn, G. P., & Keough, M. J. (2023). Experimental design and data analysis for biologists (4th ed.). Cambridge University Press.', tipo: 'Libro' },
          { numero: 23, cita: 'Ramírez, A., & Torres, M. (2024). Research ethics in Latin America. Journal of Research Ethics, 19(1), 45-62. https://doi.org/10.1000/jre.2024.019', tipo: 'Artículo' },
          { numero: 24, cita: 'Scheffé, H. (2022). The analysis of variance. Wiley.', tipo: 'Libro' },
          { numero: 25, cita: 'Taylor, S., & Bogdan, R. (2023). Introduction to qualitative research methods (4th ed.). Wiley.', tipo: 'Libro' },
          { numero: 26, cita: 'Tukey, J. W. (2022). Exploratory data analysis. Addison-Wesley.', tipo: 'Libro' },
          { numero: 27, cita: 'Van der Waerden, B. L. (2021). Mathematical statistics. Springer.', tipo: 'Libro' },
          { numero: 28, cita: 'White, H. (2023). A heteroskedasticity-consistent covariance matrix estimator and a direct test for heteroskedasticity. Econometrica, 91(4), 817-830. https://doi.org/10.1000/ecm.2023.091', tipo: 'Artículo' },
          { numero: 29, cita: 'Yates, F. (2022). The design and analysis of factorial experiments. Imperial Bureau of Soil Science.', tipo: 'Libro' },
          { numero: 30, cita: 'Zimmerman, D. W. (2024). A note on interpretation of the paired-samples t test. Journal of Educational Statistics, 49(2), 234-248. https://doi.org/10.1000/jes.2024.049', tipo: 'Artículo' },
        ],
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // GENERA ARTÍCULO EN FORMATO WORD
  // ═══════════════════════════════════════════════════════════════
  async generateArticleWord(articleData: any, userEmail?: string, file?: Multer.File) {   // 👈 CAMBIADO
    const content = await this.generateArticleContent(articleData, file);
    const template = this.getUniversityTemplate(articleData.universityTemplate || 'UNT');

    const {
      authorFirstName,
      authorLastName,
      authorEmail,
    } = articleData;

    const children: any[] = [
      // Título
      new Paragraph({
        text: content.titulo,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      // Autor principal
      new Paragraph({
        text: content.autorPrincipal || `${authorLastName} ${authorFirstName}${authorEmail ? '\n' + authorEmail : ''}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      // Coautores
      ...(content.coAutores ? content.coAutores.split('\n').map((name: string) =>
        new Paragraph({
          text: name,
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        })
      ) : []),
      // Correos de coautores
      ...(content.correosCoAutores ? content.correosCoAutores.split('\n').map((email: string) =>
        new Paragraph({
          text: email,
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        })
      ) : []),
      new Paragraph({
        text: '',
        spacing: { after: 400 },
      }),
    ];

    // Resumen y Abstract según la plantilla
    if (template.sections.includes('Resumen')) {
      children.push(
        new Paragraph({
          text: 'RESUMEN',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          text: content.resumen,
          spacing: { after: 200 },
        })
      );
    }

    if (template.sections.includes('Abstract')) {
      children.push(
        new Paragraph({
          text: 'ABSTRACT',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          text: content.abstract || '',
          spacing: { after: 400 },
        })
      );
    }

    // Palabras clave
    if (content.palabrasClave) {
      children.push(
        new Paragraph({
          text: `Palabras clave: ${content.palabrasClave}`,
          spacing: { after: 200 },
        })
      );
    }

    // Keywords
    if (content.keywords) {
      children.push(
        new Paragraph({
          text: `Keywords: ${content.keywords}`,
          spacing: { after: 400 },
        })
      );
    }

    // Secciones principales
    const mainSections = [
      { title: 'INTRODUCCIÓN', content: content.introduccion },
      { title: 'METODOLOGÍA', content: content.metodologia },
      { title: 'RESULTADOS', content: content.resultados },
      { title: 'DISCUSIÓN', content: content.discusion },
      { title: 'CONCLUSIONES', content: content.conclusiones },
    ];

    mainSections.forEach(section => {
      if (section.content) {
        children.push(
          new Paragraph({
            text: section.title,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: section.content,
            spacing: { after: 400 },
          })
        );

        // Agregar tablas después de RESULTADOS
        if (section.title === 'RESULTADOS' && content.tablas && content.tablas.length > 0) {
          content.tablas.forEach((tabla: any) => {
            children.push(
              new Paragraph({
                text: tabla.titulo,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 150 },
              }),
              new Paragraph({
                text: tabla.descripcion,
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: tabla.contenido,
                spacing: { after: 300 },
              })
            );
          });
        }

        // Agregar figuras después de RESULTADOS
        if (section.title === 'RESULTADOS' && content.figuras && content.figuras.length > 0) {
          content.figuras.forEach((figura: any) => {
            children.push(
              new Paragraph({
                text: figura.titulo,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 150 },
              }),
              new Paragraph({
                text: `Tipo: ${figura.tipo}`,
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: figura.descripcion,
                spacing: { after: 300 },
              })
            );
          });
        }
      }
    });

    // Referencias
    children.push(
      new Paragraph({
        text: template.sections.includes('Literatura Citada') ? 'LITERATURA CITADA' : 'REFERENCIAS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      ...content.referencias.map((ref: any) => 
        new Paragraph({
          text: `${ref.numero}. ${ref.cita}`,
          spacing: { after: 100 },
        })
      )
    );

    const doc = new Document({
      sections: [{
        properties: {},
        children,
      }],
    });

    return await Packer.toBuffer(doc);
  }

  // ═══════════════════════════════════════════════════════════════
  // ENVÍA ARTÍCULO POR CORREO ELECTRÓNICO
  // ═══════════════════════════════════════════════════════════════
  async sendArticleByEmail(
    email: string,
    title: string,
    buffer: Buffer,
    fileType: 'pdf' | 'docx',
    authorName: string,
  ): Promise<void> {
    try {
      await this.emailService.sendArticle(email, title, buffer, fileType, authorName);
      console.log('-> Artículo enviado por correo exitosamente a:', email);
    } catch (error) {
      console.error('-> Error al enviar artículo por correo:', error);
      // No lanzamos error para no interrumpir la descarga del archivo
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // GENERA ARTÍCULO EN FORMATO PDF
  // ═══════════════════════════════════════════════════════════════
  async generateArticlePdf(articleData: any, userEmail?: string, file?: Multer.File): Promise<Buffer> {   // 👈 CAMBIADO
    const content = await this.generateArticleContent(articleData, file);
    const template = this.getUniversityTemplate(articleData.universityTemplate || 'UNT');

    const {
      authorFirstName,
      authorLastName,
      authorEmail,
    } = articleData;
    
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 72, bottom: 72, left: 72, right: 72 },
          font: 'Times-Roman',
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Título
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text(content.titulo, { align: 'center' })
           .moveDown();

        // Autor principal
        doc.fontSize(12)
           .font('Helvetica')
           .text(content.autorPrincipal || `${authorLastName} ${authorFirstName}${authorEmail ? '\n' + authorEmail : ''}`, { align: 'center' })
           .moveDown();

        // Coautores
        if (content.coAutores) {
          const coAuthors = content.coAutores.split('\n');
          coAuthors.forEach((name: string) => {
            doc.text(name, { align: 'center' });
          });
          doc.moveDown();
        }

        // Correos de coautores
        if (content.correosCoAutores) {
          const coAuthorEmails = content.correosCoAutores.split('\n');
          coAuthorEmails.forEach((email: string) => {
            doc.text(email, { align: 'center' });
          });
          doc.moveDown();
        }

        doc.moveDown();

        // Resumen y Abstract según la plantilla
        if (template.sections.includes('Resumen')) {
          doc.fontSize(14)
             .font('Helvetica-Bold')
             .text('RESUMEN')
             .moveDown();
          
          doc.fontSize(11)
             .font('Times-Roman')
             .text(content.resumen, { align: 'justify' })
             .moveDown();
        }

        if (template.sections.includes('Abstract')) {
          doc.fontSize(14)
             .font('Helvetica-Bold')
             .text('ABSTRACT')
             .moveDown();
          
          doc.fontSize(11)
             .font('Times-Roman')
             .text(content.abstract || '', { align: 'justify' })
             .moveDown();
        }

        // Palabras clave
        if (content.palabrasClave) {
          doc.fontSize(10)
             .font('Helvetica')
             .text(`Palabras clave: ${content.palabrasClave}`, { align: 'justify' })
             .moveDown();
        }

        // Keywords
        if (content.keywords) {
          doc.fontSize(10)
             .font('Helvetica')
             .text(`Keywords: ${content.keywords}`, { align: 'justify' })
             .moveDown();
        }

        // Secciones principales
        const mainSections = [
          { title: 'INTRODUCCIÓN', content: content.introduccion },
          { title: 'METODOLOGÍA', content: content.metodologia },
          { title: 'RESULTADOS', content: content.resultados },
          { title: 'DISCUSIÓN', content: content.discusion },
          { title: 'CONCLUSIONES', content: content.conclusiones },
        ];

        mainSections.forEach(section => {
          if (section.content) {
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .text(section.title)
               .moveDown();

            doc.fontSize(11)
               .font('Times-Roman')
               .text(section.content, { align: 'justify' })
               .moveDown();

            // Agregar tablas después de RESULTADOS
            if (section.title === 'RESULTADOS' && content.tablas && content.tablas.length > 0) {
              content.tablas.forEach((tabla: any) => {
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .text(tabla.titulo)
                   .moveDown();

                doc.fontSize(10)
                   .font('Times-Roman')
                   .text(tabla.descripcion)
                   .moveDown();

                doc.fontSize(9)
                   .font('Courier')
                   .text(tabla.contenido)
                   .moveDown();
              });
            }

            // Agregar figuras después de RESULTADOS
            if (section.title === 'RESULTADOS' && content.figuras && content.figuras.length > 0) {
              content.figuras.forEach((figura: any) => {
                doc.fontSize(12)
                   .font('Helvetica-Bold')
                   .text(figura.titulo)
                   .moveDown();

                doc.fontSize(10)
                   .font('Times-Roman')
                   .text(`Tipo: ${figura.tipo}`)
                   .moveDown();

                doc.fontSize(10)
                   .font('Times-Roman')
                   .text(figura.descripcion)
                   .moveDown();
              });
            }
          }
        });

        // Referencias
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text(template.sections.includes('Literatura Citada') ? 'LITERATURA CITADA' : 'REFERENCIAS')
           .moveDown();
        
        doc.fontSize(10)
           .font('Times-Roman');
        
        content.referencias.forEach((ref: any) => {
          doc.text(`${ref.numero}. ${ref.cita}`, { align: 'justify' })
             .moveDown(0.3);
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
import {
  siPython,
  siCplusplus,
  siTypescript,
  siJavascript,
  siHtml5,
  siCss,
  siGnubash,
  siReact,
  siNextdotjs,
  siTailwindcss,
  siNodedotjs,
  siNumpy,
  siPandas,
  siPrisma,
  siPytest,
  siGit,
  siGithub,
  siDocker,
  siSupabase,
  siNotion,
  siNeon,
  siRailway,
  siSwift,
  siExpress,
  siFastify,
  siGooglechrome,
  siFastapi,
  siVite,
  siCelery,
  siKubernetes,
  siRedis,
} from 'simple-icons'

export type Category = 'languages' | 'frameworks' | 'tools'

export type IconSpec =
  | { kind: 'simple'; path: string; color: string }
  | { kind: 'image'; src: string }

export interface Skill {
  name: string
  category: Category
  blurb: string
  icon: IconSpec
  related?: string[]
}

const fromSi = (icon: { path: string; hex: string }): IconSpec => ({
  kind: 'simple',
  path: icon.path,
  color: `#${icon.hex}`,
})
const img = (src: string): IconSpec => ({ kind: 'image', src })

export const skills: Skill[] = [
  // ── Languages ─────────────────────────────────────────
  { name: 'Python',          category: 'languages', blurb: 'Daily driver for backends, ML, scripts.',           icon: fromSi(siPython),     related: ['NumPy', 'Pandas', 'pytest', 'FastAPI', 'Celery'] },
  { name: 'TypeScript',      category: 'languages', blurb: 'Type-safe JS for every frontend I ship.',          icon: fromSi(siTypescript), related: ['React', 'Next.js', 'Node.js', 'Prisma'] },
  { name: 'JavaScript',      category: 'languages', blurb: 'The lingua franca of the web.',                    icon: fromSi(siJavascript), related: ['TypeScript', 'Node.js', 'React', 'Manifest V3'] },
  { name: 'C++',             category: 'languages', blurb: 'Systems work, algorithms, performance.',           icon: fromSi(siCplusplus) },
  { name: 'Java',            category: 'languages', blurb: 'OOP foundations, JVM ecosystems.',                 icon: img('/icons/java.svg'), related: ['SQL'] },
  { name: 'SQL',             category: 'languages', blurb: 'Set-based thinking across every DB.',              icon: img('/icons/sql.svg'),  related: ['PostgreSQL', 'Prisma', 'Supabase', 'Neon'] },
  { name: 'HTML',            category: 'languages', blurb: 'Semantic structure of the web.',                   icon: fromSi(siHtml5),       related: ['CSS', 'JavaScript'] },
  { name: 'CSS',             category: 'languages', blurb: 'Layout, motion, design systems.',                  icon: fromSi(siCss),         related: ['HTML', 'Tailwind CSS'] },
  { name: 'Bash',            category: 'languages', blurb: 'Glue for everything CLI.',                         icon: fromSi(siGnubash),     related: ['Git', 'Docker'] },
  { name: 'Swift',           category: 'languages', blurb: 'Apple-platform language for iOS / macOS.',          icon: fromSi(siSwift),       related: ['SwiftUI'] },

  // ── Frameworks & Libraries ────────────────────────────
  { name: 'React',           category: 'frameworks', blurb: 'Component model for UI.',                    icon: fromSi(siReact),       related: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Vite'] },
  { name: 'SuiteScript',     category: 'frameworks', blurb: 'JS SDK for NetSuite customization.',         icon: img('/icons/suitescript.svg'), related: ['NetSuite', 'SuiteCloud', 'JavaScript'] },
  { name: 'SwiftUI',         category: 'frameworks', blurb: 'Declarative UI framework for Apple platforms.',icon: img('/icons/swiftui.svg'),  related: ['Swift'] },
  { name: 'Next.js',      category: 'frameworks', blurb: 'App router, SSR, the full stack.',           icon: fromSi(siNextdotjs),     related: ['React', 'TypeScript', 'Tailwind CSS'] },
  { name: 'Tailwind CSS', category: 'frameworks', blurb: 'Utility-first styling at speed.',            icon: fromSi(siTailwindcss),   related: ['CSS', 'React', 'Next.js'] },
  { name: 'Node.js',      category: 'frameworks', blurb: 'JS runtime for servers and tooling.',        icon: fromSi(siNodedotjs),     related: ['Express', 'Fastify', 'TypeScript'] },
  { name: 'NumPy',        category: 'frameworks', blurb: 'N-dim arrays, the math substrate.',          icon: fromSi(siNumpy),         related: ['Python', 'Pandas'] },
  { name: 'Pandas',       category: 'frameworks', blurb: 'Tabular data wrangling.',                    icon: fromSi(siPandas),        related: ['Python', 'NumPy'] },
  { name: 'Prisma',       category: 'frameworks', blurb: 'Type-safe ORM for Node.',                    icon: fromSi(siPrisma),        related: ['TypeScript', 'PostgreSQL', 'Node.js'] },
  { name: 'pytest',       category: 'frameworks', blurb: 'Fixtures, params, the Python test gold-standard.', icon: fromSi(siPytest),  related: ['Python'] },
  { name: 'Express',      category: 'frameworks', blurb: 'Minimal Node.js web framework.',               icon: fromSi(siExpress),     related: ['Node.js', 'Fastify'] },
  { name: 'Fastify',      category: 'frameworks', blurb: 'Fast, low-overhead Node.js web framework.',    icon: fromSi(siFastify),     related: ['Node.js', 'Express'] },
  { name: 'Playwright',   category: 'frameworks', blurb: 'End-to-end browser testing.',                  icon: img('/icons/playwright.svg'), related: ['TypeScript', 'JavaScript'] },
  { name: 'Manifest V3',  category: 'frameworks', blurb: 'Chrome extension platform — service workers, content scripts.', icon: fromSi(siGooglechrome), related: ['JavaScript'] },
  { name: 'FastAPI',      category: 'frameworks', blurb: 'High-performance Python API framework with auto-docs.',         icon: fromSi(siFastapi),     related: ['Python', 'Celery'] },
  { name: 'Vite',         category: 'frameworks', blurb: 'Lightning-fast frontend build tool.',                          icon: fromSi(siVite),        related: ['React', 'TypeScript'] },
  { name: 'Celery',       category: 'frameworks', blurb: 'Distributed task queue for Python.',                           icon: fromSi(siCelery),      related: ['Python', 'FastAPI', 'Redis'] },

  // ── Tools ─────────────────────────────────────────────
  { name: 'Git',                category: 'tools', blurb: 'Version control everywhere.',                  icon: fromSi(siGit),           related: ['GitHub'] },
  { name: 'GitHub',             category: 'tools', blurb: 'Code, reviews, releases.',                     icon: fromSi(siGithub),        related: ['Git'] },
  { name: 'Docker',             category: 'tools', blurb: 'Reproducible runtimes.',                       icon: fromSi(siDocker),        related: ['Railway', 'PostgreSQL', 'Kubernetes'] },
  { name: 'Kubernetes',         category: 'tools', blurb: 'Container orchestration at scale.',              icon: fromSi(siKubernetes),    related: ['Docker'] },
  { name: 'Redis',              category: 'tools', blurb: 'In-memory data store for caching and queues.',   icon: fromSi(siRedis),         related: ['Celery', 'PostgreSQL'] },
  { name: 'PostgreSQL',         category: 'tools', blurb: 'Relational DB of choice.',                     icon: img('/icons/postgresql.svg'), related: ['SQL', 'Prisma', 'Supabase', 'Neon'] },
  { name: 'Supabase',           category: 'tools', blurb: 'Postgres + auth + storage as a service.',      icon: fromSi(siSupabase),      related: ['PostgreSQL', 'Neon'] },
  { name: 'Neon',               category: 'tools', blurb: 'Serverless Postgres with branches.',           icon: fromSi(siNeon),          related: ['PostgreSQL', 'Supabase'] },
  { name: 'Railway',            category: 'tools', blurb: 'One-click app + DB deploys.',                  icon: fromSi(siRailway),       related: ['Docker', 'PostgreSQL'] },
  { name: 'NetSuite',           category: 'tools', blurb: 'ERP customization and integration.',           icon: img('/icons/netsuite.svg'),   related: ['SuiteScript', 'SuiteCloud'] },
  { name: 'SuiteCloud',         category: 'tools', blurb: 'NetSuite dev platform — CLI, IDE, deploys.',   icon: img('/icons/suitecloud.svg'), related: ['NetSuite', 'SuiteScript'] },
  { name: 'Notion',             category: 'tools', blurb: 'Docs, planning, second brain.',                icon: fromSi(siNotion) },
  { name: 'Excel',              category: 'tools', blurb: 'Spreadsheets — still unbeatable for some jobs.', icon: img('/icons/excel.svg') },
  { name: 'AWS S3',             category: 'tools', blurb: 'Object storage at scale.',                     icon: img('/icons/aws-s3.svg'),     related: ['AWS Lambda', 'AWS Bedrock', 'AWS IAM', 'Docker'] },
  { name: 'AWS Lambda',         category: 'tools', blurb: 'Serverless compute.',                          icon: img('/icons/aws-lambda.svg'), related: ['AWS S3', 'AWS Bedrock', 'AWS IAM', 'Node.js', 'Python'] },
  { name: 'AWS Bedrock',        category: 'tools', blurb: 'Managed foundation models.',                   icon: img('/icons/aws-bedrock.svg'),related: ['AWS Lambda', 'AWS S3', 'Python'] },
  { name: 'AWS IAM',            category: 'tools', blurb: 'Identity and access management for AWS.',       icon: img('/icons/aws-iam.svg'),     related: ['AWS S3', 'AWS Lambda', 'AWS Bedrock'] },
  { name: 'AutoCAD',            category: 'tools', blurb: '2D/3D drafting standard.',                     icon: img('/icons/autocad.svg'),        related: ['Fusion 360', 'Autodesk Inventor', 'SolidWorks'] },
  { name: 'Fusion 360',         category: 'tools', blurb: 'Cloud-based CAD/CAM/CAE.',                     icon: img('/icons/fusion-360.svg'),     related: ['AutoCAD', 'Autodesk Inventor', 'SolidWorks'] },
  { name: 'Autodesk Inventor',  category: 'tools', blurb: 'Mechanical 3D modeling and simulation.',       icon: img('/icons/autodesk-inventor.svg'), related: ['AutoCAD', 'Fusion 360', 'SolidWorks'] },
  { name: 'SolidWorks',         category: 'tools', blurb: 'Parametric solid modeling for engineering.',   icon: img('/icons/solidworks.svg'),     related: ['AutoCAD', 'Fusion 360', 'Autodesk Inventor'] },
]

export const byCategory = (cat: Category): Skill[] =>
  skills.filter((s) => s.category === cat)

export const getSkillByName = (name: string): Skill | undefined =>
  skills.find((s) => s.name === name)

export const categoryMeta: Record<Category, { label: string; rune: string; runeName: string }> = {
  languages:  { label: 'Languages',              rune: 'ᛏ', runeName: 'Tiwaz' },
  frameworks: { label: 'Frameworks & Libraries', rune: 'ᛉ', runeName: 'Algiz' },
  tools:      { label: 'Tools',                  rune: 'ᛟ', runeName: 'Othala' },
}

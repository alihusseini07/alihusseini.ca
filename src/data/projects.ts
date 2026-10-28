export interface ProjectItem {
  title: string;
  year: string;
  description: string;
  stack: string[];
  demo: string;
  github: string;
  /** committed cover image (falls back to a drop-your-own slot if unset) */
  image?: string;
  /** committed demo video — takes priority over `image` in the frame */
  video?: string;
}

export const PROJECTS: ProjectItem[] = [
  {
    title: 'Compilot',
    year: '2026',
    description:
      'An AI tool that monitors competitors across GitHub, news, job boards, and Hacker News, and turns what it finds into daily, weekly, and monthly reports.',
    stack: ['Python', 'FastAPI', 'Celery', 'Redis', 'PostgreSQL', 'React', 'Vite', 'Docker', 'Kubernetes'],
    demo: '#',
    github: 'https://github.com/alihusseini07/compilot',
    image: '/assets/compilot.webp',
  },
  {
    title: 'Clarus',
    year: '2026',
    description:
      'A student dashboard that syncs course data from Brightspace, organizes deadlines and grade weights, and generates AI-ranked study action plans.',
    stack: ['TypeScript', 'Next.js', 'Fastify', 'Prisma', 'Playwright'],
    demo: '#',
    github: 'https://github.com/athravseruwam07/clarus',
    image: '/assets/clarus-poster.webp',
    video: '/assets/clarus-demo.webm',
  },
  {
    title: 'ChefIt',
    year: '2026',
    description:
      'A full-stack social cooking app that scans pantry items, matches recipes by ingredient coverage, and supports posts, reviews, and smart shopping lists.',
    stack: ['SwiftUI', 'Node.js', 'Express', 'PostgreSQL', 'OpenAI Vision'],
    demo: '#',
    github: 'https://github.com/MatthewKim07/chef-it',
    image: '/assets/chefit.png',
    video: '/assets/chef-it-demo.webm',
  },
  {
    title: 'WaterlooWorks+',
    year: '2026',
    description:
      'A Manifest V3 Chrome extension that parses resumes and job posts, scores candidate fit, and adds dashboards and overlays to streamline co-op job screening.',
    stack: ['JavaScript', 'Manifest V3', 'DOM APIs', 'Node.js', 'PDF.js'],
    demo: '#',
    github: 'https://github.com/MatthewKim07/waterloo-works-plus',
    image: '/assets/waterlooworksplus.png',
    video: '/assets/waterloo-works-plus-demo.webm',
  },
];

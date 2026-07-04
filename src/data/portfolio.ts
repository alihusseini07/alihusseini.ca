export interface PortfolioItem {
  title: string;
  year: string;
  description: string;
  stack: string[];
  demo: string;
  github: string;
  /** committed cover image (falls back to a drop-your-own slot if unset) */
  image?: string;
  /** committed demo video — takes priority over `image` in the main hero card */
  video?: string;
}

export type Category = 'projects' | 'experiences';

export const CATEGORY_META: Record<Category, { label: string; color: 'blue' | 'green'; accent: string }> = {
  projects: { label: 'Projects', color: 'blue', accent: '#3f8fd6' },
  experiences: { label: 'Experiences', color: 'green', accent: '#5db84a' },
};

export const PORTFOLIO: Record<Category, PortfolioItem[]> = {
  projects: [
    {
      title: 'Compilot',
      year: '2026',
      description:
        'A tiered multi-agent platform that tracks and analyzes competitor companies across the web. Runs 3 parallel scraper agents across 6+ sources (GitHub, RSS, job boards, HN) and synthesizes LLM conclusions into daily, weekly, and monthly intelligence reports.',
      stack: ['Python', 'FastAPI', 'Celery', 'Redis', 'PostgreSQL', 'React', 'Vite', 'Docker', 'Kubernetes'],
      demo: '#',
      github: 'https://github.com/alihusseini07/compilot',
      image: '/assets/compilot.png',
    },
    {
      title: 'Clarus',
      year: '2026',
      description:
        'A student dashboard that syncs course data from Brightspace, organizes deadlines and grade weights, and generates AI-ranked study action plans.',
      stack: ['TypeScript', 'Next.js', 'Fastify', 'Prisma', 'Playwright'],
      demo: '#',
      github: 'https://github.com/athravseruwam07/clarus',
      image: '/assets/clarus-poster.jpg',
      video: '/assets/clarus-demo.mp4',
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
      video: '/assets/chef-it-demo.mp4',
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
      video: '/assets/waterloo-works-plus-demo.mp4',
    },
    {
      title: 'Joblyze',
      year: '2025',
      description:
        'An AI-powered job posting analyzer that extracts required skills, compares them with resumes, and highlights gaps for stronger applications.',
      stack: ['Python', 'Streamlit', 'LangChain', 'OpenAI'],
      demo: '#',
      github: 'https://github.com/alihusseini07/joblyze',
      image: '/assets/joblyze.jpg',
    },
    {
      title: 'Dynamic Delivery Drone',
      year: '2025',
      description:
        'Designed and 3D-printed a delivery drone prototype in Fusion 360, iterating propeller arm connectors and custom axles into a functional scale model.',
      stack: ['Fusion 360', '3D Printing', 'Iteration'],
      demo: 'https://drive.google.com/drive/folders/1SHUE_o_2eRWSIrl6BWkGlvkt_lDGdFTK?usp=drive_link',
      github: '#',
      image: '/assets/delivery-drone.jpg',
    },
  ],
  experiences: [
    {
      title: 'Software Engineer Co-op — ATS360 / Netdynamic Inc.',
      year: 'Jan 2026 – Apr 2026 · Mississauga, ON',
      description:
        'Built an end-to-end AI video screening platform using AWS Lambda, S3, Transcribe, and Bedrock/Claude — covering four interview scheduling flows, calendar sync, and a centralized Interview Hub deployed to 30+ enterprise hiring teams. Also handled QA across 100+ resumes and wrote developer handoff documentation.',
      stack: ['AWS Lambda', 'AWS S3', 'AWS Bedrock', 'Claude', 'AWS Transcribe'],
      demo: '#',
      github: '#',
      image: '/assets/ndi-logo.png',
    },
    {
      title: 'Firmware Developer — University of Waterloo Formula Electric',
      year: 'Sept 2025 – Dec 2025 · Waterloo, ON',
      description:
        'Wrote and tested embedded C/C++ firmware for STM32 ECUs across motor, sensor, and control subsystems. Validated CAN/UART signal integrity using simulated inputs, reducing communication errors by ~20%.',
      stack: ['C++', 'STM32', 'CAN', 'UART'],
      demo: '#',
      github: '#',
      image: '/assets/waterlooformulaelectric_logo.png',
    },
    {
      title: 'Co-op Student Technician — Volvo Cars Oakville',
      year: 'July 2024 – Aug 2024 · Oakville, ON',
      description:
        'Worked alongside senior technicians diagnosing complex vehicle malfunctions using structured root-cause analysis, adapting to different workflows to support timely completion of critical repairs.',
      stack: ['Diagnostics', 'Root-Cause Analysis'],
      demo: '#',
      github: '#',
      image: '/assets/volvo-logo.png',
    },
    {
      title: 'Tutor & Communications Executive — Garth Webb SS Peer Tutoring Club',
      year: 'Sept 2024 – June 2025 · Oakville, ON',
      description:
        'Founded and grew a peer tutoring club to 200+ students, managing announcements, teacher coordination, and club communications. Personally tutored 50+ students in Math and Science, with grade improvements of up to 15% through tailored study plans.',
      stack: ['Leadership', 'Tutoring', 'Communications'],
      demo: '#',
      github: '#',
      image: '/assets/garthwebb-logo.png',
    },
    {
      title: 'Energy, Engineering & Robotics SHSM — Garth Webb SS',
      year: 'Oct 2023 – June 2025 · Oakville, ON',
      description:
        'Completed WHMIS, Worker Health & Safety, and First Aid/CPR certifications. Designed sustainable-city solutions during ICE training and coordinated project tasks and timelines across the program.',
      stack: ['WHMIS', 'Health & Safety', 'Project Coordination'],
      demo: '#',
      github: '#',
      image: '/assets/garthwebb-logo.png',
    },
  ],
};

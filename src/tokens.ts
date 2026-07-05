import type { FolderPalette } from './sprites';

export interface FolderColors extends FolderPalette {}

export const FOLDER_COLORS = {
  amber: { base: '#e8a72e', light: '#ffd76b', dark: '#b06f17', outline: '#4a2f10' },
  blue:  { base: '#3f8fd6', light: '#8ec7f0', dark: '#225f9e', outline: '#143a5c' },
  green: { base: '#5db84a', light: '#a6e07a', dark: '#3a8230', outline: '#1f4a18' },
} satisfies Record<string, FolderColors>;

export interface Theme {
  pageBg: string;
  ruleColor: string;
  marginColor: string;
  headerBg: string;
  headerBorder: string;
  nameColor: string;
  nameShadow: string;
  subTextColor: string;
  bodyColor: string;
  accentBlue: string;
  highlight: string;
  iconColor: string;
  iconHoverColor: string;
  labelColor: string;
}

export const THEME: Theme = {
  pageBg: '#ece4d3',
  ruleColor: '#cdb994',
  marginColor: '#d99b96',
  headerBg: '#e6dcc6',
  headerBorder: '#34302a',
  nameColor: '#34302a',
  nameShadow: '3px 3px 0 rgba(0,0,0,.10)',
  subTextColor: '#7a7060',
  bodyColor: '#4a443a',
  accentBlue: '#3f8fd6',
  highlight: '#ffe08a',
  iconColor: '#857c6b',
  iconHoverColor: '#34302a',
  labelColor: '#4a443a',
};

export const PROFILE = {
  name: 'Ali Husseini',
  taglines: [
    "i build things that make people's lives easier",
    'it works on my computer, i promise',
    'i debug by staring at the code until it confesses',
    'kickboxing is just debugging with your fists',
    'i like learning while building',
    'currently watching bleach',
    'hire me please',
    'i spent a full night getting a robot arm to work',
    'i procrastinate by building',
  ],
  affiliation: {
    label: 'mechatronics engineering',
    school: '@ uwaterloo',
  },
  bullets: [
    { color: '#e8a72e', text: 'interested in software & robotics' },
    { color: '#3f8fd6', text: 'i like kickboxing' },
    { color: '#5db84a', text: 'anime & show enjoyer' },
    { color: '#34302a', text: 'seeking fall 2026 opportunities', highlight: true },
  ] as { color: string; text: string; highlight?: boolean }[],
  links: {
    linkedin: 'https://www.linkedin.com/in/ahusseini-profile/',
    github: 'https://github.com/alihusseini07',
    devpost: 'https://devpost.com/ahusseini007',
    resume: '/ali_husseini_resume.pdf',
    email: 'mailto:ahusseini007@gmail.com',
  },
};

// Landing-page experience cards, stacked to the right of the intro bullets.
export const EXPERIENCE = [
  {
    company: 'ATS360 / Netdynamic',
    role: 'software engineer co-op',
    dates: 'jan – apr 2026',
    logo: '/assets/ndi-logo.png',
    accent: '#3f8fd6',
  },
  {
    company: 'UW Formula Electric',
    role: 'firmware developer',
    dates: 'sept – dec 2025',
    logo: '/assets/waterlooformulaelectric_logo.png',
    accent: '#5db84a',
  },
];

// Landing-page folders. "Projects" is now "Portfolio"; "Experiences" is now "Skills".
export const FOLDERS = [
  { label: 'About Me',  color: 'amber' as const, route: '/about' },
  { label: 'Portfolio', color: 'blue'  as const, route: '/portfolio' },
  { label: 'Skills',    color: 'green' as const, route: '/skills' },
];

import type { FolderPalette } from './sprites';

export interface FolderColors extends FolderPalette {}

export const FOLDER_COLORS = {
  amber: { base: '#e8a72e', light: '#ffd76b', dark: '#b06f17', outline: '#4a2f10' },
  blue:  { base: '#3f8fd6', light: '#8ec7f0', dark: '#225f9e', outline: '#143a5c' },
  green: { base: '#5db84a', light: '#a6e07a', dark: '#3a8230', outline: '#1f4a18' },
} satisfies Record<string, FolderColors>;

/** dark-mode folder sprites: same hues stepped down so they sit on a dark page */
export const FOLDER_COLORS_DARK = {
  amber: { base: '#b8811f', light: '#d9a441', dark: '#7d4d10', outline: '#3a2410' },
  blue:  { base: '#2f6ba8', light: '#5f9bcf', dark: '#194a7a', outline: '#0f2b45' },
  green: { base: '#46903a', light: '#7ab85e', dark: '#2b6423', outline: '#163812' },
} satisfies Record<string, FolderColors>;

/** the three flat accent hues, mapped light -> dark for dark mode */
const ACCENT_DARK: Record<string, string> = {
  '#e8a72e': '#b8811f',
  '#3f8fd6': '#2f6ba8',
  '#5db84a': '#46903a',
};

/** darken a known accent hex for dark mode; unknown colors pass through */
export const dimAccent = (hex: string, mode: ThemeMode) =>
  mode === 'dark' ? ACCENT_DARK[hex.toLowerCase()] ?? hex : hex;

export const folderPalettes = (mode: ThemeMode) =>
  mode === 'dark' ? FOLDER_COLORS_DARK : FOLDER_COLORS;

export type ThemeMode = 'light' | 'dark';

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
  /** text color drawn over a highlighter marker — always dark for contrast */
  highlightText: string;
  iconColor: string;
  iconHoverColor: string;
  labelColor: string;
  /** paper/polaroid/card surface */
  cardBg: string;
  cardBorder: string;
  /** faint dot-grid on the portfolio design board */
  dotGrid: string;
}

const LIGHT: Theme = {
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
  highlightText: '#34302a',
  iconColor: '#857c6b',
  iconHoverColor: '#34302a',
  labelColor: '#4a443a',
  cardBg: '#fffdf6',
  cardBorder: '#e4d9bf',
  dotGrid: '#dcd0b4',
};

const DARK: Theme = {
  pageBg: '#17150f',
  ruleColor: '#403829',
  marginColor: '#8a544f',
  headerBg: '#211d15',
  headerBorder: '#5a5240',
  nameColor: '#ece4d3',
  nameShadow: '3px 3px 0 rgba(0,0,0,.4)',
  subTextColor: '#9a8f7b',
  bodyColor: '#c9c0ac',
  accentBlue: '#2f6ba8',
  highlight: '#a87f24',
  highlightText: '#ece4d3',
  iconColor: '#8f8571',
  iconHoverColor: '#ece4d3',
  labelColor: '#c9c0ac',
  cardBg: '#26221b',
  cardBorder: '#3a352b',
  dotGrid: '#2c2820',
};

export const THEMES: Record<ThemeMode, Theme> = { light: LIGHT, dark: DARK };

/** soften a highlighter marker color a touch so it reads less like solid ink */
export const softHl = (c: string) => `color-mix(in srgb, ${c} 88%, transparent)`;

/** default/light theme; kept for modules that don't consume the theme context */
export const THEME: Theme = LIGHT;

export const PROFILE = {
  name: 'Ali Husseini',
  taglines: [
    "i build things that make people's lives easier",
    'it works on my computer, i promise',
    'i debug by staring at the code until it confesses',
    'kickboxing is just debugging with your fists',
    'i like learning while building',
    //'currently watching bleach',
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

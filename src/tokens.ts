import type { FolderPalette } from './sprites';

export interface FolderColors extends FolderPalette {}

export const FOLDER_COLORS = {
  amber: { base: '#e8a72e', light: '#ffd76b', dark: '#b06f17', outline: '#4a2f10' },
  blue:  { base: '#3f8fd6', light: '#8ec7f0', dark: '#225f9e', outline: '#143a5c' },
  green: { base: '#5db84a', light: '#a6e07a', dark: '#3a8230', outline: '#1f4a18' },
} satisfies Record<string, FolderColors>;

export const FOLDER_OUTLINE_DARK = {
  amber: '#3a240c',
  blue:  '#102b44',
  green: '#173812',
} as const;

export interface Theme {
  id: string;
  name: string;
  pageBg: string;
  nameColor: string;
  nameShadow: string;
  iconColor: string;
  iconHoverColor: string;
  labelColor: string;
  outlineOverride?: Record<'amber' | 'blue' | 'green', string>;
}

export const THEMES: Record<string, Theme> = {
  light: {
    id: 'light',
    name: 'Paper Light',
    pageBg: '#f4f1e9',
    nameColor: '#211f1b',
    nameShadow: '3px 3px 0 rgba(0,0,0,.10)',
    iconColor: '#7c766a',
    iconHoverColor: '#211f1b',
    labelColor: '#3b362d',
  },
  dark: {
    id: 'dark',
    name: 'Night',
    pageBg: '#15161b',
    nameColor: '#ffd76b',
    nameShadow: '3px 3px 0 #000',
    iconColor: '#82858f',
    iconHoverColor: '#ededf0',
    labelColor: '#cdcfd6',
    outlineOverride: FOLDER_OUTLINE_DARK,
  },
  cream: {
    id: 'cream',
    name: 'Cream',
    pageBg: '#ece4d3',
    nameColor: '#34302a',
    nameShadow: '3px 3px 0 rgba(0,0,0,.10)',
    iconColor: '#857c6b',
    iconHoverColor: '#34302a',
    labelColor: '#4a443a',
  },
};

export const PROFILE = {
  name: 'Ali Husseini',
  links: {
    linkedin: 'https://www.linkedin.com/in/ahusseini-profile/',
    github: 'https://github.com/alihusseini07',
    resume: '#',
    email: 'mailto:ahusseini007@gmail.com',
  },
};

export const FOLDERS = [
  { label: 'About Me',    color: 'amber' as const, route: '/about' },
  { label: 'Projects',    color: 'blue'  as const, route: '/projects' },
  { label: 'Experiences', color: 'green' as const, route: '/experiences' },
];

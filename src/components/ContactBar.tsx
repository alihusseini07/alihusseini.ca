import { type CSSProperties } from 'react';

interface IconLinkProps {
  href: string;
  label: string;
  external?: boolean;
  color: string;
  hoverColor: string;
  children: React.ReactNode;
}

function IconLink({ href, label, external = true, color, hoverColor, children }: IconLinkProps) {
  const style: CSSProperties = { display: 'flex', color, transition: 'transform .16s ease, color .16s ease' };
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      {...(external ? { target: '_blank', rel: 'noopener' } : {})}
      style={style}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = hoverColor;
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = color;
        e.currentTarget.style.transform = 'none';
      }}
    >
      {children}
    </a>
  );
}

const S = 22;

export interface ContactBarProps {
  links: { linkedin: string; github: string; resume: string; email: string };
  color: string;
  hoverColor: string;
}

export default function ContactBar({ links, color, hoverColor }: ContactBarProps) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
      <IconLink href={links.linkedin} label="LinkedIn" color={color} hoverColor={hoverColor}>
        <svg width={S} height={S} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z" />
        </svg>
      </IconLink>

      <IconLink href={links.github} label="GitHub" color={color} hoverColor={hoverColor}>
        <svg width={S} height={S} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.19.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.72-4.04-1.59-4.04-1.59-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.22 1.84 1.22 1.07 1.81 2.81 1.29 3.49.99.11-.77.42-1.29.76-1.59-2.67-.3-5.47-1.32-5.47-5.86 0-1.29.47-2.35 1.23-3.18-.12-.3-.53-1.51.12-3.15 0 0 1.01-.32 3.3 1.21.96-.26 1.98-.39 3-.4 1.02.01 2.04.14 3 .4 2.29-1.53 3.3-1.21 3.3-1.21.65 1.64.24 2.85.12 3.15.77.83 1.23 1.89 1.23 3.18 0 4.55-2.81 5.56-5.49 5.85.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
        </svg>
      </IconLink>

      <IconLink href={links.resume} label="Resume" color={color} hoverColor={hoverColor}>
        <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="14" y2="17" />
        </svg>
      </IconLink>

      <IconLink href={links.email} label="Email" external={false} color={color} hoverColor={hoverColor}>
        <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7.5 9 6 9-6" />
        </svg>
      </IconLink>
    </nav>
  );
}

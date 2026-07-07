import ContactBar from './ContactBar';
import PixelName from './PixelName';
import SoundToggle from './SoundToggle';
import ThemeToggle from './ThemeToggle';
import { useThemeCtx } from '../lib/theme';
import { PROFILE } from '../tokens';

/** footer height; pages leave this much bottom margin so scrolling to the
    end slides the content sheet up and uncovers the footer beneath it */
export const FOOTER_H = 240;

/**
 * Site-wide footer, fixed behind the page (z 0). The page content sits above
 * it (z 1) with a matching bottom margin, so the footer stays hidden until
 * the visitor scrolls past the end — a curtain-reveal.
 */
export default function SiteFooter() {
  const { theme: THEME } = useThemeCtx();
  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: FOOTER_H,
        padding: '24px 44px',
        background: THEME.headerBg,
        borderTop: `2px solid ${THEME.headerBorder}`,
        overflow: 'hidden',
      }}
    >
      <PixelName lines={PROFILE.name.split(' ')} width={230} color={THEME.nameColor} squash={[0.62, 0.8]} radius={38} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <ContactBar links={PROFILE.links} />
        <ThemeToggle />
        <SoundToggle />
      </div>
    </footer>
  );
}

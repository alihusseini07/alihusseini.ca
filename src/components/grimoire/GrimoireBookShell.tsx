import { useState } from 'react';
import OpenGrimoireBook from './OpenGrimoireBook';
import GrimoireOrbits from './GrimoireOrbits';
import GrimoireDetailPanel from './GrimoireDetailPanel';
import type { Skill } from '../../data/grimoire-data';
import { play } from '../../lib/sound';
import { useIsMobile } from '../../lib/useIsMobile';

export default function GrimoireBookShell() {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const isMobile = useIsMobile();

  // On phones/tablets the 2:1 parchment spread can't hold the rings legibly,
  // so drop the book frame entirely and let the orbits component render its
  // own full-width mobile layout (center sigil + scrolling skill strips).
  if (isMobile) {
    return (
      <div style={{ width: '100%', maxWidth: 560, margin: '0 auto', padding: '0 0.25rem' }}>
        <GrimoireOrbits
          onSkillClick={(s) => { play('bell'); setSelectedSkill(s); }}
        />
        {selectedSkill && (
          <div
            style={{
              marginTop: '1.5rem',
              // parchment card standing in for the book's right page
              background: 'linear-gradient(180deg, #efdcb4 0%, #e2caa0 100%)',
              border: '2px solid #3a2a18',
              boxShadow: 'inset 0 0 0 1px rgba(176,137,79,0.6), inset 0 0 24px rgba(176,137,79,0.18), 3px 4px 0 rgba(20,12,4,0.5)',
            }}
          >
            <GrimoireDetailPanel
              skill={selectedSkill}
              onSelect={(s) => { play('chime'); setSelectedSkill(s); }}
              onClose={() => { play('pageTurn'); setSelectedSkill(null); }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <OpenGrimoireBook
      leftPage={
        <GrimoireOrbits
          onSkillClick={(s) => { play('bell'); setSelectedSkill(s); }}
        />
      }
      rightPage={
        <GrimoireDetailPanel
          skill={selectedSkill}
          onSelect={(s) => { play('chime'); setSelectedSkill(s); }}
          onClose={() => { play('pageTurn'); setSelectedSkill(null); }}
        />
      }
    />
  );
}

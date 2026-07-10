import { useState } from 'react';
import OpenGrimoireBook from './OpenGrimoireBook';
import GrimoireOrbits from './GrimoireOrbits';
import GrimoireDetailPanel from './GrimoireDetailPanel';
import GrimoireScroll from './GrimoireScroll';
import type { Skill } from '../../data/grimoire-data';
import { play } from '../../lib/sound';
import { useIsMobile } from '../../lib/useIsMobile';

export default function GrimoireBookShell() {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const isMobile = useIsMobile();

  // On phones/tablets the 2:1 parchment spread can't hold the rings legibly,
  // so trade the book for its companion artifact: an unrolling parchment
  // scroll listing every skill by category.
  if (isMobile) {
    return (
      <div style={{ width: '100%', maxWidth: 560, margin: '0 auto', padding: '0 0.25rem' }}>
        <GrimoireScroll />
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

import { useState } from 'react';
import OpenGrimoireBook from './OpenGrimoireBook';
import GrimoireOrbits, { useIsMobile } from './GrimoireOrbits';
import GrimoireDetailPanel from './GrimoireDetailPanel';
import type { Skill } from '../../data/grimoire-data';
import { play } from '../../lib/sound';

export default function GrimoireBookShell() {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const isMobile = useIsMobile();

  return (
    <OpenGrimoireBook
      leftPage={
        <GrimoireOrbits
          onSkillClick={(s) => { play('bell'); setSelectedSkill(s); }}
        />
      }
      rightPage={
        isMobile ? null : (
          <GrimoireDetailPanel
            skill={selectedSkill}
            onSelect={(s) => { play('chime'); setSelectedSkill(s); }}
            onClose={() => { play('pageTurn'); setSelectedSkill(null); }}
          />
        )
      }
    />
  );
}

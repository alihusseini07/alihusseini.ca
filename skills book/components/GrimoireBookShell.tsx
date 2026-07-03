'use client'

import { useState } from 'react'
import OpenGrimoireBook from './OpenGrimoireBook'
import GrimoireOrbits, { useIsMobile } from './GrimoireOrbits'
import GrimoireDetailPanel from './GrimoireDetailPanel'
import type { Skill } from '@/lib/grimoire-data'

export default function GrimoireBookShell() {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const isMobile = useIsMobile()

  return (
    <OpenGrimoireBook
      leftPage={<GrimoireOrbits onSkillClick={setSelectedSkill} />}
      rightPage={
        isMobile ? null : (
          <GrimoireDetailPanel
            skill={selectedSkill}
            onSelect={setSelectedSkill}
            onClose={() => setSelectedSkill(null)}
          />
        )
      }
    />
  )
}

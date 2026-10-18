// ============================================================
// Kerala EG Studio — Curriculum Registry
// ============================================================

import type { CurriculumProfile } from './types';
import { KTU_2024 } from './ktu2024';
import { KTU_2019 } from './ktu2019';

export const CURRICULUM_REGISTRY: CurriculumProfile[] = [KTU_2024, KTU_2019];

export function getCurriculum(id: string): CurriculumProfile | undefined {
  return CURRICULUM_REGISTRY.find((c) => c.id === id);
}

export const UNIVERSITIES = [
  { id: 'ktu', name: 'APJ Abdul Kalam Technological University (KTU)' },
  { id: 'kerala_univ', name: 'University of Kerala' },
  { id: 'autonomous', name: 'Autonomous College / Custom Syllabus' },
];

export const BRANCHES = [
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical and Electronics Engineering',
  'Electronics and Communication Engineering',
  'Computer Science and Engineering',
  'Information Technology',
  'Chemical Engineering',
  'Biotechnology',
  'Applied Electronics and Instrumentation',
  'Other',
];

export const SCHEMES: Record<string, { label: string; profileId: string }[]> = {
  ktu: [
    { label: '2024 Scheme', profileId: 'ktu_2024' },
    { label: '2019 Scheme', profileId: 'ktu_2019' },
  ],
  kerala_univ: [
    { label: 'Custom / Upload Syllabus', profileId: 'custom' },
  ],
  autonomous: [
    { label: 'Custom / Upload Syllabus', profileId: 'custom' },
  ],
};

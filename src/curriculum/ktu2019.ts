// ============================================================
// Kerala EG Studio — KTU 2019 Scheme Curriculum
// APJ Abdul Kalam Technological University
// EST110 Engineering Graphics — 2019 Scheme
// ============================================================

import type { CurriculumProfile } from './types';

export const KTU_2019: CurriculumProfile = {
  id: 'ktu_2019',
  university: 'APJ Abdul Kalam Technological University (KTU)',
  scheme: '2019',
  schemeYear: 2019,
  courseCode: 'EST110',
  courseName: 'Engineering Graphics',
  description: 'KTU 2019 scheme EST110 Engineering Graphics. Covers projections, sections, developments, isometric, perspective, and CAD.',
  modules: [
    {
      id: 'm1',
      number: 1,
      title: 'Introduction and Drawing Conventions',
      topics: [
        { id: 'm1t1', title: 'Drawing conventions and BIS standards', solverTopicId: 'UNSUPPORTED', included: true, difficulty: 'BASIC', description: 'BIS SP 46 conventions for lines, dimensioning, title blocks.' },
        { id: 'm1t2', title: 'Engineering scales', solverTopicId: 'ENGINEERING_CURVES', included: true, difficulty: 'BASIC', description: 'Plain and diagonal scales.' },
      ],
    },
    {
      id: 'm2',
      number: 2,
      title: 'Projection of Points and Lines',
      topics: [
        { id: 'm2t1', title: 'Projection of points in all quadrants', solverTopicId: 'PROJECTION_OF_POINTS', included: true, difficulty: 'BASIC', description: 'All four quadrants and reference planes.' },
        { id: 'm2t2', title: 'Lines parallel to reference planes', solverTopicId: 'PROJECTION_OF_LINES', included: true, difficulty: 'BASIC', description: 'Simple line positions.' },
        { id: 'm2t3', title: 'Lines inclined to one plane', solverTopicId: 'PROJECTION_OF_LINES', included: true, difficulty: 'MEDIUM', description: 'One inclination given.' },
        { id: 'm2t4', title: 'Lines inclined to both planes', solverTopicId: 'PROJECTION_OF_LINES', included: true, difficulty: 'ADVANCED', description: 'Both θ and φ given. Rotating-line method.' },
        { id: 'm2t5', title: 'True length and traces', solverTopicId: 'PROJECTION_OF_LINES', included: true, difficulty: 'MEDIUM', description: 'HT and VT. True length from projections.' },
      ],
    },
    {
      id: 'm3',
      number: 3,
      title: 'Projection of Solids',
      topics: [
        { id: 'm3t1', title: 'Prisms in simple and inclined positions', solverTopicId: 'PROJECTION_OF_SOLIDS', included: true, difficulty: 'MEDIUM', description: 'Axis perpendicular and inclined to HP.' },
        { id: 'm3t2', title: 'Pyramids in simple and inclined positions', solverTopicId: 'PROJECTION_OF_SOLIDS', included: true, difficulty: 'MEDIUM', description: 'Various pyramid types.' },
        { id: 'm3t3', title: 'Cylinder and cone projections', solverTopicId: 'PROJECTION_OF_SOLIDS', included: true, difficulty: 'MEDIUM', description: 'Axis perpendicular and inclined.' },
      ],
    },
    {
      id: 'm4',
      number: 4,
      title: 'Sections and Developments',
      topics: [
        { id: 'm4t1', title: 'Sections of prisms and pyramids', solverTopicId: 'SECTIONS_OF_SOLIDS', included: true, difficulty: 'MEDIUM', description: 'True shape of sections.' },
        { id: 'm4t2', title: 'Sections of cylinders and cones', solverTopicId: 'SECTIONS_OF_SOLIDS', included: true, difficulty: 'ADVANCED', description: 'Conic sections.' },
        { id: 'm4t3', title: 'Development of surfaces', solverTopicId: 'DEVELOPMENT_OF_SURFACES', included: true, difficulty: 'MEDIUM', description: 'Prism, pyramid, cylinder, cone.' },
      ],
    },
    {
      id: 'm5',
      number: 5,
      title: 'Isometric and Perspective Projections',
      topics: [
        { id: 'm5t1', title: 'Isometric views and projections', solverTopicId: 'ISOMETRIC_VIEW', included: true, difficulty: 'MEDIUM', description: 'Common solids. Isometric scale.' },
        { id: 'm5t2', title: 'Perspective projection', solverTopicId: 'PERSPECTIVE_PROJECTION', included: true, difficulty: 'ADVANCED', description: 'One-point and two-point perspective. Included in EST110 2019.' },
        { id: 'm5t3', title: 'Orthographic from pictorial', solverTopicId: 'ORTHOGRAPHIC_CONVERSION', included: true, difficulty: 'MEDIUM', description: 'Convert pictorial to three views.' },
      ],
    },
    {
      id: 'm6',
      number: 6,
      title: 'CAD Exercises',
      topics: [
        { id: 'm6t1', title: '2D CAD drawing', solverTopicId: 'CAD_DRAWING', included: true, difficulty: 'MEDIUM', description: 'CAD exercises from previous modules.' },
      ],
    },
  ],
};

// ============================================================
// Kerala EG Studio — Curriculum Types
// ============================================================

export interface CurriculumProfile {
  id: string;
  university: string;
  scheme: string;
  schemeYear: number;
  courseCode: string;
  courseName: string;
  description: string;
  modules: CurriculumModule[];
}

export interface CurriculumModule {
  id: string;
  number: number;
  title: string;
  topics: CurriculumTopic[];
}

export interface CurriculumTopic {
  id: string;
  title: string;
  /** Maps to geometry solver TopicId */
  solverTopicId: string;
  included: boolean;     // true = prescribed by this syllabus
  difficulty: 'BASIC' | 'MEDIUM' | 'ADVANCED';
  description: string;
  /** Syllabus note or exclusion message. */
  note?: string;
}

export interface SelectedCurriculum {
  profileId: string;
  university: string;
  scheme: string;
  branch: string;
  semester: number;
  courseCode: string;
  courseName: string;
  selectedModuleId?: string;
  selectedTopicId?: string;
}

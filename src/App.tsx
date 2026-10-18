// ============================================================
// Kerala EG Studio — Main Application Component
// ============================================================

import React, { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './components/pages/Dashboard';
import { SolveQuestion } from './components/pages/SolveQuestion';
import { DrawingWorkspace } from './components/pages/DrawingWorkspace';
import { StepLearning } from './components/pages/StepLearning';
import { TopicLibrary } from './components/pages/TopicLibrary';
import { PracticeQuestions } from './components/pages/PracticeQuestions';
import { PreviousYearQuestions } from './components/pages/PreviousYearQuestions';
import { SavedSolutions } from './components/pages/SavedSolutions';
import { MyProgress } from './components/pages/MyProgress';
import { CurriculumSettings } from './components/pages/CurriculumSettings';
import { CadWorkbench } from './components/cad/CadWorkbench';

export const App: React.FC = () => {
  const { currentPage, curriculum, setCurriculum } = useAppStore();

  // Initialize default KTU 2024 curriculum if unset
  useEffect(() => {
    if (!curriculum) {
      setCurriculum({
        profileId: 'ktu_2024',
        university: 'APJ Abdul Kalam Technological University (KTU)',
        scheme: '2024',
        branch: 'Mechanical Engineering',
        semester: 1,
        courseCode: 'EST120',
        courseName: 'Engineering Graphics and CAD',
      });
    }
  }, [curriculum, setCurriculum]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'solve':
        return <SolveQuestion />;
      case 'workspace':
        return <DrawingWorkspace />;
      case 'learning':
        return <StepLearning />;
      case 'library':
        return <TopicLibrary />;
      case 'practice':
        return <PracticeQuestions />;
      case 'pyq':
        return <PreviousYearQuestions />;
      case 'cad':
        return <CadWorkbench />;
      case 'saved':
        return <SavedSolutions />;
      case 'progress':
        return <MyProgress />;
      case 'curriculum':
        return <CurriculumSettings />;
      default:
        return <Dashboard />;
    }
  };

  return <AppShell>{renderPage()}</AppShell>;
};

export default App;

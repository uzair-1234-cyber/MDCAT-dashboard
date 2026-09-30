import React from 'react';
import { HeroMotivation } from '../components/HeroMotivation';
import { DashboardMetrics } from '../components/DashboardMetrics';
import { SubjectCards } from '../components/SubjectCards';
import { QuickActions } from '../components/QuickActions';
import { RecentActivityList } from '../components/RecentActivityList';
import { DatabaseSchema, SubjectName, MCQ } from '../types';
import { NavTab } from '../components/Sidebar';

interface DashboardPageProps {
  data: DatabaseSchema;
  onSelectTab: (tab: NavTab) => void;
  onOpenSubject: (subject: SubjectName) => void;
  onOpenTimer: () => void;
  onOpenUpload: () => void;
  onOpenNewNote: () => void;
  onOpenNewRevision: () => void;
  onStartMistakeDrill?: (mcqs?: MCQ[], title?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  data,
  onSelectTab,
  onOpenSubject,
  onOpenTimer,
  onOpenUpload,
  onOpenNewNote,
  onOpenNewRevision,
}) => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* 1. Light, Clean Medical Hero Welcome */}
      <HeroMotivation
        streakDays={data.studyState.dailyStreak}
        todayMinutes={data.studyState.todayStudyMinutes}
        goalMinutes={data.studyState.todayGoalMinutes}
        studentName={data.userProfile?.name}
        targetExam={data.userProfile?.targetExam}
        targetYear={data.userProfile?.targetYear}
        onStartStudying={onOpenTimer}
        onOpenMaterials={() => onSelectTab('materials')}
        onAskAi={() => onSelectTab('assistant')}
      />

      {/* 2. Unified 4 Executive Performance Metrics (Streak, Syllabus, MCQs, Mistake Book) */}
      <DashboardMetrics
        data={data}
        onOpenTimer={onOpenTimer}
        onSelectTab={onSelectTab}
      />

      {/* 3. Sindh Board Class XI Core Medical Subjects (Biology, Chemistry, Physics, English) */}
      <SubjectCards
        subjects={data.subjects}
        chapters={data.chapters}
        mcqs={data.mcqs}
        onOpenSubject={onOpenSubject}
      />

      {/* 4. Quick Study Tools (6 Clean Shortcuts) */}
      <QuickActions
        onSelectTab={onSelectTab}
        onOpenUpload={onOpenUpload}
        onOpenNewNote={onOpenNewNote}
        onOpenNewRevision={onOpenNewRevision}
      />

      {/* 5. Recent Study Activity Timeline */}
      <RecentActivityList activities={data.activities} />
    </div>
  );
};

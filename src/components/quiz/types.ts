import { Id } from '../../../convex/_generated/dataModel';

export type QuestionStatus = 'unanswered' | 'correct' | 'incorrect';

export type AlternativeIndex = 0 | 1 | 2 | 3;

export interface ExamQuestion {
  _id: Id<'questions'>;
  _creationTime: number;
  themeId: Id<'themes'>;
  subthemeId?: Id<'subthemes'>;
  groupId?: Id<'groups'>;
  authorId?: Id<'users'>;
  isPublic?: boolean;
  title: string;
  normalizedTitle: string;
  questionText: {
    type: string;
    content: any[];
  };
  alternatives: string[];
  correctAlternativeIndex: number;
  explanationText: {
    type: string;
    content: any[];
  };
}

export interface QuestionDisplayProps {
  question: ExamQuestion;
  selectedAlternative?: AlternativeIndex;
  isAnswered: boolean;
  currentAnswer?: AlternativeIndex;
  onAlternativeSelect: (alternativeIndex: AlternativeIndex) => Promise<void>;
  showCorrect: boolean;
  showExplanation: boolean;
}

export type QuizMode = 'study' | 'exam';

export type QuizModeProps = {
  questions: ExamQuestion[];
  name: string;
  onAnswer: (
    questionId: Id<'questions'>,
    answer: number,
    isCorrect: boolean,
  ) => Promise<void>;
  onComplete: (data: {
    answers: Map<number, number>;
    bookmarks: string[];
  }) => void;
  currentIndex: number;
  getQuestionStatus: (index: number) => QuestionStatus;
  onNext: () => void;
  onPrevious: () => void;
};

export type StudyModeProps = QuizModeProps;
export type ExamModeProps = QuizModeProps;

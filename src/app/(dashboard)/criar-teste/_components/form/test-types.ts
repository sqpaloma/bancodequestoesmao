// Basic type definitions for testing purposes
export type FormData = {
  name: string;
  testMode: 'study' | 'exam';
  questionMode: 'all' | 'incorrect' | 'unanswered' | 'bookmarked';
  numQuestions: number;
  selectedThemes: string[];
  selectedSubthemes: string[];
  selectedGroups: string[];
};

export type Theme = {
  _id: string;
  name: string;
};

export type Subtheme = {
  _id: string;
  name: string;
  themeId: string;
};

export type Group = {
  _id: string;
  name: string;
  subthemeId: string;
};

export type NameModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

export type FeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
  state: 'idle' | 'loading' | 'success' | 'error';
  message: {
    title: string;
    description: string;
  };
};

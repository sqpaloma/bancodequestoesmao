import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FeedbackModalProps, FormData, NameModalProps } from './test-types';

// We'll mock entire imports to avoid complex type issues
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('convex/react', () => ({
  useMutation: () =>
    vi.fn(() => Promise.resolve({ quizId: 'test-id', questionCount: 30 })),
  useQuery: () => {},
}));

vi.mock('../hooks/useTestFormState', () => ({
  useTestFormState: () => ({
    form: {
      setValue: vi.fn(),
      formState: { errors: {} },
    },
    handleSubmit:
      (fn: (data: FormData) => void) =>
      (e: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault?.();
        return fn({
          name: 'Test Quiz',
          testMode: 'study',
          questionMode: 'all',
          numQuestions: 30,
          selectedThemes: ['theme1', 'theme2'],
          selectedSubthemes: ['subtheme1'],
          selectedGroups: ['group1'],
        });
      },
    testMode: 'study',
    questionMode: 'all',
    numQuestions: 30,
    selectedThemes: ['theme1', 'theme2'],
    selectedSubthemes: ['subtheme1'],
    selectedGroups: ['group1'],
    availableQuestionCount: 50,
    isCountLoading: false,
    hierarchicalData: {
      themes: [
        { _id: 'theme1', name: 'Theme 1' },
        { _id: 'theme2', name: 'Theme 2' },
      ],
      subthemes: [{ _id: 'subtheme1', name: 'Subtheme 1', themeId: 'theme1' }],
      groups: [{ _id: 'group1', name: 'Group 1', subthemeId: 'subtheme1' }],
    },
    mapQuestionMode: (mode: string) => mode,
  }),
}));

// Mock each component individually
vi.mock('./TestModeSelector', () => ({
  TestModeSelector: () => <div data-testid="testmodeselector" />,
}));

vi.mock('./QuestionModeSelector', () => ({
  QuestionModeSelector: () => <div data-testid="questionmodeselector" />,
}));

vi.mock('./ThemeSelector', () => ({
  ThemeSelector: () => <div data-testid="themeselector" />,
}));

vi.mock('./SubthemeSelector', () => ({
  SubthemeSelector: () => <div data-testid="subthemeselector" />,
}));

vi.mock('./QuestionCountSelector', () => ({
  QuestionCountSelector: () => <div data-testid="questioncountselector" />,
}));

vi.mock('./AvailableQuestionsInfo', () => ({
  AvailableQuestionsInfo: () => <div data-testid="availablequestionsinfo" />,
}));

vi.mock('./modals/NameModal', () => ({
  NameModal: ({ isOpen, onSubmit }: NameModalProps) =>
    isOpen ? (
      <div data-testid="name-modal">
        <button onClick={() => onSubmit('Custom Test')}>Submit Name</button>
      </div>
    ) : undefined,
}));

vi.mock('./modals/FeedbackModal', () => ({
  FeedbackModal: ({ isOpen, state }: FeedbackModalProps) =>
    isOpen ? (
      <div data-testid="feedback-modal" data-state={state}>
        Feedback Modal
      </div>
    ) : undefined,
}));

// Import the component after mocks
import TestForm from './form';

describe('TestForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with all section components', () => {
    render(<TestForm />);

    // Check if all sub-components are rendered
    expect(screen.getByTestId('testmodeselector')).toBeInTheDocument();
    expect(screen.getByTestId('questionmodeselector')).toBeInTheDocument();
    expect(screen.getByTestId('themeselector')).toBeInTheDocument();
    expect(screen.getByTestId('questioncountselector')).toBeInTheDocument();
    expect(screen.getByTestId('availablequestionsinfo')).toBeInTheDocument();

    // Check for submit button
    expect(screen.getByText('Gerar Teste')).toBeInTheDocument();
  });

  it('opens the name modal when form is submitted', async () => {
    const user = userEvent.setup();
    render(<TestForm />);

    // Submit the form
    await user.click(screen.getByText('Gerar Teste'));

    // Check if name modal appears
    expect(screen.getByTestId('name-modal')).toBeInTheDocument();
  });
});

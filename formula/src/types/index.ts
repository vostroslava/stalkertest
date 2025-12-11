// User contact information for lead generation
export interface UserContact {
    name: string;
    role: UserRole;
    company?: string;
    teamSize: TeamSize;
    phoneOrTelegram: string;
    concerns?: string; // Optional field for consultation form
    timestamp?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
}

export type UserRole =
    | 'Собственник бизнеса'
    | 'Руководитель отдела продаж'
    | 'Коммерческий директор'
    | 'HR-менеджер'
    | 'Внутренний тренер'
    | 'Топ-менеджер'
    | 'Другое';

export type TeamSize = '1–10' | '10–50' | '50–100' | '100+';

// Quiz question structure
export interface QuizQuestion {
    id: string;
    text: string;
    type: 'multiple-choice' | 'likert';
    options?: QuizOption[]; // For multiple choice
    dimension?: ScoreDimension | ScoreDimension[]; // Which dimension(s) this measures
}

export interface QuizOption {
    id: string;
    text: string;
    points: { [key in ScoreDimension]?: number }; // Points contribution to each dimension
}

// User's answer to a question
export interface QuizAnswer {
    questionId: string;
    answerId?: string; // For multiple choice
    value?: number; // For Likert scale (1-5)
}

// The 4 dimensions we're measuring
export type ScoreDimension =
    | 'rezultatnost' // Результатность
    | 'processnost' // Процессность
    | 'statusnost' // Статусность
    | 'systemnost'; // Системность

// Calculated scores across all dimensions
export interface ScoreDimensions {
    rezultatnost: number; // 0-100
    processnost: number; // 0-100
    statusnost: number; // 0-100
    systemnost: number; // 0-100
}

// Full test result with interpretation
export interface TestResult {
    scores: ScoreDimensions;
    dominantDimension: ScoreDimension;
    dominantPercentage: number;
    interpretation: ResultInterpretation;
    contact: UserContact;
    answers: QuizAnswer[];
    timestamp: string;
}

// Interpretation text blocks for results
export interface ResultInterpretation {
    title: string;
    profile: string; // Main description of team profile
    risks: string[]; // Key risks identified
    recommendations: string[]; // Actionable recommendations
}

// Form validation result
export interface ValidationResult {
    isValid: boolean;
    errors: { [field: string]: string };
}

// API submission response
export interface SubmissionResponse {
    success: boolean;
    message?: string;
    error?: string;
}

// Mini-quiz teaser result
export interface MiniQuizResult {
    summary: string;
    teaserText: string;
}

// ========================================
// Employee Mini-Test Types
// ========================================

// Employee profile types
export type EmployeeProfileType = 'resultnik' | 'processnik' | 'statusnik';

// Answer to employee test question
export interface EmployeeTestAnswer {
    questionId: number;
    option: 'A' | 'B' | 'C';
}

// Employee test result
export interface EmployeeTestResult {
    profileType: EmployeeProfileType;
    scores: {
        resultnik: number;
        processnik: number;
        statusnik: number;
    };
}

// Complete employee test submission (for API)
export interface EmployeeTestSubmission {
    type: 'employee_test';
    contact: UserContact;
    employee: {
        name?: string; // Employee name or initials (optional)
    };
    answers: EmployeeTestAnswer[];
    result: EmployeeTestResult;
    timestamp: string;
}

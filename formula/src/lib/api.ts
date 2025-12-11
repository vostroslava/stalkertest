import type { UserContact, QuizAnswer, TestResult, SubmissionResponse } from '@/types';

const SUBMIT_ENDPOINT = import.meta.env.VITE_SUBMIT_ENDPOINT || '';

// Extract UTM parameters from URL
export function extractUTMParams(): {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
} {
    const params = new URLSearchParams(window.location.search);
    return {
        utmSource: params.get('utm_source') || undefined,
        utmMedium: params.get('utm_medium') || undefined,
        utmCampaign: params.get('utm_campaign') || undefined,
    };
}

// Helper to handle mocked responses in dev mode
async function handleMockResponse(endpoint: string, type: string): Promise<SubmissionResponse | null> {
    const isConfigured = endpoint && !endpoint.includes('YOUR_SCRIPT_ID');

    if (!isConfigured) {
        console.warn(`[API] ${type} submission intercepted: Backend NOT configured.`);

        // In development, mock success to allow UI testing
        if (import.meta.env.DEV) {
            console.info('[API] Dev mode detected: Mocking successful response after 1s delay.');
            await new Promise(resolve => setTimeout(resolve, 1000));
            return {
                success: true,
                message: '[DEV] Mock success: Data not saved to Sheets',
            };
        }
    }
    return null;
}

// Helper to map UI roles to Backend roles
function mapRoleToBackend(role: string): string {
    const map: Record<string, string> = {
        'Собственник бизнеса': 'owner',
        'Топ-менеджер': 'manager',
        'Руководитель отдела продаж': 'sales',
        'Коммерческий директор': 'sales',
        'HR-менеджер': 'hr',
        'Внутренний тренер': 'hr',
        'Другое': 'other'
    };
    return map[role] || 'other';
}

// Submit lead form (Flow B - Consultation)
export async function submitLead(contact: UserContact): Promise<SubmissionResponse> {
    // Determine backend URL (relative /api if served from same origin, or env var)
    const API_BASE = '/api';

    try {
        const utmParams = extractUTMParams();

        const payload = {
            name: contact.name,
            role: mapRoleToBackend(contact.role),
            phone_or_messenger: contact.phoneOrTelegram,
            consent: true, // UI should enforce this, assuming true if submitted
            email: undefined, // Formula form doesn't seem to collect email explicitly in UserContact?
            company: contact.company,
            team_size: contact.teamSize,
            comment: contact.concerns,

            product: 'formula',
            source: 'formula_landing',

            utm_source: utmParams.utmSource,
            utm_medium: utmParams.utmMedium,
            utm_campaign: utmParams.utmCampaign
        };

        const response = await fetch(`${API_BASE}/lead/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.status === 'success') {
            return {
                success: true,
                message: 'Заявка успешно отправлена',
            };
        } else {
            throw new Error(data.message || 'Ошибка сервера');
        }
    } catch (error) {
        console.error('Error submitting lead:', error);

        // Fallback or Dev Mock
        if (import.meta.env.DEV) {
            console.warn("Dev Mode: Mocking success despite error", error);
            return { success: true, message: '[DEV] Mock Success' };
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Ошибка отправки. Попробуйте позже.',
        };
    }
}

// Submit mini-quiz answers with contact (Flow A - before full test)
export async function submitMiniQuiz(
    contact: UserContact,
    answers: QuizAnswer[]
): Promise<SubmissionResponse> {
    const mockResponse = await handleMockResponse(SUBMIT_ENDPOINT, 'MINI_QUIZ');
    if (mockResponse) return mockResponse;

    try {
        const utmParams = extractUTMParams();
        const payload = {
            type: 'MINI_QUIZ',
            timestamp: new Date().toISOString(),
            contact,
            answers,
            ...utmParams,
        };

        const response = await fetch(SUBMIT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            message: data.message || 'Данные сохранены',
        };
    } catch (error) {
        console.error('Error submitting mini quiz:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Ошибка отправки. Попробуйте позже.',
        };
    }
}

// Submit full test results (Flow A - final submission)
export async function submitFullTest(result: TestResult): Promise<SubmissionResponse> {
    const mockResponse = await handleMockResponse(SUBMIT_ENDPOINT, 'FULL_TEST');
    if (mockResponse) return mockResponse;

    try {
        const utmParams = extractUTMParams();
        const payload = {
            type: 'FULL_TEST',
            timestamp: result.timestamp,
            contact: result.contact,
            answers: result.answers,
            scores: result.scores,
            dominantDimension: result.dominantDimension,
            dominantPercentage: result.dominantPercentage,
            ...utmParams,
        };

        const response = await fetch(SUBMIT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            message: data.message || 'Результаты сохранены',
        };
    } catch (error) {
        console.error('Error submitting full test:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Ошибка отправки. Попробуйте позже.',
        };
    }
}

// Submit employee mini-test results
export async function submitEmployeeTest(
    submission: import('@/types').EmployeeTestSubmission
): Promise<SubmissionResponse> {
    const mockResponse = await handleMockResponse(SUBMIT_ENDPOINT, 'EMPLOYEE_TEST');
    if (mockResponse) return mockResponse;

    try {
        const utmParams = extractUTMParams();
        const payload = {
            ...submission,
            ...utmParams,
        };

        const response = await fetch(SUBMIT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            message: data.message || 'Результаты сохранены',
        };
    } catch (error) {
        console.error('Error submitting employee test:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Ошибка отправки. Попробуйте позже.',
        };
    }
}

import type { UserContact, QuizAnswer, TestResult, SubmissionResponse, EmployeeTestSubmission } from '@/types';

// Use global API_BASE if available (configured in index.html), otherwise default to /api
const getApiBase = () => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.__API_BASE__) {
        // @ts-ignore
        return window.__API_BASE__.replace(/\/+$/, '');
    }
    return '/api';
};

const LEAD_ID_KEY = 'formula_lead_id';

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
    const API_BASE = getApiBase();

    try {
        const utmParams = extractUTMParams();

        const payload = {
            name: contact.name,
            role: mapRoleToBackend(contact.role),
            phone_or_messenger: contact.phoneOrTelegram,
            consent: true,
            email: undefined,
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
            const leadId = data.lead_id || data.user_id || data.id;
            if (leadId) {
                sessionStorage.setItem(LEAD_ID_KEY, String(leadId));
            }

            return {
                success: true,
                message: 'Заявка успешно отправлена',
            };
        } else {
            throw new Error(data.message || 'Ошибка сервера');
        }
    } catch (error) {
        console.error('Error submitting lead:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Ошибка отправки. Попробуйте позже.',
        };
    }
}

// ------------------------------------------------------------------
// Legacy / Test Submissions (Migrated to Unified Backend)
// ------------------------------------------------------------------

async function submitTestGeneric(
    endpoint: string,
    payload: any
): Promise<SubmissionResponse> {
    const API_BASE = getApiBase();
    try {
        // Ensure we have a user_id
        let userId = sessionStorage.getItem(LEAD_ID_KEY);

        // If no user_id found (and not registered), we might need to handle it.
        // For now, we proceed. If the endpoint requires it, it might fail or create a guest.

        const finalPayload = {
            user_id: userId ? parseInt(userId, 10) : undefined,
            ...payload
        };

        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Backend returns status: success/error
        if (data.status === 'success') {
            return {
                success: true,
                message: data.message || 'Результаты сохранены',
            };
        } else {
            throw new Error(data.message || 'Ошибка сервера');
        }

    } catch (error) {
        console.error('Error submitting test:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Ошибка отправки. Попробуйте позже.',
        };
    }
}

// Submit mini-quiz answers
export async function submitMiniQuiz(
    contact: UserContact,
    answers: QuizAnswer[]
): Promise<SubmissionResponse> {
    // 1. Ensure lead is registered
    const leadResult = await submitLead(contact);
    if (!leadResult.success) return leadResult;

    // 2. Submit answers
    // Using RSP submit endpoint as generic receiver for now, or we could add specific one.
    // The user instruction focuses on "Formula (React)... translate tests and results to unified backend".
    // Since MiniQuiz is part of Formula, we use /api/formula/rsp/submit or similar.
    // However, MiniQuiz might have different structure. 
    // For safety, we assume the backend handles it or we send as generic data.

    // NOTE: The previous backend was Google Sheet. 
    // Now we must use /api/formula/rsp/submit.

    // We map answers to a simplified format if needed.
    const answersMap = answers.reduce((acc, curr) => {
        acc[curr.questionId] = curr.answerId || curr.value;
        return acc;
    }, {} as Record<string, any>);

    return submitTestGeneric('/formula/rsp/submit', {
        type: 'mini_quiz', // Marker for backend to distinguish if needed
        answers: answersMap,
        timestamp: new Date().toISOString()
    });
}

// Submit full test results
export async function submitFullTest(result: TestResult): Promise<SubmissionResponse> {
    // 1. Register contact if not already (it should be, but safe to update)
    // Actually full test usually comes after lead gen.
    if (result.contact) {
        await submitLead(result.contact);
    }

    const answersMap = result.answers.reduce((acc, curr) => {
        acc[curr.questionId] = curr.answerId || curr.value;
        return acc;
    }, {} as Record<string, any>);

    return submitTestGeneric('/formula/rsp/submit', {
        type: 'full_test',
        answers: answersMap,
        scores: result.scores,
        dominant_dimension: result.dominantDimension,
        timestamp: result.timestamp
    });
}

// Submit employee mini-test results
export async function submitEmployeeTest(
    submission: EmployeeTestSubmission
): Promise<SubmissionResponse> {
    // 1. Register contact (should satisfy requirements)
    if (submission.contact) {
        const leadRes = await submitLead(submission.contact);
        if (!leadRes.success) return leadRes;
    }

    // 2. Submit test
    // Map array answers to object if needed, or send as is.
    // Backend expects 'answers' dict usually.
    const answersMap = submission.answers.reduce((acc, curr) => {
        acc[curr.questionId] = curr.option;
        return acc;
    }, {} as Record<number, string>);

    return submitTestGeneric('/formula/rsp/submit', {
        type: 'employee_test',
        employee_name: submission.employee.name,
        answers: answersMap,
        result: submission.result, // Send calculated result too if backend wants to log it
        timestamp: submission.timestamp
    });
}

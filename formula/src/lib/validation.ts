import type { UserContact, ValidationResult } from '@/types';

// Validate user contact form
export function validateContact(contact: Partial<UserContact>): ValidationResult {
    const errors: { [field: string]: string } = {};

    // Name validation (only letters, required)
    if (!contact.name || contact.name.trim() === '') {
        errors.name = 'Имя обязательно для заполнения';
    } else if (!/^[а-яА-ЯёЁa-zA-Z\s-]+$/.test(contact.name)) {
        errors.name = 'Имя должно содержать только буквы';
    }

    // Role validation (required)
    if (!contact.role) {
        errors.role = 'Выберите вашу роль';
    }

    // Team size validation (required)
    if (!contact.teamSize) {
        errors.teamSize = 'Укажите размер команды';
    }

    // Phone/Telegram validation (required, basic format)
    if (!contact.phoneOrTelegram || contact.phoneOrTelegram.trim() === '') {
        errors.phoneOrTelegram = 'Укажите телефон или Telegram';
    } else {
        const value = contact.phoneOrTelegram.trim();
        // Should start with + (phone) or @ (telegram) or be a valid phone number
        const isValidPhone = /^[\+]?[0-9]{10,15}$/.test(value.replace(/[\s\-\(\)]/g, ''));
        const isValidTelegram = /^@[a-zA-Z0-9_]{5,}$/.test(value);

        if (!isValidPhone && !isValidTelegram) {
            errors.phoneOrTelegram = 'Введите корректный телефон (+7...) или Telegram (@username)';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

// Validate email (optional, for future use)
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Sanitize text input
export function sanitizeText(text: string): string {
    return text.trim().replace(/[<>]/g, '');
}

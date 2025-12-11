import React, { useState } from 'react';
import type { UserContact, TeamSize, UserRole } from '@/types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { RadioGroup } from '../ui/Radio';
import { Button } from '../ui/Button';
import { validateContact } from '@/lib/validation';

interface ContactFormProps {
    onSubmit: (contact: UserContact) => void;
    loading?: boolean;
    showConcerns?: boolean; // For consultation form
}

const ROLE_OPTIONS: { value: UserRole; label: UserRole }[] = [
    { value: 'Собственник бизнеса', label: 'Собственник бизнеса' },
    { value: 'Руководитель отдела продаж', label: 'Руководитель отдела продаж' },
    { value: 'Коммерческий директор', label: 'Коммерческий директор' },
    { value: 'HR-менеджер', label: 'HR-менеджер' },
    { value: 'Внутренний тренер', label: 'Внутренний тренер' },
    { value: 'Топ-менеджер', label: 'Топ-менеджер' },
    { value: 'Другое', label: 'Другое' },
];

const TEAM_SIZE_OPTIONS: { value: TeamSize; label: string }[] = [
    { value: '1–10', label: '1–10 человек' },
    { value: '10–50', label: '10–50 человек' },
    { value: '50–100', label: '50–100 человек' },
    { value: '100+', label: 'Более 100 человек' },
];

export const ContactForm: React.FC<ContactFormProps> = ({
    onSubmit,
    loading = false,
    showConcerns = false,
}) => {
    const [formData, setFormData] = useState<Partial<UserContact>>({
        name: '',
        role: undefined,
        company: '',
        teamSize: undefined,
        phoneOrTelegram: '',
        concerns: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const validation = validateContact(formData);

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        onSubmit(formData as UserContact);
    };

    const updateField = (field: keyof UserContact, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-primary-800 font-semibold">
                    📅 Регистрация на встречу 28 января 2026 (10:00-15:00)
                </p>
                <p className="text-xs text-primary-700 mt-1">
                    Стоимость: 290 BYN • Место: г. Минск, ТЦ «ЕВРОПА»
                </p>
            </div>

            <Input
                label="Ваше имя"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                error={errors.name}
                placeholder="Иван Петров"
                required
            />

            <Select
                label="Ваша роль в компании"
                value={formData.role || ''}
                onChange={(e) => updateField('role', e.target.value)}
                options={ROLE_OPTIONS}
                error={errors.role}
                required
            />

            <Input
                label="Название компании"
                value={formData.company}
                onChange={(e) => updateField('company', e.target.value)}
                placeholder="ООО «Пример»"
                helperText="Необязательно, но поможет лучше подготовиться к встрече"
            />

            <RadioGroup
                label="Размер вашей команды"
                name="teamSize"
                value={formData.teamSize}
                onChange={(value) => updateField('teamSize', value)}
                options={TEAM_SIZE_OPTIONS}
                error={errors.teamSize}
                required
            />

            <Input
                label="Телефон или Telegram"
                value={formData.phoneOrTelegram}
                onChange={(e) => updateField('phoneOrTelegram', e.target.value)}
                error={errors.phoneOrTelegram}
                placeholder="+375 29 123-45-67 или @username"
                helperText="Для подтверждения регистрации и отправки материалов"
                required
            />

            {showConcerns && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        С какими вопросами по персоналу сталкиваетесь?
                    </label>
                    <textarea
                        value={formData.concerns}
                        onChange={(e) => updateField('concerns', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="Это поможет нам сделать встречу максимально полезной для вас..."
                    />
                </div>
            )}

            <Button type="submit" className="w-full" loading={loading} size="lg">
                {showConcerns ? 'Зарегистрироваться на встречу' : 'Забронировать место'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
                После отправки заявки мы свяжемся с вами для подтверждения участия
            </p>
        </form>
    );
};

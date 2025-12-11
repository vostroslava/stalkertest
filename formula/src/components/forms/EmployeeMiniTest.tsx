import React, { useState } from 'react';
import type { UserContact, EmployeeTestAnswer, EmployeeTestSubmission } from '@/types';
import { ContactForm } from './ContactForm';
import { EmployeeTestQuestion } from './EmployeeTestQuestion';
import { EmployeeTestResult } from '../results/EmployeeTestResult';
import {
    EMPLOYEE_TEST_QUESTIONS,
    calculateEmployeeProfile,
} from '@/lib/employee-profiles';
import { submitLead, submitEmployeeTest } from '@/lib/api';

type TestStep = 'contact' | 'instruction' | 'test' | 'result';

interface EmployeeMiniTestProps {
    onOpenConsultation: () => void;
}

export const EmployeeMiniTest: React.FC<EmployeeMiniTestProps> = ({ onOpenConsultation }) => {
    const [step, setStep] = useState<TestStep>('contact');
    const [contactData, setContactData] = useState<UserContact | null>(null);
    const [employeeName, setEmployeeName] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<EmployeeTestAnswer[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Step 1: Handle contact form submission
    const handleContactSubmit = async (contact: UserContact) => {
        setIsSubmitting(true);

        // Submit lead data first
        const result = await submitLead(contact);
        setIsSubmitting(false);

        if (result.success) {
            setContactData(contact);
            setStep('instruction');
        } else {
            alert(result.error || 'Ошибка отправки. Попробуйте позже.');
        }
    };

    // Step 2: Start test from instruction
    const handleStartTest = () => {
        if (!employeeName.trim()) {
            alert('Пожалуйста, укажите имя или инициалы сотрудника');
            return;
        }
        setStep('test');
    };

    // Step 3: Handle answer selection
    const handleAnswer = (option: 'A' | 'B' | 'C') => {
        const newAnswer: EmployeeTestAnswer = {
            questionId: EMPLOYEE_TEST_QUESTIONS[currentQuestionIndex].id,
            option,
        };

        const updatedAnswers = [...answers, newAnswer];
        setAnswers(updatedAnswers);

        // Move to next question or show result
        if (currentQuestionIndex < EMPLOYEE_TEST_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // All questions answered, submit and show result
            submitTestResults(updatedAnswers);
        }
    };

    // Submit test results to backend
    const submitTestResults = async (finalAnswers: EmployeeTestAnswer[]) => {
        if (!contactData) return;

        const result = calculateEmployeeProfile(finalAnswers);

        const submission: EmployeeTestSubmission = {
            type: 'employee_test',
            contact: contactData,
            employee: {
                name: employeeName,
            },
            answers: finalAnswers,
            result,
            timestamp: new Date().toISOString(),
        };

        setIsSubmitting(true);
        await submitEmployeeTest(submission);
        setIsSubmitting(false);

        setStep('result');
    };

    // Reset for another employee assessment
    const handleAssessAnother = () => {
        setEmployeeName('');
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setStep('instruction');
    };

    const currentQuestion = EMPLOYEE_TEST_QUESTIONS[currentQuestionIndex];
    const testResult = answers.length === 7 ? calculateEmployeeProfile(answers) : null;

    return (
        <section
            id="mini-quiz"
            className="py-24 bg-gradient-to-br from-primary-900 via-accent-900 to-gray-900 text-white relative overflow-hidden"
        >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '40px 40px',
                    }}
                ></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-block mb-6">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 text-white/90 font-medium">
                                🎯 Оценка сотрудника
                            </div>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Определите{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-accent-300">
                                тип сотрудника
                            </span>
                        </h2>
                        <p className="text-lg text-white/80 max-w-2xl mx-auto">
                            {step === 'contact' && 'Заполните форму и пройдите быстрый тест'}
                            {step === 'instruction' && 'Подумайте об одном сотруднике и ответьте на вопросы'}
                            {step === 'test' && `Вопрос ${currentQuestionIndex + 1} из 7`}
                            {step === 'result' && 'Результат оценки готов'}
                        </p>
                    </div>

                    {/* Content based on step */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
                        {/* Step 1: Contact Form */}
                        {step === 'contact' && (
                            <div>
                                <h3 className="text-2xl font-bold mb-6 text-white">Шаг 1: Ваши контактные данные</h3>
                                <ContactForm onSubmit={handleContactSubmit} loading={isSubmitting} showConcerns={false} />
                            </div>
                        )}

                        {/* Step 2: Instruction */}
                        {step === 'instruction' && (
                            <div className="text-center">
                                <div className="mb-8">
                                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-2xl">
                                        👤
                                    </div>
                                    <p className="text-lg text-white/90 mb-6">
                                        Выберите одного сотрудника, которого вы хорошо знаете. Отвечайте на вопросы так, как он
                                        ведёт себя в реальной работе, а не "как должен".
                                    </p>
                                </div>

                                <div className="max-w-md mx-auto mb-8">
                                    <label className="block text-left text-sm font-medium text-white/90 mb-2">
                                        Имя или инициалы сотрудника (необязательно)
                                    </label>
                                    <input
                                        type="text"
                                        value={employeeName}
                                        onChange={(e) => setEmployeeName(e.target.value)}
                                        placeholder="Иван Иванов или И.И."
                                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                                    />
                                </div>

                                <button
                                    onClick={handleStartTest}
                                    className="px-12 py-4 bg-gradient-to-r from-primary-500 via-accent-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 transform hover:scale-105"
                                >
                                    Начать оценку
                                </button>
                            </div>
                        )}

                        {/* Step 3: Test Questions */}
                        {step === 'test' && currentQuestion && (
                            <EmployeeTestQuestion
                                question={currentQuestion}
                                questionNumber={currentQuestionIndex + 1}
                                totalQuestions={EMPLOYEE_TEST_QUESTIONS.length}
                                onAnswer={handleAnswer}
                            />
                        )}

                        {/* Step 4: Result */}
                        {step === 'result' && testResult && (
                            <EmployeeTestResult
                                result={testResult}
                                employeeName={employeeName}
                                onAssessAnother={handleAssessAnother}
                                onOpenConsultation={onOpenConsultation}
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

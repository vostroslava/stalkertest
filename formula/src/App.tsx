import { useState } from 'react';
import { Hero } from './sections/Hero';
import { HowItWorks } from './sections/HowItWorks';
import { TargetAudience } from './sections/TargetAudience';
import { CaseStudies } from './sections/CaseStudies';
import { WorkFormats } from './sections/WorkFormats';
import { FAQ } from './sections/FAQ';
import { Footer } from './sections/Footer';
import { Modal } from './components/ui/Modal';
import { ContactForm } from './components/forms/ContactForm';
import { EmployeeMiniTest } from './components/forms/EmployeeMiniTest';
import type { UserContact } from './types';
import { submitLead } from './lib/api';

function App() {
    const [showConsultationModal, setShowConsultationModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Test modal state
    const [showTestModal, setShowTestModal] = useState(false);
    const [testStep, setTestStep] = useState<'registration' | 'test'>('registration');
    const [, setTestUserContact] = useState<UserContact | null>(null);

    const handleConsultationSubmit = async (contact: UserContact) => {
        setIsSubmitting(true);
        const result = await submitLead(contact);
        setIsSubmitting(false);

        if (result.success) {
            setSubmitSuccess(true);
            setTimeout(() => {
                setShowConsultationModal(false);
                setSubmitSuccess(false);
            }, 3000);
        } else {
            alert(result.error || 'Ошибка отправки. Попробуйте позже.');
        }
    };

    const scrollToQuiz = () => {
        const quizSection = document.getElementById('mini-quiz');
        if (quizSection) {
            quizSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleOpenTestModal = () => {
        setShowTestModal(true);
        setTestStep('registration');
        setTestUserContact(null);
    };

    const handleTestRegistration = async (contact: UserContact) => {
        setIsSubmitting(true);
        const result = await submitLead(contact);
        setIsSubmitting(false);

        if (result.success) {
            setTestUserContact(contact);
            setTestStep('test');
        } else {
            alert(result.error || 'Ошибка отправки. Попробуйте позже.');
        }
    };

    const handleCloseTestModal = () => {
        setShowTestModal(false);
        setTestStep('registration');
        setTestUserContact(null);
    };

    return (
        <div className="min-h-screen bg-white">
            <Hero
                onStartQuiz={scrollToQuiz}
                onOpenConsultation={() => setShowConsultationModal(true)}
                onStartTest={handleOpenTestModal}
            />

            <HowItWorks />

            <TargetAudience
                onStartQuiz={scrollToQuiz}
                onOpenConsultation={() => setShowConsultationModal(true)}
            />

            <CaseStudies />

            <WorkFormats onOpenConsultation={() => setShowConsultationModal(true)} />

            <FAQ />

            <Footer />

            {/* Event Registration Modal */}
            <Modal
                isOpen={showConsultationModal}
                onClose={() => setShowConsultationModal(false)}
                title="Регистрация на бизнес-встречу"
                size="md"
            >
                {submitSuccess ? (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-3">Вы зарегистрированы!</h3>
                        <p className="text-lg text-gray-600 mb-4">
                            Мы свяжемся с вами в ближайшее время для подтверждения участия.
                        </p>
                        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mt-6">
                            <p className="text-sm text-primary-800 font-semibold">
                                📅 28 января 2026, 10:00-15:00
                            </p>
                            <p className="text-sm text-primary-700 mt-1">
                                г. Минск, ТЦ «ЕВРОПА», ул. Сурганова, 57Б, офис 143
                            </p>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            Детали и материалы для подготовки отправим на указанный контакт
                        </p>
                    </div>
                ) : (
                    <ContactForm
                        onSubmit={handleConsultationSubmit}
                        loading={isSubmitting}
                        showConcerns={true}
                    />
                )}
            </Modal>

            {/* Employee Test Modal */}
            <Modal
                isOpen={showTestModal}
                onClose={handleCloseTestModal}
                title={testStep === 'registration' ? 'Регистрация для теста' : 'Тест сотрудника'}
                size="lg"
            >
                {testStep === 'registration' ? (
                    <div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-emerald-800 font-semibold">
                                🧪 Быстрый тест для определения профиля сотрудника
                            </p>
                            <p className="text-xs text-emerald-700 mt-1">
                                После регистрации вы сможете пройти тест и получить профиль
                            </p>
                        </div>
                        <ContactForm
                            onSubmit={handleTestRegistration}
                            loading={isSubmitting}
                            showConcerns={false}
                        />
                    </div>
                ) : (
                    <EmployeeMiniTest onOpenConsultation={() => setShowConsultationModal(true)} />
                )}
            </Modal>
        </div>
    );
}

export default App;

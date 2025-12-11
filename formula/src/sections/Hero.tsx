import React from 'react';
import { Button } from '../components/ui/Button';

interface HeroProps {
    onStartQuiz: () => void;
    onOpenConsultation: () => void;
    onStartTest: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartQuiz, onOpenConsultation, onStartTest }) => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-primary-900 to-accent-900">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient orbs */}
                <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-accent-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }}></div>

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px',
                }}></div>
            </div>

            <div className="container mx-auto px-4 py-20 relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Event badge */}
                    <div className="inline-block mb-8 animate-fade-in">
                        <div className="bg-gradient-to-r from-primary-500 to-accent-500 border border-white/30 rounded-full px-8 py-3 text-white font-bold text-lg shadow-2xl">
                            📅 28 ЯНВАРЯ 2026 • 10:00 - 15:00 • г. Минск
                        </div>
                    </div>

                    {/* Main headline */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight animate-slide-up">
                        Вся правда{' '}
                        <br className="hidden md:block" />
                        о{' '}
                        <span className="relative inline-block">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-accent-300 to-cyan-300 animate-pulse">
                                персонале
                            </span>
                            <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none">
                                <path d="M1 6C50 2 100 10 150 6C200 2 250 10 299 6" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                                        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
                                        <stop offset="50%" stopColor="#c084fc" stopOpacity="0.7" />
                                        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.5" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl lg:text-3xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up font-light">
                        <strong className="text-white font-semibold">Формула успешной команды</strong> —
                        бизнес-встреча для <span className="text-primary-300 font-bold">собственников и топ-менеджеров</span>.
                        <br />
                        Научитесь <span className="text-accent-300 font-semibold">прогнозировать поведение персонала</span>{' '}
                        и эффективно управлять командой.
                    </p>

                    {/* Event details */}
                    <div className="flex flex-wrap justify-center gap-6 mb-14 animate-fade-in">
                        {[
                            { icon: '📅', text: '28 января', desc: '2026 года' },
                            { icon: '⏰', text: '10:00 - 15:00', desc: 'с кофе-брейком' },
                            { icon: '📍', text: 'Минск', desc: 'ТЦ «ЕВРОПА»' },
                            { icon: '💰', text: '290 BYN', desc: 'стоимость участия' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/20"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{item.icon}</span>
                                    <div className="text-left">
                                        <div className="text-white font-bold text-lg">{item.text}</div>
                                        <div className="text-white/70 text-sm">{item.desc}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-scale-in mb-12">
                        <Button
                            size="lg"
                            onClick={onOpenConsultation}
                            className="text-xl px-12 py-6 shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 transform hover:scale-110 transition-all duration-300 bg-gradient-to-r from-primary-500 via-accent-500 to-cyan-500 hover:from-primary-600 hover:via-accent-600 hover:to-cyan-600"
                        >
                            <span className="flex items-center gap-3">
                                <span>Зарегистрироваться на встречу</span>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </Button>
                        <Button
                            size="lg"
                            onClick={onStartTest}
                            className="text-xl px-12 py-6 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:scale-110 transition-all duration-300 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600"
                        >
                            <span className="flex items-center gap-3">
                                <span>🧪</span>
                                <span>Пройти тест сотрудника</span>
                            </span>
                        </Button>
                        <button
                            onClick={onStartQuiz}
                            className="text-xl px-12 py-6 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
                        >
                            Узнать программу
                        </button>
                    </div>

                    {/* Location details */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto mb-12">
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">📍</div>
                            <div className="text-left">
                                <h3 className="text-white font-bold text-xl mb-2">Место проведения</h3>
                                <p className="text-white/80 text-lg">
                                    г. Минск, ул. Сурганова, 57Б, офис 143
                                </p>
                                <p className="text-white/70 text-sm mt-1">
                                    Торговый центр «ЕВРОПА»
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Social proof */}
                    <div className="flex items-center justify-center gap-8 flex-wrap text-white/70 animate-fade-in">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">👥</span>
                            <span className="text-sm">
                                <strong className="text-white">Ограниченное</strong> количество мест
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">☕</span>
                            <span className="text-sm">
                                <strong className="text-white">Кофе-брейк</strong> и нетворкинг
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🎓</span>
                            <span className="text-sm">
                                <strong className="text-white">Авторские</strong> методики
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="flex flex-col items-center gap-2 text-white/60">
                    <span className="text-sm font-medium">Программа встречи</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </div>
        </section>
    );
};

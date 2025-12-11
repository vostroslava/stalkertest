import React from 'react';

const TELEGRAM_CHANNEL = import.meta.env.VITE_TELEGRAM_CHANNEL || 'https://t.me/testtesttest12332221';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-white py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Main footer content */}
                    <div className="grid md:grid-cols-3 gap-12 mb-12">
                        {/* Brand */}
                        <div>
                            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-accent-400 text-transparent bg-clip-text">
                                Формула успешной команды
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                Диагностическая методика для построения эффективных команд на основе типов сотрудников и уровня вовлечённости.
                            </p>
                        </div>

                        {/* Quick links */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Быстрые ссылки</h4>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#how-it-works" className="text-gray-400 hover:text-primary-400 transition-colors">
                                        Как работает
                                    </a>
                                </li>
                                <li>
                                    <a href="#mini-quiz" className="text-gray-400 hover:text-primary-400 transition-colors">
                                        Пройти тест
                                    </a>
                                </li>
                                <li>
                                    <a href="#target-audience" className="text-gray-400 hover:text-primary-400 transition-colors">
                                        Для кого
                                    </a>
                                </li>
                                <li>
                                    <a href="#faq" className="text-gray-400 hover:text-primary-400 transition-colors">
                                        FAQ
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Telegram CTA */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Присоединяйтесь к нам</h4>
                            <p className="text-gray-400 mb-4">
                                Подпишитесь на наш Telegram-канал: разборы реальных кейсов, дополнительные материалы и мини-игры по вашей команде.
                            </p>
                            <a
                                href={TELEGRAM_CHANNEL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                                </svg>
                                Перейти в Telegram-канал
                            </a>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                        <p>&copy; {new Date().getFullYear()} Формула успешной команды. Все права защищены.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

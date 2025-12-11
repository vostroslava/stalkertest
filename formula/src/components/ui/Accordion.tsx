import React, { useState } from 'react';

interface AccordionItem {
    id: string;
    question: string;
    answer: string;
}

interface AccordionProps {
    items: AccordionItem[];
}

export const Accordion: React.FC<AccordionProps> = ({ items }) => {
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const toggleItem = (id: string) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(id)) {
            newOpenItems.delete(id);
        } else {
            newOpenItems.add(id);
        }
        setOpenItems(newOpenItems);
    };

    return (
        <div className="space-y-4">
            {items.map((item) => {
                const isOpen = openItems.has(item.id);

                return (
                    <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                        <button
                            onClick={() => toggleItem(item.id)}
                            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                            aria-expanded={isOpen}
                        >
                            <span className="text-lg font-semibold text-gray-900 pr-4">
                                {item.question}
                            </span>
                            <svg
                                className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''
                                    }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        <div
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <div className="px-6 py-4 bg-gray-50 text-gray-700 leading-relaxed">
                                {item.answer}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

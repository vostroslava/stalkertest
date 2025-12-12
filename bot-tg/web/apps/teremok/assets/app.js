



// ===== MOBILE MENU =====
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.nav-overlay');
    const btn = document.querySelector('.mobile-menu-btn');

    const isOpen = navLinks.classList.contains('open');

    if (isOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.nav-overlay');
    const btn = document.querySelector('.mobile-menu-btn');

    navLinks.classList.add('open');
    overlay.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.nav-overlay');
    const btn = document.querySelector('.mobile-menu-btn');

    navLinks.classList.remove('open');
    overlay.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

// Click outside menu to close
document.addEventListener('click', function (e) {
    const navLinks = document.querySelector('.nav-links');
    const menuBtn = document.querySelector('.mobile-menu-btn');

    // Если меню открыто И клик был не по меню и не по кнопке
    if (navLinks && navLinks.classList.contains('open')) {
        if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    }
});

// ===== END MOBILE MENU =====


// Управление скроллом страницы в зависимости от открытых модал
function adjustBodyScroll() {
    const lead = document.getElementById('leadModal');
    const test = document.getElementById('testModal');
    const privacy = document.getElementById('privacyModal');

    const anyOpen = [lead, test, privacy].some(m => m && m.classList.contains('open'));

    if (anyOpen) {
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open'); // Prevent iOS bounce
    } else {
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
    }
}

// Открыть модал заявки
function openLeadModal(source) {
    const modal = document.getElementById('leadModal');
    if (!modal) return;

    modal.classList.add('open');

    const banner = document.getElementById('testAccessBanner');
    if (banner) {
        banner.style.display = (source === 'test') ? 'block' : 'none';
    }

    adjustBodyScroll();
}

// Закрыть модал заявки
function closeLeadModal() {
    const modal = document.getElementById('leadModal');
    if (!modal) return;
    modal.classList.remove('open');
    adjustBodyScroll();
}

// Открыть модал с тестом
function openTestModal() {
    const leadId = sessionStorage.getItem('teremok_lead_id');

    // If no lead ID, redirect to registration
    if (!leadId) {
        // Show banner saying registration is required
        openLeadModal('test');
        return;
    }

    const modal = document.getElementById('testModal');
    if (!modal) return;

    modal.classList.add('open');
    adjustBodyScroll();

    // Init Test via Integration
    if (typeof window.initMiniTest === 'function') {
        window.initMiniTest();
    }
}

// Закрыть модал теста
function closeTestModal() {
    const modal = document.getElementById('testModal');
    if (!modal) return;
    modal.classList.remove('open');
    adjustBodyScroll();
}

// Открыть модал политики конфиденциальности
function openPrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (!modal) return;
    modal.classList.add('open');
    adjustBodyScroll();
}

// Закрыть модал политики конфиденциальности
function closePrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (!modal) return;
    modal.classList.remove('open');
    adjustBodyScroll();
}

// Инициализация полоски отсчёта времени до мероприятия
function initEventCountdown() {
    const textEl = document.getElementById('eventCountdownText');
    const barEl = document.getElementById('eventCountdownFill');
    if (!textEl || !barEl) return;

    // 18 декабря 2025, 10:00 — локальное время
    const eventStart = new Date(2025, 11, 18, 10, 0, 0);
    const windowMs = 30 * 24 * 60 * 60 * 1000; // 30 дней до события как "полная шкала"

    function formatUnit(value, forms) {
        const v = Math.abs(value) % 100;
        const v1 = v % 10;
        if (v > 10 && v < 20) return value + ' ' + forms[2];
        if (v1 > 1 && v1 < 5) return value + ' ' + forms[1];
        if (v1 === 1) return value + ' ' + forms[0];
        return value + ' ' + forms[2];
    }

    function updateCountdown() {
        const now = new Date();
        let diff = eventStart - now;

        if (diff <= 0) {
            textEl.textContent = 'мероприятие уже началось или прошло';
            barEl.style.width = '100%';
            barEl.setAttribute('aria-valuenow', '100');
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        diff -= days * 1000 * 60 * 60 * 24;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * 1000 * 60 * 60;
        const minutes = Math.floor(diff / (1000 * 60));

        let parts = [];
        if (days > 0) {
            parts.push(formatUnit(days, ['день', 'дня', 'дней']));
        }
        if (hours > 0) {
            parts.push(formatUnit(hours, ['час', 'часа', 'часов']));
        }
        if (days === 0 && hours === 0 && minutes > 0) {
            parts.push(formatUnit(minutes, ['минута', 'минуты', 'минут']));
        }

        textEl.textContent = parts.length ? parts.join(' ') : 'меньше минуты';

        let remainingForWindow = eventStart - now;
        if (remainingForWindow > windowMs) {
            remainingForWindow = windowMs;
        }
        if (remainingForWindow < 0) {
            remainingForWindow = 0;
        }

        const percent = 100 - (remainingForWindow / windowMs) * 100;
        const clamped = Math.max(0, Math.min(100, percent));

        barEl.style.width = clamped.toFixed(0) + '%';
        barEl.setAttribute('aria-valuenow', clamped.toFixed(0));
    }

    updateCountdown();
    setInterval(updateCountdown, 60000);
}

document.addEventListener('DOMContentLoaded', function () {


    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;

        const privacy = document.getElementById('privacyModal');
        const test = document.getElementById('testModal');
        const lead = document.getElementById('leadModal');

        // Сначала закрываем верхнее окно политики, если оно открыто
        if (privacy && privacy.classList.contains('open')) {
            closePrivacyModal();
            return;
        }

        // Потом — окно с тестом
        if (test && test.classList.contains('open')) {
            closeTestModal();
            return;
        }

        // И только потом — окно регистрации
        if (lead && lead.classList.contains('open')) {
            closeLeadModal();
        }
    });

    const animated = document.querySelectorAll('[data-animate]');
    if ('IntersectionObserver' in window && animated.length > 0) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        animated.forEach(el => observer.observe(el));
    } else {
        animated.forEach(el => el.classList.add('in-view'));
    }

    // Testimonials & experts accordion
    const testimonialHeaders = document.querySelectorAll('.testimonial-header');
    testimonialHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const item = header.closest('.testimonial-item');
            const isOpen = item.classList.contains('open');

            document.querySelectorAll('.testimonial-item.open').forEach(other => {
                if (other !== item) {
                    other.classList.remove('open');
                }
            });

            if (!isOpen) {
                item.classList.add('open');
            } else {
                item.classList.remove('open');
            }
        });
    });

    // Инициализируем отсчёт до мероприятия
    initEventCountdown();



    // Interactive Cards Modal Logic
    document.querySelectorAll('.level-card').forEach(card => {
        // Click handler
        card.addEventListener('click', function (e) {
            const modalId = this.getAttribute('data-modal');
            if (modalId) {
                openModal(modalId);
            }
        });

        // Keyboard handler for accessibility
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const modalId = this.getAttribute('data-modal');
                if (modalId) {
                    openModal(modalId);
                }
            }
        });
    });

    // Mobile menu close on link click (Migrated from script.js)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // 1. Close menu first using app.js function
                closeMobileMenu();

                // 2. Wait and scroll (smooth)
                setTimeout(() => {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }, 400);
            }
        });
    });

    // Hover Tilt Effect for Level Cards (Migrated from script.js)
    const cards = document.querySelectorAll('.level-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // We need to check if the CSS actually uses these variables, 
            // but setting them is safe and restores the intended effect.
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });
});

// Generic Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('open');
        adjustBodyScroll();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('open');
        adjustBodyScroll();
    }
}



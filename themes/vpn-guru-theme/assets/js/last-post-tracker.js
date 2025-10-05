/**
 * Last Post Tracker
 * Отслеживает последний посещенный пост и выделяет его на главной странице
 */

class LastPostTracker {
    constructor() {
        this.storageKey = 'vpn-guru-last-post';
        this.lastPostUrl = null;
        this.init();
    }

    init() {
        // Проверяем, находимся ли мы на странице поста
        if (this.isPostPage()) {
            this.saveCurrentPost();
        }
        
        // Если мы на главной странице, выделяем последний пост
        if (this.isHomePage()) {
            this.highlightLastPost();
        }
        
        // Добавляем обработчики событий
        this.addEventListeners();
    }

    /**
     * Добавляет обработчики событий
     */
    addEventListeners() {
        // Обработчик для кнопки очистки истории
        const clearButton = document.getElementById('clear-last-post');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clearLastPost();
                this.showNotification('История посещений очищена', 'success');
                
                // Убираем выделение с постов
                const lastVisitedPosts = document.querySelectorAll('.last-visited-post');
                lastVisitedPosts.forEach(post => {
                    post.classList.remove('last-visited-post');
                    const indicator = post.querySelector('.last-visited-indicator');
                    if (indicator) {
                        indicator.remove();
                    }
                });
            });
        }

        // Обработчик для карточек постов (для улучшения UX)
        document.addEventListener('click', (e) => {
            const postCard = e.target.closest('.post-card');
            if (postCard) {
                // Добавляем небольшую задержку перед переходом для лучшего UX
                setTimeout(() => {
                    // Сохраняем информацию о клике
                    this.savePostClick(postCard);
                }, 100);
            }
        });
    }

    /**
     * Сохраняет информацию о клике на пост
     */
    savePostClick(postCard) {
        const href = postCard.getAttribute('data-href');
        if (href) {
            // Сохраняем информацию о том, что пользователь кликнул на пост
            try {
                const clickData = {
                    url: href,
                    clickedAt: Date.now()
                };
                localStorage.setItem('vpn-guru-post-click', JSON.stringify(clickData));
            } catch (error) {
                console.error('Ошибка сохранения клика:', error);
            }
        }
    }

    /**
     * Показывает уведомление пользователю
     */
    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${this.getNotificationIcon(type)}</span>
            <span class="notification-text">${message}</span>
            <button class="notification-close">×</button>
        `;

        // Добавляем стили
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            background: this.getNotificationBackground(type),
            color: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem',
            fontWeight: '500',
            maxWidth: '400px',
            animation: 'notificationSlideIn 0.3s ease-out'
        });

        // Добавляем в DOM
        document.body.appendChild(notification);

        // Обработчик закрытия
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Автоматическое закрытие через 4 секунды
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'notificationSlideOut 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 4000);
    }

    /**
     * Получает иконку для уведомления
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Получает фон для уведомления
     */
    getNotificationBackground(type) {
        const backgrounds = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        };
        return backgrounds[type] || backgrounds.info;
    }

    /**
     * Проверяет, находимся ли мы на странице поста
     */
    isPostPage() {
        return window.location.pathname.includes('/posts/') && 
               window.location.pathname !== '/posts/';
    }

    /**
     * Проверяет, находимся ли мы на главной странице
     */
    isHomePage() {
        return window.location.pathname === '/' || 
               window.location.pathname === '/index.html';
    }

    /**
     * Сохраняет текущий пост в localStorage
     */
    saveCurrentPost() {
        const currentUrl = window.location.pathname;
        const postTitle = document.querySelector('h1')?.textContent || 'Неизвестный пост';
        const postDate = document.querySelector('.post-date')?.textContent || '';
        
        const postData = {
            url: currentUrl,
            title: postTitle,
            date: postDate,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(postData));
            this.lastPostUrl = currentUrl;
            console.log('Сохранен последний пост:', postData);
        } catch (error) {
            console.error('Ошибка сохранения поста:', error);
        }
    }

    /**
     * Получает данные о последнем посещенном посте
     */
    getLastPost() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Ошибка получения данных о последнем посте:', error);
            return null;
        }
    }

    /**
     * Выделяет последний посещенный пост на главной странице
     */
    highlightLastPost() {
        const lastPost = this.getLastPost();
        if (!lastPost) return;

        // Находим карточку поста по URL
        const postCard = document.querySelector(`[data-href="${lastPost.url}"]`);
        if (!postCard) return;

        // Добавляем класс для выделения
        postCard.classList.add('last-visited-post');
        
        // Добавляем индикатор "Последний просмотренный"
        this.addLastVisitedIndicator(postCard, lastPost);

        console.log('Выделен последний пост:', lastPost.title);
    }

    /**
     * Добавляет индикатор "Последний просмотренный"
     */
    addLastVisitedIndicator(postCard, lastPost) {
        // Проверяем, не добавлен ли уже индикатор
        if (postCard.querySelector('.last-visited-indicator')) return;

        const indicator = document.createElement('div');
        indicator.className = 'last-visited-indicator';
        indicator.innerHTML = `
            <span class="indicator-icon">👁️</span>
            <span class="indicator-text">Последний просмотренный</span>
        `;

        // Вставляем индикатор в начало карточки
        const postCardContent = postCard.querySelector('.post-card-content');
        if (postCardContent) {
            postCardContent.insertBefore(indicator, postCardContent.firstChild);
        }
    }

    /**
     * Очищает данные о последнем посте
     */
    clearLastPost() {
        try {
            localStorage.removeItem(this.storageKey);
            this.lastPostUrl = null;
            console.log('Данные о последнем посте очищены');
        } catch (error) {
            console.error('Ошибка очистки данных:', error);
        }
    }

    /**
     * Получает статистику посещений
     */
    getVisitStats() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return null;
            
            const postData = JSON.parse(data);
            const now = Date.now();
            const timeDiff = now - postData.timestamp;
            
            return {
                ...postData,
                timeAgo: this.formatTimeAgo(timeDiff)
            };
        } catch (error) {
            console.error('Ошибка получения статистики:', error);
            return null;
        }
    }

    /**
     * Форматирует время с момента последнего посещения
     */
    formatTimeAgo(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} дн. назад`;
        if (hours > 0) return `${hours} ч. назад`;
        if (minutes > 0) return `${minutes} мин. назад`;
        return 'Только что';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.lastPostTracker = new LastPostTracker();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LastPostTracker;
}

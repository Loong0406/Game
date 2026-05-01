/**
 * 公共触摸控制组件
 * 为所有游戏提供统一的触摸按钮支持
 */

// 触摸控制管理器
const TouchController = {
    // 为2048添加滑动支持
    addSwipeSupport(element, onSwipe) {
        if (!element) return;

        let touchStartX = 0, touchStartY = 0;
        let touchEndX = 0, touchEndY = 0;

        element.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            e.preventDefault();
        });

        element.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;

            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;

            if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) onSwipe('right');
                else onSwipe('left');
            } else {
                if (dy > 0) onSwipe('down');
                else onSwipe('up');
            }
            e.preventDefault();
        });
    },

    // 为游戏添加方向按钮
    addDirectionButtons(handlers) {
        const upBtn = document.querySelector('[data-dir="up"]');
        const downBtn = document.querySelector('[data-dir="down"]');
        const leftBtn = document.querySelector('[data-dir="left"]');
        const rightBtn = document.querySelector('[data-dir="right"]');

        const setActive = (dir, active) => {
            if (handlers[dir]) handlers[dir](active);
        };

        const handleStart = (dir) => (e) => {
            e.preventDefault();
            setActive(dir, true);
            if (handlers.onPress) handlers.onPress(dir);
        };

        const handleEnd = (dir) => (e) => {
            e.preventDefault();
            setActive(dir, false);
            if (handlers.onRelease) handlers.onRelease(dir);
        };

        const bindButton = (btn, dir) => {
            if (!btn) return;
            btn.addEventListener('touchstart', handleStart(dir));
            btn.addEventListener('touchend', handleEnd(dir));
            btn.addEventListener('touchcancel', handleEnd(dir));
            btn.addEventListener('mousedown', handleStart(dir));
            btn.addEventListener('mouseup', handleEnd(dir));
        };

        bindButton(upBtn, 'up');
        bindButton(downBtn, 'down');
        bindButton(leftBtn, 'left');
        bindButton(rightBtn, 'right');
    },

    // 添加动作按钮（射击/旋转等）
    addActionButton(selector, callback) {
        const btn = document.querySelector(selector);
        if (!btn) return;

        const handler = (e) => {
            e.preventDefault();
            callback();
        };

        btn.addEventListener('touchstart', handler);
        btn.addEventListener('mousedown', handler);
    },

    // 判断是否为手机端
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || window.innerWidth <= 768;
    }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TouchController;
}
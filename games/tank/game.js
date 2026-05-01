class TankGame {
    constructor() {
        this.canvas = document.getElementById('tankCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.w = 600;
        this.h = 600;
        this.canvas.width = this.w;
        this.canvas.height = this.h;

        this.enemyCount = 3;
        this.playerSpeed = 3.5;
        this.enemySpeed = 1.5;

        this.player = { x: 280, y: 540, w: 28, h: 28, dir: 'UP', color: '#4CAF50' };
        this.enemies = [];
        this.enemyBullets = [];
        this.bullets = [];

        this.obstacles = [
            { x: 150, y: 200, w: 60, h: 20 }, { x: 390, y: 200, w: 60, h: 20 },
            { x: 270, y: 300, w: 60, h: 20 }, { x: 100, y: 400, w: 20, h: 60 },
            { x: 480, y: 400, w: 20, h: 60 }, { x: 280, y: 450, w: 40, h: 20 }
        ];

        this.score = 0;
        this.gameOver = false;
        this.win = false;
        this.gameEnded = false;

        this.keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
        this.shootCooldown = 0;
        this.enemyShootCooldown = 0;

        this.initEnemies();
        this.bindEvents();
        this.bindTouchControls();
        this.gameLoop();

        // 适配手机画布大小
        this.adjustCanvasSize();
        window.addEventListener('resize', () => this.adjustCanvasSize());
    }

    adjustCanvasSize() {
        const container = this.canvas.parentElement;
        const maxSize = Math.min(container.clientWidth - 40, 550);
        if (maxSize > 0) {
            const scale = maxSize / this.w;
            this.canvas.style.width = maxSize + 'px';
            this.canvas.style.height = (this.h * scale) + 'px';
        }
    }

    initEnemies() {
        this.enemies = [];
        const colors = ['#E53935', '#FF6D00', '#8E24AA', '#1E88E5', '#43A047', '#FB8C00'];
        const startX = 50, startY = 40, spacing = 70;
        for (let i = 0; i < this.enemyCount; i++) {
            this.enemies.push({
                x: startX + (i % 3) * spacing,
                y: startY + Math.floor(i / 3) * spacing,
                w: 28, h: 28, dir: 'DOWN',
                color: colors[i % colors.length],
                changeDirTimer: Math.floor(Math.random() * 60)
            });
        }
    }

    bindEvents() {
        this.handleKeyDown = (e) => {
            if (!document.getElementById('tankCanvas')?.isConnected) return;
            if (this.gameOver) return;
            const key = e.key;
            if (key === 'ArrowUp') { this.keys.ArrowUp = true; e.preventDefault(); }
            if (key === 'ArrowDown') { this.keys.ArrowDown = true; e.preventDefault(); }
            if (key === 'ArrowLeft') { this.keys.ArrowLeft = true; e.preventDefault(); }
            if (key === 'ArrowRight') { this.keys.ArrowRight = true; e.preventDefault(); }
            if (key === ' ') { e.preventDefault(); this.shoot(); }
            if (key === 'w') { this.keys.ArrowUp = true; e.preventDefault(); }
            if (key === 's') { this.keys.ArrowDown = true; e.preventDefault(); }
            if (key === 'a') { this.keys.ArrowLeft = true; e.preventDefault(); }
            if (key === 'd') { this.keys.ArrowRight = true; e.preventDefault(); }
        };

        this.handleKeyUp = (e) => {
            const key = e.key;
            if (key === 'ArrowUp' || key === 'w') this.keys.ArrowUp = false;
            if (key === 'ArrowDown' || key === 's') this.keys.ArrowDown = false;
            if (key === 'ArrowLeft' || key === 'a') this.keys.ArrowLeft = false;
            if (key === 'ArrowRight' || key === 'd') this.keys.ArrowRight = false;
        };

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        document.getElementById('resetTank').onclick = () => this.reset();
        document.getElementById('applySettings').onclick = () => {
            let newCount = parseInt(document.getElementById('enemyCount').value);
            if (newCount >= 1 && newCount <= 6) this.enemyCount = newCount;
            this.reset();
        };
    }

    bindTouchControls() {
        const upBtn = document.querySelector('[data-dir="up"]');
        const downBtn = document.querySelector('[data-dir="down"]');
        const leftBtn = document.querySelector('[data-dir="left"]');
        const rightBtn = document.querySelector('[data-dir="right"]');
        const shootBtn = document.getElementById('mobileShootBtn');

        const setActive = (dir, active) => {
            if (dir === 'up') this.keys.ArrowUp = active;
            if (dir === 'down') this.keys.ArrowDown = active;
            if (dir === 'left') this.keys.ArrowLeft = active;
            if (dir === 'right') this.keys.ArrowRight = active;
        };

        const handleStart = (dir) => (e) => { e.preventDefault(); setActive(dir, true); };
        const handleEnd = (dir) => (e) => { e.preventDefault(); setActive(dir, false); };

        const bindBtn = (btn, dir) => {
            if (!btn) return;
            btn.addEventListener('touchstart', handleStart(dir));
            btn.addEventListener('touchend', handleEnd(dir));
            btn.addEventListener('touchcancel', handleEnd(dir));
            btn.addEventListener('mousedown', handleStart(dir));
            btn.addEventListener('mouseup', handleEnd(dir));
        };

        bindBtn(upBtn, 'up');
        bindBtn(downBtn, 'down');
        bindBtn(leftBtn, 'left');
        bindBtn(rightBtn, 'right');

        if (shootBtn) {
            shootBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.shoot(); });
            shootBtn.addEventListener('mousedown', (e) => { e.preventDefault(); this.shoot(); });
        }
    }

    shoot() {
        if (this.gameOver || this.shootCooldown > 0) return;
        let bullet = { x: this.player.x + 11, y: this.player.y + 11, w: 6, h: 6, dir: this.player.dir };
        switch(this.player.dir) {
            case 'UP': bullet.y = this.player.y - 5; break;
            case 'DOWN': bullet.y = this.player.y + 29; break;
            case 'LEFT': bullet.x = this.player.x - 5; break;
            case 'RIGHT': bullet.x = this.player.x + 29; break;
        }
        this.bullets.push(bullet);
        this.shootCooldown = 12;
    }

    movePlayer() {
        let speed = this.playerSpeed;
        let oldX = this.player.x, oldY = this.player.y;
        if (this.keys.ArrowUp) { this.player.dir = 'UP'; this.player.y -= speed; }
        if (this.keys.ArrowDown) { this.player.dir = 'DOWN'; this.player.y += speed; }
        if (this.keys.ArrowLeft) { this.player.dir = 'LEFT'; this.player.x -= speed; }
        if (this.keys.ArrowRight) { this.player.dir = 'RIGHT'; this.player.x += speed; }

        this.player.x = Math.min(Math.max(0, this.player.x), this.w - this.player.w);
        this.player.y = Math.min(Math.max(0, this.player.y), this.h - this.player.h);

        for (let obs of this.obstacles) {
            if (this.collision(this.player, obs)) {
                this.player.x = oldX; this.player.y = oldY;
                return;
            }
        }
        for (let enemy of this.enemies) {
            if (this.collision(this.player, enemy)) {
                this.player.x = oldX; this.player.y = oldY;
                return;
            }
        }
    }

    moveEnemies() {
        for (let enemy of this.enemies) {
            enemy.changeDirTimer++;
            if (enemy.changeDirTimer > 50) {
                enemy.changeDirTimer = 0;
                const dirs = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
                enemy.dir = dirs[Math.floor(Math.random() * 4)];
            }
            let oldX = enemy.x, oldY = enemy.y;
            switch(enemy.dir) {
                case 'UP': enemy.y -= this.enemySpeed; break;
                case 'DOWN': enemy.y += this.enemySpeed; break;
                case 'LEFT': enemy.x -= this.enemySpeed; break;
                case 'RIGHT': enemy.x += this.enemySpeed; break;
            }
            enemy.x = Math.min(Math.max(0, enemy.x), this.w - enemy.w);
            enemy.y = Math.min(Math.max(0, enemy.y), this.h - enemy.h);
            for (let obs of this.obstacles) {
                if (this.collision(enemy, obs)) { enemy.x = oldX; enemy.y = oldY; break; }
            }
            if (Math.random() < 0.015 && this.enemyShootCooldown <= 0) {
                this.enemyShoot(enemy);
                this.enemyShootCooldown = 35;
            }
        }
        if (this.enemyShootCooldown > 0) this.enemyShootCooldown--;
    }

    enemyShoot(enemy) {
        let bullet = { x: enemy.x + 11, y: enemy.y + 11, w: 5, h: 5, dir: enemy.dir };
        switch(enemy.dir) {
            case 'UP': bullet.y = enemy.y - 4; break;
            case 'DOWN': bullet.y = enemy.y + 29; break;
            case 'LEFT': bullet.x = enemy.x - 4; break;
            case 'RIGHT': bullet.x = enemy.x + 29; break;
        }
        this.enemyBullets.push(bullet);
    }

    updateBullets() {
        for (let i = 0; i < this.bullets.length; i++) {
            let b = this.bullets[i];
            switch(b.dir) {
                case 'UP': b.y -= 7; break; case 'DOWN': b.y += 7; break;
                case 'LEFT': b.x -= 7; break; case 'RIGHT': b.x += 7; break;
            }
            if (b.x < -20 || b.x > this.w + 20 || b.y < -20 || b.y > this.h + 20) {
                this.bullets.splice(i, 1); i--; continue;
            }
            for (let j = 0; j < this.enemies.length; j++) {
                if (this.collision(b, this.enemies[j])) {
                    this.enemies.splice(j, 1);
                    this.bullets.splice(i, 1);
                    this.score += 10;
                    document.getElementById('tankScore').innerText = this.score;
                    i--; break;
                }
            }
        }

        for (let i = 0; i < this.enemyBullets.length; i++) {
            let b = this.enemyBullets[i];
            switch(b.dir) {
                case 'UP': b.y -= 5.5; break; case 'DOWN': b.y += 5.5; break;
                case 'LEFT': b.x -= 5.5; break; case 'RIGHT': b.x += 5.5; break;
            }
            if (b.x < -20 || b.x > this.w + 20 || b.y < -20 || b.y > this.h + 20) {
                this.enemyBullets.splice(i, 1); i--; continue;
            }
            if (!this.gameOver && this.collision(b, this.player)) {
                this.gameOver = true;
                setTimeout(() => {
                    if (confirm('💀 你被击毁了！游戏结束 💀\n\n是否返回主界面？')) {
                        window.location.href = '../../index.html';
                    } else this.reset();
                }, 50);
                return;
            }
        }
    }

    collision(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    draw() {
        this.ctx.fillStyle = '#2a3a2a';
        this.ctx.fillRect(0, 0, this.w, this.h);

        for (let obs of this.obstacles) {
            this.ctx.fillStyle = '#8B7355';
            this.ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        }

        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.w, this.player.h);
        this.ctx.fillStyle = '#2E7D32';
        switch(this.player.dir) {
            case 'UP': this.ctx.fillRect(this.player.x + 12, this.player.y - 8, 4, 12); break;
            case 'DOWN': this.ctx.fillRect(this.player.x + 12, this.player.y + 24, 4, 12); break;
            case 'LEFT': this.ctx.fillRect(this.player.x - 8, this.player.y + 12, 12, 4); break;
            case 'RIGHT': this.ctx.fillRect(this.player.x + 24, this.player.y + 12, 12, 4); break;
        }

        for (let enemy of this.enemies) {
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
            this.ctx.fillStyle = '#B71C1C';
            switch(enemy.dir) {
                case 'UP': this.ctx.fillRect(enemy.x + 12, enemy.y - 6, 4, 10); break;
                case 'DOWN': this.ctx.fillRect(enemy.x + 12, enemy.y + 24, 4, 10); break;
                case 'LEFT': this.ctx.fillRect(enemy.x - 6, enemy.y + 12, 10, 4); break;
                case 'RIGHT': this.ctx.fillRect(enemy.x + 24, enemy.y + 12, 10, 4); break;
            }
        }

        for (let b of this.bullets) { this.ctx.fillStyle = '#FFD700'; this.ctx.fillRect(b.x, b.y, b.w, b.h); }
        for (let b of this.enemyBullets) { this.ctx.fillStyle = '#FF5722'; this.ctx.fillRect(b.x, b.y, b.w, b.h); }

        if (this.gameOver && !this.win) {
            this.ctx.font = 'bold 28px monospace';
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillText('GAME OVER', this.w/2 - 90, this.h/2);
        } else if (this.enemies.length === 0 && !this.win) {
            this.win = true;
            setTimeout(() => {
                if (confirm('🎉 胜利！你击毁了所有敌方坦克！ 🎉\n\n是否返回主界面？')) {
                    window.location.href = '../../index.html';
                } else this.reset();
            }, 50);
            this.ctx.font = 'bold 28px monospace';
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillText('VICTORY!', this.w/2 - 70, this.h/2);
        }
    }

    update() {
        if (this.gameOver) return;
        if (this.shootCooldown > 0) this.shootCooldown--;
        this.movePlayer();
        this.moveEnemies();
        this.updateBullets();
        if (this.enemies.length === 0 && !this.win) this.win = true;
    }

    gameLoop() { this.update(); this.draw(); requestAnimationFrame(() => this.gameLoop()); }

    reset() {
        this.gameOver = false; this.win = false; this.gameEnded = false;
        this.player = { x: 280, y: 540, w: 28, h: 28, dir: 'UP', color: '#4CAF50' };
        this.bullets = []; this.enemyBullets = [];
        this.score = 0; this.shootCooldown = 0; this.enemyShootCooldown = 0;
        this.keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
        document.getElementById('tankScore').innerText = '0';
        this.initEnemies();
    }
}

new TankGame();
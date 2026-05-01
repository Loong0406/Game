class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cell = 20;
        this.cols = 20;
        this.rows = 15;
        this.canvas.width = this.cols * this.cell;
        this.canvas.height = this.rows * this.cell;
        this.reset();
        this.bindEvents();
        this.bindTouchControls();
    }

    reset() {
        if (this.interval) clearInterval(this.interval);
        this.snake = [[10,7],[9,7],[8,7]];
        this.dir = 'RIGHT';
        this.nextDir = 'RIGHT';
        this.score = 0;
        this.gameOver = false;
        this.generateFood();
        this.updateScore();
        this.draw();
        this.interval = setInterval(() => this.update(), 140);
    }

    generateFood() {
        do { this.food = [Math.floor(Math.random() * this.cols), Math.floor(Math.random() * this.rows)]; }
        while (this.snake.some(seg => seg[0] === this.food[0] && seg[1] === this.food[1]));
    }

    update() {
        if (this.gameOver) return;
        this.dir = this.nextDir;
        const head = this.snake[0];
        let newHead = [...head];
        if (this.dir === 'RIGHT') newHead[0]++;
        else if (this.dir === 'LEFT') newHead[0]--;
        else if (this.dir === 'UP') newHead[1]--;
        else if (this.dir === 'DOWN') newHead[1]++;

        if (newHead[0] < 0 || newHead[0] >= this.cols || newHead[1] < 0 || newHead[1] >= this.rows ||
            this.snake.some(seg => seg[0] === newHead[0] && seg[1] === newHead[1])) {
            this.gameOver = true;
            clearInterval(this.interval);
            alert("游戏结束！");
            return;
        }
        this.snake.unshift(newHead);
        if (newHead[0] === this.food[0] && newHead[1] === this.food[1]) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
        } else this.snake.pop();
        this.draw();
    }

    draw() {
        // 适配手机
        const container = this.canvas.parentElement;
        const maxSize = Math.min(container.clientWidth - 40, 400);
        if (maxSize > 0 && maxSize < this.canvas.width) {
            const scale = maxSize / this.canvas.width;
            this.canvas.style.width = maxSize + 'px';
            this.canvas.style.height = (this.canvas.height * scale) + 'px';
        }

        this.ctx.fillStyle = '#1f3a1c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let s of this.snake) {
            this.ctx.fillStyle = '#6fdc6f';
            this.ctx.fillRect(s[0] * this.cell, s[1] * this.cell, this.cell - 1, this.cell - 1);
        }
        this.ctx.fillStyle = '#eb5e5e';
        this.ctx.fillRect(this.food[0] * this.cell, this.food[1] * this.cell, this.cell - 1, this.cell - 1);
    }

    updateScore() { document.getElementById('snakeScore').innerText = this.score; }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (!document.getElementById('snakeCanvas')) return;
            const key = e.key;
            if (key === 'ArrowRight' && this.dir !== 'LEFT') this.nextDir = 'RIGHT';
            else if (key === 'ArrowLeft' && this.dir !== 'RIGHT') this.nextDir = 'LEFT';
            else if (key === 'ArrowUp' && this.dir !== 'DOWN') this.nextDir = 'UP';
            else if (key === 'ArrowDown' && this.dir !== 'UP') this.nextDir = 'DOWN';
            e.preventDefault();
        });
        document.getElementById('resetSnake').onclick = () => { this.reset(); };
    }

    bindTouchControls() {
        const upBtn = document.querySelector('[data-dir="up"]');
        const downBtn = document.querySelector('[data-dir="down"]');
        const leftBtn = document.querySelector('[data-dir="left"]');
        const rightBtn = document.querySelector('[data-dir="right"]');

        const setDir = (dir) => {
            if (dir === 'up' && this.dir !== 'DOWN') this.nextDir = 'UP';
            else if (dir === 'down' && this.dir !== 'UP') this.nextDir = 'DOWN';
            else if (dir === 'left' && this.dir !== 'RIGHT') this.nextDir = 'LEFT';
            else if (dir === 'right' && this.dir !== 'LEFT') this.nextDir = 'RIGHT';
        };

        const bindBtn = (btn, dir) => {
            if (!btn) return;
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); setDir(dir); });
            btn.addEventListener('mousedown', (e) => { e.preventDefault(); setDir(dir); });
        };

        bindBtn(upBtn, 'up');
        bindBtn(downBtn, 'down');
        bindBtn(leftBtn, 'left');
        bindBtn(rightBtn, 'right');
    }
}

new SnakeGame();
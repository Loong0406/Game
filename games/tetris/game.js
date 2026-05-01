class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('tetrisCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cols = 10;
        this.rows = 20;
        this.cell = 30;
        this.canvas.width = this.cols * this.cell;
        this.canvas.height = this.rows * this.cell;
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.pieces = [
            [[1,1,1,1]],
            [[1,1],[1,1]],
            [[0,1,0],[1,1,1]],
            [[1,0,0],[1,1,1]],
            [[0,0,1],[1,1,1]],
            [[0,1,1],[1,1,0]],
            [[1,1,0],[0,1,1]]
        ];
        this.colors = ['cyan','yellow','purple','orange','blue','green','red'];
        this.reset();
        this.bindEvents();
        this.bindTouchControls();
    }

    reset() {
        if (this.interval) clearInterval(this.interval);
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.spawnPiece();
        this.updateScore();
        this.draw();
        this.interval = setInterval(() => { if (!this.gameOver) this.moveDown(); }, 400);
    }

    spawnPiece() {
        const idx = Math.floor(Math.random() * this.pieces.length);
        this.piece = this.pieces[idx].map(row => [...row]);
        this.color = this.colors[idx];
        this.pieceX = Math.floor((this.cols - this.piece[0].length) / 2);
        this.pieceY = 0;
        if (this.collision()) this.gameOver = true;
    }

    collision() {
        for (let y = 0; y < this.piece.length; y++)
            for (let x = 0; x < this.piece[0].length; x++)
                if (this.piece[y][x] && (this.pieceY + y >= this.rows || this.pieceX + x < 0 || this.pieceX + x >= this.cols || this.board[this.pieceY + y][this.pieceX + x]))
                    return true;
        return false;
    }

    merge() {
        for (let y = 0; y < this.piece.length; y++)
            for (let x = 0; x < this.piece[0].length; x++)
                if (this.piece[y][x]) this.board[this.pieceY + y][this.pieceX + x] = this.color;
        this.clearLines();
        this.spawnPiece();
        this.draw();
        if (this.gameOver) { clearInterval(this.interval); alert("游戏结束！"); }
    }

    clearLines() {
        let cleared = 0;
        for (let row = this.rows - 1; row >= 0; ) {
            let full = true;
            for (let col = 0; col < this.cols; col++) if (!this.board[row][col]) full = false;
            if (full) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.cols).fill(0));
                cleared++;
            } else row--;
        }
        if (cleared) this.score += [0, 100, 300, 600, 1000][cleared];
        this.updateScore();
    }

    moveDown() { if (!this.gameOver) { this.pieceY++; if (this.collision()) { this.pieceY--; this.merge(); } this.draw(); } }
    moveHor(dx) { this.pieceX += dx; if (this.collision()) this.pieceX -= dx; else this.draw(); }
    rotate() {
        const rotated = this.piece[0].map((_, i) => this.piece.map(row => row[i]).reverse());
        const old = this.piece; this.piece = rotated;
        if (this.collision()) this.piece = old; else this.draw();
    }

    draw() {
        // 适配手机分辨率
        const container = this.canvas.parentElement;
        const maxSize = Math.min(container.clientWidth - 40, 400);
        if (maxSize > 0 && maxSize < this.canvas.width) {
            const scale = maxSize / this.canvas.width;
            this.canvas.style.width = maxSize + 'px';
            this.canvas.style.height = (this.canvas.height * scale) + 'px';
        }

        this.ctx.fillStyle = '#0f121c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let row = 0; row < this.rows; row++)
            for (let col = 0; col < this.cols; col++)
                if (this.board[row][col]) {
                    this.ctx.fillStyle = this.board[row][col];
                    this.ctx.fillRect(col * this.cell, row * this.cell, this.cell - 1, this.cell - 1);
                }
        for (let y = 0; y < this.piece.length; y++)
            for (let x = 0; x < this.piece[0].length; x++)
                if (this.piece[y][x]) {
                    this.ctx.fillStyle = this.color;
                    this.ctx.fillRect((this.pieceX + x) * this.cell, (this.pieceY + y) * this.cell, this.cell - 1, this.cell - 1);
                }
    }

    updateScore() { document.getElementById('tetrisScore').innerText = this.score; }

    bindEvents() {
        // 键盘控制
        window.addEventListener('keydown', (e) => {
            if (!document.getElementById('tetrisCanvas')) return;
            if (e.key === 'ArrowLeft') this.moveHor(-1);
            else if (e.key === 'ArrowRight') this.moveHor(1);
            else if (e.key === 'ArrowDown') this.moveDown();
            else if (e.key === 'ArrowUp') this.rotate();
            e.preventDefault();
        });
        document.getElementById('resetTetris').onclick = () => { this.reset(); };
    }

    bindTouchControls() {
        // 方向按钮
        const upBtn = document.querySelector('[data-dir="up"]');
        const downBtn = document.querySelector('[data-dir="down"]');
        const leftBtn = document.querySelector('[data-dir="left"]');
        const rightBtn = document.querySelector('[data-dir="right"]');
        const rotateBtn = document.getElementById('rotateBtn');

        let moveInterval = null;
        let currentDir = null;

        const startMove = (dir) => {
            if (currentDir) return;
            currentDir = dir;
            if (dir === 'left') this.moveHor(-1);
            if (dir === 'right') this.moveHor(1);
            if (dir === 'down') this.moveDown();
            moveInterval = setInterval(() => {
                if (currentDir === 'left') this.moveHor(-1);
                if (currentDir === 'right') this.moveHor(1);
                if (currentDir === 'down') this.moveDown();
            }, 100);
        };

        const stopMove = () => {
            if (moveInterval) clearInterval(moveInterval);
            currentDir = null;
        };

        const bindButton = (btn, dir) => {
            if (!btn) return;
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); startMove(dir); });
            btn.addEventListener('touchend', stopMove);
            btn.addEventListener('touchcancel', stopMove);
            btn.addEventListener('mousedown', (e) => { e.preventDefault(); startMove(dir); });
            btn.addEventListener('mouseup', stopMove);
        };

        bindButton(leftBtn, 'left');
        bindButton(rightBtn, 'right');
        bindButton(downBtn, 'down');

        if (upBtn) {
            upBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.rotate(); });
            upBtn.addEventListener('mousedown', (e) => { e.preventDefault(); this.rotate(); });
        }

        if (rotateBtn) {
            rotateBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.rotate(); });
            rotateBtn.addEventListener('mousedown', (e) => { e.preventDefault(); this.rotate(); });
        }
    }
}

new TetrisGame();
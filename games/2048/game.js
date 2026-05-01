class Game2048 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.init();
        this.renderGridBackground();
        this.bindEvents();
        this.addSwipeSupport();
    }

    init() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.addRandomTile();
        this.addRandomTile();
        this.updateScore();
        this.render();
    }

    addRandomTile() {
        const empty = [];
        for (let i = 0; i < this.size; i++)
            for (let j = 0; j < this.size; j++)
                if (this.grid[i][j] === 0) empty.push([i, j]);
        if (empty.length) {
            const [x, y] = empty[Math.floor(Math.random() * empty.length)];
            this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            let row = this.grid[i].filter(v => v !== 0);
            let newRow = [];
            for (let j = 0; j < row.length; j++) {
                if (j + 1 < row.length && row[j] === row[j + 1]) {
                    newRow.push(row[j] * 2);
                    this.score += row[j] * 2;
                    j++;
                } else newRow.push(row[j]);
            }
            while (newRow.length < this.size) newRow.push(0);
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) moved = true;
            this.grid[i] = newRow;
        }
        return moved;
    }

    moveRight() { this.reverse(); let m = this.moveLeft(); this.reverse(); return m; }
    reverse() { for (let i = 0; i < this.size; i++) this.grid[i].reverse(); }
    transpose() {
        let newG = Array(4).fill().map(() => Array(4).fill(0));
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) newG[j][i] = this.grid[i][j];
        this.grid = newG;
    }
    moveUp() { this.transpose(); let m = this.moveLeft(); this.transpose(); return m; }
    moveDown() { this.transpose(); let m = this.moveRight(); this.transpose(); return m; }

    move(direction) {
        let moved = false;
        if (direction === 'left') moved = this.moveLeft();
        else if (direction === 'right') moved = this.moveRight();
        else if (direction === 'up') moved = this.moveUp();
        else if (direction === 'down') moved = this.moveDown();
        if (moved) {
            this.addRandomTile();
            this.updateScore();
            this.render();
            if (this.isGameOver()) setTimeout(() => alert("游戏结束！点击新游戏"), 50);
            if (this.checkWin()) setTimeout(() => alert("🎉 恭喜你达到2048！ 🎉"), 50);
        }
    }

    checkWin() {
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++)
                if (this.grid[i][j] === 2048) return true;
        return false;
    }

    isGameOver() {
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++)
                if (this.grid[i][j] === 0) return false;
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++) {
                if (j + 1 < 4 && this.grid[i][j] === this.grid[i][j + 1]) return false;
                if (i + 1 < 4 && this.grid[i][j] === this.grid[i + 1][j]) return false;
            }
        return true;
    }

    renderGridBackground() {
        const container = document.getElementById('gridContainer');
        container.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            container.appendChild(cell);
        }
    }

    render() {
        const container = document.getElementById('gridContainer');
        const oldTiles = container.querySelectorAll('.tile');
        oldTiles.forEach(t => t.remove());
        const gap = 12;
        const rect = container.getBoundingClientRect();
        const tileSize = (rect.width - gap * 3) / 4;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const val = this.grid[i][j];
                if (val !== 0) {
                    const tile = document.createElement('div');
                    tile.className = 'tile';
                    tile.setAttribute('data-val', val);
                    tile.textContent = val;
                    tile.style.width = tileSize + 'px';
                    tile.style.height = tileSize + 'px';
                    tile.style.left = j * (tileSize + gap) + 'px';
                    tile.style.top = i * (tileSize + gap) + 'px';
                    tile.style.lineHeight = tileSize + 'px';
                    container.appendChild(tile);
                }
            }
        }
        this.updateScore();
    }

    updateScore() { document.getElementById('gameScore').innerText = this.score; }

    bindEvents() {
        // 键盘控制
        window.addEventListener('keydown', (e) => {
            let dir = null;
            if (e.key === 'ArrowLeft') dir = 'left';
            else if (e.key === 'ArrowRight') dir = 'right';
            else if (e.key === 'ArrowUp') dir = 'up';
            else if (e.key === 'ArrowDown') dir = 'down';
            else if (e.key === 'a') dir = 'left';
            else if (e.key === 'd') dir = 'right';
            else if (e.key === 'w') dir = 'up';
            else if (e.key === 's') dir = 'down';
            if (dir) { e.preventDefault(); this.move(dir); }
        });
        document.getElementById('resetGame').onclick = () => { this.init(); };
    }

    addSwipeSupport() {
        const container = document.getElementById('gridContainer');
        if (!container) return;

        let startX, startY;
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            e.preventDefault();
        });

        container.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const dx = endX - startX;
            const dy = endY - startY;

            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) this.move('right');
                else this.move('left');
            } else {
                if (dy > 0) this.move('down');
                else this.move('up');
            }
            e.preventDefault();
        });
    }
}

new Game2048();
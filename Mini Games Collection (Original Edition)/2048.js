let game2048Board = [];
let game2048Score = 0;
let game2048HighScore = localStorage.getItem('2048HighScore') || 0;
let is2048GameOver = false;
const game2048Size = 4;

// 获取DOM元素
const game2048BoardElement = document.getElementById('2048-board');
const game2048ScoreElement = document.getElementById('2048-score');
const game2048HighScoreElement = document.getElementById('2048-high-score');
const game2048StartBtn = document.getElementById('2048-start');
const game2048ResetBtn = document.getElementById('2048-reset');
const game2048GameOverElement = document.getElementById('2048-game-over');
const game2048FinalScoreElement = document.getElementById('2048-final-score');
const game2048PlayAgainBtn = document.getElementById('2048-play-again');

// 初始化2048游戏
function init2048Game() {
    // 移除旧的事件监听器
    if (game2048StartBtn) game2048StartBtn.removeEventListener('click', start2048Game);
    if (game2048ResetBtn) game2048ResetBtn.removeEventListener('click', reset2048Game);
    if (game2048PlayAgainBtn) game2048PlayAgainBtn.removeEventListener('click', reset2048Game);
    document.removeEventListener('keydown', handle2048KeyPress);

    // 重置游戏状态
    game2048Board = [];
    game2048Score = 0;
    is2048GameOver = false;
    if (game2048GameOverElement) game2048GameOverElement.style.display = 'none';

    // 初始化棋盘
    for (let i = 0; i < game2048Size; i++) {
        game2048Board[i] = [];
        for (let j = 0; j < game2048Size; j++) {
            game2048Board[i][j] = 0;
        }
    }

    // 添加两个初始方块
    addRandomTile();
    addRandomTile();

    // 更新分数显示
    if (game2048ScoreElement) game2048ScoreElement.textContent = game2048Score;
    if (game2048HighScoreElement) game2048HighScoreElement.textContent = game2048HighScore;

    // 渲染棋盘
    render2048Board();

    // 添加事件监听
    if (game2048StartBtn) game2048StartBtn.addEventListener('click', start2048Game);
    if (game2048ResetBtn) game2048ResetBtn.addEventListener('click', reset2048Game);
    if (game2048PlayAgainBtn) game2048PlayAgainBtn.addEventListener('click', reset2048Game);
    document.addEventListener('keydown', handle2048KeyPress);
}

// 添加随机方块
function addRandomTile() {
    // 寻找空位置
    const emptyCells = [];
    for (let i = 0; i < game2048Size; i++) {
        for (let j = 0; j < game2048Size; j++) {
            if (game2048Board[i][j] === 0) {
                emptyCells.push({i, j});
            }
        }
    }

    if (emptyCells.length === 0) {
        // 没有空位置，游戏结束
        check2048GameOver();
        return;
    }

    // 随机选择一个空位置
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const {i, j} = emptyCells[randomIndex];

    // 90%概率生成2，10%概率生成4
    /**
     * 这个概率可以根据用户实际挑战难度进行调整
     */
    game2048Board[i][j] = Math.random() < 0.9 ? 2 : 4;
}

// 渲染棋盘
function render2048Board() {
    game2048BoardElement.innerHTML = '';
    game2048BoardElement.style.position = 'relative';
    game2048BoardElement.style.width = '400px';
    game2048BoardElement.style.height = '400px';
    game2048BoardElement.style.margin = '0 auto';

    const cellSize = 100; // 每个格子的大小
    const gap = 5; // 格子之间的间隙

    for (let i = 0; i < game2048Size; i++) {
        for (let j = 0; j < game2048Size; j++) {
            const cellValue = game2048Board[i][j];
            const cellElement = document.createElement('div');
            cellElement.classList.add('game-2048-cell');
            cellElement.style.width = `${cellSize - gap * 2}px`;
            cellElement.style.height = `${cellSize - gap * 2}px`;
            cellElement.style.left = `${j * cellSize + gap}px`;
            cellElement.style.top = `${i * cellSize + gap}px`;

            if (cellValue !== 0) {
                cellElement.classList.add(`cell-${cellValue}`);
                cellElement.textContent = cellValue;
            }

            game2048BoardElement.appendChild(cellElement);
        }
    }
}

// 添加一个新函数用于处理动态移动
function animateMove(direction) {
    return new Promise((resolve) => {
        let moved = false;
        const cellSize = 100; // 每个格子的大小
        const gap = 5; // 格子之间的间隙
        const cells = document.querySelectorAll('.game-2048-cell');
        const moves = []; // 记录每个格子的移动
        const oldBoard = JSON.parse(JSON.stringify(game2048Board)); // 记录移动前的棋盘状态

        // 根据方向计算移动
        switch (direction) {
            case 'up':
                moved = moveUp2048();
                break;
            case 'down':
                moved = moveDown2048();
                break;
            case 'left':
                moved = moveLeft2048();
                break;
            case 'right':
                moved = moveRight2048();
                break;
        }

        if (!moved) {
            resolve(false);
            return;
        }

        // 创建移动动画
        for (let i = 0; i < game2048Size; i++) {
            for (let j = 0; j < game2048Size; j++) {
                if (oldBoard[i][j] !== 0) {
                    // 找到移动前的位置
                    const oldIndex = i * game2048Size + j;
                    // 找到移动后的位置
                    let newI, newJ;
                    for (let x = 0; x < game2048Size; x++) {
                        for (let y = 0; y < game2048Size; y++) {
                            if (game2048Board[x][y] === oldBoard[i][j] && (x !== i || y !== j)) {
                                newI = x;
                                newJ = y;
                                break;
                            }
                        }
                    }

                    if (newI !== undefined && newJ !== undefined) {
                        // 创建新的动画元素
                        const animateElement = document.createElement('div');
                        animateElement.classList.add('game-2048-cell');
                        animateElement.classList.add(`cell-${oldBoard[i][j]}`);
                        animateElement.textContent = oldBoard[i][j];
                        animateElement.style.width = `${cellSize - gap * 2}px`;
                        animateElement.style.height = `${cellSize - gap * 2}px`;
                        animateElement.style.left = `${j * cellSize + gap}px`;
                        animateElement.style.top = `${i * cellSize + gap}px`;
                        animateElement.style.position = 'absolute';
                        animateElement.style.zIndex = '10';
                        game2048BoardElement.appendChild(animateElement);

                        // 应用动画
                        setTimeout(() => {
                            animateElement.style.transform = `translate(${(newJ - j) * cellSize}px, ${(newI - i) * cellSize}px)`;
                            animateElement.style.transition = 'transform 0.3s ease-out';
                        }, 10);

                        moves.push({element: animateElement, i: newI, j: newJ, value: oldBoard[i][j]});
                    }
                }
            }
        }

        // 等待动画完成
        setTimeout(() => {
            // 移除动画元素
            moves.forEach(move => {
                move.element.remove();
            });

            // 添加新方块
            addRandomTile();

            // 重新渲染棋盘
            render2048Board();

            // 检查游戏是否结束
            check2048GameOver();

            resolve(true);
        }, 350); // 比CSS过渡时间稍长
    });
}

// 修改键盘事件处理函数
function handle2048KeyPress(e) {
    if (is2048GameOver) return;

    let direction;

    switch (e.key) {
        case 'ArrowUp':
            direction = 'up';
            break;
        case 'ArrowDown':
            direction = 'down';
            break;
        case 'ArrowLeft':
            direction = 'left';
            break;
        case 'ArrowRight':
            direction = 'right';
            break;
        default:
            return;
    }

    // 执行动画移动
    animateMove(direction);
}

// 向上移动
function moveUp2048() {
    let moved = false;

    for (let j = 0; j < game2048Size; j++) {
        // 合并相同的方块
        for (let i = 1; i < game2048Size; i++) {
            if (game2048Board[i][j] !== 0) {
                let k = i;
                while (k > 0 && game2048Board[k - 1][j] === 0) {
                    // 移动方块
                    game2048Board[k - 1][j] = game2048Board[k][j];
                    game2048Board[k][j] = 0;
                    k--;
                    moved = true;
                }

                if (k > 0 && game2048Board[k - 1][j] === game2048Board[k][j]) {
                    // 合并方块
                    game2048Board[k - 1][j] *= 2;
                    game2048Score += game2048Board[k - 1][j];
                    game2048Board[k][j] = 0;
                    moved = true;
                    update2048Score();
                }
            }
        }
    }

    return moved;
}

// 向下移动
function moveDown2048() {
    let moved = false;

    for (let j = 0; j < game2048Size; j++) {
        // 合并相同的方块
        for (let i = game2048Size - 2; i >= 0; i--) {
            if (game2048Board[i][j] !== 0) {
                let k = i;
                while (k < game2048Size - 1 && game2048Board[k + 1][j] === 0) {
                    // 移动方块
                    game2048Board[k + 1][j] = game2048Board[k][j];
                    game2048Board[k][j] = 0;
                    k++;
                    moved = true;
                }

                if (k < game2048Size - 1 && game2048Board[k + 1][j] === game2048Board[k][j]) {
                    // 合并方块
                    game2048Board[k + 1][j] *= 2;
                    game2048Score += game2048Board[k + 1][j];
                    game2048Board[k][j] = 0;
                    moved = true;
                    update2048Score();
                }
            }
        }
    }

    return moved;
}

// 向左移动
function moveLeft2048() {
    let moved = false;

    for (let i = 0; i < game2048Size; i++) {
        // 合并相同的方块
        for (let j = 1; j < game2048Size; j++) {
            if (game2048Board[i][j] !== 0) {
                let k = j;
                while (k > 0 && game2048Board[i][k - 1] === 0) {
                    // 移动方块
                    game2048Board[i][k - 1] = game2048Board[i][k];
                    game2048Board[i][k] = 0;
                    k--;
                    moved = true;
                }

                if (k > 0 && game2048Board[i][k - 1] === game2048Board[i][k]) {
                    // 合并方块
                    game2048Board[i][k - 1] *= 2;
                    game2048Score += game2048Board[i][k - 1];
                    game2048Board[i][k] = 0;
                    moved = true;
                    update2048Score();
                }
            }
        }
    }

    return moved;
}

// 向右移动
function moveRight2048() {
    let moved = false;

    for (let i = 0; i < game2048Size; i++) {
        // 合并相同的方块
        for (let j = game2048Size - 2; j >= 0; j--) {
            if (game2048Board[i][j] !== 0) {
                let k = j;
                while (k < game2048Size - 1 && game2048Board[i][k + 1] === 0) {
                    // 移动方块
                    game2048Board[i][k + 1] = game2048Board[i][k];
                    game2048Board[i][k] = 0;
                    k++;
                    moved = true;
                }

                if (k < game2048Size - 1 && game2048Board[i][k + 1] === game2048Board[i][k]) {
                    // 合并方块
                    game2048Board[i][k + 1] *= 2;
                    game2048Score += game2048Board[i][k + 1];
                    game2048Board[i][k] = 0;
                    moved = true;
                    update2048Score();
                }
            }
        }
    }

    return moved;
}

// 更新分数
function update2048Score() {
    game2048ScoreElement.textContent = game2048Score;

    // 更新最高分
    if (game2048Score > game2048HighScore) {
        game2048HighScore = game2048Score;
        localStorage.setItem('2048HighScore', game2048HighScore);
        game2048HighScoreElement.textContent = game2048HighScore;
    }
}

// 检查游戏是否结束
function check2048GameOver() {
    // 检查是否有空位置
    for (let i = 0; i < game2048Size; i++) {
        for (let j = 0; j < game2048Size; j++) {
            if (game2048Board[i][j] === 0) {
                return;
            }
        }
    }

    // 检查是否可以合并
    for (let i = 0; i < game2048Size; i++) {
        for (let j = 0; j < game2048Size; j++) {
            // 检查右侧
            if (j < game2048Size - 1 && game2048Board[i][j] === game2048Board[i][j + 1]) {
                return;
            }
            // 检查下方
            if (i < game2048Size - 1 && game2048Board[i][j] === game2048Board[i + 1][j]) {
                return;
            }
        }
    }

    // 游戏结束
    is2048GameOver = true;
    game2048FinalScoreElement.textContent = game2048Score;
    game2048GameOverElement.style.display = 'block';
}

// 开始游戏
function start2048Game() {
    if (is2048GameOver) {
        reset2048Game();
    }
}

// 重置游戏
function reset2048Game() {
    // 重置游戏状态
    game2048Board = [];
    game2048Score = 0;
    is2048GameOver = false;
    game2048GameOverElement.style.display = 'none';

    // 初始化棋盘
    for (let i = 0; i < game2048Size; i++) {
        game2048Board[i] = [];
        for (let j = 0; j < game2048Size; j++) {
            game2048Board[i][j] = 0;
        }
    }

    // 添加两个初始方块
    addRandomTile();
    addRandomTile();

    // 更新分数显示
    game2048ScoreElement.textContent = game2048Score;

    // 渲染棋盘
    render2048Board();
}
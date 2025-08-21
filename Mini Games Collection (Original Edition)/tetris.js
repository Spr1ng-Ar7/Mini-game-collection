let tetrisBoard = [];
let tetrisScore = 0;
let tetrisLevel = 1;
let tetrisGameLoopId = null;
let isTetrisPaused = false;
let isTetrisGameOver = false;
let currentPiece = null;
let nextPiece = null;
let currentX = 0;
let currentY = 0;
const tetrisRows = 20;
const tetrisCols = 10;
const tetrisBlockSize = 20;

// 方块形状定义
const tetrominoes = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ]
};

// 方块颜色
const tetrominoColors = {
    I: '#00FFFF', // Cyan
    O: '#FFFF00', // Yellow
    T: '#800080', // Purple
    L: '#FFA500', // Orange
    J: '#0000FF', // Blue
    S: '#00FF00', // Green
    Z: '#FF0000'  // Red
};

// 获取DOM元素
let tetrisCanvas = document.getElementById('tetris-canvas');
let tetrisCtx = tetrisCanvas ? tetrisCanvas.getContext('2d') : null;
let nextPieceCanvas = document.getElementById('tetris-next-canvas');
let nextPieceCtx = nextPieceCanvas ? nextPieceCanvas.getContext('2d') : null;
let tetrisScoreElement = document.getElementById('tetris-score');
let tetrisHighScoreElement = document.getElementById('tetris-high-score');
let tetrisLevelElement = document.getElementById('tetris-level');
let tetrisStartBtn = document.getElementById('tetris-start');
let tetrisPauseBtn = document.getElementById('tetris-pause');
let tetrisResetBtn = document.getElementById('tetris-reset');
let tetrisGameOverElement = document.getElementById('tetris-game-over');
let tetrisFinalScoreElement = document.getElementById('tetris-final-score');
let tetrisPlayAgainBtn = document.getElementById('tetris-play-again');
let tetrisRulesBtn = document.getElementById('tetris-rules');
let tetrisRulesModal = document.getElementById('tetris-rules-modal');
let tetrisCloseRulesBtn = tetrisRulesModal ? tetrisRulesModal.querySelector('.close-btn') : null;
let tetrisLevel1Btn = document.getElementById('tetris-level-1');
let tetrisLevel2Btn = document.getElementById('tetris-level-2');
let tetrisLevel3Btn = document.getElementById('tetris-level-3');

// 游戏难度配置
const difficultyLevels = {
    1: { speed: 1, label: '简单' },
    2: { speed: 2, label: '中等' },
    3: { initialSpeed: 3, accelerationInterval: 20, accelerationAmount: 0.5, maxSpeed: 10, label: '困难' }
};

// 初始化游戏变量
let gameStartTime = 0;
let currentGameSpeed = 1;

// 初始化俄罗斯方块游戏
function initTetrisGame() {
    // 重置游戏状态
    if (tetrisGameLoopId) clearInterval(tetrisGameLoopId);
    tetrisBoard = [];
    tetrisScore = 0;
    tetrisLevel = 1;
    currentGameSpeed = difficultyLevels[1].speed;
    isTetrisPaused = true;  // 初始状态设置为暂停
    isTetrisGameOver = false;
    
    // 检查元素是否存在再设置属性
    if (tetrisGameOverElement) tetrisGameOverElement.style.display = 'none';
    if (tetrisPauseBtn) tetrisPauseBtn.textContent = '开始';  // 初始显示为'开始'

    // 初始化棋盘
    for (let i = 0; i < tetrisRows; i++) {
        tetrisBoard[i] = [];
        for (let j = 0; j < tetrisCols; j++) {
            tetrisBoard[i][j] = 0;
        }
    }

    // 生成当前方块和下一个方块
    generateTetromino();

    // 更新分数和等级显示 - 检查元素是否存在
    if (tetrisScoreElement) tetrisScoreElement.textContent = tetrisScore;
    if (tetrisLevelElement) tetrisLevelElement.textContent = tetrisLevel;
    
    // 更新最高分显示
    if (tetrisHighScoreElement) {
        const highScore = localStorage.getItem('tetrisHighScore') || 0;
        tetrisHighScoreElement.textContent = highScore;
    }

    // 绘制游戏
    drawTetrisGame();

    // 移除旧的事件监听器（如果存在）
    if (tetrisStartBtn) tetrisStartBtn.removeEventListener('click', startTetrisGame);
    if (tetrisPauseBtn) tetrisPauseBtn.removeEventListener('click', pauseTetrisGame);
    if (tetrisResetBtn) tetrisResetBtn.removeEventListener('click', resetTetrisGame);
    if (tetrisPlayAgainBtn) tetrisPlayAgainBtn.removeEventListener('click', resetTetrisGame);

    // 添加事件监听
    if (tetrisStartBtn) tetrisStartBtn.addEventListener('click', startTetrisGame);
    if (tetrisPauseBtn) tetrisPauseBtn.addEventListener('click', pauseTetrisGame);
    if (tetrisResetBtn) tetrisResetBtn.addEventListener('click', resetTetrisGame);
    if (tetrisPlayAgainBtn) tetrisPlayAgainBtn.addEventListener('click', resetTetrisGame);

    // 确保只添加一次键盘事件监听器
    document.removeEventListener('keydown', handleTetrisKeyPress);
    document.addEventListener('keydown', handleTetrisKeyPress);

    // 添加难度级别按钮事件监听
    if (tetrisLevel1Btn) {
        tetrisLevel1Btn.removeEventListener('click', () => setTetrisDifficulty(1));
        tetrisLevel1Btn.addEventListener('click', () => setTetrisDifficulty(1));
    }
    if (tetrisLevel2Btn) {
        tetrisLevel2Btn.removeEventListener('click', () => setTetrisDifficulty(2));
        tetrisLevel2Btn.addEventListener('click', () => setTetrisDifficulty(2));
    }
    if (tetrisLevel3Btn) {
        tetrisLevel3Btn.removeEventListener('click', () => setTetrisDifficulty(3));
        tetrisLevel3Btn.addEventListener('click', () => setTetrisDifficulty(3));
    }

    // 添加游戏规则按钮事件监听
    if (tetrisRulesBtn && tetrisRulesModal && tetrisCloseRulesBtn) {
        tetrisRulesBtn.onclick = showTetrisRules;
        tetrisCloseRulesBtn.onclick = hideTetrisRules;
        window.onclick = handleOutsideClick;
    }

    // 添加自定义难度按钮事件监听
    const tetrisCustomBtn = document.getElementById('tetris-custom');
    const tetrisCustomModal = document.getElementById('tetris-custom-modal');
    const tetrisCustomCloseBtn = tetrisCustomModal ? tetrisCustomModal.querySelector('.close-btn') : null;
    const tetrisCustomApplyBtn = document.getElementById('tetris-custom-apply');

    if (tetrisCustomBtn && tetrisCustomModal && tetrisCustomCloseBtn && tetrisCustomApplyBtn) {
        tetrisCustomBtn.onclick = () => tetrisCustomModal.classList.remove('hidden');
        tetrisCustomCloseBtn.onclick = () => tetrisCustomModal.classList.add('hidden');
        tetrisCustomApplyBtn.onclick = function() {
            const levelSelect = document.getElementById('tetris-custom-level');
            if (levelSelect) {
                const level = parseInt(levelSelect.value);
                setTetrisDifficulty(level);
            }
            tetrisCustomModal.classList.add('hidden');
        };
    }
}

// 开始游戏
function startTetrisGame() {
    if (tetrisGameLoopId) clearInterval(tetrisGameLoopId);
    if (isTetrisGameOver) {
        initTetrisGame();
        return; // 重新初始化后返回
    }
    isTetrisPaused = false;
    tetrisPauseBtn.textContent = '暂停';

    // 记录游戏开始时间
    gameStartTime = Date.now();

    // 根据当前级别设置游戏速度
    if (tetrisLevel === 3) {
        currentGameSpeed = difficultyLevels[3].initialSpeed;
        tetrisGameLoopId = setInterval(updateTetrisGame, 1000 / currentGameSpeed);
    } else {
        currentGameSpeed = difficultyLevels[tetrisLevel].speed;
        tetrisGameLoopId = setInterval(updateTetrisGame, 1000 / currentGameSpeed);
    }
}

// 暂停游戏
function pauseTetrisGame() {
    isTetrisPaused = !isTetrisPaused;
    if (isTetrisPaused) {
        clearInterval(tetrisGameLoopId);
        tetrisPauseBtn.textContent = '继续';
    } else {
        // 恢复游戏时使用当前游戏速度
        tetrisGameLoopId = setInterval(updateTetrisGame, 1000 / currentGameSpeed);
        tetrisPauseBtn.textContent = '暂停';
    }
}

// 重置游戏
function resetTetrisGame() {
    // 停止游戏循环
    if (tetrisGameLoopId) clearInterval(tetrisGameLoopId);
    
    // 重新初始化游戏
    initTetrisGame();
    
    // 游戏状态设置为未开始
    isTetrisPaused = true;
    tetrisPauseBtn.textContent = '开始';
}

// 处理弹窗外部点击事件
function handleOutsideClick(event) {
    if (tetrisRulesModal && event.target === tetrisRulesModal) {
        hideTetrisRules();
    }
}

// 设置游戏难度
function setTetrisDifficulty(level) {
    if (level < 1 || level > 3) return;

    tetrisLevel = level;
    tetrisLevelElement.textContent = tetrisLevel;

    // 记录游戏开始时间（用于级别三的时间计算）
    gameStartTime = Date.now();

    // 更新游戏速度
    if (tetrisGameLoopId) {
        clearInterval(tetrisGameLoopId);
        if (level === 3) {
            currentGameSpeed = difficultyLevels[level].initialSpeed;
            tetrisGameLoopId = setInterval(updateTetrisGame, 1000 / currentGameSpeed);
        } else {
            currentGameSpeed = difficultyLevels[level].speed;
            tetrisGameLoopId = setInterval(updateTetrisGame, 1000 / currentGameSpeed);
        }
    }
}

// 显示游戏规则
function showTetrisRules() {
    if (tetrisRulesModal) {
        tetrisRulesModal.classList.remove('hidden');
    }
}

// 隐藏游戏规则
function hideTetrisRules() {
    if (tetrisRulesModal) {
        tetrisRulesModal.classList.add('hidden');
    }
}

// 生成方块
function generateTetromino() {
    // 随机选择一个方块类型
    const tetrominoKeys = Object.keys(tetrominoes);
    const randomKey = tetrominoKeys[Math.floor(Math.random() * tetrominoKeys.length)];

    // 如果没有下一个方块，则生成一个
    if (!nextPiece) {
        nextPiece = {
            shape: tetrominoes[randomKey],
            color: tetrominoColors[randomKey],
            type: randomKey
        };
    }

    // 设置当前方块为下一个方块
    currentPiece = nextPiece;

    // 生成新的下一个方块
    const nextRandomKey = tetrominoKeys[Math.floor(Math.random() * tetrominoKeys.length)];
    nextPiece = {
        shape: tetrominoes[nextRandomKey],
        color: tetrominoColors[nextRandomKey],
        type: nextRandomKey
    };

    // 设置初始位置
    currentX = Math.floor(tetrisCols / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentY = 0;

    // 检查游戏是否结束（新方块无法放置）
    if (!isValidMove(0, 0)) {
        isTetrisGameOver = true;
        clearInterval(tetrisGameLoopId);
        tetrisGameOver();
    }

    // 绘制下一个方块
    drawNextPiece();
}

// 旋转方块
function rotateTetromino() {
    if (isTetrisPaused || isTetrisGameOver) return;

    // 创建旋转后的新形状
    const newShape = [];
    for (let i = 0; i < currentPiece.shape[0].length; i++) {
        newShape[i] = [];
        for (let j = currentPiece.shape.length - 1; j >= 0; j--) {
            newShape[i].push(currentPiece.shape[j][i]);
        }
    }

    // 保存旧形状
    const oldShape = currentPiece.shape;

    // 尝试应用新形状
    currentPiece.shape = newShape;

    // 如果旋转后位置无效，则恢复旧形状
    if (!isValidMove(0, 0)) {
        currentPiece.shape = oldShape;
    } else {
        // 有效则绘制
        drawTetrisGame();
    }
}

// 检查移动是否有效
function isValidMove(offsetX, offsetY) {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const newX = currentX + x + offsetX;
                const newY = currentY + y + offsetY;

                // 检查是否超出边界
                if (newX < 0 || newX >= tetrisCols || newY >= tetrisRows) {
                    return false;
                }

                // 检查是否与已有方块重叠
                if (newY >= 0 && tetrisBoard[newY][newX]) {
                    return false;
                }
            }
        }
    }

    return true;
}

// 移动方块
function moveTetromino(offsetX, offsetY) {
    if (isTetrisPaused || isTetrisGameOver) return;

    if (isValidMove(offsetX, offsetY)) {
        currentX += offsetX;
        currentY += offsetY;
        drawTetrisGame();
        return true;
    } else if (offsetY > 0) {
        // 如果向下移动无效，则固定方块
        fixTetromino();
        return false;
    }

    return false;
}

// 固定方块到棋盘
function fixTetromino() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const boardY = currentY + y;
                const boardX = currentX + x;

                // 检查是否超出顶部边界（游戏结束）
                if (boardY < 0) {
                    isTetrisGameOver = true;
                    clearInterval(tetrisGameLoopId);
                    tetrisGameOver();
                    return;
                }

                tetrisBoard[boardY][boardX] = currentPiece.color;
            }
        }
    }

    // 检查是否有完整行
    checkLines();

    // 生成新方块
    generateTetromino();

    // 绘制游戏
    drawTetrisGame();
}

// 检查并消除完整行
function checkLines() {
    let linesCleared = 0;

    for (let y = tetrisRows - 1; y >= 0; y--) {
        let isLineComplete = true;

        for (let x = 0; x < tetrisCols; x++) {
            if (!tetrisBoard[y][x]) {
                isLineComplete = false;
                break;
            }
        }

        if (isLineComplete) {
            // 消除当前行
            for (let yy = y; yy > 0; yy--) {
                for (let x = 0; x < tetrisCols; x++) {
                    tetrisBoard[yy][x] = tetrisBoard[yy - 1][x];
                }
            }

            // 清空顶部行
            for (let x = 0; x < tetrisCols; x++) {
                tetrisBoard[0][x] = 0;
            }

            // 增加分数
            linesCleared++;

            // 因为消除了一行，需要重新检查当前位置
            y++;
        }
    }

    // 根据消除的行数增加分数
    if (linesCleared > 0) {
        const linePoints = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4行的分数
        tetrisScore += linePoints[linesCleared] * tetrisLevel;
        tetrisScoreElement.textContent = tetrisScore;

        // 检查是否升级
        const levelUp = Math.floor(tetrisScore / 1000) + 1;
        if (levelUp > tetrisLevel) {
            tetrisLevel = levelUp;
            tetrisLevelElement.textContent = tetrisLevel;

            // 调整游戏速度
            if (tetrisGameLoopId) {
                clearInterval(tetrisGameLoopId);
                if (tetrisLevel === 3) {
                    currentGameSpeed = difficultyLevels[3].initialSpeed;
                    tetrisGameLoopId = setInterval(updateTetrisGame, 1000 / currentGameSpeed);
                } else {
                    currentGameSpeed = difficultyLevels[tetrisLevel].speed || tetrisLevel;
                    tetrisGameLoopId = setInterval(updateTetrisGame, 1000 / currentGameSpeed);
                }
            }
        }
    }
}

// 绘制游戏
function drawTetrisGame() {
    // 清空画布
    tetrisCtx.clearRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);

    // 绘制棋盘
    for (let y = 0; y < tetrisRows; y++) {
        for (let x = 0; x < tetrisCols; x++) {
            if (tetrisBoard[y][x]) {
                drawBlock(x, y, tetrisBoard[y][x]);
            }
        }
    }

    // 绘制当前方块
    if (currentPiece) {
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    const boardX = currentX + x;
                    const boardY = currentY + y;

                    // 只绘制在可见区域内的方块
                    if (boardY >= 0) {
                        drawBlock(boardX, boardY, currentPiece.color);
                    }
                }
            }
        }
    }

    // 绘制网格线
    drawGrid();
}

// 绘制方块
function drawBlock(x, y, color) {
    tetrisCtx.fillStyle = color;
    tetrisCtx.fillRect(x * tetrisBlockSize, y * tetrisBlockSize, tetrisBlockSize, tetrisBlockSize);

    // 绘制边框
    tetrisCtx.strokeStyle = '#FFFFFF';
    tetrisCtx.strokeRect(x * tetrisBlockSize, y * tetrisBlockSize, tetrisBlockSize, tetrisBlockSize);

    // 绘制内部阴影
    tetrisCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    tetrisCtx.fillRect(x * tetrisBlockSize, y * tetrisBlockSize, tetrisBlockSize / 2, tetrisBlockSize / 2);
}

// 绘制网格线
function drawGrid() {
    tetrisCtx.strokeStyle = '#CCCCCC';
    tetrisCtx.lineWidth = 0.5;

    // 绘制垂直线
    for (let x = 0; x <= tetrisCols; x++) {
        tetrisCtx.beginPath();
        tetrisCtx.moveTo(x * tetrisBlockSize, 0);
        tetrisCtx.lineTo(x * tetrisBlockSize, tetrisCanvas.height);
        tetrisCtx.stroke();
    }

    // 绘制水平线
    for (let y = 0; y <= tetrisRows; y++) {
        tetrisCtx.beginPath();
        tetrisCtx.moveTo(0, y * tetrisBlockSize);
        tetrisCtx.lineTo(tetrisCanvas.width, y * tetrisBlockSize);
        tetrisCtx.stroke();
    }
}

// 绘制下一个方块
function drawNextPiece() {
    // 清空画布
    nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);

    if (nextPiece) {
        // 计算居中位置
        const offsetX = (nextPieceCanvas.width - nextPiece.shape[0].length * tetrisBlockSize) / 2;
        const offsetY = (nextPieceCanvas.height - nextPiece.shape.length * tetrisBlockSize) / 2;

        // 绘制方块
        for (let y = 0; y < nextPiece.shape.length; y++) {
            for (let x = 0; x < nextPiece.shape[y].length; x++) {
                if (nextPiece.shape[y][x]) {
                    nextPieceCtx.fillStyle = nextPiece.color;
                    nextPieceCtx.fillRect(
                        offsetX + x * tetrisBlockSize,
                        offsetY + y * tetrisBlockSize,
                        tetrisBlockSize,
                        tetrisBlockSize
                    );

                    // 绘制边框
                    nextPieceCtx.strokeStyle = '#FFFFFF';
                    nextPieceCtx.strokeRect(
                        offsetX + x * tetrisBlockSize,
                        offsetY + y * tetrisBlockSize,
                        tetrisBlockSize,
                        tetrisBlockSize
                    );
                }
            }
        }
    }
}

// 处理键盘输入
function handleTetrisKeyPress(e) {
    if (isTetrisGameOver) return;

    switch (e.key) {
        case 'ArrowLeft':
            moveTetromino(-1, 0);
            e.preventDefault();
            break;
        case 'ArrowRight':
            moveTetromino(1, 0);
            e.preventDefault();
            break;
        case 'ArrowDown':
            moveTetromino(0, 1);
            e.preventDefault();
            break;
        case 'ArrowUp':
            rotateTetromino();
            e.preventDefault();
            break;
        case ' ': // 空格键快速下落
            hardDrop();
            e.preventDefault();
            break;
    }
}

// 快速下落
function hardDrop() {
    if (isTetrisPaused || isTetrisGameOver) return;

    let dropDistance = 0;
    while (isValidMove(0, dropDistance + 1)) {
        dropDistance++;
    }

    if (dropDistance > 0) {
        currentY += dropDistance;
        drawTetrisGame();
        fixTetromino();
    }
}

// 更新游戏状态
function updateTetrisGame() {
    if (isTetrisPaused || isTetrisGameOver) return;

    // 级别三随时间加速
    if (tetrisLevel === 3) {
        // 计算游戏已进行时间（秒）
        const elapsedTime = (Date.now() - gameStartTime) / 1000;
        
        // 计算应该增加的速度次数
        const accelerationCount = Math.floor(elapsedTime / difficultyLevels[3].accelerationInterval);
        
        // 计算当前速度
        const currentSpeed = difficultyLevels[3].initialSpeed + accelerationCount * difficultyLevels[3].accelerationAmount;
        
        // 确保速度不超过最大值
        const targetSpeed = Math.min(currentSpeed, difficultyLevels[3].maxSpeed);
        
        // 如果速度发生变化，更新游戏循环
        if (currentGameSpeed !== targetSpeed) {
            currentGameSpeed = targetSpeed;
            clearInterval(tetrisGameLoopId);
            tetrisGameLoopId = setInterval(updateTetrisGame, 1000 / currentGameSpeed);
        }
    }

    // 移动方块
    moveTetromino(0, 1);
}

// 游戏结束
function tetrisGameOver() {
    isTetrisGameOver = true;
    clearInterval(tetrisGameLoopId);

    // 检查并更新最高分
    if (tetrisHighScoreElement) {
        const highScore = localStorage.getItem('tetrisHighScore') || 0;
        if (tetrisScore > highScore) {
            localStorage.setItem('tetrisHighScore', tetrisScore);
            tetrisHighScoreElement.textContent = tetrisScore;
        }
    }

    // 显示游戏结束界面
    tetrisFinalScoreElement.textContent = tetrisScore;
    tetrisGameOverElement.style.display = 'block';
}

// 确保DOM加载完成后再初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    // 重新获取所有DOM元素
    tetrisCanvas = document.getElementById('tetris-canvas');
    tetrisCtx = tetrisCanvas ? tetrisCanvas.getContext('2d') : null;
    nextPieceCanvas = document.getElementById('tetris-next-canvas');
    nextPieceCtx = nextPieceCanvas ? nextPieceCanvas.getContext('2d') : null;
    tetrisScoreElement = document.getElementById('tetris-score');
    tetrisHighScoreElement = document.getElementById('tetris-high-score');
    tetrisLevelElement = document.getElementById('tetris-level');
    tetrisStartBtn = document.getElementById('tetris-start');
    tetrisPauseBtn = document.getElementById('tetris-pause');
    tetrisResetBtn = document.getElementById('tetris-reset');
    tetrisGameOverElement = document.getElementById('tetris-game-over');
    tetrisFinalScoreElement = document.getElementById('tetris-final-score');
    tetrisPlayAgainBtn = document.getElementById('tetris-play-again');
    tetrisRulesBtn = document.getElementById('tetris-rules');
    tetrisRulesModal = document.getElementById('tetris-rules-modal');
    tetrisCloseRulesBtn = tetrisRulesModal ? tetrisRulesModal.querySelector('.close-btn') : null;
    tetrisLevel1Btn = document.getElementById('tetris-level-1');
    tetrisLevel2Btn = document.getElementById('tetris-level-2');
    tetrisLevel3Btn = document.getElementById('tetris-level-3');

    // 初始化游戏
    if (tetrisCanvas && tetrisCtx) {
        initTetrisGame();
    } else {
        console.error('Tetris canvas not found!');
    }
});

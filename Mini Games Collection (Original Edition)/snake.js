let snakeGameLoopId = null;
let snake = [];
let snakeX = 10 * 20;
let snakeY = 10 * 20;
let velocityX = 1;
let velocityY = 0;
let foodX = 5 * 20;
let foodY = 5 * 20;
let snakeScore = 0;
let snakeHighScore = localStorage.getItem('snakeHighScore') || 0;
let isSnakePaused = false;
let isSnakeGameOver = false;
let gameSpeed = 80; // 默认速度，数值越小速度越快
const gridSize = 20;
const tileCount = 400 / gridSize;

// 获取DOM元素
const snakeCanvas = document.getElementById('snake-canvas');
const snakeCtx = snakeCanvas.getContext('2d');
const snakeScoreElement = document.getElementById('snake-score');
const snakeHighScoreElement = document.getElementById('snake-high-score');
const snakeStartBtn = document.getElementById('snake-start');
const snakePauseBtn = document.getElementById('snake-pause');
const snakeResetBtn = document.getElementById('snake-reset');
const snakeGameOverElement = document.getElementById('snake-game-over');
const snakeFinalScoreElement = document.getElementById('snake-final-score');
const snakePlayAgainBtn = document.getElementById('snake-play-again');
const snakeRulesBtn = document.getElementById('snake-rules');
const snakeRulesModal = document.getElementById('snake-rules-modal');
const closeRulesBtn = snakeRulesModal.querySelector('.close-btn');
const snakeLevel1Btn = document.getElementById('snake-level-1');
const snakeLevel2Btn = document.getElementById('snake-level-2');
const snakeLevel3Btn = document.getElementById('snake-level-3');
const snakeCustomSpeedBtn = document.getElementById('snake-custom-speed');
const snakeSpeedModal = document.getElementById('snake-speed-modal');
const closeSpeedBtn = snakeSpeedModal.querySelector('.close-btn');
const snakeSpeedInput = document.getElementById('snake-speed-input');
const snakeSpeedApplyBtn = document.getElementById('snake-speed-apply');

// 生成食物
function generateSnakeFood() {
    let newFoodX, newFoodY;
    let onSnake;
    do {
        onSnake = false;
        newFoodX = Math.floor(Math.random() * tileCount) * gridSize;
        newFoodY = Math.floor(Math.random() * tileCount) * gridSize;

        for (let segment of snake) {
            if (segment.x === newFoodX && segment.y === newFoodY) {
                onSnake = true;
                break;
            }
        }
    } while (onSnake);

    foodX = newFoodX;
    foodY = newFoodY;
}

// 绘制游戏
// 绘制蛇
function drawSnakeGame() {
    // 清空画布
    snakeCtx.fillStyle = '#eee';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

    // 绘制食物
    snakeCtx.fillStyle = 'red';
    snakeCtx.fillRect(foodX, foodY, gridSize, gridSize);

    // 绘制蛇 - 修改颜色并添加轨迹效果
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        // 为蛇身添加透明度渐变，尾部更透明
        const opacity = 1 - (i * 0.05);
        snakeCtx.fillStyle = i === 0 ? '#1976D2' : `rgba(25, 118, 210, ${opacity})`;
        snakeCtx.fillRect(segment.x, segment.y, gridSize, gridSize);

        // 绘制蛇的眼睛（仅头部）
        if (i === 0) {
            snakeCtx.fillStyle = 'white';
            if (velocityX === 1) { // 向右
                snakeCtx.fillRect(segment.x + gridSize - 8, segment.y + 5, 3, 3);
                snakeCtx.fillRect(segment.x + gridSize - 8, segment.y + gridSize - 8, 3, 3);
            } else if (velocityX === -1) { // 向左
                snakeCtx.fillRect(segment.x + 5, segment.y + 5, 3, 3);
                snakeCtx.fillRect(segment.x + 5, segment.y + gridSize - 8, 3, 3);
            } else if (velocityY === -1) { // 向上
                snakeCtx.fillRect(segment.x + 5, segment.y + 5, 3, 3);
                snakeCtx.fillRect(segment.x + gridSize - 8, segment.y + 5, 3, 3);
            } else if (velocityY === 1) { // 向下
                snakeCtx.fillRect(segment.x + 5, segment.y + gridSize - 8, 3, 3);
                snakeCtx.fillRect(segment.x + gridSize - 8, segment.y + gridSize - 8, 3, 3);
            }
        }
    }
}

// 更新游戏状态
function updateSnakeGame() {
    if (isSnakePaused || isSnakeGameOver) return;

    // 更新蛇头位置
    snakeX += velocityX * gridSize;
    snakeY += velocityY * gridSize;

    // 检查是否撞墙
    if (snakeX < 0 || snakeX >= snakeCanvas.width || snakeY < 0 || snakeY >= snakeCanvas.height) {
        snakeGameOver();
        return;
    }

    // 添加新的头部
    snake.unshift({x: snakeX, y: snakeY});

    // 检查是否吃到食物
    if (snakeX === foodX && snakeY === foodY) {
        snakeScore += 10;
        snakeScoreElement.textContent = snakeScore;
        generateSnakeFood();
    } else {
        // 如果没吃到食物，移除尾部
        snake.pop();
    }

    // 检查是否撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
            snakeGameOver();
            return;
        }
    }

    // 绘制游戏
    drawSnakeGame();
}

// 游戏结束
function snakeGameOver() {
    isSnakeGameOver = true;
    clearInterval(snakeGameLoopId);

    // 更新最高分
    if (snakeScore > snakeHighScore) {
        snakeHighScore = snakeScore;
        localStorage.setItem('snakeHighScore', snakeHighScore);
        snakeHighScoreElement.textContent = snakeHighScore;
    }

    // 显示游戏结束界面
    snakeFinalScoreElement.textContent = snakeScore;
    snakeGameOverElement.style.display = 'block';
}

// 开始游戏
function startSnakeGame() {
    if (snakeGameLoopId) clearInterval(snakeGameLoopId);
    if (isSnakeGameOver) {
        resetSnakeGame();
        return;
    }
    isSnakePaused = false;
    snakePauseBtn.textContent = '暂停';
    snakeGameLoopId = setInterval(updateSnakeGame, gameSpeed);
}

// 暂停游戏
function pauseSnakeGame() {
    isSnakePaused = !isSnakePaused;
    snakePauseBtn.textContent = isSnakePaused ? '继续' : '暂停';
}

// 重置游戏
function resetSnakeGame() {
    // 重置游戏状态
    if (snakeGameLoopId) clearInterval(snakeGameLoopId);
    snakeX = 10 * gridSize;
    snakeY = 10 * gridSize;
    velocityX = 1;
    velocityY = 0;
    snakeScore = 0;
    isSnakePaused = false;
    isSnakeGameOver = false;
    snakeGameOverElement.style.display = 'none';
    snakePauseBtn.textContent = '暂停';

    // 初始化蛇和食物
    snake = [];
    snake.push({x: snakeX, y: snakeY});
    generateSnakeFood();

    // 更新分数显示
    snakeScoreElement.textContent = snakeScore;
    snakeHighScoreElement.textContent = snakeHighScore;

    // 绘制游戏
    drawSnakeGame();

    // 添加事件监听
    snakeStartBtn.addEventListener('click', startSnakeGame);
    snakePauseBtn.addEventListener('click', pauseSnakeGame);
    snakeResetBtn.addEventListener('click', resetSnakeGame);
    snakePlayAgainBtn.addEventListener('click', resetSnakeGame);
    document.addEventListener('keydown', changeSnakeDirection);

    // 添加规则按钮事件
    snakeRulesBtn.addEventListener('click', () => {
        snakeRulesModal.style.display = 'block';
    });

    // 关闭规则弹窗
    closeRulesBtn.addEventListener('click', () => {
        snakeRulesModal.style.display = 'none';
    });

    // 点击弹窗外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === snakeRulesModal) {
            snakeRulesModal.style.display = 'none';
        }
        if (event.target === snakeSpeedModal) {
            snakeSpeedModal.style.display = 'none';
        }
    });

    // 添加等级按钮事件
    snakeLevel1Btn.addEventListener('click', () => {
        gameSpeed = 120; // 最慢
        if (!isSnakePaused && !isSnakeGameOver) {
            restartGameLoop();
        }
    });

    snakeLevel2Btn.addEventListener('click', () => {
        gameSpeed = 80; // 中等
        if (!isSnakePaused && !isSnakeGameOver) {
            restartGameLoop();
        }
    });

    snakeLevel3Btn.addEventListener('click', () => {
        gameSpeed = 50; // 最快
        if (!isSnakePaused && !isSnakeGameOver) {
            restartGameLoop();
        }
    });

    // 自定义速度按钮事件
    snakeCustomSpeedBtn.addEventListener('click', () => {
        snakeSpeedModal.style.display = 'block';
        snakeSpeedInput.value = gameSpeed;
    });

    // 关闭速度弹窗
    closeSpeedBtn.addEventListener('click', () => {
        snakeSpeedModal.style.display = 'none';
    });

    // 应用自定义速度
    snakeSpeedApplyBtn.addEventListener('click', () => {
        const newSpeed = parseInt(snakeSpeedInput.value);
        if (newSpeed >= 50 && newSpeed <= 200) {
            gameSpeed = newSpeed;
            if (!isSnakePaused && !isSnakeGameOver) {
                restartGameLoop();
            }
            snakeSpeedModal.style.display = 'none';
        } else {
            alert('请输入50-200之间的数值');
        }
    });
}

// 重新启动游戏循环
function restartGameLoop() {
    clearInterval(snakeGameLoopId);
    snakeGameLoopId = setInterval(updateSnakeGame, gameSpeed);
}

// 控制方向
function changeSnakeDirection(e) {
    // 防止反向移动
    if ((e.key === 'ArrowUp' || e.key === 'w') && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
    } else if ((e.key === 'ArrowDown' || e.key === 's') && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
    } else if ((e.key === 'ArrowLeft' || e.key === 'a') && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
    } else if ((e.key === 'ArrowRight' || e.key === 'd') && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
    }
}

// 添加页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化贪吃蛇游戏
    resetSnakeGame();
    // 更新最高分显示
    snakeHighScoreElement.textContent = snakeHighScore;
    // 绘制初始游戏界面
    drawSnakeGame();
});
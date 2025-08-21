/**
 * 这个文件是贪吃蛇的初版，是自己一开始研究用的，不完善
 * 具体的完善的贪吃蛇游戏的代码在snake.js里面，但是这个文件的存在不会影响游戏的运行
 * 学习历程
 * @author Spr1ng
 * @email 1329330944@qq.com
 * @date 2025-7-25 start
 */
// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgainBtn');

// 游戏参数
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// 蛇的初始位置和速度
let snake = [];
let snakeX = 10 * gridSize;
let snakeY = 10 * gridSize;
let velocityX = 0;
let velocityY = 0;

// 食物位置
let foodX = 5 * gridSize;
let foodY = 5 * gridSize;

// 游戏状态
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoopId = null;
let isPaused = false;
let isGameOver = false;

// 更新最高分显示
highScoreElement.textContent = highScore;

// 初始化蛇
function initSnake() {
    snake = [];
    snake.push({x: snakeX, y: snakeY});
}

// 随机生成食物位置
function generateFood() {
    // 确保食物不会生成在蛇身上
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
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#eee';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制食物
    ctx.fillStyle = 'red';
    ctx.fillRect(foodX, foodY, gridSize, gridSize);

    // 绘制蛇
    ctx.fillStyle = 'green';
    for (let segment of snake) {
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);

        // 绘制蛇的眼睛（仅头部）
        if (segment === snake[0]) {
            ctx.fillStyle = 'white';
            if (velocityX === 1) { // 向右
                ctx.fillRect(segment.x + gridSize - 8, segment.y + 5, 3, 3);
                ctx.fillRect(segment.x + gridSize - 8, segment.y + gridSize - 8, 3, 3);
            } else if (velocityX === -1) { // 向左
                ctx.fillRect(segment.x + 5, segment.y + 5, 3, 3);
                ctx.fillRect(segment.x + 5, segment.y + gridSize - 8, 3, 3);
            } else if (velocityY === -1) { // 向上
                ctx.fillRect(segment.x + 5, segment.y + 5, 3, 3);
                ctx.fillRect(segment.x + gridSize - 8, segment.y + 5, 3, 3);
            } else if (velocityY === 1) { // 向下
                ctx.fillRect(segment.x + 5, segment.y + gridSize - 8, 3, 3);
                ctx.fillRect(segment.x + gridSize - 8, segment.y + gridSize - 8, 3, 3);
            }
        }
    }
}

// 更新游戏状态
function updateGame() {
    if (isPaused || isGameOver) return;

    // 更新蛇头位置
    snakeX += velocityX * gridSize;
    snakeY += velocityY * gridSize;

    // 检查是否撞墙
    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height) {
        gameOver();
        return;
    }

    // 添加新的头部
    snake.unshift({x: snakeX, y: snakeY});

    // 检查是否吃到食物
    if (snakeX === foodX && snakeY === foodY) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
    } else {
        // 如果没吃到食物，移除尾部
        snake.pop();
    }

    // 检查是否撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
            gameOver();
            return;
        }
    }

    // 绘制游戏
    drawGame();
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    clearInterval(gameLoopId);

    // 更新最高分
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = highScore;
    }

    // 显示游戏结束界面
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

// 开始游戏
function startGame() {
    if (gameLoopId) clearInterval(gameLoopId);

    // 重置游戏状态
    snakeX = 10 * gridSize;
    snakeY = 10 * gridSize;
    velocityX = 1; // 初始向右移动
    velocityY = 0;
    score = 0;
    scoreElement.textContent = score;
    isPaused = false;
    isGameOver = false;
    gameOverElement.style.display = 'none';

    // 初始化蛇和食物
    initSnake();
    generateFood();

    // 开始游戏循环
    gameLoopId = setInterval(updateGame, 100);
}

// 暂停游戏
function pauseGame() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '继续' : '暂停';
}

// 重置游戏
function resetGame() {
    startGame();
}

// 控制方向
function changeDirection(e) {
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

// 事件监听
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', startGame);

document.addEventListener('keydown', changeDirection);

// 初始化游戏
initSnake();
generateFood();
drawGame();
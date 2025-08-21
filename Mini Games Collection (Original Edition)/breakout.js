let breakoutGameLoopId = null;
let ballX = 200;
let ballY = 350;
let ballSpeedX = 4;
let ballSpeedY = -4;
let paddleX = 160;
let paddleWidth = 80;
let paddleHeight = 10;
let bricks = [];
let brickRowCount = 5;
let brickColumnCount = 8;
let brickWidth = 45;
let brickHeight = 20;
let brickPadding = 5;
let brickOffsetTop = 30;
let brickOffsetLeft = 25;
let breakoutScore = 0;
let breakoutLives = 3;
let isBreakoutPaused = false;
let isBreakoutGameOver = false;
let currentLevel = 1; // 添加当前级别变量

// 获取DOM元素
const breakoutCanvas = document.getElementById('breakout-canvas');
const breakoutCtx = breakoutCanvas.getContext('2d');
const breakoutScoreElement = document.getElementById('breakout-score');
const breakoutLivesElement = document.getElementById('breakout-lives');
const breakoutStartBtn = document.getElementById('breakout-start');
const breakoutPauseBtn = document.getElementById('breakout-pause');
const breakoutResetBtn = document.getElementById('breakout-reset');
const breakoutGameOverElement = document.getElementById('breakout-game-over');
const breakoutFinalScoreElement = document.getElementById('breakout-final-score');
const breakoutPlayAgainBtn = document.getElementById('breakout-play-again');
const breakoutRulesBtn = document.getElementById('breakout-rules');
const breakoutRulesModal = document.getElementById('breakout-rules-modal');
const closeBreakoutRulesBtn = breakoutRulesModal.querySelector('.close-btn');
const breakoutLevel1Btn = document.getElementById('breakout-level-1');
const breakoutLevel2Btn = document.getElementById('breakout-level-2');
const breakoutLevel3Btn = document.getElementById('breakout-level-3');
const breakoutLevelXBtn = document.getElementById('breakout-level-x');

// 初始化打砖块游戏
function initBreakoutGame() {
    // 重置游戏状态
    if (breakoutGameLoopId) clearInterval(breakoutGameLoopId);
    ballX = 200;
    ballY = 350;
    breakoutScore = 0;
    breakoutLives = 3;
    isBreakoutPaused = false;
    isBreakoutGameOver = false;
    breakoutGameOverElement.style.display = 'none';
    breakoutPauseBtn.textContent = '暂停';

    // 根据当前级别设置球速和砖块布局
    setLevel(currentLevel);

    // 更新分数和生命显示
    breakoutScoreElement.textContent = breakoutScore;
    breakoutLivesElement.textContent = breakoutLives;

    // 绘制游戏
    drawBreakoutGame();

    // 添加事件监听
    breakoutStartBtn.addEventListener('click', startBreakoutGame);
    breakoutPauseBtn.addEventListener('click', pauseBreakoutGame);
    breakoutResetBtn.addEventListener('click', resetBreakoutGame);
    breakoutPlayAgainBtn.addEventListener('click', resetBreakoutGame);
    document.addEventListener('mousemove', movePaddle);

    // 游戏规则按钮事件
    breakoutRulesBtn.addEventListener('click', () => {
        breakoutRulesModal.style.display = 'block';
    });

    // 关闭规则弹窗
    closeBreakoutRulesBtn.addEventListener('click', () => {
        breakoutRulesModal.style.display = 'none';
    });

    // 点击弹窗外部关闭
    window.addEventListener('click', (event) => {
        if (event.target === breakoutRulesModal) {
            breakoutRulesModal.style.display = 'none';
        }
    });

    // 难度级别按钮事件
    breakoutLevel1Btn.addEventListener('click', () => {
        currentLevel = 1;
        resetBreakoutGame();
    });

    breakoutLevel2Btn.addEventListener('click', () => {
        currentLevel = 2;
        resetBreakoutGame();
    });

    breakoutLevel3Btn.addEventListener('click', () => {
        currentLevel = 3;
        resetBreakoutGame();
    });

    breakoutLevelXBtn.addEventListener('click', () => {
        currentLevel = 'x';
        resetBreakoutGame();
    });
}

// 设置级别
function setLevel(level) {
    switch(level) {
        case 1:
            // 简单级别：砖块增加，球速慢
            ballSpeedX = 4;
            ballSpeedY = -4;
            paddleWidth = 100;
            createStandardBrickLayout(6, 9); // 增加到6行9列
            break;
        case 2:
            // 中等级别：砖块增加，球速中等
            ballSpeedX = 5;
            ballSpeedY = -5;
            paddleWidth = 80;
            createStandardBrickLayout(7, 9); // 增加到7行9列
            break;
        case 3:
            // 困难级别：砖块增加且有间隙，球速快
            ballSpeedX = 6;
            ballSpeedY = -6;
            paddleWidth = 60;
            createAdvancedBrickLayout();
            break;
        /**
         * 彩蛋级别
         */
        case 'x':
            // 爱心形状级别
            ballSpeedX = 5;
            ballSpeedY = -5;
            paddleWidth = 80;
            createHeartShapedBrickLayout();
            break;
    }
    paddleX = (breakoutCanvas.width - paddleWidth) / 2;
}

// 创建标准砖块布局
function createStandardBrickLayout(rows, cols) {
    brickRowCount = rows;
    brickColumnCount = cols;
    // 调整砖块大小和间距以适应更多砖块
    brickWidth = 40; // 略微减小砖块宽度
    brickHeight = 20;
    brickPadding = 5;
    brickOffsetLeft = (breakoutCanvas.width - (cols * (brickWidth + brickPadding))) / 2; // 居中显示
    brickOffsetTop = 30;
    
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = {
                x: 0,
                y: 0,
                status: 1
            };
        }
    }
}

// 创建高级砖块布局（有间隙）
function createAdvancedBrickLayout() {
    brickRowCount = 8; // 增加到8行
    brickColumnCount = 9; // 增加到9列
    // 调整砖块大小和间距
    brickWidth = 40;
    brickHeight = 20;
    brickPadding = 5;
    brickOffsetLeft = (breakoutCanvas.width - (brickColumnCount * (brickWidth + brickPadding))) / 2;
    brickOffsetTop = 30;
    
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            // 创建更复杂的交错砖块布局
            const isBrickPresent = (c % 3 !== 0 || r % 2 !== 0) && (r % 3 !== 0 || c % 2 !== 0);
            bricks[c][r] = {
                x: 0,
                y: 0,
                status: isBrickPresent ? 1 : 0
            };
        }
    }
}

// 创建爱心形状的砖块布局
function createHeartShapedBrickLayout() {
    brickRowCount = 12;
    brickColumnCount = 18; // 增加列数以加宽爱心形状
    brickWidth = 20; // 适当减小砖块宽度
    brickHeight = 20;
    brickPadding = 2;
    brickOffsetLeft = (breakoutCanvas.width - (brickColumnCount * (brickWidth + brickPadding))) / 2; // 居中显示
    brickOffsetTop = 40;
    
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            // 优化的倒爱心形状算法
            const x = (c - brickColumnCount / 2) / 3.5; // 调整x缩放因子
            const y = (r - brickRowCount / 2) / 3;    // 调整y缩放因子
            const x2 = x * x;
            const y2 = y * y;
            
            // 倒心形曲线公式基础
            const heartBase = Math.pow(x2 + y2 - 1, 3) - x2 * Math.pow(-y, 3) <= 0;
            
            const isTopGap = r < brickRowCount * 0.25 && Math.abs(x) < 0.5;
            
            const isBrick = heartBase && !isTopGap;
            
            bricks[c][r] = {
                x: 0,
                y: 0,
                status: isBrick ? 1 : 0
            };
        }
    }
}

// 移动挡板
function movePaddle(e) {
    const relativeX = e.clientX - breakoutCanvas.offsetLeft;
    if (relativeX > 0 && relativeX < breakoutCanvas.width) {
        paddleX = relativeX - paddleWidth / 2;
        // 确保挡板不会超出画布
        if (paddleX < 0) paddleX = 0;
        if (paddleX + paddleWidth > breakoutCanvas.width) paddleX = breakoutCanvas.width - paddleWidth;
    }
}

// 绘制球
function drawBall() {
    breakoutCtx.beginPath();
    breakoutCtx.arc(ballX, ballY, 10, 0, Math.PI * 2);
    breakoutCtx.fillStyle = '#0095DD';
    breakoutCtx.fill();
    breakoutCtx.closePath();
}

// 绘制挡板
function drawPaddle() {
    breakoutCtx.beginPath();
    breakoutCtx.rect(paddleX, breakoutCanvas.height - paddleHeight, paddleWidth, paddleHeight);
    breakoutCtx.fillStyle = '#0095DD';
    breakoutCtx.fill();
    breakoutCtx.closePath();
}

// 绘制砖块
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                breakoutCtx.beginPath();
                breakoutCtx.rect(brickX, brickY, brickWidth, brickHeight);
                // 不同行的砖块颜色不同
                const colors = ['#FF5252', '#FF9800', '#FFEB3B', '#4CAF50', '#2196F3', '#9C27B0', '#E91E63'];
                breakoutCtx.fillStyle = colors[r % colors.length];
                breakoutCtx.fill();
                breakoutCtx.closePath();
            }
        }
    }
}

// 碰撞检测
function detectCollision() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (
                    ballX > b.x &&
                    ballX < b.x + brickWidth &&
                    ballY > b.y &&
                    ballY < b.y + brickHeight
                ) {
                    ballSpeedY = -ballSpeedY;
                    b.status = 0;
                    breakoutScore += 10;
                    breakoutScoreElement.textContent = breakoutScore;

                    // 检查是否所有砖块都被清除
                    let allBricksDestroyed = true;
                    for (let i = 0; i < brickColumnCount; i++) {
                        for (let j = 0; j < brickRowCount; j++) {
                            if (bricks[i][j].status === 1) {
                                allBricksDestroyed = false;
                                break;
                            }
                        }
                        if (!allBricksDestroyed) break;
                    }

                    if (allBricksDestroyed) {
                        // 所有砖块都被清除，重新生成砖块
                        for (let i = 0; i < brickColumnCount; i++) {
                            for (let j = 0; j < brickRowCount; j++) {
                                bricks[i][j].status = 1;
                            }
                        }
                        // 增加球的速度
                        ballSpeedX *= 1.1;
                        ballSpeedY *= 1.1;
                    }
                }
            }
        }
    }
}

// 绘制游戏
function drawBreakoutGame() {
    // 清空画布
    breakoutCtx.clearRect(0, 0, breakoutCanvas.width, breakoutCanvas.height);

    // 绘制砖块、球和挡板
    drawBricks();
    drawBall();
    drawPaddle();

    // 碰撞检测
    detectCollision();

    // 检测球与墙壁的碰撞
    if (ballX + ballSpeedX > breakoutCanvas.width - 10 || ballX + ballSpeedX < 10) {
        ballSpeedX = -ballSpeedX;
    }

    if (ballY + ballSpeedY < 10) {
        ballSpeedY = -ballSpeedY;
    } else if (ballY + ballSpeedY > breakoutCanvas.height - 10 - paddleHeight) {
        // 检测球与挡板的碰撞
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            ballSpeedY = -ballSpeedY;
            // 根据碰撞位置调整反弹角度
            const hitPosition = (ballX - paddleX) / paddleWidth;
            const angle = hitPosition * Math.PI - Math.PI / 2;
            ballSpeedX = 5 * Math.cos(angle);
            ballSpeedY = -5 * Math.abs(Math.sin(angle));
        } else if (ballY + ballSpeedY > breakoutCanvas.height - 10) {
            // 球掉落，减少生命
            breakoutLives--;
            breakoutLivesElement.textContent = breakoutLives;
            if (breakoutLives <= 0) {
                breakoutGameOver();
                return;
            } else {
                // 重置球和挡板位置
                ballX = 200;
                ballY = 350;
                ballSpeedX = 4;
                ballSpeedY = -4;
                paddleX = 160;
            }
        }
    }

    // 更新球的位置
    ballX += ballSpeedX;
    ballY += ballSpeedY;
}

// 游戏结束
function breakoutGameOver() {
    isBreakoutGameOver = true;
    clearInterval(breakoutGameLoopId);

    // 显示游戏结束界面
    breakoutFinalScoreElement.textContent = breakoutScore;
    breakoutGameOverElement.style.display = 'block';
}

// 开始游戏
function startBreakoutGame() {
    if (breakoutGameLoopId) clearInterval(breakoutGameLoopId);
    if (isBreakoutGameOver) {
        resetBreakoutGame();
        return;
    }
    isBreakoutPaused = false;
    breakoutPauseBtn.textContent = '暂停';
    breakoutGameLoopId = setInterval(drawBreakoutGame, 10);
}

// 暂停游戏
function pauseBreakoutGame() {
    isBreakoutPaused = !isBreakoutPaused;
    if (isBreakoutPaused) {
        clearInterval(breakoutGameLoopId);
        breakoutPauseBtn.textContent = '继续';
    } else {
        breakoutGameLoopId = setInterval(drawBreakoutGame, 10);
        breakoutPauseBtn.textContent = '暂停';
    }
}

// 重置游戏
function resetBreakoutGame() {
    // 重置游戏状态
    if (breakoutGameLoopId) clearInterval(breakoutGameLoopId);
    ballX = 200;
    ballY = 350;
    breakoutScore = 0;
    breakoutLives = 3;
    isBreakoutPaused = false;
    isBreakoutGameOver = false;
    breakoutGameOverElement.style.display = 'none';
    breakoutPauseBtn.textContent = '暂停';

    // 根据当前级别设置球速和砖块布局
    setLevel(currentLevel);

    // 更新分数和生命显示
    breakoutScoreElement.textContent = breakoutScore;
    breakoutLivesElement.textContent = breakoutLives;

    // 绘制游戏
    drawBreakoutGame();
}

// 添加页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化打砖块游戏
    initBreakoutGame();
});
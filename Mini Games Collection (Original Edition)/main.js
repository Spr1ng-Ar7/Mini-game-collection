// 获取DOM元素
const menuContainer = document.getElementById('menu-container');
const snakeGame = document.getElementById('snake-game');
const breakoutGame = document.getElementById('breakout-game');
const memoryGame = document.getElementById('memory-game');
const memory2Game = document.getElementById('memory2-game');
const game2048 = document.getElementById('2048-game');
const tetrisGame = document.getElementById('tetris-game');
const sudokuGame = document.getElementById('sudoku-game'); // 添加数独游戏DOM元素获取

// 菜单按钮
const snakeBtn = document.getElementById('snake-btn');
const breakoutBtn = document.getElementById('breakout-btn');
const memoryBtn = document.getElementById('memory-btn');
const memory2Btn = document.getElementById('memory2-btn');
const game2048Btn = document.getElementById('2048-btn');
const tetrisBtn = document.getElementById('tetris-btn');
const sudokuBtn = document.getElementById('sudoku-btn'); // 添加数独按钮获取

// 返回按钮
const snakeBack = document.getElementById('snake-back');
const breakoutBack = document.getElementById('breakout-back');
const memoryBack = document.getElementById('memory-back');
const memory2Back = document.getElementById('memory2-back');
const game2048Back = document.getElementById('2048-back');
const tetrisBack = document.getElementById('tetris-back');
const sudokuBack = document.getElementById('sudoku-back'); // 添加数独返回按钮获取

// 显示指定游戏，隐藏其他元素
function showGame(gameElement) {
    menuContainer.classList.add('hidden');
    snakeGame.classList.add('hidden');
    breakoutGame.classList.add('hidden');
    memoryGame.classList.add('hidden');
    memory2Game.classList.add('hidden');
    game2048.classList.add('hidden');
    tetrisGame.classList.add('hidden');
    sudokuGame.classList.add('hidden'); // 隐藏数独游戏
    gameElement.classList.remove('hidden');
}

// 返回菜单
function showMenu() {
    menuContainer.classList.remove('hidden');
    snakeGame.classList.add('hidden');
    breakoutGame.classList.add('hidden');
    memoryGame.classList.add('hidden');
    memory2Game.classList.add('hidden');
    game2048.classList.add('hidden');
    tetrisGame.classList.add('hidden');
    sudokuGame.classList.add('hidden'); // 隐藏数独游戏
}

// 初始化事件监听
function initEventListeners() {
    // 贪吃蛇游戏按钮点击事件
    snakeBtn.addEventListener('click', () => {
        showGame(snakeGame);
        if (typeof initSnakeGame === 'function') {
            initSnakeGame();
        }
    });

    // 打砖块游戏按钮点击事件
    breakoutBtn.addEventListener('click', () => {
        showGame(breakoutGame);
        if (typeof initBreakoutGame === 'function') {
            initBreakoutGame();
        }
    });

    // 记忆翻牌游戏按钮点击事件
    memoryBtn.addEventListener('click', () => {
        showGame(memoryGame);
        if (typeof initMemoryGame === 'function') {
            initMemoryGame();
        }
    });

    // 记忆翻牌2游戏按钮点击事件
    memory2Btn.addEventListener('click', () => {
        showGame(memory2Game);
        if (typeof initMemory2Game === 'function') {
            initMemory2Game();
        } else {
            console.error('initMemory2Game function not found');
        }
    });

    // 2048游戏按钮点击事件
    game2048Btn.addEventListener('click', () => {
        showGame(game2048);
        if (typeof init2048Game === 'function') {
            init2048Game();
        }
    });

    // 俄罗斯方块游戏按钮点击事件
    tetrisBtn.addEventListener('click', () => {
        showGame(tetrisGame);
        if (typeof initTetrisGame === 'function') {
            initTetrisGame();
        }
    });

    // 添加数独游戏按钮点击事件
    sudokuBtn.addEventListener('click', () => {
        showGame(sudokuGame);
        if (typeof initSudokuGame === 'function') {
            initSudokuGame();
        } else {
            console.error('initSudokuGame function not found');
        }
    });

    // 返回菜单按钮点击事件
    snakeBack.addEventListener('click', showMenu);
    breakoutBack.addEventListener('click', showMenu);
    memoryBack.addEventListener('click', showMenu);
    memory2Back.addEventListener('click', showMenu);
    game2048Back.addEventListener('click', showMenu);
    tetrisBack.addEventListener('click', showMenu);
    sudokuBack.addEventListener('click', showMenu);
}

// 初始化
function init() {
    initEventListeners();
}

// 页面加载完成后初始化
window.addEventListener('load', init);
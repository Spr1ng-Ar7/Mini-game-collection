// 数独游戏核心逻辑
let sudokuBoard = []; // 数独棋盘数据
let solutionBoard = []; // 解决方案
let userBoard = []; // 用户填写的棋盘
let isSudokuGameOver = false; // 游戏是否结束
let difficulty = 'medium'; // 默认难度

// 获取DOM元素
let sudokuContainer = null;
let sudokuBoardElement = null;
let sudokuDifficultyElement = null;
let sudokuResetBtn = null;
let sudokuGameOverElement = null;
let sudokuPlayAgainBtn = null;
let sudokuBackBtn = null;

// 初始化数独游戏
function initSudokuGame() {
    // 获取DOM元素
    sudokuContainer = document.getElementById('sudoku-game');
    sudokuBoardElement = document.getElementById('sudoku-board');
    sudokuDifficultyElement = document.getElementById('sudoku-difficulty');
    sudokuResetBtn = document.getElementById('sudoku-reset');
    sudokuGameOverElement = document.getElementById('sudoku-game-over');
    sudokuPlayAgainBtn = document.getElementById('sudoku-play-again');
    sudokuBackBtn = document.getElementById('sudoku-back');

    // 重置游戏状态
    isSudokuGameOver = false;
    sudokuGameOverElement.style.display = 'none';

    // 生成数独谜题
    generateSudoku();

    // 渲染数独棋盘
    renderSudokuBoard();

    // 添加事件监听
    sudokuResetBtn.addEventListener('click', resetSudokuGame);
    sudokuPlayAgainBtn.addEventListener('click', resetSudokuGame);
    sudokuDifficultyElement.addEventListener('change', () => {
        difficulty = sudokuDifficultyElement.value;
        resetSudokuGame();
    });
}

// 生成数独谜题和解决方案
function generateSudoku() {
    // 初始化空棋盘
    sudokuBoard = Array(9).fill().map(() => Array(9).fill(0));
    userBoard = Array(9).fill().map(() => Array(9).fill(0));

    // 生成解决方案
    solveSudoku(sudokuBoard);
    // 深拷贝解决方案
    solutionBoard = JSON.parse(JSON.stringify(sudokuBoard));

    // 根据难度移除数字
    let removeCount;
    switch(difficulty) {
        case 'easy':
            removeCount = 30;
            break;
        case 'medium':
            removeCount = 40;
            break;
        case 'hard':
            removeCount = 50;
            break;
        default:
            removeCount = 40;
    }

    // 随机移除数字
    let removed = 0;
    while (removed < removeCount) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (sudokuBoard[row][col] !== 0) {
            sudokuBoard[row][col] = 0;
            removed++;
        }
    }
}

// 解数独（回溯算法）
function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveSudoku(board)) {
                            return true;
                        }
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// 验证数字是否有效
function isValid(board, row, col, num) {
    // 检查行
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) return false;
    }

    // 检查列
    for (let i = 0; i < 9; i++) {
        if (board[i][col] === num) return false;
    }

    // 检查3x3宫格
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) return false;
        }
    }

    return true;
}

// 渲染数独棋盘
function renderSudokuBoard() {
    sudokuBoardElement.innerHTML = '';

    // 创建9x9的网格
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.classList.add('sudoku-cell');

            // 添加边框样式，突出显示3x3宫格
            if (row % 3 === 0 && row > 0) {
                cell.style.borderTop = '3px solid #333';
            }
            if (col % 3 === 0 && col > 0) {
                cell.style.borderLeft = '3px solid #333';
            }

            // 如果是初始数字，设置为不可编辑
            if (sudokuBoard[row][col] !== 0) {
                cell.textContent = sudokuBoard[row][col];
                cell.classList.add('sudoku-fixed');
            } else {
                // 可编辑单元格
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => handleCellClick(row, col));
            }

            // 如果用户已经填写了数字，显示出来
            if (userBoard[row][col] !== 0 && sudokuBoard[row][col] === 0) {
                cell.textContent = userBoard[row][col];
                cell.classList.add('sudoku-user-input');
            }

            sudokuBoardElement.appendChild(cell);
        }
    }
}

// 处理单元格点击
function handleCellClick(row, col) {
    if (isSudokuGameOver) return;
    if (sudokuBoard[row][col] !== 0) return; // 固定数字不能更改

    // 创建数字选择面板
    createNumberSelector(row, col);
}

// 创建数字选择面板
function createNumberSelector(row, col) {
    // 先移除已有的选择面板
    const existingSelector = document.querySelector('.sudoku-number-selector');
    if (existingSelector) {
        existingSelector.remove();
    }

    const selector = document.createElement('div');
    selector.classList.add('sudoku-number-selector');

    // 定位选择面板
    const cell = document.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
    const rect = cell.getBoundingClientRect();
    selector.style.left = `${rect.left}px`;
    selector.style.top = `${rect.bottom}px`;
    document.body.appendChild(selector);
    for (let i = 1; i <= 9; i++) { 
        const number = document.createElement('div');
        number.classList.add('sudoku-number');
        number.textContent = i;
        number.addEventListener('click', () => selectNumber(i, row, col));
        selector.appendChild(number);
        number.style.backgroundColor = isValid(userBoard, row, col, i) ? 'lightgreen' : 'lightcoral';
        number.style.color = isValid(userBoard, row, col, i) ? 'black' : 'white';
        number.style.border = '1px solid #333';
        number.style.borderRadius = '50%';
    }
}

// 添加选择数字函数
function selectNumber(num, row, col) {
    // 更新用户棋盘
    userBoard[row][col] = num;
    // 重新渲染棋盘
    renderSudokuBoard();
    // 检查游戏是否结束
    checkSudokuGameOver();
    // 移除选择面板
    const selector = document.querySelector('.sudoku-number-selector');
    if (selector) {
        selector.remove();
    }
}

// 添加检查游戏结束函数
function checkSudokuGameOver() {
    // 检查用户是否填满所有格子
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (userBoard[row][col] === 0) {
                return;
            }
        }
    }

    // 检查用户答案是否正确
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (userBoard[row][col] !== solutionBoard[row][col]) {
                alert('很遗憾，你的答案不正确，请重新检查！');
                return;
            }
        }
    }

    // 游戏结束
    isSudokuGameOver = true;
    sudokuGameOverElement.style.display = 'flex';
}

// 添加重置游戏函数
function resetSudokuGame() {
    // 重置游戏状态
    isSudokuGameOver = false;
    sudokuGameOverElement.style.display = 'none';
    // 生成新的数独谜题
    generateSudoku();
    // 重新渲染棋盘
    renderSudokuBoard();
}
// 添加显示菜单函数（假设与其他游戏保持一致）
function showMenu() {
    // 隐藏数独游戏容器
    sudokuContainer.style.display = 'none';
    // 显示菜单（这里需要根据实际的菜单DOM结构修改）
    const menu = document.getElementById('game-menu');
    if (menu) {
        menu.style.display = 'block';
    }
}

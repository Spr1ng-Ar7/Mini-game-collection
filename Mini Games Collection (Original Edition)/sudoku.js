// sudoku.js

// 核心数据
let sudokuBoard = [];     // 当前题目棋盘
let solutionBoard = [];   // 完整解
let userBoard = [];       // 用户填写的棋盘
let isSudokuGameOver = false;
let difficulty = 'medium'; // 默认难度

// DOM元素
let sudokuContainer = null;
let sudokuBoardElement = null;
let sudokuDifficultyElement = null;
let sudokuResetBtn = null;
let sudokuGameOverElement = null;
let sudokuPlayAgainBtn = null;
let sudokuBackBtn = null;

// 初始化游戏
function initSudokuGame() {
    sudokuContainer = document.getElementById('sudoku-game');
    sudokuBoardElement = document.getElementById('sudoku-board');
    sudokuDifficultyElement = document.getElementById('sudoku-difficulty');
    sudokuResetBtn = document.getElementById('sudoku-reset');
    sudokuGameOverElement = document.getElementById('sudoku-game-over');
    sudokuPlayAgainBtn = document.getElementById('sudoku-play-again');
    sudokuBackBtn = document.getElementById('sudoku-back');

    // 初始状态
    isSudokuGameOver = false;
    sudokuGameOverElement.style.display = 'none';

    // 生成题目
    generateSudoku();

    // 渲染棋盘
    renderSudokuBoard();

    // 事件绑定
    sudokuResetBtn.addEventListener('click', resetSudokuGame);
    sudokuPlayAgainBtn.addEventListener('click', resetSudokuGame);
    sudokuDifficultyElement.addEventListener('change', () => {
        difficulty = sudokuDifficultyElement.value;
        resetSudokuGame();
    });
}

// 生成数独题目
function generateSudoku() {
    sudokuBoard = Array(9).fill().map(() => Array(9).fill(0));
    userBoard = Array(9).fill().map(() => Array(9).fill(0));

    // 先解出一个完整棋盘
    solveSudoku(sudokuBoard);

    // 打乱棋盘，保证每次不同
    randomizeBoard(sudokuBoard);

    // 保存解
    solutionBoard = JSON.parse(JSON.stringify(sudokuBoard));

    // 挖空
    let removeCount;
    switch (difficulty) {
        case 'easy': removeCount = 30; break;
        case 'medium': removeCount = 40; break;
        case 'hard': removeCount = 50; break;
        default: removeCount = 40;
    }

    let removed = 0;
    while (removed < removeCount) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (sudokuBoard[row][col] !== 0) {
            sudokuBoard[row][col] = 0;
            removed++;
        }
    }

    console.log("完整解：", solutionBoard);
}

// 回溯解数独
function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveSudoku(board)) return true;
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// 检查是否能放 num
function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) return false;
        if (board[i][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) return false;
        }
    }
    return true;
}

// 随机化数独解
function randomizeBoard(board) {
    // 数字映射
    let mapping = [0,1,2,3,4,5,6,7,8,9];
    for (let i = 1; i <= 9; i++) {
        let j = Math.floor(Math.random() * 9) + 1;
        [mapping[i], mapping[j]] = [mapping[j], mapping[i]];
    }
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            board[r][c] = mapping[board[r][c]];
        }
    }

    // 行交换（宫内）
    for (let block = 0; block < 3; block++) {
        let row1 = block * 3 + Math.floor(Math.random() * 3);
        let row2 = block * 3 + Math.floor(Math.random() * 3);
        [board[row1], board[row2]] = [board[row2], board[row1]];
    }

    // 列交换（宫内）
    for (let block = 0; block < 3; block++) {
        let col1 = block * 3 + Math.floor(Math.random() * 3);
        let col2 = block * 3 + Math.floor(Math.random() * 3);
        for (let r = 0; r < 9; r++) {
            [board[r][col1], board[r][col2]] = [board[r][col2], board[r][col1]];
        }
    }
}

// 渲染棋盘
function renderSudokuBoard() {
    sudokuBoardElement.innerHTML = '';

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.classList.add('sudoku-cell');

            // 3x3 粗线
            if (row % 3 === 0 && row > 0) cell.style.borderTop = '3px solid #333';
            if (col % 3 === 0 && col > 0) cell.style.borderLeft = '3px solid #333';

            if (sudokuBoard[row][col] !== 0) {
                // 固定数字
                cell.textContent = sudokuBoard[row][col];
                cell.classList.add('sudoku-fixed');
            } else {
                // 可输入格
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => handleCellClick(row, col));

                if (userBoard[row][col] !== 0) {
                    cell.textContent = userBoard[row][col];
                    cell.classList.add('sudoku-user-input');
                }
            }

            sudokuBoardElement.appendChild(cell);
        }
    }
}

// 点击单元格
function handleCellClick(row, col) {
    if (isSudokuGameOver) return;
    if (sudokuBoard[row][col] !== 0) return;

    createNumberSelector(row, col);
}

// 数字选择面板
function createNumberSelector(row, col) {
    const existing = document.querySelector('.sudoku-number-selector');
    if (existing) existing.remove();

    const selector = document.createElement('div');
    selector.classList.add('sudoku-number-selector');

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
    }
}

// 用户选择数字
function selectNumber(num, row, col) {
    userBoard[row][col] = num;
    renderSudokuBoard();
    checkSudokuGameOver();

    const selector = document.querySelector('.sudoku-number-selector');
    if (selector) selector.remove();
}

// 检查是否结束
function checkSudokuGameOver() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (userBoard[row][col] === 0 && sudokuBoard[row][col] === 0) return;
        }
    }
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const val = userBoard[row][col] || sudokuBoard[row][col];
            if (val !== solutionBoard[row][col]) {
                alert("答案不正确，请再试试！");
                return;
            }
        }
    }

    isSudokuGameOver = true;
    sudokuGameOverElement.style.display = 'flex';
}

// 重置游戏
function resetSudokuGame() {
    isSudokuGameOver = false;
    sudokuGameOverElement.style.display = 'none';
    generateSudoku();
    renderSudokuBoard();
}

// 返回菜单
function showMenu() {
    sudokuContainer.style.display = 'none';
    const menu = document.getElementById('game-menu');
    if (menu) menu.style.display = 'block';
}

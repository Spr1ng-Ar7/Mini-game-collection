// sudoku.js

// 核心数据
let sudokuBoard = [];     // 当前题目棋盘（挖空后，给定处是1~9，其余为0）
let solutionBoard = [];   // 生成时的完整解（仅用于调试或对照）
let userBoard = [];       // 用户填写的棋盘（仅对挖空处记录1~9）
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

    isSudokuGameOver = false;
    if (sudokuGameOverElement) sudokuGameOverElement.style.display = 'none';

    generateSudoku();
    renderSudokuBoard();

    if (sudokuResetBtn) sudokuResetBtn.addEventListener('click', resetSudokuGame);
    if (sudokuPlayAgainBtn) sudokuPlayAgainBtn.addEventListener('click', resetSudokuGame);
    if (sudokuDifficultyElement) {
        sudokuDifficultyElement.value = difficulty;
        sudokuDifficultyElement.addEventListener('change', () => {
            difficulty = sudokuDifficultyElement.value;
            resetSudokuGame();
        });
    }
}

// 生成数独题目
function generateSudoku() {
    sudokuBoard = Array(9).fill().map(() => Array(9).fill(0));
    userBoard   = Array(9).fill().map(() => Array(9).fill(0));

    // 先解出一个完整棋盘（确定的解）
    solveSudoku(sudokuBoard);

    // 打乱棋盘，确保每次不同但仍合法
    randomizeBoard(sudokuBoard);

    // 保存完整解
    solutionBoard = JSON.parse(JSON.stringify(sudokuBoard));

    // 按难度挖空（保证唯一解）
    let removeCount;
    switch (difficulty) {
        case 'easy':   removeCount = 30; break;
        case 'medium': removeCount = 40; break;
        case 'hard':   removeCount = 50; break;
        default:       removeCount = 40;
    }

    let removed = 0;
    while (removed < removeCount) {
        const r = Math.floor(Math.random() * 9);
        const c = Math.floor(Math.random() * 9);
        if (sudokuBoard[r][c] !== 0) {
            const backup = sudokuBoard[r][c];
            sudokuBoard[r][c] = 0;

            // 检查唯一解
            if (hasUniqueSolution(sudokuBoard)) {
                removed++;
            } else {
                sudokuBoard[r][c] = backup; // 恢复
            }
        }
    }


    // 调试：在控制台打印完整解
    console.log('Sudoku Solution:', solutionBoard);
}

// 回溯解数独（用于生成初始完整解）
function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                // 为了更多随机性，随机尝试数字顺序
                const nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
                for (let k = 0; k < 9; k++) {
                    const num = nums[k];
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

// —— 检查当前棋盘是否唯一解 ——
// 返回 true 表示唯一解，false 表示无解或多解
function hasUniqueSolution(board) {
    let solutionCount = 0;

    function backtrack(bd) {
        if (solutionCount > 1) return; // 超过1个解就可以提前结束
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (bd[r][c] === 0) {
                    for (let n = 1; n <= 9; n++) {
                        if (isValid(bd, r, c, n)) {
                            bd[r][c] = n;
                            backtrack(bd);
                            bd[r][c] = 0;
                        }
                    }
                    return;
                }
            }
        }
        solutionCount++;
    }

    const copy = JSON.parse(JSON.stringify(board));
    backtrack(copy);
    return solutionCount === 1;
}


// 检查在 board 上 (row,col) 能否放 num
function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) return false;
        if (board[i][col] === num) return false;
    }
    const sr = Math.floor(row / 3) * 3;
    const sc = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[sr + i][sc + j] === num) return false;
        }
    }
    return true;
}

// 打乱完整解：数字映射 + 宫内行/列交换 + 宫块交换
function randomizeBoard(board) {
    // 数字映射（1~9随机置换）
    const mapping = [0,1,2,3,4,5,6,7,8,9];
    for (let i = 1; i <= 9; i++) {
        const j = Math.floor(Math.random() * 9) + 1;
        [mapping[i], mapping[j]] = [mapping[j], mapping[i]];
    }
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            board[r][c] = mapping[board[r][c]];
        }
    }

    // 宫内随机交换行
    for (let block = 0; block < 3; block++) {
        const r1 = block * 3 + Math.floor(Math.random() * 3);
        const r2 = block * 3 + Math.floor(Math.random() * 3);
        [board[r1], board[r2]] = [board[r2], board[r1]];
    }

    // 宫内随机交换列
    for (let block = 0; block < 3; block++) {
        const c1 = block * 3 + Math.floor(Math.random() * 3);
        const c2 = block * 3 + Math.floor(Math.random() * 3);
        for (let r = 0; r < 9; r++) {
            [board[r][c1], board[r][c2]] = [board[r][c2], board[r][c1]];
        }
    }

    // 宫块整体交换（行宫）
    if (Math.random() > 0.5) {
        const b1 = Math.floor(Math.random() * 3);
        const b2 = Math.floor(Math.random() * 3);
        for (let i = 0; i < 3; i++) {
            [board[b1*3 + i], board[b2*3 + i]] = [board[b2*3 + i], board[b1*3 + i]];
        }
    }

    // 宫块整体交换（列宫）
    if (Math.random() > 0.5) {
        const b1 = Math.floor(Math.random() * 3);
        const b2 = Math.floor(Math.random() * 3);
        for (let r = 0; r < 9; r++) {
            for (let i = 0; i < 3; i++) {
                const c1 = b1*3 + i, c2 = b2*3 + i;
                [board[r][c1], board[r][c2]] = [board[r][c2], board[r][c1]];
            }
        }
    }
}

// —— 工具：把“给定+用户”合并成当前盘面 ——
function getCurrentBoard() {
    const cur = Array(9).fill().map(() => Array(9).fill(0));
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            cur[r][c] = sudokuBoard[r][c] !== 0 ? sudokuBoard[r][c] : userBoard[r][c];
        }
    }
    return cur;
}
function isBoardFull(board) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) return false;
        }
    }
    return true;
}
function hasAllDigits(arr) {
    const set = new Set(arr);
    if (set.size !== 9) return false;
    for (let n = 1; n <= 9; n++) if (!set.has(n)) return false;
    return true;
}
function isSolvedBoard(board) {
    // 行
    for (let r = 0; r < 9; r++) {
        if (!hasAllDigits(board[r])) return false;
    }
    // 列
    for (let c = 0; c < 9; c++) {
        const col = [];
        for (let r = 0; r < 9; r++) col.push(board[r][c]);
        if (!hasAllDigits(col)) return false;
    }
    // 3x3 宫
    for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
            const box = [];
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    box.push(board[br*3 + i][bc*3 + j]);
                }
            }
            if (!hasAllDigits(box)) return false;
        }
    }
    return true;
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
                // 固定数字（题面）
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
    selector.style.top = `${rect.bottom + 4}px`;
    document.body.appendChild(selector);

    for (let i = 1; i <= 9; i++) {
        const number = document.createElement('div');
        number.classList.add('sudoku-number');
        number.textContent = i;

        if (difficulty === 'easy') {
            // 简单难度才显示红绿提示
            const current = getCurrentBoard();
            const canPlace = isValid(current, row, col, i);
            number.style.backgroundColor = canPlace ? 'lightgreen' : 'lightcoral';
            number.style.color = canPlace ? 'black' : 'white';
        } else {
            // 其他难度不提示，用统一样式
            number.style.backgroundColor = '#eee';
            number.style.color = 'black';
        }

        number.style.border = '1px solid #333';
        number.style.borderRadius = '50%';
        number.style.cursor = 'pointer';

        number.addEventListener('click', () => selectNumber(i, row, col));
        selector.appendChild(number);
    }

    // === 新增删除按钮 ===
    const delBtn = document.createElement('div');
    delBtn.classList.add('sudoku-number');
    delBtn.textContent = '⌫'; // 或者写 "Del"
    delBtn.style.backgroundColor = '#f5f5f5';
    delBtn.style.color = 'black';
    delBtn.style.border = '1px solid #333';
    delBtn.style.borderRadius = '8px';
    delBtn.style.marginTop = '6px';
    delBtn.style.cursor = 'pointer';

    delBtn.addEventListener('click', () => {
        userBoard[row][col] = 0; // 清空用户输入
        renderSudokuBoard();
        const selector = document.querySelector('.sudoku-number-selector');
        if (selector) selector.remove();
    });

    selector.appendChild(delBtn);
}


// 用户选择数字
function selectNumber(num, row, col) {
    userBoard[row][col] = num;
    renderSudokuBoard();
    checkSudokuGameOver();

    const selector = document.querySelector('.sudoku-number-selector');
    if (selector) selector.remove();
}

// 过关判定：接受“任意合法解”，不再强制等于 solutionBoard
function checkSudokuGameOver() {
    const current = getCurrentBoard();

    if (!isBoardFull(current)) return;

    if (isSolvedBoard(current)) {
        isSudokuGameOver = true;
        if (sudokuGameOverElement) sudokuGameOverElement.style.display = 'flex';
    } else {
        alert('答案不正确，请再试试！');
    }
}

// 重置游戏
function resetSudokuGame() {
    isSudokuGameOver = false;
    if (sudokuGameOverElement) sudokuGameOverElement.style.display = 'none';
    generateSudoku();
    renderSudokuBoard();
}

// 返回菜单（如果有）
function showMenu() {
    if (sudokuContainer) sudokuContainer.style.display = 'none';
    const menu = document.getElementById('game-menu');
    if (menu) menu.style.display = 'block';
}
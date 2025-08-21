// 使用IIFE封装记忆翻牌2游戏代码
(function() {
    let memoryCards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let attempts = 0;
    let isMemoryGameOver = false;

    // 18种不同的符号
    const cardSymbols = ['♥', '♦', '♣', '♠', '★', '☆', '●', '○', '✕', '✓', '△', '□', '◈', '♫', '♬', '☀', '☁', '☂'];

    // 获取DOM元素
    const memoryBoard = document.getElementById('memory2-board');
    const memoryAttemptsElement = document.getElementById('memory2-attempts');
    const memoryResetBtn = document.getElementById('memory2-reset');
    const memoryGameOverElement = document.getElementById('memory2-game-over');
    const memoryFinalAttemptsElement = document.getElementById('memory2-final-attempts');
    const memoryPlayAgainBtn = document.getElementById('memory2-play-again');

    // 初始化记忆翻牌游戏
    function initMemory2Game() {
        // 重置游戏状态
        memoryCards = [];
        flippedCards = [];
        matchedPairs = 0;
        attempts = 0;
        isMemoryGameOver = false;
        memoryGameOverElement.style.display = 'none';
        memoryBoard.innerHTML = '';

        // 更新尝试次数显示
        memoryAttemptsElement.textContent = attempts;

        // 准备卡片数据
        prepareMemoryCards();

        // 渲染卡片
        renderMemoryCards();

        // 添加事件监听
        memoryResetBtn.addEventListener('click', resetMemoryGame);
        memoryPlayAgainBtn.addEventListener('click', resetMemoryGame);
    }

    // 准备卡片数据
    function prepareMemoryCards() {
        // 每种符号添加两个（配对）
        memoryCards = [...cardSymbols, ...cardSymbols].map((symbol, index) => ({
            id: index,
            symbol: symbol,
            flipped: false,
            matched: false
        }));

        // 打乱卡片顺序
        memoryCards.sort(() => Math.random() - 0.5);
    }

    // 渲染卡片
    function renderMemoryCards() {
        memoryBoard.innerHTML = '';
        memoryCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memory-card');
            cardElement.dataset.id = card.id;

            // 创建卡片正面和背面
            const frontElement = document.createElement('div');
            frontElement.classList.add('memory-card-front');

            const backElement = document.createElement('div');
            backElement.classList.add('memory-card-back');
            backElement.textContent = card.symbol;

            cardElement.appendChild(frontElement);
            cardElement.appendChild(backElement);

            // 添加事件监听
            cardElement.addEventListener('click', () => flipCard(card.id));

            // 添加到DOM
            memoryBoard.appendChild(cardElement);

            // 延迟添加 flipped 类以确保动画触发
            setTimeout(() => {
                if (card.flipped || card.matched) {
                    cardElement.classList.add('flipped');
                }
                if (card.matched) {
                    cardElement.classList.add('matched');
                }
            }, 50);
        });
    }

    // 翻转卡片
    function flipCard(id) {
        if (isMemoryGameOver) return;

        const card = memoryCards.find(c => c.id === id);
        // 如果卡片已经翻开或匹配，不执行操作
        if (card.flipped || card.matched) return;
        // 如果已经翻开两张卡片，不执行操作
        if (flippedCards.length >= 2) return;

        // 更新卡片状态
        card.flipped = true;
        flippedCards.push(card);

        // 触发重绘以启动动画
        renderMemoryCards();

        // 如果翻开了两张卡片，检查是否匹配
        if (flippedCards.length === 2) {
            attempts++;
            memoryAttemptsElement.textContent = attempts;

            // 等待翻转动画完成后再检查匹配
            setTimeout(() => {
                const [card1, card2] = flippedCards;
                if (card1.symbol === card2.symbol) {
                    // 匹配成功
                    card1.matched = true;
                    card2.matched = true;
                    matchedPairs++;
                    flippedCards = [];  // 重置flippedCards数组

                    // 匹配成功动画效果
                    setTimeout(() => {
                        if (matchedPairs === 18) {  // 6x6网格需要匹配18对
                            memoryGameOver();
                        }
                        renderMemoryCards();
                    }, 300);
                } else {
                    // 匹配失败，翻回
                    setTimeout(() => {
                        card1.flipped = false;
                        card2.flipped = false;
                        flippedCards = [];
                        renderMemoryCards();
                    }, 500);
                }
            }, 600); // 等待翻转动画完成 (与CSS过渡时间匹配)
        }
    }

    // 游戏结束
    function memoryGameOver() {
        isMemoryGameOver = true;
        memoryFinalAttemptsElement.textContent = attempts;
        memoryGameOverElement.style.display = 'block';
    }

    // 重置游戏
    function resetMemoryGame() {
        // 重置游戏状态
        memoryCards = [];
        flippedCards = [];
        matchedPairs = 0;
        attempts = 0;
        isMemoryGameOver = false;
        memoryGameOverElement.style.display = 'none';

        // 更新尝试次数显示
        memoryAttemptsElement.textContent = attempts;

        // 准备卡片数据
        prepareMemoryCards();

        // 渲染卡片
        renderMemoryCards();
    }

    // 暴露initMemory2Game函数到全局作用域
    window.initMemory2Game = initMemory2Game;

    // 页面加载完成后初始化游戏
    document.addEventListener('DOMContentLoaded', () => {
        initMemory2Game();
    });
})();

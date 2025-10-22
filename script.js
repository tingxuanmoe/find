document.addEventListener('DOMContentLoaded', () => {
    const levelCounter = document.getElementById('level-counter');
    const timerDisplay = document.getElementById('timer');
    const canvas1 = document.getElementById('game-canvas-1');
    const canvas2 = document.getElementById('game-canvas-2');
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');

    let currentLevel = 0;
    let foundDifferences = 0;
    let timer;
    let timeLeft = 600; // 10 minutes in seconds

    const levels = [
        {
            scene: {
                bgColor: '#a0e9fbd6',
                shapes: [
                    { type: 'rect', color: '#f0c419', x: 50, y: 50, w: 80, h: 80 },
                    { type: 'circle', color: '#ff7f50', x: 250, y: 150, r: 50 },
                    { type: 'rect', color: '#6ab04c', x: 150, y: 250, w: 100, h: 60 },
                ]
            },
            differences: [
                // A circle is a different color on the second image
                { type: 'circle', color: '#ff1111', x: 250, y: 150, r: 50, found: false },
            ]
        },
        {
            scene: {
                bgColor: '#f0f0f0',
                shapes: [
                    { type: 'circle', color: '#8e44ad', x: 100, y: 100, r: 40 },
                    { type: 'rect', color: '#3498db', x: 200, y: 200, w: 90, h: 90 },
                    { type: 'circle', color: '#2ecc71', x: 300, y: 80, r: 30 },
                ]
            },
            differences: [
                // One shape is missing on the first image
                { type: 'rect', color: '#e74c3c', x: 80, y: 250, w: 50, h: 50, found: false },
                 // Another shape is in a different position
                { type: 'circle', color: '#f1c40f', x: 320, y: 320, r: 25, found: false },
            ]
        }
    ];

    function drawShape(ctx, shape) {
        ctx.fillStyle = shape.color;
        if (shape.type === 'rect') {
            ctx.fillRect(shape.x, shape.y, shape.w, shape.h);
        } else if (shape.type === 'circle') {
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.r, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    function drawScene(ctx, levelData) {
        // Draw background
        ctx.fillStyle = levelData.scene.bgColor;
        ctx.fillRect(0, 0, canvas1.width, canvas1.height);
        // Draw shapes
        levelData.scene.shapes.forEach(shape => drawShape(ctx, shape));
    }

    function startTimer() {
        clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                alert('时间到！游戏结束！');
                location.reload();
            }
        }, 1000);
    }

    function loadLevel(levelIndex) {
        if (levelIndex >= levels.length) {
            clearInterval(timer);
            alert('恭喜你，通关啦！');
            return;
        }

        const levelData = levels[levelIndex];
        foundDifferences = 0;
        levelData.differences.forEach(diff => diff.found = false);

        // Draw base scene on both canvases
        drawScene(ctx1, levelData);
        drawScene(ctx2, levelData);

        // Draw differences on the second canvas only
        levelData.differences.forEach(diff => drawShape(ctx2, diff));

        levelCounter.textContent = levelIndex + 1;
    }

    function isClickOnDifference(x, y, diff) {
        if (diff.type === 'rect') {
            return x >= diff.x && x <= diff.x + diff.w && y >= diff.y && y <= diff.y + diff.h;
        } else if (diff.type === 'circle') {
            const distance = Math.sqrt(Math.pow(x - diff.x, 2) + Math.pow(y - diff.y, 2));
            return distance <= diff.r;
        }
        return false;
    }

    function handleClick(event) {
        if (timeLeft <= 0) return;

        const canvas = event.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        const levelData = levels[currentLevel];
        levelData.differences.forEach((diff) => {
            if (!diff.found && isClickOnDifference(x, y, diff)) {
                diff.found = true;
                foundDifferences++;
                markDifference(diff);

                if (foundDifferences === levelData.differences.length) {
                    setTimeout(() => {
                        currentLevel++;
                        loadLevel(currentLevel);
                    }, 1000);
                }
            }
        });
    }

    function markDifference(diff) {
        [ctx1, ctx2].forEach(ctx => {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 5;
            ctx.beginPath();
            if (diff.type === 'rect') {
                ctx.strokeRect(diff.x - 5, diff.y - 5, diff.w + 10, diff.h + 10);
            } else if (diff.type === 'circle') {
                ctx.arc(diff.x, diff.y, diff.r + 5, 0, 2 * Math.PI);
                ctx.stroke();
            }
        });
    }

    canvas1.addEventListener('click', handleClick);
    canvas2.addEventListener('click', handleClick);

    loadLevel(currentLevel);
    startTimer();
});

document.addEventListener('DOMContentLoaded', () => {
    const levelCounter = document.getElementById('level-counter');
    const timerDisplay = document.getElementById('timer');
    const imageContainer1 = document.getElementById('image-container-1');
    const imageContainer2 = document.getElementById('image-container-2');
    const gameImage1 = document.getElementById('game-image-1');
    const gameImage2 = document.getElementById('game-image-2');

    let currentLevel = 0;
    let foundDifferences = 0;
    let timer;
    let timeLeft = 600; // 10 minutes in seconds

    const levels = [
        {
            image1: 'https://picsum.photos/id/1015/600/400',
            image2: 'https://picsum.photos/id/1016/600/400',
            differences: [
                { x: 15, y: 75, r: 5, found: false },
                { x: 80, y: 60, r: 6, found: false }
            ]
        },
        {
            image1: 'https://picsum.photos/id/1025/600/400',
            image2: 'https://picsum.photos/id/1024/600/400',
            differences: [
                { x: 50, y: 50, r: 4, found: false },
                { x: 25, y: 25, r: 3, found: false },
                { x: 75, y: 75, r: 5, found: false }
            ]
        }
    ];

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
        gameImage1.src = levelData.image1;
        gameImage2.src = levelData.image2;
        levelCounter.textContent = levelIndex + 1;
        foundDifferences = 0;

        levelData.differences.forEach(diff => diff.found = false);
        document.querySelectorAll('.difference-marker').forEach(marker => marker.remove());
    }

    function handleClick(event) {
        if (timeLeft <= 0) return;

        const container = event.currentTarget;
        const rect = container.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        const levelData = levels[currentLevel];
        levelData.differences.forEach((diff) => {
            const distance = Math.sqrt(Math.pow(x - diff.x, 2) + Math.pow(y - diff.y, 2));
            if (distance < diff.r && !diff.found) {
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
        [imageContainer1, imageContainer2].forEach(container => {
            const marker = document.createElement('div');
            marker.className = 'difference-marker';
            marker.style.left = `${diff.x}%`;
            marker.style.top = `${diff.y}%`;
            marker.style.width = `${diff.r * 2}%`;
            marker.style.height = `${diff.r * 2}%`;
            marker.style.transform = 'translate(-50%, -50%)';
            container.appendChild(marker);
        });
    }

    imageContainer1.addEventListener('click', handleClick);
    imageContainer2.addEventListener('click', handleClick);

    loadLevel(currentLevel);
    startTimer();
});

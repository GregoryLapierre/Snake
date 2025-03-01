const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.querySelector('.game-over');
const restartBtn = document.getElementById('restart-btn');
const speedSelect = document.getElementById('speed');

canvas.width = 600;
canvas.height = 400;

const gridSize = 20;
const tileCountX = canvas.width / gridSize;
const tileCountY = canvas.height / gridSize;

let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let direction = {x: 0, y: 0};
let score = 0;
let lastRenderTime = 0;
let gameActive = true;
let snakeSpeed = 10;

function getAvailablePositions() {
  const allPositions = [];
  for (let x = 0; x < tileCountX; x++) {
    for (let y = 0; y < tileCountY; y++) {
      allPositions.push({x, y});
    }
  }
  return allPositions.filter(pos => 
    !snake.some(segment => segment.x === pos.x && segment.y === pos.y)
  );
}

function placeFood() {
  const availablePositions = getAvailablePositions();
  if (availablePositions.length > 0) {
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    food = availablePositions[randomIndex];
  } else {
    resetGame();
  }
}

function update() {
  if (!gameActive) return;
  
  const snakeHead = {
    x: (snake[0].x + direction.x + tileCountX) % tileCountX,
    y: (snake[0].y + direction.y + tileCountY) % tileCountY
  };
  
  if (snake.slice(1).some(segment => segment.x === snakeHead.x && segment.y === snakeHead.y)) {
    gameOver();
    return;
  }
  
  snake.unshift(snakeHead);
  
  if (snakeHead.x === food.x && snakeHead.y === food.y) {
    score += 10;
    scoreElement.textContent = score;
    placeFood();
  } else {
    snake.pop();
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    const x = segment.x * gridSize;
    const y = segment.y * gridSize;
    
    // Base color
    ctx.fillStyle = '#00cc77';
    ctx.fillRect(x, y, gridSize, gridSize);
    
    // Reflection effect
    const gradient = ctx.createLinearGradient(
      x, y, 
      x + gridSize, y + gridSize
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, gridSize, gridSize);
    
    // Highlight for head
    if (index === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(
        x + gridSize/2,
        y + gridSize/2,
        gridSize/3, 
        0, Math.PI * 2
      );
      ctx.fill();
    }
  });
}

function drawFood() {
  const x = food.x * gridSize;
  const y = food.y * gridSize;
  
  // Base color
  ctx.fillStyle = '#ff0044';
  ctx.beginPath();
  ctx.arc(
    x + gridSize/2,
    y + gridSize/2,
    gridSize/2, 
    0, Math.PI * 2
  );
  ctx.fill();
  
  // Reflection effect
  const gradient = ctx.createRadialGradient(
    x + gridSize/2,
    y + gridSize/2,
    0,
    x + gridSize/2,
    y + gridSize/2,
    gridSize/2
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fill();
}

function draw() {
  // Clear canvas
  ctx.fillStyle = '#151528';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw snake
  drawSnake();
  
  // Draw food
  drawFood();
}

function gameOver() {
  gameActive = false;
  if (gameOverElement) {
    gameOverElement.style.display = 'block';
  }
}

function resetGame() {
  snake = [{x: 10, y: 10}];
  direction = {x: 0, y: 0};
  score = 0;
  scoreElement.textContent = score;
  gameActive = true;
  if (gameOverElement) {
    gameOverElement.style.display = 'none';
  }
  placeFood();
}

function gameLoop(currentTime) {
  window.requestAnimationFrame(gameLoop);
  const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
  if (secondsSinceLastRender < 1 / snakeSpeed) return;
  
  lastRenderTime = currentTime;
  update();
  draw();
}

// Event listeners
window.addEventListener('keydown', e => {
  if (!gameActive && e.key === ' ') {
    resetGame();
    return;
  }
  
  switch (e.key) {
    case 'ArrowUp':
      if (direction.y === 0) direction = {x: 0, y: -1};
      break;
    case 'ArrowDown':
      if (direction.y === 0) direction = {x: 0, y: 1};
      break;
    case 'ArrowLeft':
      if (direction.x === 0) direction = {x: -1, y: 0};
      break;
    case 'ArrowRight':
      if (direction.x === 0) direction = {x: 1, y: 0};
      break;
  }
});

if (restartBtn) {
  restartBtn.addEventListener('click', resetGame);
}

if (speedSelect) {
  speedSelect.addEventListener('change', (e) => {
    snakeSpeed = parseInt(e.target.value);
  });
}

// Initial setup
placeFood();
draw(); // Draw initial state
window.requestAnimationFrame(gameLoop);

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

function drawSnakeSegment(x, y, type, dir) {
  const radius = gridSize / 2;
  const centerX = x * gridSize + radius;
  const centerY = y * gridSize + radius;

  ctx.fillStyle = type === 'head' ? '#00cc77' : 
                  type === 'tail' ? '#009966' : '#00ff96';

  if (type === 'body') {
    // Draw straight body segment
    ctx.fillRect(
      x * gridSize,
      y * gridSize,
      gridSize,
      gridSize
    );
    return;
  }

  ctx.beginPath();

  if (type === 'head') {
    // Draw head with rounded front
    if (dir.x === 1) { // Right
      ctx.arc(centerX + radius, centerY, radius, -Math.PI/2, Math.PI/2);
      ctx.lineTo(centerX, centerY + radius);
      ctx.lineTo(centerX, centerY - radius);
    } else if (dir.x === -1) { // Left
      ctx.arc(centerX - radius, centerY, radius, Math.PI/2, -Math.PI/2);
      ctx.lineTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
    } else if (dir.y === 1) { // Down
      ctx.arc(centerX, centerY + radius, radius, Math.PI, 0);
      ctx.lineTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
    } else if (dir.y === -1) { // Up
      ctx.arc(centerX, centerY - radius, radius, 0, Math.PI);
      ctx.lineTo(centerX + radius, centerY);
      ctx.lineTo(centerX - radius, centerY);
    }
  } else if (type === 'tail') {
    // Draw tail with rounded end
    if (dir.x === 1) { // Right
      ctx.arc(centerX - radius, centerY, radius, Math.PI/2, -Math.PI/2);
      ctx.lineTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
    } else if (dir.x === -1) { // Left
      ctx.arc(centerX + radius, centerY, radius, -Math.PI/2, Math.PI/2);
      ctx.lineTo(centerX, centerY + radius);
      ctx.lineTo(centerX, centerY - radius);
    } else if (dir.y === 1) { // Down
      ctx.arc(centerX, centerY - radius, radius, 0, Math.PI);
      ctx.lineTo(centerX + radius, centerY);
      ctx.lineTo(centerX - radius, centerY);
    } else if (dir.y === -1) { // Up
      ctx.arc(centerX, centerY + radius, radius, Math.PI, 0);
      ctx.lineTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
    }
  }

  ctx.closePath();
  ctx.fill();

  // Draw eyes on head
  if (type === 'head') {
    ctx.fillStyle = '#fff';
    const eyeOffsetX = dir.x !== 0 ? radius - 5 : 5;
    const eyeOffsetY = dir.y !== 0 ? radius - 5 : 5;
    
    ctx.beginPath();
    if (dir.x === 1) { // Right
      ctx.arc(centerX + radius - 5, centerY - 5, 2, 0, Math.PI * 2);
      ctx.arc(centerX + radius - 5, centerY + 5, 2, 0, Math.PI * 2);
    } else if (dir.x === -1) { // Left
      ctx.arc(centerX - radius + 5, centerY - 5, 2, 0, Math.PI * 2);
      ctx.arc(centerX - radius + 5, centerY + 5, 2, 0, Math.PI * 2);
    } else if (dir.y === 1) { // Down
      ctx.arc(centerX - 5, centerY + radius - 5, 2, 0, Math.PI * 2);
      ctx.arc(centerX + 5, centerY + radius - 5, 2, 0, Math.PI * 2);
    } else if (dir.y === -1) { // Up
      ctx.arc(centerX - 5, centerY - radius + 5, 2, 0, Math.PI * 2);
      ctx.arc(centerX + 5, centerY - radius + 5, 2, 0, Math.PI * 2);
    }
    ctx.fill();
  }
}

function draw() {
  // Clear canvas
  ctx.fillStyle = '#151528';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    const segment = snake[i];
    let type = 'body';
    let dir = direction;
    
    if (i === 0) {
      type = 'head';
      dir = direction;
    } else if (i === snake.length - 1) {
      type = 'tail';
      dir = {
        x: segment.x - snake[i-1].x,
        y: segment.y - snake[i-1].y
      };
    }
    
    drawSnakeSegment(segment.x, segment.y, type, dir);
  }
  
  // Draw food
  ctx.fillStyle = '#ff0044';
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize/2,
    food.y * gridSize + gridSize/2,
    gridSize/2, 0, Math.PI * 2
  );
  ctx.fill();
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

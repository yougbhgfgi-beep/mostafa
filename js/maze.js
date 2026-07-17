const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const winOverlay = document.getElementById('winOverlay');

const COLS = 21;
const ROWS = 17;
let CELL_SIZE;
let maze = [];
let player = {x:1, y:1};
let gameWon = false;
let animationId = null;

function generateMaze(){
  maze = Array.from({length:ROWS}, () => Array(COLS).fill(1));
  const stack = [{x:1, y:1}];
  maze[1][1] = 0;
  while(stack.length > 0){
    const cur = stack[stack.length-1];
    const neighbors = [];
    const dirs = [[0,-2],[0,2],[-2,0],[2,0]];
    for(const [dx,dy] of dirs){
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if(nx > 0 && nx < COLS-1 && ny > 0 && ny < ROWS-1 && maze[ny][nx] === 1){
        neighbors.push({x:nx, y:ny, wx:cur.x+dx/2, wy:cur.y+dy/2});
      }
    }
    if(neighbors.length > 0){
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      maze[next.wy][next.wx] = 0;
      maze[next.y][next.x] = 0;
      stack.push({x:next.x, y:next.y});
    } else {
      stack.pop();
    }
  }
  maze[ROWS-2][COLS-2] = 0;
}

function resizeCanvas(){
  const maxW = Math.min(window.innerWidth * 0.95, 600);
  const maxH = window.innerHeight * 0.52;
  const cellW = Math.floor(maxW / COLS);
  const cellH = Math.floor(maxH / ROWS);
  CELL_SIZE = Math.max(Math.min(cellW, cellH, 36), 14);
  canvas.width = COLS * CELL_SIZE;
  canvas.height = ROWS * CELL_SIZE;
}

function drawMaze(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(let y = 0; y < ROWS; y++){
    for(let x = 0; x < COLS; x++){
      if(maze[y][x] === 1){
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = 'rgba(244,63,94,0.08)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
  // End point
  ctx.fillStyle = 'rgba(251,113,133,0.25)';
  ctx.shadowColor = 'rgba(244,63,94,0.2)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc((COLS-2)*CELL_SIZE + CELL_SIZE/2, (ROWS-2)*CELL_SIZE + CELL_SIZE/2, CELL_SIZE*0.32, 0, Math.PI*2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Heart icon at end
  ctx.font = `${CELL_SIZE*0.4}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(251,113,133,0.5)';
  ctx.fillText('💕', (COLS-2)*CELL_SIZE + CELL_SIZE/2, (ROWS-2)*CELL_SIZE + CELL_SIZE/2);
  // Player
  const px = player.x * CELL_SIZE + CELL_SIZE/2;
  const py = player.y * CELL_SIZE + CELL_SIZE/2;
  ctx.shadowColor = 'rgba(244,63,94,0.4)';
  ctx.shadowBlur = 16;
  const grad = ctx.createRadialGradient(px-2, py-2, 0, px, py, CELL_SIZE*0.4);
  grad.addColorStop(0, '#fda4af');
  grad.addColorStop(0.6, '#fb7185');
  grad.addColorStop(1, '#e11d48');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(px, py, CELL_SIZE*0.33, 0, Math.PI*2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Hearts floating around player
  if(!gameWon){
    const t = Date.now() / 1000;
    for(let i=0; i<3; i++){
      const offsetX = Math.sin(t + i*2) * CELL_SIZE*0.25;
      const offsetY = Math.cos(t*0.7 + i*1.5) * CELL_SIZE*0.2 - 2;
      ctx.font = `${CELL_SIZE*0.2}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.3 + Math.sin(t + i)*0.15;
      ctx.fillText('💕', px + offsetX, py + offsetY);
      ctx.globalAlpha = 1;
    }
  }
}

function movePlayer(dx, dy){
  if(gameWon) return;
  const nx = player.x + dx;
  const ny = player.y + dy;
  if(nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return;
  if(maze[ny][nx] === 1) return;
  player.x = nx;
  player.y = ny;
  drawMaze();
  if(nx === COLS-2 && ny === ROWS-2){
    gameWon = true;
    setTimeout(showWin, 300);
  }
}

function showWin(){
  winOverlay.classList.add('show');
}

function closeWin(){
  winOverlay.classList.remove('show');
}

function resetGame(){
  player = {x:1, y:1};
  gameWon = false;
  generateMaze();
  resizeCanvas();
  drawMaze();
  winOverlay.classList.remove('show');
}

// Keyboard
document.addEventListener('keydown', (e) => {
  switch(e.key){
    case 'ArrowUp': e.preventDefault(); movePlayer(0, -1); break;
    case 'ArrowDown': e.preventDefault(); movePlayer(0, 1); break;
    case 'ArrowLeft': e.preventDefault(); movePlayer(-1, 0); break;
    case 'ArrowRight': e.preventDefault(); movePlayer(1, 0); break;
  }
});

// Touch controls
document.getElementById('btnUp').addEventListener('click', () => movePlayer(0, -1));
document.getElementById('btnDown').addEventListener('click', () => movePlayer(0, 1));
document.getElementById('btnLeft').addEventListener('click', () => movePlayer(-1, 0));
document.getElementById('btnRight').addEventListener('click', () => movePlayer(1, 0));

// Touch swipe on canvas
let touchStartX, touchStartY;
canvas.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
}, {passive: true});
canvas.addEventListener('touchend', (e) => {
  if(!touchStartX || !touchStartY) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const adx = Math.abs(dx), ady = Math.abs(dy);
  if(Math.max(adx, ady) < 10) return;
  if(adx > ady){
    movePlayer(dx > 0 ? 1 : -1, 0);
  } else {
    movePlayer(0, dy > 0 ? 1 : -1);
  }
  touchStartX = null;
}, {passive: true});

// Resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    resizeCanvas();
    drawMaze();
  }, 200);
});

// Back to main site
function goBack(){
  if(window.opener || window.history.length <= 2){
    window.close();
  } else {
    window.location.href = './index.html';
  }
}

// Event listeners (robust, no inline onclick)
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('backBtn').addEventListener('click', goBack);
  document.getElementById('exitGameBtn').addEventListener('click', goBack);
  document.getElementById('retryBtn').addEventListener('click', () => { resetGame(); });
});

// Init
resetGame();

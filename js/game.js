/* ==========================================================================
   SCHOOL QUEST: KNOWLEDGE RUNNER - CANVAS 2D ENGINE
   Full 60fps HTML5 Canvas educational runner with physics, jumping,
   obstacles, collectibles, high scores, pause/restart, mobile touch controls,
   and Web Audio sound effects.
   ========================================================================== */

class SchoolQuestGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Internal resolution
    this.width = 900;
    this.height = 420;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Game state
    this.isRunning = false;
    this.isPaused = false;
    this.isGameOver = false;
    this.score = 0;
    this.starsCount = 0;
    this.highScore = parseInt(localStorage.getItem('apex_school_quest_highscore')) || 0;

    // World & physics parameters
    this.groundY = 340;
    this.gravity = 0.65;
    this.gameSpeed = 5.5;
    this.maxGameSpeed = 12;
    this.distance = 0;

    // Player state
    this.player = {
      x: 100,
      y: this.groundY - 50,
      w: 36,
      h: 52,
      vy: 0,
      isGrounded: true,
      jumpCount: 0,
      maxJumps: 2,
      isSliding: false,
      normalHeight: 52,
      slideHeight: 28,
      color: '#3b82f6',
      animFrame: 0,
      animTimer: 0
    };

    // Arrays
    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.clouds = [];

    // Timers
    this.obstacleTimer = 0;
    this.obstacleInterval = 110; // frames
    this.collectibleTimer = 0;

    // Key states
    this.keys = {
      up: false,
      down: false
    };

    // Init clouds
    for (let i = 0; i < 5; i++) {
      this.clouds.push({
        x: Math.random() * this.width,
        y: 30 + Math.random() * 90,
        w: 60 + Math.random() * 40,
        speed: 0.5 + Math.random() * 0.8
      });
    }

    this.bindEvents();
    this.updateUI();
  }

  bindEvents() {
    // Keyboard Listener
    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        this.handleJump();
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        this.handleSlide(true);
      } else if (e.code === 'KeyP') {
        this.togglePause();
      } else if (e.code === 'KeyR') {
        if (this.isGameOver) this.restart();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        this.handleSlide(false);
      }
    });

    // Touch / On-screen Buttons
    const btnJump = document.getElementById('touch-btn-jump');
    const btnSlide = document.getElementById('touch-btn-slide');
    const btnStart = document.getElementById('btn-start-game');
    const btnRestart = document.getElementById('btn-restart-game');
    const btnPause = document.getElementById('btn-game-pause');
    const btnResume = document.getElementById('btn-resume-game');
    const btnSound = document.getElementById('btn-sound-toggle');

    if (btnJump) {
      const triggerJump = (e) => {
        e.preventDefault();
        this.handleJump();
      };
      btnJump.addEventListener('touchstart', triggerJump);
      btnJump.addEventListener('mousedown', triggerJump);
    }

    if (btnSlide) {
      const startSlide = (e) => {
        e.preventDefault();
        this.handleSlide(true);
      };
      const endSlide = (e) => {
        e.preventDefault();
        this.handleSlide(false);
      };
      btnSlide.addEventListener('touchstart', startSlide);
      btnSlide.addEventListener('touchend', endSlide);
      btnSlide.addEventListener('mousedown', startSlide);
      btnSlide.addEventListener('mouseup', endSlide);
    }

    if (btnStart) btnStart.addEventListener('click', () => this.start());
    if (btnRestart) btnRestart.addEventListener('click', () => this.restart());
    if (btnPause) btnPause.addEventListener('click', () => this.togglePause());
    if (btnResume) btnResume.addEventListener('click', () => this.togglePause());

    if (btnSound) {
      btnSound.addEventListener('click', () => {
        if (window.soundEngine) {
          window.soundEngine.enabled = !window.soundEngine.enabled;
          btnSound.innerHTML = window.soundEngine.enabled ? 
            '<i class="fa-solid fa-volume-high"></i>' : 
            '<i class="fa-solid fa-volume-xmark"></i>';
        }
      });
    }
  }

  handleJump() {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;

    if (this.player.jumpCount < this.player.maxJumps) {
      this.player.vy = -12.5;
      this.player.isGrounded = false;
      this.player.jumpCount++;
      if (this.player.isSliding) this.handleSlide(false);

      if (window.soundEngine) window.soundEngine.playJump();

      // Create jump dust particles
      this.createParticles(this.player.x + 10, this.player.y + this.player.h, 6, '#cbd5e1');
    }
  }

  handleSlide(isSliding) {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;

    if (isSliding && !this.player.isSliding) {
      this.player.isSliding = true;
      this.player.h = this.player.slideHeight;
      if (this.player.isGrounded) {
        this.player.y = this.groundY - this.player.slideHeight;
      }
    } else if (!isSliding && this.player.isSliding) {
      this.player.isSliding = false;
      this.player.h = this.player.normalHeight;
      this.player.y = this.groundY - this.player.normalHeight;
    }
  }

  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.isGameOver = false;
    this.score = 0;
    this.starsCount = 0;
    this.distance = 0;
    this.gameSpeed = 5.5;
    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];

    this.player.y = this.groundY - this.player.normalHeight;
    this.player.vy = 0;
    this.player.jumpCount = 0;
    this.player.isGrounded = true;
    this.player.isSliding = false;

    document.getElementById('game-start-overlay').classList.add('hidden');
    document.getElementById('game-over-overlay').classList.add('hidden');
    document.getElementById('game-pause-overlay').classList.add('hidden');

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  restart() {
    this.start();
  }

  togglePause() {
    if (!this.isRunning || this.isGameOver) return;
    this.isPaused = !this.isPaused;

    const overlay = document.getElementById('game-pause-overlay');
    if (this.isPaused) {
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  gameOver() {
    this.isRunning = false;
    this.isGameOver = true;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('apex_school_quest_highscore', this.highScore);
    }

    if (window.soundEngine) window.soundEngine.playCrash();

    document.getElementById('final-score-val').textContent = Math.floor(this.score);
    document.getElementById('final-stars-val').textContent = this.starsCount;
    document.getElementById('final-high-score-val').textContent = this.highScore;

    document.getElementById('game-over-overlay').classList.remove('hidden');
    this.updateUI();
  }

  loop(currentTime) {
    if (!this.isRunning || this.isPaused) return;

    this.update();
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }

  update() {
    this.distance += this.gameSpeed;
    this.score += 0.15;
    if (this.gameSpeed < this.maxGameSpeed) {
      this.gameSpeed += 0.001;
    }

    // Player physics
    this.player.vy += this.gravity;
    this.player.y += this.player.vy;

    const currentH = this.player.isSliding ? this.player.slideHeight : this.player.normalHeight;

    if (this.player.y + currentH >= this.groundY) {
      this.player.y = this.groundY - currentH;
      this.player.vy = 0;
      this.player.isGrounded = true;
      this.player.jumpCount = 0;
    }

    // Spawn Obstacles
    this.obstacleTimer++;
    if (this.obstacleTimer > Math.max(50, this.obstacleInterval - (this.gameSpeed * 4))) {
      this.obstacleTimer = 0;
      this.spawnObstacle();
    }

    // Spawn Collectibles
    this.collectibleTimer++;
    if (this.collectibleTimer > 80) {
      this.collectibleTimer = 0;
      this.spawnCollectible();
    }

    // Update Obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.gameSpeed;

      // Check collision
      if (this.checkCollision(this.player, obs)) {
        this.gameOver();
        return;
      }

      if (obs.x + obs.w < 0) {
        this.obstacles.splice(i, 1);
      }
    }

    // Update Collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.x -= this.gameSpeed;

      if (this.checkCollision(this.player, col)) {
        this.score += col.points;
        if (col.type === 'star') this.starsCount++;
        if (window.soundEngine) window.soundEngine.playCollect();

        this.createParticles(col.x, col.y, 8, '#f59e0b');
        this.collectibles.splice(i, 1);
        continue;
      }

      if (col.x + col.w < 0) {
        this.collectibles.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.03;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Clouds
    this.clouds.forEach(c => {
      c.x -= c.speed;
      if (c.x + c.w < 0) {
        c.x = this.width + 50;
      }
    });

    this.updateUI();
  }

  spawnObstacle() {
    const types = ['desk', 'popquiz', 'hurdle'];
    const type = types[Math.floor(Math.random() * types.length)];

    if (type === 'desk') {
      this.obstacles.push({
        type: 'desk',
        x: this.width + 20,
        y: this.groundY - 45,
        w: 38,
        h: 45,
        color: '#e11d48'
      });
    } else if (type === 'popquiz') {
      // High floating obstacle (must slide under)
      this.obstacles.push({
        type: 'popquiz',
        x: this.width + 20,
        y: this.groundY - 75,
        w: 42,
        h: 30,
        color: '#9333ea'
      });
    } else {
      this.obstacles.push({
        type: 'hurdle',
        x: this.width + 20,
        y: this.groundY - 35,
        w: 25,
        h: 35,
        color: '#d97706'
      });
    }
  }

  spawnCollectible() {
    const types = ['star', 'book', 'diploma'];
    const r = Math.random();
    let type = 'star';
    let points = 100;
    let color = '#fbbf24';

    if (r > 0.85) {
      type = 'diploma';
      points = 500;
      color = '#38bdf8';
    } else if (r > 0.6) {
      type = 'book';
      points = 250;
      color = '#34d399';
    }

    const heights = [this.groundY - 40, this.groundY - 85, this.groundY - 120];
    const spawnY = heights[Math.floor(Math.random() * heights.length)];

    this.collectibles.push({
      type,
      x: this.width + 30,
      y: spawnY,
      w: 24,
      h: 24,
      points,
      color
    });
  }

  checkCollision(p, obj) {
    const pHeight = p.isSliding ? p.slideHeight : p.normalHeight;
    const pY = p.isSliding ? this.groundY - p.slideHeight : p.y;

    return (
      p.x < obj.x + obj.w &&
      p.x + p.w > obj.x &&
      pY < obj.y + obj.h &&
      pY + pHeight > obj.y
    );
  }

  createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        alpha: 1,
        color
      });
    }
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Sky Gradient
    const sky = this.ctx.createLinearGradient(0, 0, 0, this.height);
    sky.addColorStop(0, '#0284c7');
    sky.addColorStop(0.7, '#38bdf8');
    sky.addColorStop(1, '#bae6fd');
    this.ctx.fillStyle = sky;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 2. Parallax Clouds
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    this.clouds.forEach(c => {
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, c.w / 3, 0, Math.PI * 2);
      this.ctx.arc(c.x + c.w / 4, c.y - c.w / 5, c.w / 3, 0, Math.PI * 2);
      this.ctx.arc(c.x + c.w / 2, c.y, c.w / 3, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 3. Background School Building Silhouette
    this.drawSchoolSilhouette();

    // 4. Ground Track
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

    // Grass line
    this.ctx.fillStyle = '#10b981';
    this.ctx.fillRect(0, this.groundY, this.width, 6);

    // Moving Track Lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([20, 15]);
    this.ctx.beginPath();
    this.ctx.moveTo(- (this.distance % 35), this.groundY + 30);
    this.ctx.lineTo(this.width, this.groundY + 30);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // 5. Draw Collectibles
    this.collectibles.forEach(col => {
      this.ctx.fillStyle = col.color;
      if (col.type === 'star') {
        this.drawStar(col.x + 12, col.y + 12, 5, 12, 6);
      } else {
        this.ctx.fillRect(col.x, col.y, col.w, col.h);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px sans-serif';
        this.ctx.fillText(col.type === 'book' ? 'BOOK' : 'DIP', col.x + 2, col.y + 15);
      }
    });

    // 6. Draw Obstacles
    this.obstacles.forEach(obs => {
      this.ctx.fillStyle = obs.color;
      this.ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

      // Warning detail on obstacle
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 11px sans-serif';
      this.ctx.fillText('QUIZ!', obs.x + 2, obs.y + obs.h / 2 + 3);
    });

    // 7. Draw Player Character
    const pY = this.player.isSliding ? this.groundY - this.player.slideHeight : this.player.y;
    const pH = this.player.isSliding ? this.player.slideHeight : this.player.normalHeight;

    // Body
    this.ctx.fillStyle = this.player.color;
    this.ctx.beginPath();
    this.ctx.roundRect(this.player.x, pY, this.player.w, pH, 6);
    this.ctx.fill();

    // Graduation Cap on Player
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(this.player.x - 4, pY - 6, this.player.w + 8, 5);
    this.ctx.beginPath();
    this.ctx.moveTo(this.player.x + this.player.w / 2, pY - 12);
    this.ctx.lineTo(this.player.x + this.player.w + 6, pY - 6);
    this.ctx.lineTo(this.player.x + this.player.w / 2, pY);
    this.ctx.lineTo(this.player.x - 6, pY - 6);
    this.ctx.closePath();
    this.ctx.fill();

    // Eyes
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(this.player.x + this.player.w - 10, pY + 8, 6, 6);
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(this.player.x + this.player.w - 7, pY + 10, 3, 3);

    // 8. Draw Particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillRect(p.x, p.y, 4, 4);
    });
    this.ctx.globalAlpha = 1;
  }

  drawSchoolSilhouette() {
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
    const offset = (this.distance * 0.2) % 600;

    for (let x = -offset; x < this.width + 600; x += 300) {
      // Main Building
      this.ctx.fillRect(x, this.groundY - 140, 160, 140);
      // Clock tower
      this.ctx.fillRect(x + 55, this.groundY - 210, 50, 70);
      // Roof triangle
      this.ctx.beginPath();
      this.ctx.moveTo(x + 55, this.groundY - 210);
      this.ctx.lineTo(x + 80, this.groundY - 240);
      this.ctx.lineTo(x + 105, this.groundY - 210);
      this.ctx.fill();
    }
  }

  drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }
    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
    this.ctx.fill();
  }

  updateUI() {
    const scoreEl = document.getElementById('game-score');
    const highEl = document.getElementById('game-high-score');
    const starEl = document.getElementById('game-stars-count');

    if (scoreEl) scoreEl.textContent = Math.floor(this.score);
    if (highEl) highEl.textContent = this.highScore;
    if (starEl) starEl.textContent = this.starsCount;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.schoolGame = new SchoolQuestGame('gameCanvas');
});

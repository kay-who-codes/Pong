const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const paddleWidth = 12;
const paddleHeight = 90;
const ballRadius = 10;
const playerX = 30;
const aiX = canvas.width - 30 - paddleWidth;

// State
let playerY = (canvas.height - paddleHeight) / 2;
let aiY = (canvas.height - paddleHeight) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
let playerScore = 0;
let aiScore = 0;

// Player paddle follows mouse
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    // Get mouse Y relative to canvas
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - paddleHeight / 2;
    // Clamp within canvas
    playerY = Math.max(0, Math.min(canvas.height - paddleHeight, playerY));
});

// Draw everything
function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw net
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([8, 16]);
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = "#fff";
    ctx.fillRect(playerX, playerY, paddleWidth, paddleHeight); // Player
    ctx.fillRect(aiX, aiY, paddleWidth, paddleHeight);         // AI

    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI*2);
    ctx.fill();

    // Draw scores
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText(playerScore, canvas.width/4, 50);
    ctx.fillText(aiScore, 3*canvas.width/4, 50);
}

// Ball physics and collision
function update() {
    // Move ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Wall collision (top/bottom)
    if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
        ballSpeedY = -ballSpeedY;
        ballY = ballY - ballRadius < 0 ? ballRadius : canvas.height - ballRadius;
    }

    // Paddle collision (player)
    if (
        ballX - ballRadius < playerX + paddleWidth &&
        ballY > playerY &&
        ballY < playerY + paddleHeight &&
        ballSpeedX < 0
    ) {
        ballSpeedX = -ballSpeedX;
        // Add a little vertical velocity based on where it hit the paddle
        let hitPoint = (ballY - (playerY + paddleHeight / 2)) / (paddleHeight / 2);
        ballSpeedY = hitPoint * 5;
        ballX = playerX + paddleWidth + ballRadius; // prevent sticking
    }

    // Paddle collision (AI)
    if (
        ballX + ballRadius > aiX &&
        ballY > aiY &&
        ballY < aiY + paddleHeight &&
        ballSpeedX > 0
    ) {
        ballSpeedX = -ballSpeedX;
        let hitPoint = (ballY - (aiY + paddleHeight / 2)) / (paddleHeight / 2);
        ballSpeedY = hitPoint * 5;
        ballX = aiX - ballRadius; // prevent sticking
    }

    // Score
    if (ballX - ballRadius < 0) {
        aiScore++;
        resetBall();
    } else if (ballX + ballRadius > canvas.width) {
        playerScore++;
        resetBall();
    }

    // AI movement: follow the ball, but imperfectly
    let aiCenter = aiY + paddleHeight / 2;
    if (aiCenter < ballY - 40) {
        aiY += 5;
    } else if (aiCenter > ballY + 40) {
        aiY -= 5;
    }
    // Clamp
    aiY = Math.max(0, Math.min(canvas.height - paddleHeight, aiY));
}

// Reset ball to center after score
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
}

// Main game loop
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
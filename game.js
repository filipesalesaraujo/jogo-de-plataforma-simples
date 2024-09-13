const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
let timeLeft = 60;
let timerInterval;
let canJump = true; 

let skyX = 0;
let cloudsX = 0;
let cloudsX2 = 0; 

let animationFrame = 0;

const bgm = new Audio('assets/bgm.mp3');
bgm.loop = true;
bgm.volume = 0.5;



const player = {
	x: 300 + 80, 
	y: 80 - 100,
	width: 50,
	height: 100,
	speedY: 0,
	gravity: 0.5,
	onGround: false,
	speedX: 0,
	maxSpeed: 2,
	health: 3 
};

const platforms = [
	{ x: 0, y: 360, width: 800, height: 40 },
	{ x: 200, y: 280, width: 100, height: 10 },
	{ x: 400, y: 220, width: 100, height: 10 },
	{ x: 600, y: 160, width: 100, height: 10 },
	{ x: 300, y: 150, width: 200, height: 20, isSpaceship: true }
];

const enemies = [
	{ x: 300, y: 320, width: 40, height: 40, speedX: 0.5, speedY: 0, gravity: 0.5, onGround: false, alive: true },  
	{ x: 500, y: 320, width: 40, height: 40, speedX: -0.5, speedY: 0, gravity: 0.5, onGround: false, alive: true }
];

const keys = {};

document.addEventListener('keydown', (e) => {
	keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
	keys[e.key] = false;
	if (e.key === 'ArrowUp') {
			canJump = true;
	}
});

function startTimer() {
	timerInterval = setInterval(() => {
			if (timeLeft > 0) {
					timeLeft--;
			} else {
					clearInterval(timerInterval);
					alert("Tempo esgotado!");
			}
	}, 1000);
}

function enemyJump(enemy) {
	if (enemy.onGround) {
		enemy.speedY = -8;
		enemy.onGround = false;
	}
}

function addNewEnemy() {
	const newEnemy = {
		x: Math.random() * (canvas.width - 40),
		y: 320,
		width: 40,
		height: 40,
		speedX: Math.random() > 0.5 ? 0.5 : -0.5, 
		speedY: 0,
		gravity: 0.5,
		onGround: false,
		alive: true
	};
	enemies.push(newEnemy);
}

function resetPlayerPosition() {
	player.x = 300 + 80;
	player.y = 80 - 100;
	player.speedY = 0;
	player.onGround = true;
}

function updateEnemies() {
	let allDead = true;

	for (let enemy of enemies) {
		if (enemy.alive) {
			allDead = false; 
			enemy.x += enemy.speedX;

			if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
				enemy.speedX *= -1;
			}

			enemy.speedY += enemy.gravity;
			enemy.y += enemy.speedY;

			enemy.onGround = false;
			for (let plat of platforms) {
				if (
					enemy.x < plat.x + plat.width &&
					enemy.x + enemy.width > plat.x &&
					enemy.y + enemy.height > plat.y &&
					enemy.y + enemy.height < plat.y + plat.height + enemy.speedY
				) {
					enemy.y = plat.y - enemy.height;
					enemy.speedY = 0;
					enemy.onGround = true;
				}
			}

			if (enemy.onGround && Math.random() < 0.01) { 
				enemyJump(enemy);
			}

			if (
				player.x < enemy.x + enemy.width &&
				player.x + player.width > enemy.x &&
				player.y < enemy.y + enemy.height &&
				player.y + player.height > enemy.y
			) {
				
				if (player.speedY > 0 && player.y + player.height - player.speedY <= enemy.y) {
					enemy.alive = false;
					player.speedY = -10; 
					score += 100; 
				} else {
					player.health -= 1;
					player.x = 300 + 80; 
					player.y = 80 - 60;
					if (player.health <= 0) {
						alert('Game Over!');
						player.health = 3;
						for (let en of enemies) {
							en.alive = true;
						}
						score = 0; 
						timeLeft = 60; 
						startTimer(); 
					}
				}
			}
		}
	}

	if (allDead) {
		resetPlayerPosition();

		const enemiesCount = enemies.length + 1;
		for (let i = 0; i < enemiesCount; i++) {
			addNewEnemy();
		}
	}
}

function update() {
	if (keys['ArrowLeft']) {
			player.speedX = -player.maxSpeed;
			animationFrame++;
	} else if (keys['ArrowRight']) {
			player.speedX = player.maxSpeed;
			animationFrame++;
	} else {
			player.speedX = 0;
			animationFrame = 0;
	}
	player.x += player.speedX;

	if (keys['ArrowUp'] && player.onGround && canJump) {
			player.speedY = -10; 
			player.onGround = false;
			canJump = false; 
	}

	player.speedY += player.gravity;
	player.y += player.speedY;

	player.onGround = false;
	for (let plat of platforms) {
			if (
					player.x < plat.x + plat.width &&
					player.x + player.width > plat.x &&
					player.y + player.height > plat.y &&
					player.y + player.height < plat.y + plat.height + player.speedY
			) {
					player.y = plat.y - player.height;
					player.speedY = 0;
					player.onGround = true;
			}
	}

	if (player.x < 0) player.x = 0;
	if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
	if (player.y + player.height > canvas.height) {
			player.y = canvas.height - player.height;
			player.speedY = 0;
			player.onGround = true;
	}

	for (let enemy of enemies) {
			if (enemy.alive) {
					enemy.x += enemy.speedX;

					if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
							enemy.speedX *= -1;
					}

					if (
							player.x < enemy.x + enemy.width &&
							player.x + player.width > enemy.x &&
							player.y < enemy.y + enemy.height &&
							player.y + player.height > enemy.y
					) {
							if (player.speedY > 0 && player.y + player.height - player.speedY <= enemy.y) {
									enemy.alive = false;
									player.speedY = -10;
									score += 100;
							} else {
									player.health -= 1;
									player.x = 300 + 80;
									player.y = 80 - 60;
									if (player.health <= 0) {
											alert('Game Over!');
											player.health = 3;
											for (let en of enemies) {
													en.alive = true;
											}
											score = 0; 
											timeLeft = 60; 
											startTimer();
									}
							}
					}
			}
	}

	updateEnemies();


	skyX -= player.speedX * 0.05; 
	cloudsX -= player.speedX * 0.1; 
	cloudsX2 += player.speedX * 0.07;
	skyX = skyX % canvas.width;
	cloudsX = cloudsX % canvas.width;
	cloudsX2 = cloudsX2 % canvas.width;
}



function draw() {
	ctx.fillStyle = '#87CEEB';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	drawClouds(cloudsX, 50, 1); 
	drawClouds(cloudsX + canvas.width, 50, 1);

	drawClouds(cloudsX2, 100, 2);
	drawClouds(cloudsX2 - canvas.width, 100, 2);

	for (let plat of platforms) {
			if (plat.isSpaceship) {
					drawSpaceship(plat);
			} else {
					ctx.fillStyle = 'green';
					ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
			}
	}

	for (let enemy of enemies) {
			if (enemy.alive) {
					drawEnemy(enemy);
			}
	}

	drawPlayer();

	drawHealth();

	drawTimer();

	drawScore();
}



function drawHealth() {
	const heartSize = 20;
	for (let i = 0; i < player.health; i++) {
			ctx.fillStyle = 'red';
			ctx.fillRect(10 + i * (heartSize + 10), 10, heartSize, heartSize);
	}
}

function drawTimer() {
	ctx.fillStyle = 'black';
	ctx.font = '16px "Press Start 2P", cursive';
	ctx.fillText(`Tempo: ${timeLeft}s`, canvas.width - 305, 30);
}

function drawScore() {
	ctx.fillStyle = 'black';
	ctx.font = '16px "Press Start 2P", cursive';
	ctx.fillText(`Pontuação: ${score}`, canvas.width - 300, 60);
}

function startGame() {
	score = 0;
	timeLeft = 60; 
	startTimer(); 
	gameLoop();
}

function gameLoop() {
	update();
	draw();
	requestAnimationFrame(gameLoop);
}

window.onload = () => {
	bgm.play();
	startGame();
};

function drawSpaceship(plat) {
    ctx.fillStyle = 'gray';
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

    ctx.fillStyle = 'silver';
    ctx.beginPath();
    ctx.moveTo(plat.x, plat.y);
    ctx.lineTo(plat.x + plat.width / 2, plat.y - 40);
    ctx.lineTo(plat.x + plat.width, plat.y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'lightblue';
    ctx.fillRect(plat.x + plat.width * 0.3, plat.y + 5, plat.width * 0.1, plat.height - 10);
    ctx.fillRect(plat.x + plat.width * 0.6, plat.y + 5, plat.width * 0.1, plat.height - 10);
}

function drawClouds(offset, yPosition, layer) {
	ctx.fillStyle = 'white';

	if (layer === 1) {
			drawCloud(offset + 50, yPosition, 60, 30);
			drawCloud(offset + 200, yPosition + 30, 50, 25);
			drawCloud(offset + 350, yPosition - 20, 70, 35);
			drawCloud(offset + 500, yPosition + 10, 40, 20);
			drawCloud(offset + 650, yPosition - 30, 80, 40);
	} else if (layer === 2) {
			drawCloud(offset + 70, yPosition, 30, 15);
			drawCloud(offset + 230, yPosition + 25, 45, 20);
			drawCloud(offset + 370, yPosition - 15, 55, 25);
			drawCloud(offset + 510, yPosition + 5, 35, 18);
			drawCloud(offset + 670, yPosition - 25, 50, 30);
	}
}

function drawCloud(x, y, width, height) {
	ctx.beginPath();
	ctx.arc(x, y, width * 0.3, Math.PI * 0.5, Math.PI * 1.5);
	ctx.arc(x + width * 0.25, y - height * 0.5, width * 0.25, Math.PI * 1, Math.PI * 1.85);
	ctx.arc(x + width * 0.5, y - height * 0.5, width * 0.25, Math.PI * 1.15, Math.PI * 2);
	ctx.arc(x + width * 0.75, y - height * 0.5, width * 0.2, Math.PI * 1.15, Math.PI * 2.14);
	ctx.arc(x + width, y, width * 0.3, Math.PI * 1.5, Math.PI * 0.5);
	ctx.closePath();
	ctx.fill();
}

function drawPlayer() {
	const helmetHeight = player.height * 0.4; 
	const bodyHeight = player.height * 0.4;   
	const legHeight = player.height * 0.1;    
	const footHeight = player.height * 0.1; 

	let currentY = player.y;

	ctx.fillStyle = 'lightgray';
	ctx.fillRect(player.x, currentY, player.width, helmetHeight);

	ctx.fillStyle = '#00008B';
	ctx.fillRect(
			player.x + player.width * 0.1,
			currentY + helmetHeight * 0.2,
			player.width * 0.8,
			helmetHeight * 0.6
	);

	currentY += helmetHeight;

	ctx.fillStyle = 'gray';
	ctx.fillRect(player.x, currentY, player.width, bodyHeight);

	ctx.fillStyle = 'darkgray';
	for (let i = 1; i < 4; i++) {
			ctx.fillRect(player.x, currentY + (bodyHeight / 4) * i - 1, player.width, 2);
	}

	ctx.fillStyle = 'black';
	ctx.fillRect(player.x, currentY + bodyHeight * 0.6, player.width, bodyHeight * 0.1);

	const isMoving = player.speedX !== 0;
	const armSwing = Math.sin(animationFrame * 0.2) * 5;
	const armWidth = player.width * 0.15;
	const armHeight = bodyHeight * 0.7;
	const armYPosition = currentY + bodyHeight * 0.1;

	ctx.save();
	ctx.translate(player.x + armWidth / 2, armYPosition);
	if (isMoving) ctx.rotate((armSwing * Math.PI) / 180);
	ctx.fillStyle = 'gray';
	ctx.fillRect(-armWidth, 0, armWidth, armHeight);
	ctx.restore();

	ctx.save();
	ctx.translate(player.x + player.width - armWidth / 2, armYPosition);
	if (isMoving) ctx.rotate((-armSwing * Math.PI) / 180);
	ctx.fillStyle = 'gray';
	ctx.fillRect(0, 0, armWidth, armHeight);
	ctx.restore();

	currentY += bodyHeight;

	const legWidth = player.width * 0.2;
	const legSwing = Math.cos(animationFrame * 0.2) * 5;

	ctx.save();
	ctx.translate(player.x + player.width * 0.3, currentY);
	if (isMoving) ctx.rotate((-legSwing * Math.PI) / 180);
	ctx.fillStyle = 'gray';
	ctx.fillRect(-legWidth / 2, 0, legWidth, legHeight);
	ctx.restore();

	ctx.save();
	ctx.translate(player.x + player.width * 0.7, currentY);
	if (isMoving) ctx.rotate((legSwing * Math.PI) / 180);
	ctx.fillStyle = 'gray';
	ctx.fillRect(-legWidth / 2, 0, legWidth, legHeight);
	ctx.restore();

	currentY += legHeight;

	ctx.fillStyle = 'black';
	ctx.fillRect(player.x + player.width * 0.3 - legWidth / 2, currentY, legWidth, footHeight);
	ctx.fillRect(player.x + player.width * 0.7 - legWidth / 2, currentY, legWidth, footHeight);
}


function drawEnemy(enemy) {
	ctx.fillStyle = 'purple';
	ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

	drawWings(enemy);

	drawHorns(enemy);

	drawDragonFace(enemy);
}


function drawWings(enemy) {
	ctx.fillStyle = 'darkgray';

	ctx.beginPath();
	ctx.moveTo(enemy.x - 20, enemy.y + 10);
	ctx.lineTo(enemy.x, enemy.y + enemy.height / 2); 
	ctx.lineTo(enemy.x, enemy.y + 10); 
	ctx.closePath();
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(enemy.x + enemy.width + 20, enemy.y + 10); 
	ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height / 2);
	ctx.lineTo(enemy.x + enemy.width, enemy.y + 10);
	ctx.closePath();
	ctx.fill();
}

function drawHorns(enemy) {
	ctx.fillStyle = 'black';

	ctx.beginPath();
	ctx.moveTo(enemy.x + enemy.width * 0.2, enemy.y);
	ctx.lineTo(enemy.x + enemy.width * 0.25, enemy.y - 15);
	ctx.lineTo(enemy.x + enemy.width * 0.3, enemy.y);
	ctx.closePath();
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(enemy.x + enemy.width * 0.7, enemy.y); 
	ctx.lineTo(enemy.x + enemy.width * 0.75, enemy.y - 15); 
	ctx.lineTo(enemy.x + enemy.width * 0.8, enemy.y);
	ctx.closePath();
	ctx.fill();
}

function drawDragonFace(enemy) {
	ctx.fillStyle = 'red';
	const eyeWidth = enemy.width * 0.2;
	const eyeHeight = enemy.height * 0.2;

	ctx.beginPath();
	ctx.moveTo(enemy.x + eyeWidth, enemy.y + eyeHeight);
	ctx.lineTo(enemy.x + eyeWidth * 2, enemy.y + eyeHeight * 1.2);
	ctx.lineTo(enemy.x + eyeWidth, enemy.y + eyeHeight * 2);
	ctx.closePath();
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(enemy.x + enemy.width - eyeWidth * 2, enemy.y + eyeHeight);
	ctx.lineTo(enemy.x + enemy.width - eyeWidth, enemy.y + eyeHeight * 1.2);
	ctx.lineTo(enemy.x + enemy.width - eyeWidth * 2, enemy.y + eyeHeight * 2);
	ctx.closePath();
	ctx.fill();

	ctx.fillStyle = 'black';
	ctx.fillRect(enemy.x + enemy.width * 0.3, enemy.y + enemy.height * 0.7, enemy.width * 0.4, enemy.height * 0.2);

	ctx.fillStyle = 'white';
	for (let i = 0; i < 4; i++) {
			ctx.fillRect(enemy.x + enemy.width * 0.3 + i * 10, enemy.y + enemy.height * 0.7, 5, 10);
	}
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
let timeLeft = 60; // 1 minuto de tempo inicial
let timerInterval;

// Variáveis para o efeito de paralaxe
let skyX = 0;
let cloudsX = 0;
let cloudsX2 = 0; // Nova variável para a segunda camada de nuvens

let animationFrame = 0;

// Configurações do jogador
const player = {
    x: 300 + 80, // Inicia sobre a nave espacial (no meio da nave)
    y: 80 - 100,  // y da nave menos a altura do jogador
    width: 40,
    height: 100,
    speedY: 0,
    gravity: 0.5,
    onGround: false,
    speedX: 0,
    maxSpeed: 2,
    health: 3 // Propriedade de saúde
};

// Plataformas
const platforms = [
    { x: 0, y: 360, width: 800, height: 40 },
    { x: 200, y: 280, width: 100, height: 10 },
    { x: 400, y: 220, width: 100, height: 10 },
    { x: 600, y: 160, width: 100, height: 10 },
    { x: 300, y: 150, width: 200, height: 20, isSpaceship: true } // Nave espacial
];

// Inimigos
const enemies = [
	{ x: 300, y: 320, width: 40, height: 40, speedX: 0.5, alive: true },  // Velocidade reduzida
	{ x: 500, y: 320, width: 40, height: 40, speedX: -0.5, alive: true }  // Velocidade reduzida
];

// Controles do teclado
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Inicia o cronômetro
function startTimer() {
	timerInterval = setInterval(() => {
			if (timeLeft > 0) {
					timeLeft--;
			} else {
					clearInterval(timerInterval);
					alert("Tempo esgotado!");
					// Aqui você pode reiniciar o jogo ou fazer outra ação
			}
	}, 1000); // Reduz o tempo a cada segundo
}

function update() {
	// Movimento horizontal do jogador
	if (keys['ArrowLeft']) {
			player.speedX = -player.maxSpeed;
			animationFrame++;
	} else if (keys['ArrowRight']) {
			player.speedX = player.maxSpeed;
			animationFrame++;
	} else {
			player.speedX = 0;
			animationFrame = 0; // Reseta a animação quando parado
	}
	player.x += player.speedX;

	// Pulo
	if (keys['ArrowUp'] && player.onGround) {
			player.speedY = -10; // Reduzido para um salto mais suave
			player.onGround = false;
	}

	// Gravidade
	player.speedY += player.gravity;
	player.y += player.speedY;

	// Colisão com plataformas
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

	// Limites da tela para o jogador
	if (player.x < 0) player.x = 0;
	if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
	if (player.y + player.height > canvas.height) {
			player.y = canvas.height - player.height;
			player.speedY = 0;
			player.onGround = true;
	}

	// Atualização dos inimigos
	for (let enemy of enemies) {
			if (enemy.alive) {
					// Movimento dos inimigos mais devagar
					enemy.x += enemy.speedX;

					// Inverte a direção ao atingir os limites da plataforma
					if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
							enemy.speedX *= -1;
					}

					// Colisão entre jogador e inimigo
					if (
							player.x < enemy.x + enemy.width &&
							player.x + player.width > enemy.x &&
							player.y < enemy.y + enemy.height &&
							player.y + player.height > enemy.y
					) {
							// Verifica se o jogador está caindo sobre o inimigo
							if (player.speedY > 0 && player.y + player.height - player.speedY <= enemy.y) {
									// Derrota o inimigo
									enemy.alive = false;
									player.speedY = -10; // Rebote ao derrotar o inimigo
									score += 100; // Aumenta a pontuação ao derrotar um inimigo
							} else {
									// Dano ao jogador
									player.health -= 1;
									player.x = 300 + 80; // Reinicia na nave espacial
									player.y = 80 - 60;
									if (player.health <= 0) {
											alert('Game Over!');
											// Reinicia o jogo
											player.health = 3;
											for (let en of enemies) {
													en.alive = true;
											}
											score = 0; // Reseta a pontuação
											timeLeft = 60; // Reseta o tempo
											startTimer(); // Reinicia o cronômetro
									}
							}
					}
			}
	}

	// Atualização do fundo para o efeito de paralaxe (velocidade reduzida)
	skyX -= player.speedX * 0.05; // Movimento lento para o céu
	cloudsX -= player.speedX * 0.1; // Primeira camada de nuvens mais lenta
	cloudsX2 += player.speedX * 0.07; // Segunda camada de nuvens se move no sentido oposto
	skyX = skyX % canvas.width;
	cloudsX = cloudsX % canvas.width;
	cloudsX2 = cloudsX2 % canvas.width;
}



function draw() {
	// Desenha o céu (fundo)
	ctx.fillStyle = '#87CEEB'; // Cor do céu (azul claro)
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Desenha a primeira camada de nuvens
	drawClouds(cloudsX, 50);
	drawClouds(cloudsX + canvas.width, 50);

	// Desenha a segunda camada de nuvens (movendo-se no sentido oposto)
	drawClouds(cloudsX2, 100);
	drawClouds(cloudsX2 - canvas.width, 100);

	// Desenha as plataformas
	for (let plat of platforms) {
			if (plat.isSpaceship) {
					drawSpaceship(plat);
			} else {
					ctx.fillStyle = 'green';
					ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
			}
	}

	// Desenha os inimigos com rosto
	for (let enemy of enemies) {
			if (enemy.alive) {
					drawEnemy(enemy);
			}
	}

	// Desenha o jogador com rosto
	drawPlayer();

	// Interface da saúde
	drawHealth();

	// Interface do cronômetro
	drawTimer();

	// Interface da pontuação
	drawScore();
}



function drawHealth() {
	// Desenha corações representando a saúde do jogador
	const heartSize = 20;
	for (let i = 0; i < player.health; i++) {
			ctx.fillStyle = 'red';
			ctx.fillRect(10 + i * (heartSize + 10), 10, heartSize, heartSize);
	}
}

function drawTimer() {
	// Exibe o tempo restante com estilo de fonte pixelada
	ctx.fillStyle = 'black';
	ctx.font = '16px "Press Start 2P", cursive';
	ctx.fillText(`Tempo: ${timeLeft}s`, canvas.width - 305, 30);
}

function drawScore() {
	// Exibe a pontuação com estilo de fonte pixelada
	ctx.fillStyle = 'black';
	ctx.font = '16px "Press Start 2P", cursive';
	ctx.fillText(`Pontuação: ${score}`, canvas.width - 300, 60);
}

function startGame() {
	score = 0;
	timeLeft = 60; // Reinicia o cronômetro
	startTimer(); // Inicia o cronômetro
	gameLoop();
}

function gameLoop() {
	update();
	draw();
	requestAnimationFrame(gameLoop);
}

// Inicia o jogo ao carregar a página
window.onload = () => {
	startGame();
};

function drawSpaceship(plat) {
    // Desenha o corpo da nave (plataforma)
    ctx.fillStyle = 'gray';
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

    // Desenha o topo da nave (triângulo)
    ctx.fillStyle = 'silver';
    ctx.beginPath();
    ctx.moveTo(plat.x, plat.y);
    ctx.lineTo(plat.x + plat.width / 2, plat.y - 40);
    ctx.lineTo(plat.x + plat.width, plat.y);
    ctx.closePath();
    ctx.fill();

    // Desenha janelas
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(plat.x + plat.width * 0.3, plat.y + 5, plat.width * 0.1, plat.height - 10);
    ctx.fillRect(plat.x + plat.width * 0.6, plat.y + 5, plat.width * 0.1, plat.height - 10);
}

function drawClouds(offset, yPosition) {
    ctx.fillStyle = 'white';

    // Desenha várias nuvens em posições diferentes
    drawCloud(offset + 50, yPosition, 60, 30);
    drawCloud(offset + 200, yPosition + 30, 50, 25);
    drawCloud(offset + 350, yPosition - 20, 70, 35);
    drawCloud(offset + 500, yPosition + 10, 40, 20);
    drawCloud(offset + 650, yPosition - 30, 80, 40);
}

function drawCloud(x, y, width, height) {
    // Desenha uma nuvem simples usando arcos
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
	// Calcula as proporções com base na altura total do player
	const helmetHeight = player.height * 0.1; // 10% para o capacete
	const bodyHeight = player.height * 0.5;   // 50% para o corpo
	const legHeight = player.height * 0.3;    // 30% para as pernas
	const footHeight = player.height * 0.1;   // 10% para os pés

	// Posição inicial para desenho
	let currentY = player.y;

	// Desenha a cabeça (capacete)
	ctx.fillStyle = 'lightgray'; // Cor do capacete
	ctx.fillRect(player.x, currentY, player.width, helmetHeight);

	// Viseira do capacete (azul mais escuro)
	ctx.fillStyle = '#00008B'; // Azul escuro
	ctx.fillRect(
			player.x + player.width * 0.1,
			currentY + helmetHeight * 0.2,
			player.width * 0.8,
			helmetHeight * 0.6
	);

	currentY += helmetHeight;

	// Desenha o corpo do jogador (traje espacial)
	ctx.fillStyle = 'gray'; // Cor do traje
	ctx.fillRect(player.x, currentY, player.width, bodyHeight);

	// Adicionar detalhes ao traje (linhas horizontais)
	ctx.fillStyle = 'darkgray';
	for (let i = 1; i < 4; i++) {
			ctx.fillRect(player.x, currentY + (bodyHeight / 4) * i - 1, player.width, 2);
	}

	// Adicionar cinto
	ctx.fillStyle = 'black';
	ctx.fillRect(player.x, currentY + bodyHeight * 0.6, player.width, bodyHeight * 0.1);

	// Animação dos braços
	const isMoving = player.speedX !== 0;
	const armSwing = Math.sin(animationFrame * 0.2) * 5; // Movimento de balanço
	const armWidth = player.width * 0.15;
	const armHeight = bodyHeight * 0.7;
	const armYPosition = currentY + bodyHeight * 0.1;

	// Braço esquerdo
	ctx.save();
	ctx.translate(player.x + armWidth / 2, armYPosition);
	if (isMoving) ctx.rotate((armSwing * Math.PI) / 180);
	ctx.fillStyle = 'gray';
	ctx.fillRect(-armWidth, 0, armWidth, armHeight);
	ctx.restore();

	// Braço direito
	ctx.save();
	ctx.translate(player.x + player.width - armWidth / 2, armYPosition);
	if (isMoving) ctx.rotate((-armSwing * Math.PI) / 180);
	ctx.fillStyle = 'gray';
	ctx.fillRect(0, 0, armWidth, armHeight);
	ctx.restore();

	currentY += bodyHeight;

	// Desenha as pernas
	const legWidth = player.width * 0.2;
	const legSwing = Math.cos(animationFrame * 0.2) * 5;

	// Perna esquerda
	ctx.save();
	ctx.translate(player.x + player.width * 0.3, currentY);
	if (isMoving) ctx.rotate((-legSwing * Math.PI) / 180);
	ctx.fillStyle = 'gray';
	ctx.fillRect(-legWidth / 2, 0, legWidth, legHeight);
	ctx.restore();

	// Perna direita
	ctx.save();
	ctx.translate(player.x + player.width * 0.7, currentY);
	if (isMoving) ctx.rotate((legSwing * Math.PI) / 180);
	ctx.fillStyle = 'gray';
	ctx.fillRect(-legWidth / 2, 0, legWidth, legHeight);
	ctx.restore();

	currentY += legHeight;

	// Desenha os pés
	ctx.fillStyle = 'black';
	// Pé esquerdo
	ctx.fillRect(player.x + player.width * 0.3 - legWidth / 2, currentY, legWidth, footHeight);
	// Pé direito
	ctx.fillRect(player.x + player.width * 0.7 - legWidth / 2, currentY, legWidth, footHeight);
}


function drawEnemy(enemy) {
    // Desenha o corpo do inimigo
    ctx.fillStyle = 'purple';
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

    // Desenha o rosto do inimigo
    ctx.fillStyle = 'white'; // Cor do rosto
    const faceX = enemy.x + enemy.width * 0.2;
    const faceY = enemy.y + enemy.height * 0.2;
    const faceWidth = enemy.width * 0.6;
    const faceHeight = enemy.height * 0.6;
    ctx.fillRect(faceX, faceY, faceWidth, faceHeight);

    // Desenha os olhos
    ctx.fillStyle = 'black';
    const eyeWidth = faceWidth * 0.2;
    const eyeHeight = faceHeight * 0.2;
    // Olho esquerdo
    ctx.fillRect(faceX + eyeWidth, faceY + eyeHeight, eyeWidth, eyeHeight);
    // Olho direito
    ctx.fillRect(faceX + eyeWidth * 3, faceY + eyeHeight, eyeWidth, eyeHeight);

    // Desenha a boca (inimigo com expressão diferente)
    ctx.fillRect(faceX + eyeWidth, faceY + eyeHeight * 3, eyeWidth * 2, eyeHeight / 2);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

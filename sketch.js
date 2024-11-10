let mic; 
let ballY = 200; 
let ballX = 100; 
let ballVelocityY = -5; // Velocidade vertical da bola
let ballSize = 30; // Tamanho da bola
let gravity = 0.1; // Gravidade da bola (quanto maior, mais rápido cai)
let lift = -3; // força que controla a subida da bola

//FUNDO
let bgOffset = 0; // movimento do fundo para criar o efeito de movimento
let bgSpeed = 3; // Velocidade do movimento do fundo

//OBSTACULOS
let obstacles = []; // Array para armazenar os obstáculos
let obstacleWidth = 50; // Largura dos obstáculos
let obstacleSpeed = 3; // Velocidade do movimento dos obstaculos
let gapHeight = 200; // Altura da lacuna entre obstáculos

let gameOver = false; // Estado do jogo, se acabou ou não
let score = 0; // Pontuação do jogador
let passedObstacles = 0; // Número de obstáculos ultrapassados

// Variáveis para  botões 
let tryAgainButton;
let playButton;  // Botão para iniciar o jogo
let instructionsVisible = true; // instruções começam visiveis

function setup() {
  createCanvas(800, 600);  // Modificado para ter o dobro da largura
  
  // Configuração do microfone
  mic = new p5.AudioIn(); //inicia mic
  mic.start(); //começa a capturar o som
  
  // gerar obstáculos
  setInterval(spawnObstacle, 2000); // Gera um novo obstáculo a cada 2 segundos
  
  // botão "Jogar", começa escondido 
  playButton = createButton('Jogar');
  playButton.position(width / 2 - 40, height / 2 + 20);
  playButton.size(80, 40);
  playButton.mousePressed(startGame);
  
  //  botão "Jogar de novo"
  tryAgainButton = createButton('Jogar de novo');
  tryAgainButton.position(width / 2 - 60, height / 2 + 50);
  tryAgainButton.size(120, 40);
  tryAgainButton.mousePressed(resetGame);
  tryAgainButton.hide();
}

function draw() {
  if (instructionsVisible) {
    // Exibir  instruções
    background(0);
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Produza som para mover a bola", width / 2, height / 2 - 40);
    textSize(15); // Define o tamanho da fonte como 24
    text("Ultrapasse 10 obstáculos para vencer!", width / 2, height / 2 - 5);
    
    // Exibir o botão "Jogar"
    playButton.show();
    return;
  }
  
  if (gameOver) {
    // Se o jogo acabou, exibe a mensagem de vitória ou derrota
    background(0);
    fill(255);
    textSize(32);
    textStyle(BOLD);
    if (score >= 100) {
      text("Ganhou!", width / 2, height / 2 - 40); // Mensagem de vitória
    } else {
      text("Perdeu!", width / 2, height / 2 - 40); // Mensagem de derrota
    }
    
    textSize(18);
    text("Fez " + score + " pontos", width / 2, height / 2);
    
    // Exibir o botão "Tentar de novo"
    tryAgainButton.show();
    return; 
  }

  // Desenhar fundo em movimento
  drawBackground();

  // Obter o volume do microfone
  let volume = mic.getLevel();
  
  // Exibir o nível do microfone no canto superior esquerdo
  fill(0);
  textSize(12); // Definir o tamanho do texto para o nível do mic
 text('Mic Level: ' + nf(volume, 1, 3), 70, 30); // Posiciona no canto superior esquerdo
  
  // Usar o volume para controlar a bola
  let verticalForce = map(volume, 0, 1, 0, lift);  // Mapear o volume 
  
  updateBall(verticalForce);
  displayBall();
  
  // Atualizar e exibir os obstáculos
  updateObstacles();
  displayObstacles();
  
  // Verificar se há colisões entre a bola e os obstáculos
  checkCollisions();
  
  // Aumentar a pontuação quando a bola passa um obstáculo
  increaseScore();
}

// Função para desenhar o fundo em movimento
function drawBackground() {
  // Mover o fundo para a esquerda
  bgOffset -= bgSpeed;

  // Loop do fundo quando sair da tela
  if (bgOffset <= -width) {
    bgOffset = 0;
  }

  // Desenhar duas cópias do fundo para criar o efeito de repetição
  fill(135, 206, 235); // Cor do céu
  rect(bgOffset, 0, width, height);
  rect(bgOffset + width, 0, width, height);
}

// Atualizar a posição da bola
function updateBall(verticalForce) {
  // Aplicar a força vertical (controlo de movimento para cima e para baixo)
  ballVelocityY += gravity;  // Força da gravidade

  // Aplicar a força vertical do som para um movimento de subida mais controlado
  ballVelocityY += verticalForce;
  
  // Suavizar a subida  para evitar movimentos abruptos e descontrolados
  ballVelocityY = constrain(ballVelocityY, -15, 15); // Limitar a velocidade máxima
  
  // Atualizar a posição vertical da bola
  ballY += ballVelocityY;
  
  // Prevenir que a bola saia da tela verticalmente
  if (ballY > height - ballSize / 2) {
    ballY = height - ballSize / 2;
    ballVelocityY = 0;
  } else if (ballY < ballSize / 2) {
    ballY = ballSize / 2;
    ballVelocityY = 0;
  }
}

// Exibir a bola na tela
function displayBall() {
  fill(255, 0, 0); // Cor da bola 
  ellipse(ballX, ballY, ballSize, ballSize);
}

// Função para gerar um novo obstáculo
function spawnObstacle() {
  let obstacleHeight = random(100, height - gapHeight - 100); // Altura do obstáculo
  obstacles.push({
    x: width, // Começar fora da tela à direita
    topHeight: obstacleHeight, // Altura do obstáculo superior
    bottomHeight: height - obstacleHeight - gapHeight // Altura do obstáculo inferior
  });
}

// Atualizar a posição dos obstáculos
function updateObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= obstacleSpeed;

    // Remover obstáculos que saem da tela
    if (obstacles[i].x + obstacleWidth < 0) {
      obstacles.splice(i, 1);
    }
  }
}

// Exibir os obstáculos na tela
function displayObstacles() {
  for (let i = 0; i < obstacles.length; i++) {
    // Desenhar o obstáculo superior
    fill(0, 255, 0); // Cor verde
    rect(obstacles[i].x, 0, obstacleWidth, obstacles[i].topHeight);
    
    // Desenhar o obstáculo inferior
    rect(obstacles[i].x, height - obstacles[i].bottomHeight, obstacleWidth, obstacles[i].bottomHeight);
  }
}

// Verificar colisões entre a bola e os obstáculos
function checkCollisions() {
  for (let i = 0; i < obstacles.length; i++) {
    // Verificar se a bola está dentro da faixa horizontal do obstáculo
    if (ballX + ballSize / 2 > obstacles[i].x && ballX - ballSize / 2 < obstacles[i].x + obstacleWidth) {
      // Verificar se a bola está dentro da faixa vertical do obstáculo
      if (ballY - ballSize / 2 < obstacles[i].topHeight || ballY + ballSize / 2 > height - obstacles[i].bottomHeight) {
        gameOver = true; // Se houver colisão, termina o jogo
      }
    }
  }
}

// Aumentar a pontuação quando a bola passa um obstáculo
function increaseScore() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    if (obstacles[i].x + obstacleWidth < ballX - ballSize / 2) {
      score += 10; // Aumentar a pontuação
      passedObstacles++; // Aumentar o número de obstáculos passados
      obstacles.splice(i, 1); // Remover o obstáculo após ser ultrapassado
      
      // Garantir que o jogo termine quando atingir 100 pontos
      if (score >= 100) {
        gameOver = true; // Finalizar o jogo
      }
    }
  }
}

// Iniciar o jogo ao pressionar o botão "Jogar"
function startGame() {
  instructionsVisible = false; // Ocultar as instruções
  playButton.hide(); // Esconder o botão "Jogar"
  gameOver = false; // Reiniciar o jogo
  score = 0; // Reiniciar a pontuação
  obstacles = []; // Limpar obstáculos
  ballY = height / 2; // Reiniciar a posição da bola
  ballVelocityY = 0; // Reiniciar a velocidade da bola
}

// Reiniciar o jogo ao pressionar o botão "Tentar de novo"
function resetGame() {
  score = 0; // Reiniciar a pontuação
  obstacles = []; // Limpar obstáculos
  ballY = height / 2; // Reiniciar a posição da bola
  ballVelocityY = 0; // Reiniciar a velocidade da bola
  gameOver = false; // Reiniciar o estado do jogo
  tryAgainButton.hide(); // Esconder o botão "Tentar de novo"
  playButton.show(); // Exibir o botão "Jogar"
  instructionsVisible = true; // Exibir instruções novamente
}

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
  mic = new p5.AudioIn();
  
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

function startGame() {
  instructionsVisible = false; // Esconder a tela de instruções
  playButton.hide(); // Esconder o botão "Jogar"
  
  // Ativar o AudioContext quando o jogador clicar em "Jogar"
  mic.start(); // Iniciar o microfone após o clique
  
  gameOver = false; // Reiniciar o estado do jogo
  score = 0; // reiniciar a pontuação
  obstacles = []; // Limpar os obstáculos
  passedObstacles = 0; // reniciar obstáculos passados
}

// Agora a função draw irá continuar conforme o esperado
function draw() {
  if (instructionsVisible) {
    // Exibir  instruções
    background(0);
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Produza som para mover a bola", width / 2, height / 2 - 40);
    
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
    if (score >= 50) {
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
  
  // Exibir o nível do microfone 
  fill(0);
  text('Mic Level: ' + nf(volume, 1, 3), width / 2, height - 20);
  
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

//FUNÇÃO DO FUNDO
function drawBackground() {
  bgOffset += bgSpeed; // A cada frame, move o fundo
  if (bgOffset > width) {
    bgOffset = 0; // Se o fundo ultrapassar a largura da tela, reinicia
  }
  
  // Desenha o fundo movendo a imagem de fundo
  background(0);
  fill(100, 150, 255);
  rect(bgOffset, 0, width, height); // Fundo azul que se move
}

//FUNÇÃO PARA ATUALIZAR A BOLA
function updateBall(verticalForce) {
  ballVelocityY += gravity; // Aplica a gravidade na bola
  ballY += ballVelocityY + verticalForce; // Atualiza a posição Y da bola com a velocidade e a força do som

  // Limites da tela
  if (ballY > height - ballSize / 2) {
    ballY = height - ballSize / 2;
    ballVelocityY = 0; // A bola para ao atingir o chão
  } else if (ballY < ballSize / 2) {
    ballY = ballSize / 2;
    ballVelocityY = 0; // Impede que a bola saia da tela para cima
  }
}

//FUNÇÃO PARA EXIBIR A BOLA
function displayBall() {
  fill(255, 0, 0); // Cor da bola
  noStroke();
  ellipse(ballX, ballY, ballSize); // Desenha a bola
}

//FUNÇÃO DOS OBSTÁCULOS
function updateObstacles() {
  if (frameCount % 60 === 0) { // Cria um novo obstáculo a cada segundo
    let gapStart = random(100, height - gapHeight - 100); // Define onde a lacuna entre obstáculos vai começar
    let topHeight = gapStart;
    let bottomHeight = height - gapStart - gapHeight;
    
    obstacles.push({x: width, topHeight, bottomHeight}); // Adiciona o obstáculo no array
  }

  // Move os obstáculos
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= obstacleSpeed;
    
    // Remove obstáculos que saíram da tela
    if (obstacles[i].x < 0) {
      obstacles.splice(i, 1);
    }
  }
}

//FUNÇÃO PARA EXIBIR OS OBSTÁCULOS
function displayObstacles() {
  fill(0, 255, 0); // Cor dos obstáculos
  
  // Desenha os obstáculos
  for (let i = 0; i < obstacles.length; i++) {
    rect(obstacles[i].x, 0, obstacleWidth, obstacles[i].topHeight); // Parte superior
    rect(obstacles[i].x, height - obstacles[i].bottomHeight, obstacleWidth, obstacles[i].bottomHeight); // Parte inferior
  }
}

//FUNÇÃO PARA VERIFICAR COLISÕES
function checkCollisions() {
  for (let i = 0; i < obstacles.length; i++) {
    // Colisão com a parte superior do obstáculo
    if (ballX + ballSize / 2 > obstacles[i].x && ballX - ballSize / 2 < obstacles[i].x + obstacleWidth) {
      if (ballY - ballSize / 2 < obstacles[i].topHeight || ballY + ballSize / 2 > height - obstacles[i].bottomHeight) {
        gameOver = true;
      }
    }
  }
}

//FUNÇÃO PARA AUMENTAR A PONTUAÇÃO
function increaseScore() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    if (obstacles[i].x + obstacleWidth < ballX - ballSize / 2) {
      passedObstacles++;
      score++;
      obstacles.splice(i, 1);
    }
  }
}

//FUNÇÃO PARA REINICIAR O JOGO
function resetGame() {
  gameOver = false;
  score = 0;
  obstacles = [];
  passedObstacles = 0;
  ballY = 200;
  ballVelocityY = -5;
  mic.start();
  tryAgainButton.hide();
  instructionsVisible = true; // Mostrar instruções novamente
}

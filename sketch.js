let spriteSheet;
let walkSheet;
let jumpSheet;
let pushSheet;
let toolSheet;

let stopAnimation = [];
let walkAnimation = [];
let jumpAnimation = [];
let pushAnimation = [];
let toolAnimation = [];

const stopNumberOfFrames = 15;
const walkNumberOfFrames = 9;
const jumpNumberOfFrames = 14;
const pushNumberOfFrames = 4;
const toolNumberOfFrames = 5;

let frameWidth;
let walkFrameWidth;

// 角色的位置和速度
let x, y;
let speed = 5;
let direction = 1; // 1 for right, -1 for left

// 跳躍相關變數
let isJumping = false;
let velocityY = 0;
let gravity = 0.6;
let jumpStrength = -15; // 負數代表向上
let groundY;

// 攻擊相關變數
let isAttacking = false;
let attackFrame = 0;
const attackAnimationSpeed = 6; // 數字越小越快

// 發射物陣列
let projectiles = [];

function preload() {
  // 預先載入圖片
  // 請確保您的資料夾結構是 sketch.js 旁邊有 1/stop/stop.png
  spriteSheet = loadImage('1/stop/stop.png');
  walkSheet = loadImage('1/walk/walk.png');
  jumpSheet = loadImage('1/jump/jump.png');
  pushSheet = loadImage('1/push/push.png');
  toolSheet = loadImage('1/tool/tool.png');
}

function setup() {
  // 建立一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);

  // 初始化角色位置在畫面中央
  x = width / 2;
  y = height / 2;
  groundY = y; // 將初始 y 設為地面高度

  // 計算單一畫格的寬度
  frameWidth = spriteSheet.width / stopNumberOfFrames;
  let frameHeight = spriteSheet.height;
  for (let i = 0; i < stopNumberOfFrames; i++) {
    let frame = spriteSheet.get(i * frameWidth, 0, frameWidth, frameHeight);
    stopAnimation.push(frame);
  }

  // 計算單一畫格的寬度並切割走路動畫
  walkFrameWidth = walkSheet.width / walkNumberOfFrames;
  let walkFrameHeight = walkSheet.height;
  for (let i = 0; i < walkNumberOfFrames; i++) {
    let frame = walkSheet.get(
      i * walkFrameWidth, 0, 
      walkFrameWidth, walkFrameHeight
    );
    walkAnimation.push(frame);
  }

  // 計算單一畫格的寬度並切割跳躍動畫
  let jumpFrameWidth = jumpSheet.width / jumpNumberOfFrames;
  let jumpFrameHeight = jumpSheet.height;
  for (let i = 0; i < jumpNumberOfFrames; i++) {
    let frame = jumpSheet.get(
      i * jumpFrameWidth, 0,
      jumpFrameWidth, jumpFrameHeight
    );
    jumpAnimation.push(frame);
  }

  // 計算單一畫格的寬度並切割攻擊動畫
  let pushFrameWidth = pushSheet.width / pushNumberOfFrames;
  let pushFrameHeight = pushSheet.height;
  for (let i = 0; i < pushNumberOfFrames; i++) {
    let frame = pushSheet.get(
      i * pushFrameWidth, 0,
      pushFrameWidth, pushFrameHeight
    );
    pushAnimation.push(frame);
  }

  // 計算單一畫格的寬度並切割發射物動畫
  let toolFrameWidth = toolSheet.width / toolNumberOfFrames;
  let toolFrameHeight = toolSheet.height;
  for (let i = 0; i < toolNumberOfFrames; i++) {
    let frame = toolSheet.get(
      i * toolFrameWidth, 0, toolFrameWidth, toolFrameHeight);
    toolAnimation.push(frame);
  }
}

function draw() {
  // 設定背景顏色
  background('#f5ebe0');

  // 將圖片的繪製基準點設為中心
  imageMode(CENTER);

  // --- 物理與狀態更新 ---
  if (isJumping) {
    // 如果在跳躍中，應用重力並更新 y 座標
    velocityY += gravity;
    y += velocityY;

    // 如果角色落回地面
    if (y >= groundY) {
      y = groundY; // 確保角色不會掉到地下
      velocityY = 0;
      isJumping = false; // 結束跳躍
    }
  } else if (isAttacking) {
    // 如果不在跳躍但在攻擊中
    attackFrame++;
    if (attackFrame >= pushNumberOfFrames * attackAnimationSpeed) {
      // 攻擊動畫結束
      isAttacking = false;
      attackFrame = 0;
      // 產生一個發射物
      projectiles.push({
        x: x + (direction * 50), // 從角色前方產生
        y: y,
        direction: direction,
        speed: 40, // 增加發射物速度，使其飛得更遠
        frame: 0
      });
    }
  } else {
    // 如果不在跳躍也不在攻擊，才處理左右移動
    if (keyIsDown(RIGHT_ARROW)) {
      x += speed;
      direction = 1;
    } else if (keyIsDown(LEFT_ARROW)) {
      x -= speed;
      direction = -1;
    }
  }

  // 使用 constrain() 函式將角色的 x 座標限制在畫布範圍內
  let halfW = frameWidth / 2; // Use a general width for constraint
  x = constrain(x, halfW, width - halfW);

  // --- 繪圖 ---

  // 繪製所有發射物
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];
    p.x += p.speed * p.direction;
    p.frame++;

    push();
    translate(p.x, p.y);
    scale(p.direction, 1);
    let frameIndex = floor(p.frame / 4) % toolNumberOfFrames;
    image(toolAnimation[frameIndex], 0, 0);
    pop();

    // 只在發射物飛出畫面時才移除它
    if (p.x > width || p.x < 0) {
      projectiles.splice(i, 1);
    }
  }

  // 繪製角色
  push();
  translate(x, y);
  scale(direction, 1); // 根據方向翻轉圖片

  if (isJumping) {
    // 播放跳躍動畫
    let frameIndex = floor(map(velocityY, jumpStrength, -jumpStrength, 0, jumpNumberOfFrames - 1));
    frameIndex = constrain(frameIndex, 0, jumpNumberOfFrames - 1);
    image(jumpAnimation[frameIndex], 0, 0);
  } else if (isAttacking) {
    // 播放攻擊動畫
    let frameIndex = floor(attackFrame / attackAnimationSpeed);
    image(pushAnimation[frameIndex], 0, 0);
  } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(LEFT_ARROW)) {
    // 播放走路動畫
    image(walkAnimation[floor(frameCount / 4) % walkNumberOfFrames], 0, 0);
  } else {
    // 播放站立動畫
    image(stopAnimation[floor(frameCount / 8) % stopNumberOfFrames], 0, 0);
  }
  pop();
}

function keyPressed() {
  // 只有在角色不在跳躍或攻擊時才能觸發新動作
  if (isJumping || isAttacking) return;

  if (keyCode === UP_ARROW) {
    isJumping = true;
    velocityY = jumpStrength;
  } else if (keyCode === 32) { // 32 是空白鍵
    isAttacking = true;
    attackFrame = 0;
  }
}

function windowResized() {
  // 當視窗大小改變時，自動調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
  groundY = height / 2; // 同時更新地面高度
}

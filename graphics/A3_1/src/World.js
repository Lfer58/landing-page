function main() {
  
  setupWebGL();

  // set up GLSL shader program and connect all variables
  connectVariablesToGLSL();

  // set up actions for the html ui elements
  addActionsForHtmlUI();

  initTextures();

  camera = new Camera();

  document.onkeydown = keydown;

  document.onkeyup = keyup;

  loadMap();

  initMapMatrix();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
 
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

let playgroud = false;
let chosenTexture = 1;

let previousTime = Date.now();

// let startedShake = null;
var target_vectors = [];
let mouseLocked = false;
let keys = {};
let base_color = [1.0, 1.0, 1.0, 1.0];
let yellow_hue = [0.8, 0.8, 0.4, 1.0];
let block_CoolDown = 0.25;
let lastBlockHandle = 0;

function initalizeTargetVec(action) {
  
  target_vectors = camera.clickTarget();

  var targets = camera.clickTarget();

  for (var i = 0; i < targets.length; i++) {
    var vg_eye = new Vector3(camera.g_eye);
    vg_eye.add(new Vector3(targets[i]))
    target_vectors[i] = vg_eye.elements;
  }

  if (action === 0) {
    for (var i = 0; i < target_vectors.length; i++) {

      if (!playgroud) {
        let [x, y, z] = target_vectors[i];

        x = Math.round(x * 2) + 100;
        z = Math.round(z * 2) + 100;

        if (mapMatrix[x][z][0] === 3) {
          var monsterInfo = mapMatrix[x][z][1];


          if (y <= monsterInfo[0] + monsterInfo[1]
              && y >= monsterInfo[0] - monsterInfo[2]) {
            mapMatrix[x][z] = [3,0];
            break;
          }
        }
      } else {
        let [x, y, z] = target_vectors[i].map(v => v - 0.25);

        x = Math.round(x * 2) + 100;
        z = Math.round(z * 2) + 100;
        y = Math.round(y * 2)
        
        if (matrix[x] && matrix[x][z] 
          && matrix[x][z][y] && matrix[x][z][y][0] === 1
        && g_seconds - lastBlockHandle > block_CoolDown) {

          matrix[x][z][y] = [0,0];

          lastBlockHandle = g_seconds;
        } else {
          // console.warn("No block found at", x, y, z, "Potential rounding issue?");
        }
      }
    }
  } 
  else if (action === 1) {
    let [lx, ly, lz] = [0, 0, 0];
    for (var i = 0; i < target_vectors.length; i++) {
      let [x, y, z] = target_vectors[i].map(v => v - 0.25);

      x = Math.round(x * 2) + 100;
      z = Math.round(z * 2) + 100;
      y = Math.round(y * 2);

      if (matrix[x] && matrix[x][z] 
        && matrix[x][z][y] && matrix[x][z][y][0] === 0 
        && g_seconds - lastBlockHandle > block_CoolDown) {

        lx = x;
        ly = y;
        lz = z;

      } else if (matrix[x] && matrix[x][z] 
        && matrix[x][z][y] && matrix[x][z][y][0] === 1 
        && g_seconds - lastBlockHandle > block_CoolDown) {

          matrix[lx][lz][ly] = [1,chosenTexture];
          lastBlockHandle = g_seconds;
          return;
      }

    }

    if (target_vectors.length > 0 && g_seconds - lastBlockHandle > block_CoolDown) {
      matrix[lx][lz][ly] = [1,chosenTexture];
      lastBlockHandle = g_seconds;
    }
  }
}

const matrix = [];
function loadMap() {
  for (let x = 0; x <= 200; x++) {
    matrix[x] = [];
    for (let z = 0; z <= 200; z++) {
      matrix[x][z] = [];
      for (let y = 0; y <= 50; y++) {
        matrix[x][z][y] = 0;  // Pre-fill all values with 0
      }
    }
  }

  let waveHeight = 1.5; // Controls amplitude of sine wave
  let frequency = 1; // Controls frequency of wave
  let height_adjustment = 1;
  var textures = [1, 3, 4];
  let texNum = 0;
  for (let i = -47; i < -47 + 21; i += 0.5) {
    for (let j = 26; j < 26 + 21; j += 0.5) {
      for (let k = 0; k < 21; k += 0.5) {

        // Compute sine waves at point (i, j)
        let wave1 = (Math.sin(i * frequency) + height_adjustment) * waveHeight;
        let wave2 = (Math.sin(j * frequency) + height_adjustment) * waveHeight;

        // Average both waves to blend them together
        let k_wave = (wave1 + wave2) / 2;
        k_wave = Math.round(k_wave * 2) / 2;

        let x_coords = i * 2 + 100;
        let z_coords = j * 2 + 100;
        let y_coords = k * 2;

        if (k === k_wave) {
          texNum = textures[Math.floor(Math.random() * textures.length)];
          matrix[x_coords][z_coords][y_coords] = [1,texNum];
        } else {
          matrix[x_coords][z_coords][y_coords] = [0,0];
        }
      }
    }
  }
}

function drawMap() {

  scale = [0.5, 0.5, 0.5];
  let output = null;
  var body = new CubeMod_Rep(base_color, ...scale, 1, 4);
  for (let i = -47; i < -47 + 21; i += 0.5) {
    for (let j = 26; j < 26 + 21; j += 0.5) {
      for (let k = 0.0; k < 21; k += 0.5) {
        let x = i * 2 + 100;
        let z = j * 2 + 100;
        let y = k * 2;

        output = matrix[x][z][y];
        if (output[0] === 1) {
          cornerPos = [i, k, j];
          body.textureNum = output[1];
          renderWalls(body, cornerPos, scale);
        }
      }
    }
  }
}

function playgroundMode () {

  playgroud = true;

  monsterPos = [];

  camera.g_eye[0] = -34;
  camera.g_at[0] = -34;
  camera.g_eye[2] = 19.6;
  camera.g_at[2] += 119.5;

  camera.viewMat.setLookAt(...camera.g_eye, ...camera.g_at, ...camera.g_up);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

let deltaTime = null;

//called by brower repeatdely whenever its time
function tick() {

  const currentTime = Date.now();
  deltaTime = (currentTime - previousTime) / 1000; // in seconds
  previousTime = currentTime;

  mouseHandler();

  keyHandler();

  g_seconds = performance.now()/1000.0 - g_startTime;
  
  renderAllShapes();

  requestAnimationFrame(tick);
}

let mapMatrix;

function renderWalls(object, cornerPos, scale) {
  object.matrix.setTranslate(...centerFind(cornerPos, scale));
  object.matrix.scale(...scale);
  object.render();
}

function initMapMatrix() {
  mapMatrix = Array.from({ length: 200 }, () => Array(200).fill([0, camera.startingHeight])); // 50x50 grid for [-25,25]
  currentPos = [];
  prevPos = [];

  markWallOnMatrix(-49, -6, 50, 0);
  markWallOnMatrix(-49, -6, 0, 55);
  markWallOnMatrix(-49, 49, 63.5, 0);
  markWallOnMatrix(14.5, 23, 0, 30);
}

// Function to mark wall positions in mapMatrix
function markWallOnMatrix(x, z, length, width, y_bottom = -0.5, y_top = 6) {

  if (!markedMap) {
    for (let i = x; i <= x + length; i += 0.5) {
        for (let j = z; j <= z + width; j += 0.5) {
            let matrixX = i * 2 + 100; // Convert world X to matrix index
            let matrixZ = j * 2 + 100; // Convert world Z to matrix index
            // console.log(i, matrixX, j, matrixZ);

            if (matrixX >= 0 && matrixX < 200 
              && matrixZ >= 0 && matrixZ < 200  
              && mapMatrix[matrixX][matrixZ][0] != 1) {
                mapMatrix[matrixX][matrixZ] = [1, [y_bottom, y_top]]; // Mark wall presence
            }
        }
    }
  }
}

function markElevation(x, z, length, width, height) {

  if (!markedMap) {
    for (let i = x; i <= x + length; i += 0.5) {
        for (let j = z; j <= z + width; j += 0.5) {
            let matrixX = i * 2 + 100; // Convert world X to matrix index
            let matrixZ = j * 2 + 100; // Convert world Z to matrix index
            // console.log(i, matrixX, j, matrixZ);

            if (matrixX >= 0 && matrixX < 200 
              && matrixZ >= 0 && matrixZ < 200 
              && mapMatrix[matrixX][matrixZ][0] != 1) {
                mapMatrix[matrixX][matrixZ] = [0, height]; // Mark wall presence
            }
        }
    }
  }
}

function markPickups(center, height_basis, type) {

  let matrixX = Math.round(center[0] * 2) + 100; // Convert world X to matrix index
  let matrixZ = Math.round(center[2] * 2) + 100; // Convert world Z to matrix index}

  if ((mapMatrix[matrixX][matrixZ][0] === 2
    && mapMatrix[matrixX][matrixZ][1][0] === 0 )
    || mapMatrix[matrixX][matrixZ][0] === 4) {
      mapMatrix[matrixX][matrixZ] = [4, height_basis];
      return 0;
  } else {
    mapMatrix[matrixX][matrixZ] = [2, [1, height_basis, type]];
    return 1;
  }
}

function restart() {

  playgroud = false;

  camera.resetView();
  camera.ammo = 20;
  camera.health = 50;

  markedMap = false;
  initMapMatrix();

  // reset health
  initMonsterHealth();

  // reset positions
  initMonsterPos();
}

let currentPos;
let prevPos;

function markEnemies () {

  for (let pos of prevPos) {
    mapMatrix[pos[0]][pos[1]] = [0, pos[2]];
  }
  
  prevPos = [];
  var i = 0;
  for (let pos of currentPos) {
    let matrixX = Math.round(pos[0] * 2) + 100; // Convert world X to matrix index
    let matrixZ = Math.round(pos[2] * 2) + 100; // Convert world Z to matrix index

    // enemy matrix that gives a height basis, and a value of max and min height of killable range
    mapMatrix[matrixX][matrixZ] = [3, [pos[1], pos[4], pos[5]]];

    // prevPos is a tracker of all previous enemy values for checking against for kills
    prevPos[i] = [matrixX, matrixZ, pos[1]];
    i++;
  }

}

let markedMap = false;
let cornerPos = [];
let scale = [];
let monsterPos;
let monsterHealth;

function initMonsterPos() {
  // monsterPos consitis of 3 xyz coords, sightline, tracking-form
  monsterPos = [];
  monsterPos.push([[0, -0.5, 4], 5, 1, 0.6]);
  monsterPos.push([[-10, -0.5, -4.5], 5, 2, 0.6]);
  monsterPos.push([[-10, -0.5, 8.5], 4, 0, 0.6]);
  monsterPos.push([[3.5, 3.0, 4.5], 4, 1, 4.6]);
  monsterPos.push([[-10, -0.5, 17], 7, 0, 0.6]); // central chamber
  monsterPos.push([[-12, -0.5, 12], 5, 0, 0.6]); // central chamber
  monsterPos.push([[-23, -0.5, -4.5], 7, 0, 0.6]); // outside
  monsterPos.push([[-22, -0.5, -3.5], 7, 0, 0.6]); // outside
  monsterPos.push([[-22, -0.5, 17], 7, 0, 0.6]); // outside
  monsterPos.push([[1.5, -0.5, 13], 5, 0, 0.6]); // central chamber
  monsterPos.push([[11, -0.5, 21], 2, 0, 0.6]); // right area
}

function initMonsterHealth() {
  monsterHealth = [];
  var i = 0;
  for (i = 0; i < 9; i++) {
    monsterHealth.push(50);
  }
  for (i; i < 11; i++) {
    monsterHealth.push(150);
  }
}

function centerFind (cornerPos, scale) {
  return [cornerPos[0] + scale[0] / 2, cornerPos[1] + scale[1] / 2, cornerPos[2] + scale[2] /2]
}

function renderAllShapes() {

  var startTime = performance.now();

  // Pass the projection matrix
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projMat.elements);
  
  // Pass the view matrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  shotgun.cycle(); // Render shotgun animation

  health.render();
  ammo.render();

  if (playgroud) {
    drawMap();
    BlockSelected.render(chosenTexture);
  }

  if (camera.health <= 0) {
    restart();
  }

  cornerPos = [-49, -0.5, 24]
  scale = [25, 0.25, 25]
  var buildForm = new CubeMod_Rep(base_color, ...scale, 2, 8);
  renderWalls(buildForm, cornerPos, scale);
  markElevation(-49, 24, 25, 25, camera.actualHeight + 0.25)

  cornerPos = [-48, -0.25, 25]
  scale = [23, 0.25, 23]
  buildForm = new CubeMod_Rep(base_color, ...scale, 2, 5);
  renderWalls(buildForm, cornerPos, scale);
  markElevation(-49, 24, 25, 25, camera.actualHeight + 0.25)

  cornerPos = [-50, -0.5, -50]
  scale = [100, 0, 100]
  var platform = new CubeMod_Rep(base_color, ...scale, 2, 3);
  renderWalls(platform, cornerPos, scale);

  var skybox = new CubeMod(base_color);
  skybox.matrix.translate(0.0, 20, 0.0);
  skybox.matrix.scale(200,200,200);
  skybox.textureNum = 1;
  skybox.render();

  var sky = new CubeMod(base_color);
  sky.matrix.translate(0.0, 60, 0.0);
  sky.matrix.scale(200,0.0,200);
  sky.textureNum = 2;
  sky.render();

  if (!playgroud) {
  // room 1
  // side wall 1
    cornerPos = [1.5, -0.5, -6]
    scale = [1.0, 6, 12.0]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (1.5, -6, 1.0, 12.0);

    // center wall
    cornerPos = [-11.5, -0.5, -2]
    scale = [10.0, 2.5, 4.0]
    var wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (-11.5, -2, 10.0, 4.0);

    // side wall 2
    cornerPos = [-15, -0.5, -6]
    scale = [1.0, 6, 12.0]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (-15, -6, 1.0, 12.0);

    // front wall
    cornerPos = [-14, -0.5, -6]
    scale = [15.5, 2.5, 1]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (-14, -6, 15.5, 1.0);

    // back wall 1
    cornerPos = [-14, -0.5, 5]
    scale = [5, 6, 1]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (-14, 5, 5, 1.0);

    // back wall 2
    cornerPos = [-6, -0.5, 5]
    scale = [7.5, 6, 1]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (-6, 5, 7.5, 1.0);

    // back wall top
    cornerPos = [-9, 1.5, 5]
    scale = [3, 4, 1]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);

    // cieling
    cornerPos = [-14, 2, -6]
    scale = [15.5,1.0, 11.0]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 8);
    renderWalls(wall1, cornerPos, scale);

    // central chamber
    // front wall
    cornerPos = [-14, -0.5, 9]
    scale = [19.5, 6, 1]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (-14, 9, 19.5, 1);

    // entering horizontal stairs left
    cornerPos = [-10, -0.5, 6];
    scale = [-0.5, 0.25, 3.0];
    var stair = new CubeMod_Rep(yellow_hue, -0.5, 0.25, 3.0, 1, 5);
    renderWalls(stair, cornerPos, scale);

    for (var i = 0; i < 7; i++) {
      cornerPos[1] += scale[1];
      cornerPos[0] += scale[0];
      renderWalls(stair, cornerPos, scale);
    }

    for (var i = 0; i < 8; i++) {
      markElevation (-14 + i * 0.5, 6, 0.5, 3.0, camera.actualHeight + 2 - 0.25 * i);
    }

    // middle stairs floor
    cornerPos = [-17, 1.25, 6]
    scale = [3, 0.25, 3]
    wall1 = new CubeMod_Rep(yellow_hue, -3, 0.25, 3, 1, 5);
    renderWalls(wall1, cornerPos, scale);
    markElevation (-17, 6, 3.0, 3.0, camera.actualHeight + 2);

    // continuing vertical stairs left
    cornerPos = [-14, 1.5, 9];
    scale = [-3.0, 0.25, 0.5];
    stair = new CubeMod_Rep(yellow_hue, -3.0, -0.25, -0.5, 1, 9);
    renderWalls(stair, cornerPos, scale);

    for (var i = 0; i < 5; i++) {
      cornerPos[1] += scale[1];
      cornerPos[2] += scale[2];
      renderWalls(stair, cornerPos, scale);
    }

    for (var i = 0; i < 6; i++) {
      markElevation (-17, 9 + 0.5 * i, 3.0, 0.5, camera.actualHeight + 2.25 + 0.25 * i);
    }

    // entering horizontal stairs right
    cornerPos = [-4.5, -0.5, 6];
    scale = [0.5, 0.25, 3.0];
    var stair = new CubeMod_Rep(yellow_hue, 0.5, 0.25, 3.0, 1, 5);
    renderWalls(stair, cornerPos, scale);

    for (var i = 0; i < 13; i++) {
      cornerPos[1] += scale[1];
      cornerPos[0] += scale[0];
      renderWalls(stair, cornerPos, scale);
    }

    for (var i = 0; i < 14; i++) {
      markElevation (-4.5 + 0.5 * i, 6, 0.5, 3.0, camera.actualHeight + 0.25 * (i + 1));
    }

    // back wall left
    cornerPos = [-18, -0.5, 5]
    scale = [3, 6, 1]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (-18, 5, 3.0, 1);

    // side wall left 1
    cornerPos = [-18, -0.5, 6]
    scale = [1, 6, 8]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (-18, 6, 1, 8);

    // side wall left 2
    cornerPos = [-18, -0.5, 17]
    scale = [1, 6, 6]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (-18, 17, 1, 6);

    // side wall left top
    cornerPos = [-18, 1.5, 14]
    scale = [1, 4, 3]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (-18, 14, 1, 3, 1.5);

    // side wall left-right 1
    cornerPos = [-14, -0.5, 10]
    scale = [1, 6, 3]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (-14, 10, 1, 3);

    // side wall left-middle
    cornerPos = [-17, -0.5, 12]
    scale = [3, 2.5, 1]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (-17, 12, 3, 1, -0.5, 3);

    // side floor left
    cornerPos = [-17, 2, 12]
    scale = [3, 1, 7]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 3);
    renderWalls(wall1, cornerPos, scale);
    markElevation (-17, 12, 3.0, 7, camera.actualHeight + 3.5);

    // side floor balcony
    cornerPos = [-14.5, 3, 12]
    scale = [0.5, 0.5, 7]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 8);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (-14.5, 12, 0.5, 7, 3, 6);

    // back floor
    cornerPos = [-14, -0.5, 22]
    scale = [19.5, 0.75, -3]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 3);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (-14, 19, 16.5, 0, -0.5, 6);
    markElevation (-14, 19, 19.5, 3, camera.actualHeight + 0.75);

    // vertical stairs right bottom floor
    cornerPos = [5.5, -0.5, 17.5];
    scale = [-3.0, 0.25, 0.5];
    stair = new CubeMod_Rep(yellow_hue, -3.0, -0.25, -0.5, 1, 9);
    renderWalls(stair, cornerPos, scale);
    markWallOnMatrix(2.5, 17, 0, 2.0);

    for (var i = 0; i < 2; i++) {
      cornerPos[1] += scale[1];
      cornerPos[2] += scale[2];
      renderWalls(stair, cornerPos, scale);
    }

    for (var i = 0; i < 3; i++) {
      markElevation (2.5, 17.5 + 0.5 * i, 3.0, 0.5, camera.actualHeight + 0.25 * (i + 1));
    }

    // entering horizontal stairs back
    cornerPos = [-8.5, 0.25, 19];
    scale = [-0.5, 0.25, 3.0];
    stair = new CubeMod_Rep(yellow_hue, -0.5, 0.25, 3.0, 1, 5);
    renderWalls(stair, cornerPos, scale);

    for (var i = 0; i < 10; i++) {
      cornerPos[1] += scale[1];
      cornerPos[0] += scale[0];
      renderWalls(stair, cornerPos, scale);
    }

    for (var i = 0; i < 11; i++) {
      markElevation (-14 + 0.5 * i, 19, 0.5, 3.0, camera.actualHeight + 3.5 - (i * 0.25));
    }

    // side elevator left
    cornerPos = [-17, 2, 19]
    scale = [3, 1, 3]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 3);
    renderWalls(wall1, cornerPos, scale);
    markElevation (-17, 19, 3.0, 3.0, camera.actualHeight + 3.5);

    // side wall right
    cornerPos = [2.5, -0.5, -2]
    scale = [4, 6, 1]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (2.5, -2, 4, 1);

    // side wall right1
    cornerPos = [5.5, -0.5, -1]
    scale = [1, 6, 15]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (5.5, -1, 1, 15);

    // side wall right 2
    cornerPos = [5.5, -0.5, 17]
    scale = [1, 6, 5]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (5.5, 17, 1, 5);

    // side wall right top
    cornerPos = [5.5, 1.5, 14]
    scale = [1, 4, 3]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (5.5, 14, 1, 3, 1.5, 6);

    // side floor right top
    cornerPos = [2.5, 2, -1]
    scale = [3, 1, 10]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 3);
    renderWalls(wall1, cornerPos, scale);
    markElevation (2.5, -1, 3.0, 10, camera.actualHeight + 3.5);

    // side wall right - right 0
    cornerPos = [6.5, -0.5, 9]
    scale = [4, 6, 1]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (6.5, 9, 4, 1);

    // side wall right - right 1
    cornerPos = [9.5, -0.5, 10]
    scale = [1, 6, 10]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (9.5, 10, 1, 10);

    // side wall right - right top
    cornerPos = [9.5, 1.5, 20]
    scale = [1, 4, 2]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (9.5, 20, 1, 2, 1.5);

    // right - right - right
    cornerPos = [10.5, -0.5, 19]
    scale = [3, 6, 1]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (10.5, 19, 3, 1);

    // right - right - right side wall
    cornerPos = [13.5, -0.5, 19]
    scale = [1, 6, 4]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (13.5, 19, 1, 4);

    // back wall
    cornerPos = [-17, -0.5, 23]
    scale = [30.5, 6, -1]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
    renderWalls(wall1, cornerPos, scale);
    markWallOnMatrix (-17, 22, 30.5, 1);

    // cieling main
    cornerPos = [-18, 5.5, -2]
    scale = [28.5, 1.0, 25]
    wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 8);
    renderWalls(wall1, cornerPos, scale);
    

    if (!monsterPos) {
      initMonsterPos();
    }

    if (!monsterHealth) {
      initMonsterHealth();
    }

    var monster;

    for (var i = 0; i < monsterPos.length; i++) {
      if (i < 9) {
        monster = new ZombieMan(...monsterPos[i], i, monsterHealth[i]);
      } else {
        monster = new CyberDemon(...monsterPos[i], i, monsterHealth[i]);
      }

      monster.render();
      if (monster.health > 0) {
        camera.damagePlayer(monster.damage, currentPos[i], monster.index);
      }
    }

    // items setup
    {
    cornerPos = [-13, -0.5, -3]
    var item = new HealthItem(cornerPos);
    if (markPickups(item.center, 0.6, 0) !== 0) {
      item.render();
    }

    cornerPos = [-1, -0.5, -1.5]
    var item = new HealthItem(cornerPos);
    if (markPickups(item.center, 0.6, 0) !== 0) {
      item.render();
    }

    cornerPos = [0, -0.5, -0.5]
    var item = new AmmoItem(cornerPos);
    if (markPickups(item.center, 0.6, 1) !== 0) {
      item.render();
    }

    cornerPos = [3.5, 3.0, 3.0]
    var item = new AmmoItem(cornerPos);
    if (markPickups(item.center, 4.1, 1) !== 0) {
      item.render();
    }

    cornerPos = [3.5, -0.5, 11]
    var item = new AmmoItem(cornerPos);
    if (markPickups(item.center, 0.6, 1) !== 0) {
      item.render();
    }

    cornerPos = [8, -0.5, 12]
    var item = new HealthItem(cornerPos);
    if (markPickups(item.center, 0.6, 0) !== 0) {
      item.render();
    }

    cornerPos = [-20, -0.5, -0.5]
    var item = new HealthItem(cornerPos);
    if (markPickups(item.center, 0.6, 0) !== 0) {
      item.render();
    }

    cornerPos = [-22, -0.5, -2]
    var item = new HealthItem(cornerPos);
    if (markPickups(item.center, 0.6, 0) !== 0) {
      item.render();
    }

    cornerPos = [-21, -0.5, 0]
    var item = new AmmoItem(cornerPos);
    if (markPickups(item.center, 0.6, 1) !== 0) {
      item.render();
    }

    cornerPos = [-21, -0.5, -1]
    var item = new AmmoItem(cornerPos);
    if (markPickups(item.center, 0.6, 1) !== 0) {
      item.render();
    }

    cornerPos = [-16, 1.5, 7.5]
    var item = new AmmoItem(cornerPos);
    if (markPickups(item.center, 2.1, 1) !== 0) {
      item.render();
    }

    }

    if (!markedMap) {
      markedMap = true;
    }
  }

  markEnemies();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), 'numdot');
}

// Set the text of a html element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
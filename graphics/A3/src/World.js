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

  // loadMap();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
 
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

let previousTime = Date.now();

// let startedShake = null;
var target_vectors = [];
let mouseLocked = false;
let keys = {};
let base_color = [1.0, 1.0, 1.0, 1.0];
let yellow_hue = [0.8, 0.8, 0.4, 1.0];

function initalizeTargetVec(action) {
  
  target_vectors = camera.clickTarget();

  var targets = camera.clickTarget();

  for (var i = 0; i < targets.length; i++) {
    var vg_eye = new Vector3(camera.g_eye);
    vg_eye.add(new Vector3(targets[i]))
    // addition height so proper blocks are targeted
    vg_eye.elements[1] += 0.125;
    // This rounding ensures proper placement at half values
    target_vectors[i] = vg_eye.elements.map(v => Math.round(v * 2));
  }


  if (action === 0) {
    for (var i = 0; i < target_vectors.length; i++) {
      let [x, y, z] = target_vectors[i];
      x += 16;
      z += 16;

      if ((x > 31 || x < 0) || (y > 31 || y < 0) || (z > 31 || z < 0)) {
        continue;
      }

      if (matrix[x][z][y] === 1) {
        matrix[x][z][y] = 0;
        break;
      }
    }
  } else if (action === 1) {
    for (var i = target_vectors.length -1; i >= 0; i--) {
      let [x, y, z] = target_vectors[i];
      x += 16;
      z += 16;

      if ((x > 31 || x < 0) || (y > 31 || y < 0) || (z > 31 || z < 0)) {
        continue;
      }

      if (matrix[x][z][y] === 0) {
        matrix[x][z][y] = 1;
        break;
      }
    }
  }
}

const matrix = [];
function loadMap() {
  for (let i = 0; i < 32; i++) {
    matrix[i] = [];
    for (let j = 0; j < 32; j++) {
      matrix[i][j] = [];
      for (let k = 0; k < 32; k++) {
        if (k == Math.abs(i - 16) + Math.abs(j - 16)) {
          matrix[i][j][k] = 1;
        } else {
          matrix[i][j][k] = 0;
        }
      }
    }
  }
}

function drawMap() {

  var body = new CubeMod([1,1,1,1]);
  for (x = 0; x < 32; x++) {
    for (y = 0; y < 32; y++) {
      for (z = 0; z < 32; z++) {
        if (matrix[x][y][z] === 1) {

          body.textureNum = -2;
          body.color = [x/32, x/64 + y/64, y/64, 1]
          body.matrix.setTranslate(0, -0.25, 0);
          body.matrix.scale(0.5,0.5,0.5);
          body.matrix.translate(x - 16, z, y - 16);
          body.render()
        }
      }
    }
  }
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

  // console.log(g_seconds);
  
  updateAnimationAngles();
  
  renderAllShapes();

  requestAnimationFrame(tick);
}

function updateAnimationAngles() {

  if (g_Animation) {
    let rot = g_seconds * 150;
    ov_rot = rot % 360;
    let div_factor = 72 * 3
    st_hgt = -40 + 70 * (Math.sin(rot / div_factor) + 1);
    st_twt = 0 + 60 * (Math.sin( rot / div_factor) + 1) / 2;
    ta_hgt = 10 * Math.sin( rot / 144)
    in_rad = 60 + 30 * (Math.sin( rot / 72) + 1);

    hd_nod = 15 * Math.sin( rot / 72)

    let rot_move = 180 + 25 * Math.sin( rot / 72);
    ll_sho_rot = rot_move;
    rl_sho_rot = rot_move;
    la_sho_rot = rot_move;
    ra_sho_rot = rot_move;

    lw_rot =    0 + 20 * (Math.sin( rot / 72) + 1);
    lw_rot_1 = 25 + 15 * (Math.sin( rot / 72) + 1);
    lw_mov =   0 + 30 * Math.sin( rot / 144);

    rot += 72
    rw_rot   =  -30 + 20 * (Math.sin( rot / 72) + 1);
    rw_rot_1 = 0 + 30 * (Math.sin( rot / 72) + 1);
    rw_mov   = 0 + 30 * Math.sin( rot / 144);
  }

}

let mapMatrix = Array.from({ length: 100 }, () => Array(100).fill([0,0])); // 50x50 grid for [-25,25]

// Function to mark wall positions in mapMatrix
function markWallOnMatrix(x, z, length, width) {

  for (let i = x; i <= x + length; i += 0.5) {
      for (let j = z; j <= z + width; j += 0.5) {
          let matrixX = i * 2 + 50; // Convert world X to matrix index
          let matrixZ = j * 2 + 50; // Convert world Z to matrix index
          // console.log(i, matrixX, j, matrixZ);

          if (matrixX >= 0 && matrixX < 100 && matrixZ >= 0 && matrixZ < 100) {
              mapMatrix[matrixX][matrixZ] = [1, 1]; // Mark wall presence
          }
      }
  }
}

function markStairs(x, z, length, width, height) {

  for (let i = x; i <= x + length; i += 0.5) {
      for (let j = z; j <= z + width; j += 0.5) {
          let matrixX = i * 2 + 50; // Convert world X to matrix index
          let matrixZ = j * 2 + 50; // Convert world Z to matrix index
          // console.log(i, matrixX, j, matrixZ);

          if (matrixX >= 0 && matrixX < 100 && matrixZ >= 0 && matrixZ < 100 && mapMatrix[matrixX][matrixZ][0] != 1) {
              mapMatrix[matrixX][matrixZ] = [2, height]; // Mark wall presence
          }
      }
  }
}

let markedMap = false;
let cornerPos = []
let scale = []

let zombies;

function initEnemies() {
  zombies = [
    new ZombieMan([0, -0.5, 4], 1)
 ];
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

  // drawMap();
  
  cornerPos = [-25, -0.5, -25]
  scale = [50, 0, 50]
  var platform = new CubeMod_Rep(base_color, ...scale, 2, 3);
  platform.matrix.setTranslate(...centerFind(cornerPos, scale));
  platform.matrix.scale(...scale);
  platform.render();

  var skybox = new CubeMod(base_color);
  skybox.matrix.translate(0.0, 20, 0.0);
  skybox.matrix.scale(100,100,100);
  skybox.textureNum = 1;
  skybox.render();

  var sky = new CubeMod(base_color);
  sky.matrix.translate(0.0, 30, 0.0);
  sky.matrix.scale(100,0.0,100);
  sky.textureNum = 2;
  sky.render();

  // side wall 1
  cornerPos = [1.5, -0.5, -6]
  scale = [1.0, 2.5, 12.0]
  var wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // center wall
  cornerPos = [-11.5, -0.5, -2]
  scale = [10.0, 2.5, 4.0]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // side wall 2
  cornerPos = [-15, -0.5, -6]
  scale = [1.0, 2.5, 12.0]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // front wall
  cornerPos = [-14, -0.5, -6]
  scale = [15.5, 2.5, 1]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // back wall
  cornerPos = [-14, -0.5, 5]
  scale = [15.5, 2.5, 1]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // stairs
  cornerPos = [-1.5, -0.5, -2];
  scale = [3.0, 0.25, 0.5];
  var stair = new CubeMod_Rep(yellow_hue, 3.0, -0.25, -0.5, 1, 5);
  stair.matrix.setTranslate(...centerFind(cornerPos, scale));
  stair.matrix.scale(...scale);
  stair.render();

  for (var i = 0; i < 2; i++) {
    cornerPos[1] += scale[1];
    cornerPos[2] += scale[2];
    stair.matrix.setTranslate(...centerFind(cornerPos, scale));
    stair.matrix.scale(...scale);
    stair.render();
  }

  if (!zombies) {
    initEnemies();
  }

  for (var i = 0; i < 1; i ++) {
    zombies[i].render();
  }

  // var monster = new ZombieMan([0, -0.5, 4], 1);
  // monster.render();


  if (!markedMap) {

    // side wall 1
    markWallOnMatrix (1.5, -6, 1.0, 12.0);
    // center wall
    markWallOnMatrix (-11.5, -2, 10.0, 4.0);
    // side wall 2
    markWallOnMatrix (-15, -6, 1.0, 12.0);
    // front wall
    markWallOnMatrix (-14, -6, 15.5, 1.0);
    // back wall
    markWallOnMatrix (-14, 5, 15.5, 1.0);

    // stairs marking
    markStairs (-1.5, -2.0, 3.0, 0.5, camera.actualHeight + 0.25);
    markStairs (-1.5, -1.5, 3.0, 0.5, camera.actualHeight + 0.5);
    markStairs (-1.5, -1.0, 3.0, 0.5, camera.actualHeight + 0.75);

    markedMap = true;
  }

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
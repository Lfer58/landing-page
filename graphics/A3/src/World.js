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
    target_vectors[i] = vg_eye.elements;
  }

  if (action === 0) {
    for (var i = 0; i < target_vectors.length; i++) {
      let [x, y, z] = target_vectors[i];

      x = Math.round(x * 2) + 100;
      z = Math.round(z * 2) + 100;

      if (mapMatrix[x][z][0] === 3) {
        console.log(y, mapMatrix[x][z][1]);
        if (y <= mapMatrix[x][z][1]) {
          mapMatrix[x][z] = [3,0];
          break;
        }
      }
    }
  } 
  else if (action === 1) {
    for (var i = target_vectors.length -1; i >= 0; i--) {
      let [x, y, z] = target_vectors[i];

      x = Math.round(x * 2) + 100;
      z = Math.round(z * 2) + 100;
      y = Math.round(y * 2);

      if (matrix[x][z][y] === 0) {
        matrix[x][z][y] = 1;
        break;
      }
    }
  }
}

const matrix = [];
function loadMap() {
  for (let i = 0; i < 200; i++) {
    matrix[i] = [];
    for (let j = 0; j < 200; j++) {
      matrix[i][j] = [];
      for (let k = 0; k < 200; k++) {
        // if (k == Math.abs(i - 16) + Math.abs(j - 16)) {
        //   matrix[i][j][k] = 1;
        // } else {
          matrix[i][j][k] = 0;
        // }
      }
    }
  }
}

function drawMap() {

  var body = new CubeMod([1,1,1,1]);
  for (x = 0; x < 200; x++) {
    for (y = 0; y < 200; y++) {
      for (z = 0; z < 10; z++) {
        if (matrix[x][y][z] === 1) {
          body.textureNum = -2;
          body.color = [x/200, x/400 + y/400, y/200, 1]
          body.matrix.setTranslate(0, -0.25, 0);
          body.matrix.scale(0.5,0.5,0.5);
          body.matrix.translate(x - 100, z, y - 100);
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

let mapMatrix;

function initMapMatrix() {
  mapMatrix = Array.from({ length: 200 }, () => Array(200).fill([0, camera.startingHeight])); // 50x50 grid for [-25,25]
}

// Function to mark wall positions in mapMatrix
function markWallOnMatrix(x, z, length, width) {

  for (let i = x; i <= x + length; i += 0.5) {
      for (let j = z; j <= z + width; j += 0.5) {
          let matrixX = i * 2 + 100; // Convert world X to matrix index
          let matrixZ = j * 2 + 100; // Convert world Z to matrix index
          // console.log(i, matrixX, j, matrixZ);

          if (matrixX >= 0 && matrixX < 200 && matrixZ >= 0 && matrixZ < 200) {
              mapMatrix[matrixX][matrixZ] = [1, 1]; // Mark wall presence
          }
      }
  }
}

function markElevation(x, z, length, width, height) {

  for (let i = x; i <= x + length; i += 0.5) {
      for (let j = z; j <= z + width; j += 0.5) {
          let matrixX = i * 2 + 100; // Convert world X to matrix index
          let matrixZ = j * 2 + 100; // Convert world Z to matrix index
          // console.log(i, matrixX, j, matrixZ);

          if (matrixX >= 0 && matrixX < 200 && matrixZ >= 0 && matrixZ < 200 && mapMatrix[matrixX][matrixZ][0] != 1) {
              mapMatrix[matrixX][matrixZ] = [0, height]; // Mark wall presence
          }
      }
  }
}

// function markFloor(x, z, length, width, height) {

//   for (let i = x; i <= x + length; i += 0.5) {
//       for (let j = z; j <= z + width; j += 0.5) {
//           let matrixX = i * 2 + 50; // Convert world X to matrix index
//           let matrixZ = j * 2 + 50; // Convert world Z to matrix index

//           if (matrixX >= 0 && matrixX < 100 && matrixZ >= 0 && matrixZ < 100 && mapMatrix[matrixX][matrixZ][0] != 1) {
//               mapMatrix[matrixX][matrixZ] = [0, height]; // Mark wall presence
//           }
//       }
//   }
// }

let currentPos;
let prevPos;

function restart() {

  camera.resetView();
  camera.ammo = 20;
  camera.health = 50;

  // reset health
  zombieHealth = [];
  zombieHealth[0] = 50;
  zombieHealth[1] = 50;

  // reset positions
  zombiePos = [];
  zombiePos[0] = [0, -0.5, 4];
  zombiePos[1] = [-10, -0.5, -4.5];
}

function markEnemies () {

  for (let pos of prevPos) {
    mapMatrix[pos[0]][pos[1]] = [0,0]
  }
  
  prevPos = [];
  var i = 0;
  for (let pos of currentPos) {
    let matrixX = Math.round(pos[0] * 2) + 100; // Convert world X to matrix index
    let matrixZ = Math.round(pos[2] * 2) + 100; // Convert world Z to matrix index

    mapMatrix[matrixX][matrixZ] = [3, pos[1]];
    prevPos[i] = [matrixX, matrixZ];
    i++;
  }

}

let markedMap = false;
let cornerPos = [];
let scale = [];
let zombiePos;
let zombieHealth;

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

  drawMap();

  shotgun.cycle(); // Render shotgun animation

  health.render();
  ammo.render();

  if (camera.health <= 0) {
    restart();
  }

  if (!mapMatrix) {
    initMapMatrix();
  }

  // var dragon = new Dragon();
  // dragon.render();


  
  cornerPos = [-50, -0.5, -50]
  scale = [100, 0, 100]
  var platform = new CubeMod_Rep(base_color, ...scale, 2, 3);
  platform.matrix.setTranslate(...centerFind(cornerPos, scale));
  platform.matrix.scale(...scale);
  platform.render();

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

  // room 1
  // side wall 1
  cornerPos = [1.5, -0.5, -6]
  scale = [1.0, 6, 12.0]
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
  scale = [1.0, 6, 12.0]
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

  // back wall 1
  cornerPos = [-14, -0.5, 5]
  scale = [5, 6, 1]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // back wall 2
  cornerPos = [-6, -0.5, 5]
  scale = [7.5, 6, 1]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // back wall top
  cornerPos = [-9, 1.5, 5]
  scale = [3, 4, 1]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // cieling
  cornerPos = [-14, 2, -6]
  scale = [15.5,1.0, 11.0]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 8);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // central chamber
  // front wall
  cornerPos = [-14, -0.5, 9]
  scale = [19.5, 6, 1]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // entering horizontal stairs left
  cornerPos = [-10, -0.5, 6];
  scale = [-0.5, 0.25, 3.0];
  var stair = new CubeMod_Rep(yellow_hue, -0.5, 0.25, 3.0, 1, 5);
  stair.matrix.setTranslate(...centerFind(cornerPos, scale));
  stair.matrix.scale(...scale);
  stair.render();

  for (var i = 0; i < 7; i++) {
    cornerPos[1] += scale[1];
    cornerPos[0] += scale[0];
    stair.matrix.setTranslate(...centerFind(cornerPos, scale));
    stair.matrix.scale(...scale);
    stair.render();
  }

  // middle stairs floor
  cornerPos = [-17, 1.25, 6]
  scale = [3, 0.25, 3]
  wall1 = new CubeMod_Rep(yellow_hue, -3, 0.25, 3, 1, 5);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // continuing vertical stairs left
  cornerPos = [-14, 1.5, 9];
  scale = [-3.0, 0.25, 0.5];
  stair = new CubeMod_Rep(yellow_hue, -3.0, -0.25, -0.5, 1, 9);
  stair.matrix.setTranslate(...centerFind(cornerPos, scale));
  stair.matrix.scale(...scale);
  stair.render();

  for (var i = 0; i < 5; i++) {
    cornerPos[1] += scale[1];
    cornerPos[2] += scale[2];
    stair.matrix.setTranslate(...centerFind(cornerPos, scale));
    stair.matrix.scale(...scale);
    stair.render();
  }

  // entering horizontal stairs right
  cornerPos = [-4.5, -0.5, 6];
  scale = [0.5, 0.25, 3.0];
  var stair = new CubeMod_Rep(yellow_hue, 0.5, 0.25, 3.0, 1, 5);
  stair.matrix.setTranslate(...centerFind(cornerPos, scale));
  stair.matrix.scale(...scale);
  stair.render();

  for (var i = 0; i < 13; i++) {
    cornerPos[1] += scale[1];
    cornerPos[0] += scale[0];
    stair.matrix.setTranslate(...centerFind(cornerPos, scale));
    stair.matrix.scale(...scale);
    stair.render();
  }

  // back wall left
  cornerPos = [-18, -0.5, 5]
  scale = [3, 6, 1]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // side wall left 1
  cornerPos = [-18, -0.5, 6]
  scale = [1, 6, 8]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // side wall left 2
  cornerPos = [-18, -0.5, 17]
  scale = [1, 6, 6]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // side wall left top
  cornerPos = [-18, 1.5, 14]
  scale = [1, 4, 3]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // side wall left-right 1
  cornerPos = [-14, -0.5, 10]
  scale = [1, 6, 3]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // side wall left-middle
  cornerPos = [-17, -0.5, 12]
  scale = [3, 2.5, 1]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // side floor left
  cornerPos = [-17, 2, 12]
  scale = [3, 1, 7]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 3);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // side floor balcony
  cornerPos = [-14.5, 3, 12]
  scale = [0.5, 0.5, 7]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 8);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // back floor
  cornerPos = [-14, -0.5, 22]
  scale = [19.5, 0.75, -3]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 3);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // vertical stairs right bottom floor
  cornerPos = [5.5, -0.5, 17.5];
  scale = [-3.0, 0.25, 0.5];
  stair = new CubeMod_Rep(yellow_hue, -3.0, -0.25, -0.5, 1, 9);
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

  // entering horizontal stairs back
  cornerPos = [-8.5, 0.25, 19];
  scale = [-0.5, 0.25, 3.0];
  stair = new CubeMod_Rep(yellow_hue, -0.5, 0.25, 3.0, 1, 5);
  stair.matrix.setTranslate(...centerFind(cornerPos, scale));
  stair.matrix.scale(...scale);
  stair.render();

  for (var i = 0; i < 10; i++) {
    cornerPos[1] += scale[1];
    cornerPos[0] += scale[0];
    stair.matrix.setTranslate(...centerFind(cornerPos, scale));
    stair.matrix.scale(...scale);
    stair.render();
  }

  // side elevator left
  cornerPos = [-17, 2, 19]
  scale = [3, 1, 3]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 3);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // side wall right
  cornerPos = [2.5, -0.5, -2]
  scale = [4, 6, 1]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // side wall right1
  cornerPos = [5.5, -0.5, -1]
  scale = [1, 6, 15]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // side wall right 2
  cornerPos = [5.5, -0.5, 17]
  scale = [1, 6, 5]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // side wall right top
  cornerPos = [5.5, 1.5, 14]
  scale = [1, 4, 3]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // side floor right top
  cornerPos = [2.5, 2, -1]
  scale = [3, 1, 10]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 3);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // side wall right - right 0
  cornerPos = [6.5, -0.5, 9]
  scale = [4, 6, 1]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // side wall right - right 1
  cornerPos = [9.5, -0.5, 10]
  scale = [1, 6, 10]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // side wall right - right top
  cornerPos = [9.5, 1.5, 20]
  scale = [1, 4, 2]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // right - right - right
  cornerPos = [10.5, -0.5, 19]
  scale = [3, 6, 1]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // right - right - right side wall
  cornerPos = [13.5, -0.5, 19]
  scale = [1, 6, 4]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // back wall
  cornerPos = [-17, -0.5, 23]
  scale = [30.5, 6, -1]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 4);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();

  // cieling main
  cornerPos = [-18, 5.5, 5]
  scale = [28.5, 1.0, 20]
  wall1 = new CubeMod_Rep(yellow_hue, ...scale, 1.25, 8);
  wall1.matrix.setTranslate(...centerFind(cornerPos, scale));
  wall1.matrix.scale(...scale);
  wall1.render();
  

  if (!zombiePos) {
    zombiePos = [];
    zombiePos[0] = [0, -0.5, 4];
    zombiePos[1] = [-10, -0.5, -4.5];
  }

  if (!zombieHealth) {
    zombieHealth = [];
    zombieHealth[0] = 50;
    zombieHealth[1] = 50;
  }

  if (!currentPos) {
    currentPos = [];
  }

  if (!prevPos) {
    prevPos = [];
  }

  cornerPos = zombiePos[0];

  var monster = new ZombieMan(zombiePos[0], 1, 0, zombieHealth[0]);

  monster.render();
  if (monster.health > 0) {
    camera.damagePlayer(monster.damage, currentPos[0]);
  }

  monster = new ZombieMan(zombiePos[1], 2, 1, zombieHealth[1]);

  monster.render();
  if (monster.health > 0) {
    camera.damagePlayer(monster.damage, currentPos[1]);
  }

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
    markWallOnMatrix (-14, 5, 5, 1.0);
    markWallOnMatrix (-6, 5, 7.5, 1.0);

    //central chamber
    markWallOnMatrix (-14, 9, 19.5, 1);

    // horizontal stairs left marking
    markElevation (-10, -0.5, 6, camera.actualHeight + 0.25);

    // for (var i = 1; i <= 7; i++) {
    //   markElevation (-10 + i * -0.5, 6, -0.5, 3, camera.actualHeight + 0.25 * (i + 1));
    // }
    // markElevation (-11, -1.0, 3.0, 0.5, camera.actualHeight + 0.75);
    // markElevation (-11.5, -0.5, 3.0, 3.0, camera.actualHeight + 0.75);
    // markElevation (-12, -0.5, 3.0, 3.0, camera.actualHeight + 0.75);
    // markElevation (-12.5, -0.5, 3.0, 3.0, camera.actualHeight + 0.75);
    // markElevation (-13, -0.5, 3.0, 3.0, camera.actualHeight + 0.75);
    // markElevation (-13.5, -0.5, 3.0, 3.0, camera.actualHeight + 0.75);



    markedMap = true;
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
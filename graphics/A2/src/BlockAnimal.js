// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'uniform mat4 u_GlobalScaleMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_GlobalScaleMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_GlobalScaleMatrix;

function setupWebGL() {
    // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
  
  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalScaleMatrix = gl.getUniformLocation(gl.program, 'u_GlobalScaleMatrix');
  if (!u_GlobalScaleMatrix) {
    console.log('Failed to get the storage location of u_GlobalScaleMatrix');
    return;
  }

  // set baseline matrix
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const CUSTOM_TRI = 3;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_size = 10.0;
let g_selectedType = POINT;
let g_segments = 10;
let g_preserve = false;

let g_globalXAngle = 0;
let g_globalYAngle = 0;
let g_globalZAngle = 0;
let g_globalScale = -0.1;

let g_yellowAngle = 0;
let g_pinkAngle = 0;
let g_Animation = false;
let g_rotation_factor = 1;

// right_arm movement
let ra_sho_mov = 30;
let ra_sho_rot = 50;
let ra_elb_mov = 60;
let ra_wrt_mov = 0;
let ra_wrt_rot = 0;

// right_leg movement
let rl_sho_mov = 0;
let rl_sho_rot = 50;
let rl_elb_mov = 60;
let rl_wrt_mov = 0;
let rl_wrt_rot = 0;

// left_arm movement
let la_sho_mov = 30;
let la_sho_rot = 50;
let la_elb_mov = 60;
let la_wrt_mov = 0;
let la_wrt_rot = 0;

// left_leg movement
let ll_sho_mov = 30;
let ll_sho_rot = 50;
let ll_elb_mov = 50;
let ll_wrt_mov = 0;
let ll_wrt_rot = 70;

// left whisker
let lw_rot = 0;
let lw_rot_1 = 50;
let lw_mov = 10;

// right whisker
let rw_rot = 0;
let rw_rot_1 = 90;
let rw_mov = 10;

// body control
let st_hgt = -40;
let st_twt = 0;
let ta_hgt = -10;
let ov_rot = 0;
let in_rad = 60;

// head control
let hd_twt = 0
let hd_shk = 0
let hd_nod = 0

function addActionsForHtmlUI() {

  // Button events

  document.getElementById('clear').onclick = function() {  g_shapesList = []; g_vertices = []; renderAllShapes();};
  document.getElementById('resRot').onclick = function() {  g_globalXAngle = 0; g_globalYAngle = 0; g_globalScale = 0; renderAllShapes();};
  document.getElementById('topView').onclick = function() {  g_globalXAngle = 90; g_globalYAngle = 0; renderAllShapes();};
  document.getElementById('leftView').onclick = function() {  g_globalXAngle = 0; g_globalYAngle = 90; renderAllShapes();};
  document.getElementById('backView').onclick = function() {  g_globalXAngle = 0; g_globalYAngle = 180; renderAllShapes();};

  // document.getElementById('onY').onclick = function() {  g_yellowAnimation = true;}
  // document.getElementById('offY').onclick = function() {  g_yellowAnimation = false;};
  document.getElementById('onP').onclick = function() {  g_Animation = true;}
  document.getElementById('offP').onclick = function() {  g_Animation = false;};
  
  // Animation rotations events
  // document.getElementById('yellowSlide').addEventListener('mousemove', function() { this.value = g_yellowAngle; g_yellowAngle = this.value; renderAllShapes(); });
  // document.getElementById('pinkSlide').addEventListener('mousemove', function() { this.value = g_pinkAngle; g_pinkAngle = this.value; renderAllShapes(); });

  // Animation right arm
  document.getElementById('ra_sho_mov').addEventListener('mousemove', function() { /* this.value = ra_sho_mov; */ ra_sho_mov = this.value; renderAllShapes(); });
  document.getElementById('ra_sho_rot').addEventListener('mousemove', function() { /* this.value = ra_sho_rot; */ ra_sho_rot = this.value; renderAllShapes(); });
  document.getElementById('ra_elb_mov').addEventListener('mousemove', function() { /* this.value = ra_elb_mov; */ ra_elb_mov = Number(this.value); renderAllShapes(); });
  document.getElementById('ra_wrt_mov').addEventListener('mousemove', function() { /* this.value = ra_wrt_mov; */ ra_wrt_mov = this.value; renderAllShapes(); });
  document.getElementById('ra_wrt_rot').addEventListener('mousemove', function() { /* this.value = ra_wrt_rot; */ ra_wrt_rot = this.value; renderAllShapes(); });

  // Animation right arm
  document.getElementById('rl_sho_mov').addEventListener('mousemove', function() { /* this.value = ra_sho_mov; */ rl_sho_mov = this.value; renderAllShapes(); });
  document.getElementById('rl_sho_rot').addEventListener('mousemove', function() { /* this.value = ra_sho_rot; */ rl_sho_rot = this.value; renderAllShapes(); });
  document.getElementById('rl_elb_mov').addEventListener('mousemove', function() { /* this.value = ra_elb_mov; */ rl_elb_mov = Number(this.value); renderAllShapes(); });
  document.getElementById('rl_wrt_mov').addEventListener('mousemove', function() { /* this.value = ra_wrt_mov; */ rl_wrt_mov = this.value; renderAllShapes(); });
  document.getElementById('rl_wrt_rot').addEventListener('mousemove', function() { /* this.value = ra_wrt_rot; */ rl_wrt_rot = this.value; renderAllShapes(); });

  // Animation left arm
  document.getElementById('la_sho_mov').addEventListener('mousemove', function() { /* this.value = la_sho_mov; */ la_sho_mov = Number(this.value); renderAllShapes(); });
  document.getElementById('la_sho_rot').addEventListener('mousemove', function() { /* this.value = la_sho_rot; */ la_sho_rot = Number(this.value); renderAllShapes(); });
  document.getElementById('la_elb_mov').addEventListener('mousemove', function() { /* this.value = la_elb_mov; */ la_elb_mov = Number(this.value); renderAllShapes(); });
  document.getElementById('la_wrt_mov').addEventListener('mousemove', function() { /* this.value = la_wrt_mov; */ la_wrt_mov = Number(this.value); renderAllShapes(); });
  document.getElementById('la_wrt_rot').addEventListener('mousemove', function() { /* this.value = la_wrt_rot; */ la_wrt_rot = Number(this.value); renderAllShapes(); });

  // Animation left leg
  document.getElementById('ll_sho_mov').addEventListener('mousemove', function() { /* this.value = la_sho_mov; */ ll_sho_mov = Number(this.value); renderAllShapes(); });
  document.getElementById('ll_sho_rot').addEventListener('mousemove', function() { /* this.value = la_sho_rot; */ ll_sho_rot = Number(this.value); renderAllShapes(); });
  document.getElementById('ll_elb_mov').addEventListener('mousemove', function() { /* this.value = la_elb_mov; */ ll_elb_mov = Number(this.value); renderAllShapes(); });
  document.getElementById('ll_wrt_mov').addEventListener('mousemove', function() { /* this.value = la_wrt_mov; */ ll_wrt_mov = Number(this.value); renderAllShapes(); });
  document.getElementById('ll_wrt_rot').addEventListener('mousemove', function() { /* this.value = la_wrt_rot; */ ll_wrt_rot = Number(this.value); renderAllShapes(); });

  // Animation left whisker
  document.getElementById('lw_rot').addEventListener('mousemove', function() { /* this.value = la_sho_mov; */ lw_rot = Number(this.value); renderAllShapes(); });
  document.getElementById('lw_rot_1').addEventListener('mousemove', function() { /* this.value = la_sho_mov; */ lw_rot_1 = Number(this.value); renderAllShapes(); });
  document.getElementById('lw_mov').addEventListener('mousemove', function() { /* this.value = la_sho_mov; */ lw_mov = Number(this.value); console.log(lw_mov); renderAllShapes(); });

  // Animation left whisker
  document.getElementById('rw_rot').addEventListener('mousemove', function() { /* this.value = la_sho_mov; */ rw_rot = Number(this.value); renderAllShapes(); });
  document.getElementById('rw_rot_1').addEventListener('mousemove', function() { /* this.value = la_sho_mov; */ rw_rot_1 = Number(this.value); renderAllShapes(); });
  document.getElementById('rw_mov').addEventListener('mousemove', function() { /* this.value = la_sho_mov; */ rw_mov = Number(this.value); console.log(lw_mov); renderAllShapes(); });
  
  // Body Animation
  document.getElementById('st_hgt').addEventListener('mousemove', function() { /* this.value = st_hgt; */ st_hgt = Number(this.value); renderAllShapes(); });
  document.getElementById('st_twt').addEventListener('mousemove', function() { /* this.value = st_twt; */ st_twt = Number(this.value); renderAllShapes(); });
  document.getElementById('ta_hgt').addEventListener('mousemove', function() { /* this.value = ta_hgt; */ ta_hgt = Number(this.value); renderAllShapes(); });
  document.getElementById('ov_rot').addEventListener('mousemove', function() { /* this.value = ov_rot; */ ov_rot = Number(this.value); renderAllShapes(); });
  document.getElementById('in_rad').addEventListener('mousemove', function() { /* this.value = in_rad; */ in_rad = Number(this.value); renderAllShapes(); });
  
  // Head Animation
  document.getElementById('hd_twt').addEventListener('mousemove', function() { /* this.value = in_rad; */ hd_twt = Number(this.value); renderAllShapes(); });
  document.getElementById('hd_shk').addEventListener('mousemove', function() { /* this.value = in_rad; */ hd_shk = Number(this.value); renderAllShapes(); });
  document.getElementById('hd_nod').addEventListener('mousemove', function() { /* this.value = in_rad; */ hd_nod = Number(this.value); renderAllShapes(); });
  
  // attribute slide events
  // document.getElementById('angleSlide').addEventListener('mouseup', function() { g_globalAngle = this.value; renderAllShapes(); });
  document.getElementById('rotationFactor').addEventListener('mousemove', function() { g_rotation_factor = Number(this.value); renderAllShapes(); });

}


function main() {
  
  setupWebGL();

  // set up GLSL shader program and connect all variables
  connectVariablesToGLSL();

  // set up actions for the html ui elements
  addActionsForHtmlUI();


  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  // canvas.onmousemove = click;
  canvas.onmousemove = function(ev) {if (ev.buttons == 1) {click(ev)}};

  canvas.onwheel = function(ev) {
    ev.preventDefault(); // Prevent page scrolling
    handleScroll(ev);
  };


  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

var g_shapesList = [];
var g_vertices = [];
var previous_x = 0;
var previous_y = 0;
let startedShake = null;

function click(ev) {

  if (ev.shiftKey) {
    requestAnimationFrame(shakeHead);
    // Perform the special action here
    if (!startedShake) {
      startedShake = requestAnimationFrame(shakeHead); // Start only if not running
    }
  }

  [x, y] = converCoordinatesEventToGL(ev);

  angleUpdater(x,y, g_rotation_factor);

  //Draw eveyr shape that is supposed to be in the canvas
  renderAllShapes();
}

function handleScroll(ev) {
  if (ev.deltaY < 0) {

    g_globalScale += 0.01;
  } else {

    // scale down when scrolling down
    g_globalScale -= 0.01;
  }

  renderAllShapes();
}

let shakeStart = null;

function shakeHead() {

    g_seconds = performance.now()/1000.0 - g_startTime;

    if (shakeStart === null) {
      shakeStart = g_seconds;
    }

    if (g_seconds - shakeStart < 2.5) {
      hd_shk = 30 * Math.sin(g_seconds * 5);
      hd_twt = 15 * Math.sin(g_seconds * 5);
    } else {
      cancelAnimationFrame(startedShake);
      shakeStart = null;
      return;
    }

    renderAllShapes();

    startedShake = requestAnimationFrame(shakeHead);
}

function angleUpdater(x,y, rotationFactor) {

  if (previous_x != 0 || previous_y != 0) {

    if (x - previous_x > 0) {
      g_globalYAngle = (g_globalYAngle + rotationFactor) % 360;
    } else if (x - previous_x < 0) {
      g_globalYAngle = (g_globalYAngle - rotationFactor) % 360;
    }

    if (y - previous_y < 0) {
      if (Math.abs(g_globalYAngle) < 90 || Math.abs(g_globalYAngle) > 270) {
        g_globalXAngle = (g_globalXAngle + rotationFactor) % 360;
      // } else if (Math.abs(g_globalYAngle) < 135 || Math.abs(g_globalYAngle) > 225) {
      //   g_globalZAngle = (g_globalZAngle - rotationFactor) % 360;
      } else { 
        g_globalXAngle = (g_globalXAngle - rotationFactor) % 360;
      }
    } else if (y - previous_y > 0) {
      if (Math.abs(g_globalYAngle) < 90 || Math.abs(g_globalYAngle) > 270) {
        g_globalXAngle = (g_globalXAngle - rotationFactor) % 360;
      } else { 
        g_globalXAngle = (g_globalXAngle + rotationFactor) % 360;
      }
    }

    // if (Math.abs(g_globalYAngle) < 180 && Math.abs(g_globalYAngle) > 90) {
    //   if (y - previous_y < 0) {
    //     if (g_globalYAngle < 0) {
    //       g_globalZAngle = (g_globalZAngle + rotationFactor) % 360;
    //     } else {
    //       g_globalZAngle = (g_globalZAngle - rotationFactor) % 360;
    //     }
    //   } else if (y - previous_y > 0) {
    //     if (g_globalYAngle > 0) {
    //       g_globalZAngle = (g_globalZAngle + rotationFactor) % 360;
    //     } else {
    //       g_globalZAngle = (g_globalZAngle - rotationFactor) % 360;
    //     }
    //   }
    // }

    previous_x = x;
    previous_y = y;
  }

  if (previous_x == 0 && previous_y == 0) {
    previous_x = x;
    previous_y = y;
  }
}

function converCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);

}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

//called by brower repeatdely whenever its time
function tick() {

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

function renderAllShapes() {

  var startTime = performance.now();

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var globalRotMat = new Matrix4().rotate(-g_globalYAngle, 0, 1, 0);
  globalRotMat = globalRotMat.rotate(-g_globalXAngle, 1, 0, 0);
  globalRotMat = globalRotMat.rotate(-g_globalZAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements)

  var globalScaMat = new Matrix4().scale(1 + g_globalScale, 1 + g_globalScale, 1 + g_globalScale);
  gl.uniformMatrix4fv(u_GlobalScaleMatrix, false, globalScaMat.elements);

  // platform
  var platform = new CubeMod([0.47, 0.31, 0.66, 1]);
  // platform.color = [0.47, 0.31, 0.66, 1];
  platform.matrix.scale(1.5,0.5,1.5);
  platform.matrix.translate(0.0, -1.5, 0.0);
  platform.render();

  var K = 40.0
  let inner_radius = -0.3;
  let rad_increase = (-0.01 * in_rad - inner_radius) / K;
  let base_height = st_hgt * 0.01;
  let st_min = -40;
  let st_max = 100;
  // linear scaling of base_height to affect heigh_increase appropriately
  // along with it
  let height_increase = 0.03 - 0.06 * (st_hgt - st_min) / (st_max - st_min);
  let body_color = [0.036, 0.356, 0.412, 1];
  let last_body_matrix = null;
  let leg_body_matrix = null;
  let arm_body_matrix = null;

  let accent_color_yellow = [1, 0.8, 0, 1];
  let accent_color_yelnew = [1.0, 0.84, 0.2, 1];
  let accent_color_red = [1, 0.3, 0.4, 1];
  let accent_color_green = [0.036, 0.406, 0.412, 1];
  let accent_heights = 0.62;

  // main body
  for (var i = 0; i < K; i++) {

    var c = new CubeMod(body_color);
    // c.color = body_color;
    c.matrix.rotate(18 * i + ov_rot, 0, 1, 0);
    c.matrix.translate(0, base_height + height_increase * i, inner_radius + i * rad_increase);
    c.matrix.rotate(5, 0, 1, 0);
    c.matrix.rotate(st_twt, 1, 0, 0);
    c.matrix.rotate(-12 + 24 * (st_hgt - st_min) / (st_max - st_min), 0, 0, 1);
    if (i == 10) {
      leg_body_matrix = new Matrix4(c.matrix);
    }
    if (i == 35) {
      arm_body_matrix = new Matrix4(c.matrix);
    }
    c.matrix.scale(0.2 + 0.0015 * i + 0.1 * (in_rad - 60) / 60, 0.1 + 0.002 * i, 0.2);
    c.render();
    
    var baseMatrix = new Matrix4(c.matrix);
    var d = new RoundedCube(accent_color_yellow);
    // d.color = accent_color_yellow;
    d.matrix = baseMatrix;
    d.matrix.translate(0,accent_heights,0);
    d.render();

    baseMatrix = new Matrix4(c.matrix);
    var d = new RoundedCube(accent_color_red);
    // d.color = accent_color_red;
    d.matrix = baseMatrix;
    d.matrix.rotate(180,1,0,0)
    d.matrix.translate(0,accent_heights,0);
    d.render();

    if (i == K - 1) {
      last_body_matrix = new Matrix4(c.matrix);
    }
  }

  // tail
  K = 12
  for (var i = 0; i < K; i++) {

    var c = new CubeMod(body_color);
    // c.color = body_color;
    c.matrix.rotate(-18 * (i + 1) + ov_rot, 0, 1, 0);
    c.matrix.translate(0.03, base_height + height_increase * (i) * (-0.1 * ta_hgt), inner_radius + 0.02 * i);
    c.matrix.rotate(-10, 0, 1, 0);
    c.matrix.rotate(st_twt, 1, 0, 0);

    if (i != 0) {
      c.matrix.rotate((-12 + 24 * (st_hgt - st_min) / (st_max - st_min)) * 0.1 * ta_hgt, 0, 0, 1);
    }
    c.matrix.scale(0.2 - 0.019 * i, 0.1 - 0.009 * i, 0.2 - 0.019 * i);
    c.render();

    var baseMatrix = new Matrix4(c.matrix);
    var d = new RoundedCube(accent_color_yellow);
    // d.color = accent_color_yellow;
    d.matrix = baseMatrix;
    d.matrix.translate(0,accent_heights,0);
    d.render();

    baseMatrix = new Matrix4(c.matrix);
    var d = new RoundedCube(accent_color_red);
    // d.color = accent_color_red;
    d.matrix = baseMatrix;
    d.matrix.rotate(180,1,0,0)
    d.matrix.translate(0,accent_heights,0);
    d.render();
  }

  // // head construction
  {

  let head_control = new CubeMod(body_color);
  // head_control.color = body_color;
  head_control.matrix = new Matrix4(last_body_matrix);
  head_control.matrix.translate(-0.3,0, 0);
  head_control.matrix.rotate(hd_twt, 1,0,0);
  head_control.matrix.rotate(hd_shk, 0,1,0);
  head_control.matrix.rotate(hd_nod, 0,0,1);
  var head_control_coords = new Matrix4(head_control.matrix);
  head_control.matrix.scale(0.1,0.5,0.5);
  head_control.render();

  var head_main = new CubeMod(body_color);
  // head_main.color = body_color;
  head_main.matrix = new Matrix4(head_control_coords);;
  head_main.matrix.translate(-0.6, 0,0);
  head_main.matrix.scale(0.9, 1.1, 1.2);
  head_main.render();

  var baseMatrix = new Matrix4(head_main.matrix);
  var head_top = new RoundedCube(accent_color_yellow);
  // head_top.color = accent_color_yellow;
  head_top.matrix = baseMatrix;
  head_top.matrix.scale(1, 0.75, 1);
  head_top.matrix.translate(0,accent_heights + 0.175,0);
  head_top.render();

  baseMatrix = new Matrix4(head_main.matrix);
  var head_bottom = new RoundedCube(accent_color_red);
  // head_bottom.color = accent_color_red;
  head_bottom.matrix = baseMatrix;
  head_bottom.matrix.rotate(180,1,0,0);
  head_bottom.matrix.translate(0,accent_heights,0);
  head_bottom.render();

  baseMatrix = new Matrix4(head_main.matrix);
  var head_side = new RoundedCube(accent_color_green);
  // head_side.color = accent_color_green;
  head_side.matrix = baseMatrix;
  head_side.matrix.rotate(90,1,0,0);
  head_side.matrix.translate(0,0.57,0);
  head_side.matrix.scale(1,0.6,1);
  head_side.render();

  baseMatrix = new Matrix4(head_main.matrix);
  head_side = new RoundedCube(accent_color_green);
  // head_side.color = accent_color_green;
  head_side.matrix = baseMatrix;
  head_side.matrix.rotate(-90,1,0,0);
  head_side.matrix.translate(0,0.57,0);
  head_side.matrix.scale(1,0.6,1);
  head_side.render();
  }

  // // lower lip
  {
  baseMatrix = new Matrix4(head_main.matrix);
  var lower_lip = new CubeMod(body_color);
  // lower_lip.color = body_color;
  lower_lip.matrix = baseMatrix;
  lower_lip.matrix.rotate(15, 0,0,1);
  lower_lip.matrix.translate(-1.1,-0.25,0);
  lower_lip.matrix.scale(1.3,0.2,0.7);
  lower_lip.render();

  baseMatrix = new Matrix4(lower_lip.matrix);
  var lower_lip_side = new Triangle3D(body_color);
  // lower_lip_side.color = body_color;
  lower_lip_side.matrix = baseMatrix;
  lower_lip_side.matrix.rotate(90,0,0,1);
  lower_lip_side.matrix.scale(1,1,0.21);
  lower_lip_side.matrix.translate(0.0,0,-2.9);
  lower_lip_side.render();

  baseMatrix = new Matrix4(lower_lip.matrix);
  lower_lip_side = new Triangle3D(body_color);
  // lower_lip_side.color = body_color;
  lower_lip_side.matrix = baseMatrix;
  lower_lip_side.matrix.rotate(-90,0,0,1);
  lower_lip_side.matrix.rotate(180,1,0,0);
  lower_lip_side.matrix.scale(1,1,0.21);
  lower_lip_side.matrix.translate(0.0,0,-2.9);
  lower_lip_side.render();

  baseMatrix = new Matrix4(lower_lip.matrix);
  lower_lip_front = new RoundedCube(body_color);
  // lower_lip_front.color = body_color;
  lower_lip_front.matrix = baseMatrix;
  lower_lip_front.matrix.scale(0.5,1,1);
  lower_lip_front.matrix.rotate(90,0,0,1);
  lower_lip_front.matrix.translate(0,1.1,0);
  lower_lip_front.render();
  
  baseMatrix = new Matrix4(lower_lip.matrix);
  lower_tip_top = new Triangle3D(accent_color_red);
  // lower_tip_top.color = accent_color_red;
  lower_tip_top.matrix = baseMatrix;
  lower_tip_top.matrix.rotate(90,0,1,0);
  lower_tip_top.matrix.rotate(180,1,0,0);
  lower_tip_top.matrix.scale(1,1,1);
  lower_tip_top.matrix.translate(0,1.0,0);
  lower_tip_top.render();
  }

  // // upper lip
  {
  baseMatrix = new Matrix4(head_main.matrix);
  var upper_lip = new CubeMod(body_color);
  // upper_lip.color = body_color;
  upper_lip.matrix = baseMatrix;
  upper_lip.matrix.translate(-1.1,-0.15,0);
  var whisker_mat_1 = new Matrix4(upper_lip.matrix);
  var whisker_mat_2 = new Matrix4(upper_lip.matrix);
  upper_lip.matrix.scale(1.25,0.3,0.7);
  upper_lip.render();

  baseMatrix = new Matrix4(upper_lip.matrix);
  var upper_lip_side = new Triangle3D(body_color);
  // upper_lip_side.color = body_color;
  upper_lip_side.matrix = baseMatrix;
  upper_lip_side.matrix.rotate(90,0,0,1);
  upper_lip_side.matrix.scale(1,1,0.21);
  upper_lip_side.matrix.translate(0.0,0,-2.9);
  upper_lip_side.render();

  baseMatrix = new Matrix4(upper_lip.matrix);
  upper_lip_side = new Triangle3D(body_color);
  // upper_lip_side.color = body_color;
  upper_lip_side.matrix = baseMatrix;
  upper_lip_side.matrix.rotate(-90,0,0,1);
  upper_lip_side.matrix.rotate(180,1,0,0);
  upper_lip_side.matrix.scale(1,1,0.21);
  upper_lip_side.matrix.translate(0.0,0,-2.9);
  upper_lip_side.render();

  baseMatrix = new Matrix4(upper_lip.matrix);
  upper_lift_front = new RoundedCube(body_color);
  // upper_lift_front.color = body_color;
  upper_lift_front.matrix = baseMatrix;
  upper_lift_front.matrix.scale(0.5,1,1);
  upper_lift_front.matrix.rotate(90,0,0,1);
  upper_lift_front.matrix.translate(0,1.1,0);
  upper_lift_front.render();

  baseMatrix = new Matrix4(upper_lip.matrix);
  upper_lip_top = new Triangle3D(accent_color_yellow);
  // upper_lip_top.color = accent_color_yellow;
  upper_lip_top.matrix = baseMatrix;
  upper_lip_top.matrix.rotate(-90,0,1,0);
  upper_lip_top.matrix.scale(1,0.5,0.5);
  upper_lip_top.matrix.translate(0,1.5,0.5);
  upper_lip_top.render();
  }

  // Left Horn
  {
  var cyl = new Cylinder(accent_color_yellow);
  // cyl.color = accent_color_yellow;
  baseMatrix = new Matrix4(head_main.matrix);
  cyl.matrix = baseMatrix;
  cyl.matrix.translate(-0.5,0,0);
  cyl.matrix.rotate(-60, 1,0,0);
  cyl.matrix.rotate(60, 0,1,0);
  cyl.matrix.rotate(90, 0,0,1);
  cyl.matrix.translate(0,0.5,0.5);
  cyl.matrix.scale(0.1,0.1,0.4);
  cyl.matrix.scale(2, 2, 2);
  // cyl.render();

  var whiskMatrix_1 = new Matrix4(cyl.matrix);
  var whiskMatrix_2 = new Matrix4(cyl.matrix);
  K = 10;
  var radius_steps = (0.0 - 1.0) / K;
  var length_steps = (0.75 / (0.25 * 0.4)) / K;
  
  for (var i = 1; i <= K; i++) {
    var c = null;
    
    if (i % 2 == 0) {
      var c = new Cylinder(accent_color_red);
      // c.color = accent_color_red;
    } else {
      var c = new Cylinder(accent_color_green);
      // c.color = accent_color_green;
    }

    c.matrix = whiskMatrix_1;
    c.matrix.rotate(45 * Math.sin(i), 1, 0, 0);
    c.matrix.translate(0,0,length_steps);
    c.matrix.scale(1.0 + radius_steps, 1.0 + radius_steps, 1.0);
    c.render();
    
    whiskMatrix_1 = new Matrix4(c.matrix);
  }

  for (var i = 1; i <= K - 7; i++) {
    var c = null;
    
    if (i % 2 == 0) {
      var c = new Cylinder(accent_color_red);
      // c.color = accent_color_red;
    } else {
      var c = new Cylinder(accent_color_green);
      // c.color = accent_color_green;
    }

    c.matrix = whiskMatrix_2;
    c.matrix.rotate(30 * Math.sin(i), 1, 0, 0);
    c.matrix.translate(0,0.2,length_steps);
    c.matrix.scale(1.0 + radius_steps * 3, 1.0 + radius_steps * 3, 1.0);
    c.render();
    
    whiskMatrix_2 = new Matrix4(c.matrix);
  }
  }

  // right horn
  {
    cyl = new Cylinder(accent_color_yellow);
    // cyl.color = accent_color_yellow;
    baseMatrix = new Matrix4(head_main.matrix);
    cyl.matrix = baseMatrix;
    cyl.matrix.translate(-0.5,0,0);
    cyl.matrix.rotate(-120, 1,0,0);
    cyl.matrix.rotate(60, 0,1,0);
    cyl.matrix.rotate(90, 0,0,1);
    cyl.matrix.translate(0.0,0.5,0.5);
    cyl.matrix.scale(0.1,0.1,0.4);
    cyl.matrix.scale(2, 2, 2);
    // cyl.render();
  
    var whiskMatrix_1 = new Matrix4(cyl.matrix);
    var whiskMatrix_2 = new Matrix4(cyl.matrix);
    K = 10;
    var radius_steps = (0.0 - 1.0) / K;
    var length_steps = (0.75 / (0.25 * 0.4)) / K;
    
    for (var i = 1; i <= K; i++) {
      var c = null;
    
      if (i % 2 == 0) {
        var c = new Cylinder(accent_color_red);
        // c.color = accent_color_red;
      } else {
        var c = new Cylinder(accent_color_green);
        // c.color = accent_color_green;
      }
  
      c.matrix = whiskMatrix_1;
      c.matrix.rotate(45 * Math.sin(i), 1, 0, 0);
      c.matrix.translate(0,0,length_steps);
      c.matrix.scale(1.0 + radius_steps, 1.0 + radius_steps, 1.0);
      c.render();
      
      whiskMatrix_1 = new Matrix4(c.matrix);
    }
  
    for (var i = 1; i <= K - 7; i++) {
      var c = null;
    
      if (i % 2 == 0) {
        var c = new Cylinder(accent_color_red);
        // c.color = accent_color_red;
      } else {
        var c = new Cylinder(accent_color_green);
        // c.color = accent_color_green;
      }
  
      c.matrix = whiskMatrix_2;
      c.matrix.rotate(30 * Math.sin(i), 1, 0, 0);
      c.matrix.translate(0,0.2,length_steps);
      c.matrix.scale(1.0 + radius_steps * 3, 1.0 + radius_steps * 3, 1.0);
      c.render();
      
      whiskMatrix_2 = new Matrix4(c.matrix);
    }
    }

  // Right Whisker
  {
  cyl = new Cylinder(accent_color_yelnew);
  // baseMatrix = new Matrix4(upper_lip.matrix);
  // cyl.color = accent_color_yelnew;
  cyl.matrix = whisker_mat_1;
  cyl.matrix.rotate(190, 1,0,0);
  cyl.matrix.rotate(-90, 0,1,0);
  cyl.matrix.rotate(-90, 0,0,1);
  cyl.matrix.translate(0,-0.3,0.5);
  var whiskMatrix_1 = new Matrix4(cyl.matrix);
  cyl.matrix.scale(0.1,0.1,0.3);
  // cyl.matrix.scale(, 0.25);
  cyl.render();

  K = 10;
  var radius_steps = (0.0 - 1.0) / K;
  var length_steps = (2) / K;
  var scale_factor = 0.1; // Inherit initial size
  var whiskRot = 32 + rw_rot * 0.1;
  var rotMin = 0.8;
  var rotMax = 1.5;

  for (var i = 1; i <= K; i++) {
    var c = new Cylinder(accent_color_yelnew);

    // c.color = accent_color_yelnew;
    
    // if (i % 2 == 0) {
    //   c.color = accent_color_red;
    // } else {
    //   c.color = accent_color_green;
    // }

    c.matrix = whiskMatrix_1;
    // c.matrix.rotate(30 * Math.sin(i * Math.PI), 1, 0, 0);
    c.matrix.rotate(whiskRot * Math.sin(i * Math.PI / K), 1, 0, 0);
    c.matrix.translate(0.001 * rw_mov,0,length_steps);
    whiskMatrix_1 = new Matrix4(c.matrix);
    c.matrix.rotate(15 + 0.5 * (rw_mov - 15), 0, 1, 0);
    c.matrix.scale(scale_factor, scale_factor, 3 * scale_factor);;
    c.matrix.scale(1.0 + radius_steps, 1.0 + radius_steps, 1.0);
    c.render();
    
  }

  for (var i = 1; i <= K; i++) {
    var c = new Cylinder(accent_color_yelnew);

    // c.color = accent_color_yelnew;
    
    // if (i % 2 == 0) {
    //   c.color = accent_color_red;
    // } else {
    //   c.color = accent_color_green;
    // }

    c.matrix = whiskMatrix_1;
    // c.matrix.rotate(30 * Math.sin(i * Math.PI), 1, 0, 0);
    c.matrix.rotate(-whiskRot * 0.01 * rw_rot_1 * Math.sin(i * Math.PI / K), 1, 0, 0);
    c.matrix.translate(-0.002 * rw_mov,0,length_steps);
    whiskMatrix_1 = new Matrix4(c.matrix);
    c.matrix.rotate(-20 - (rw_mov - 15), 0, 1, 0);
    c.matrix.scale(scale_factor, scale_factor, 3 * scale_factor);;
    c.matrix.scale(1.0 + radius_steps, 1.0 + radius_steps, 1.0);
    c.render();
    
  }

  for (var i = 1; i <= K - 5; i++) {
    var c = new Cylinder(accent_color_yelnew);

    // c.color = accent_color_yelnew;
    
    // if (i % 2 == 0) {
    //   c.color = accent_color_red;
    // } else {
    //   c.color = accent_color_green;
    // }

    c.matrix = whiskMatrix_1;
    // c.matrix.rotate(30 * Math.sin(i * Math.PI), 1, 0, 0);
    c.matrix.rotate(whiskRot * 0.01 * rw_rot_1 * Math.sin(i * Math.PI / K), 1, 0, 0);
    c.matrix.translate(0.001 * rw_mov,0,length_steps);
    whiskMatrix_1 = new Matrix4(c.matrix);
    c.matrix.rotate(15 + 0.5 * (rw_mov - 15), 0, 1, 0);
    c.matrix.scale(scale_factor, scale_factor, 3 * scale_factor);;
    c.matrix.scale(1.0 + radius_steps, 1.0 + radius_steps, 1.0);
    c.render();
    
  }
  }

  // Left Whisker
  {
    cyl = new Cylinder(accent_color_yelnew);
    // cyl.color = accent_color_yelnew;
    cyl.matrix = whisker_mat_2;
    cyl.matrix.rotate(-10, 1,0,0);
    cyl.matrix.rotate(-90, 0,1,0);
    cyl.matrix.rotate(-90, 0,0,1);
    cyl.matrix.translate(0,-0.3,0.5);
    var whiskMatrix_1 = new Matrix4(cyl.matrix);
    cyl.matrix.scale(0.1,0.1,0.3);
    cyl.matrix.scale(0.25,0.25,0.25);
    cyl.render();
  
    K = 10;
    var radius_steps = (0.0 - 1.0) / K;
    var length_steps = (2) / K;
    var scale_factor = 0.1; // Inherit initial size
    var whiskRot = 30 + lw_rot * 0.1;
    var rotMin = 0.8;
    var rotMax = 1.5;

  
    for (var i = 1; i <= K; i++) {
      var c = new Cylinder(accent_color_yelnew);

      // c.color = accent_color_yelnew;
      
      // if (i % 2 == 0) {
      //   c.color = accent_color_red;
      // } else {
      //   c.color = accent_color_green;
      // }
  
      c.matrix = whiskMatrix_1;
      // c.matrix.rotate(30 * Math.sin(i * Math.PI), 1, 0, 0);
      c.matrix.rotate(whiskRot * Math.sin(i * Math.PI / K), 1, 0, 0);
      c.matrix.translate(0.001 * lw_mov,0,length_steps);
      whiskMatrix_1 = new Matrix4(c.matrix);
      c.matrix.rotate(15 + 0.5 * (lw_mov - 15), 0, 1, 0);
      c.matrix.scale(scale_factor, scale_factor, 3 * scale_factor);;
      c.matrix.scale(1.0 + radius_steps, 1.0 + radius_steps, 1.0);
      c.render();
      
    }
  
    for (var i = 1; i <= K; i++) {
      var c = new Cylinder(accent_color_yelnew);

      // c.color = accent_color_yelnew;
      
      // if (i % 2 == 0) {
      //   c.color = accent_color_red;
      // } else {
      //   c.color = accent_color_green;
      // }
  
      c.matrix = whiskMatrix_1;
      // c.matrix.rotate(30 * Math.sin(i * Math.PI), 1, 0, 0);
      c.matrix.rotate(-whiskRot * 0.01 * lw_rot_1 * Math.sin(i * Math.PI / K), 1, 0, 0);
      c.matrix.translate(-0.002 * lw_mov,0,length_steps);
      whiskMatrix_1 = new Matrix4(c.matrix);
      c.matrix.rotate(-20 - (lw_mov - 15), 0, 1, 0);
      c.matrix.scale(scale_factor, scale_factor, 3 * scale_factor);;
      c.matrix.scale(1.0 + radius_steps, 1.0 + radius_steps, 1.0);
      c.render();
      
    }
  
    for (var i = 1; i <= K - 5; i++) {
      var c = new Cylinder(accent_color_yelnew);

      // c.color = accent_color_yelnew;
      
      // if (i % 2 == 0) {
      //   c.color = accent_color_red;
      // } else {
      //   c.color = accent_color_green;
      // }
  
      c.matrix = whiskMatrix_1;
      // c.matrix.rotate(30 * Math.sin(i * Math.PI), 1, 0, 0);
      c.matrix.rotate(whiskRot * 0.01 * lw_rot_1 * Math.sin(i * Math.PI / K), 1, 0, 0);
      c.matrix.translate(0.001 * lw_mov,0,length_steps);
      whiskMatrix_1 = new Matrix4(c.matrix);
      c.matrix.rotate(15 + 0.5 * (lw_mov - 15), 0, 1, 0);
      c.matrix.scale(scale_factor, scale_factor, 3 * scale_factor);;
      c.matrix.scale(1.0 + radius_steps, 1.0 + radius_steps, 1.0);
      c.render();
      
    }
  }

  // Left leg
  {
  // control point 1
  let left_arm_control = new CubeMod(body_color);
  // left_arm_control.color = body_color;
  left_arm_control.matrix = new Matrix4(leg_body_matrix);
  left_arm_control.matrix.translate(0.03,0, -0.08);
  left_arm_control.matrix.rotate(30 + ll_sho_mov, 1,0,0);
  left_arm_control.matrix.rotate(-200 + ll_sho_rot, 0,1,0);
  var left_arm_coords = new Matrix4(left_arm_control.matrix);
  left_arm_control.matrix.scale(0.03,0.01,0.03);
  left_arm_control.render();

  let left_arm = new CubeMod(body_color);
  // left_arm.color = body_color;
  left_arm.matrix = new Matrix4(left_arm_coords);
  left_arm.matrix.translate(0.0,-0.1, 0);
  left_arm_coords = new Matrix4(left_arm.matrix);
  // left_arm.matrix.rotate(30, 1,0,0);
  left_arm.matrix.scale(0.045,0.2,0.045);
  left_arm.render();

  var baseMatrix = new Matrix4(left_arm.matrix);
  var left_arm_1 = new RoundedCube(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.modify_color = false;
  left_arm_1.matrix.translate(0,0,-0.65);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.rotate(90,1,0,0);
  left_arm_1.matrix.rotate(-90,0,0,1);
  left_arm_1.render();

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new RoundedCube(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.modify_color = false;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(0,0,0.65);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.rotate(90,1,0,0);
  left_arm_1.matrix.rotate(90,0,0,1);
  left_arm_1.render();

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new RoundedCube(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.modify_color = false;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(-0.65,0,0);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.rotate(90,1,0,0);
  left_arm_1.matrix.rotate(180,0,0,1);
  left_arm_1.render();

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new RoundedCube(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.modify_color = false;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(0.65,0,0);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.rotate(90,1,0,0);
  left_arm_1.render();

  // control point 2

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_control = new CubeMod(body_color);
  // left_arm_control.color = body_color;
  left_arm_control.matrix = new Matrix4(left_arm_coords);
  left_arm_control.matrix.translate(0.0,-0.065, 0.0);
  left_arm_control.matrix.rotate(30 + ll_elb_mov, 0,0,1);
  left_arm_coords = new Matrix4(left_arm_control.matrix);
  left_arm_control.matrix.scale(0.04,0.01,0.04);
  left_arm_control.render();

  left_arm = new CubeMod(body_color);
  // left_arm.color = body_color;
  left_arm.matrix = new Matrix4(left_arm_coords);
  left_arm.matrix.translate(0.0,-0.08, 0);
  // left_arm.matrix.rotate(30, 1,0,0);
  left_arm.matrix.scale(0.035,0.2,0.035);
  left_arm.render();


  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new RoundedCube(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.modify_color = false;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(0,0,-0.65);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.rotate(90,1,0,0);
  left_arm_1.matrix.rotate(-90,0,0,1);
  left_arm_1.render();

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new RoundedCube(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.modify_color = false;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(0,0,0.65);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.rotate(90,1,0,0);
  left_arm_1.matrix.rotate(90,0,0,1);
  left_arm_1.render();

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new RoundedCube(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.modify_color = false;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(-0.65,0,0);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.rotate(90,1,0,0);
  left_arm_1.matrix.rotate(180,0,0,1);
  left_arm_1.render();

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new RoundedCube(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.modify_color = false;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(0.65,0,0);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.rotate(90,1,0,0);
  left_arm_1.render();

  // Control Point 3

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_control = new CubeMod(accent_color_yellow);
  // left_arm_control.color = accent_color_yellow;
  left_arm_control.matrix = new Matrix4(left_arm_coords);
  left_arm_control.matrix.translate(0.0,-0.17, 0.0);
  left_arm_control.matrix.rotate(30 - ll_wrt_mov, 1,0,0);
  left_arm_control.matrix.rotate(30 - ll_wrt_rot, 0,1,0);
  left_arm_coords = new Matrix4(left_arm_control.matrix);
  left_arm_control.matrix.scale(0.03,0.005,0.015);
  left_arm_control.render();

  baseMatrix = left_arm_coords;
  left_arm = new CubeMod(body_color);
  // left_arm.color = body_color;
  left_arm.matrix = baseMatrix;
  left_arm.matrix.translate(0,-0.022, 0);
  left_arm.matrix.scale(0.04,0.06,0.03);
  left_arm.render();

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new Triangle3D(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(-0.7,0, 0);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.scale(1.0,1,0.5);
  left_arm_1.render();

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new Triangle3D(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(0.75,0, 0);
  left_arm_1.matrix.rotate(-90,0,1,0);
  left_arm_1.matrix.scale(1.0,1,0.5);
  left_arm_1.render();

  // claws
  for (i = -0.65; i <= 0.65; i += 0.65) {
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new CubeMod([1,1,1,0.8]);
    // left_arm_1.color = [1,1,1,0.8];
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(i,-0.65, 0);
    left_arm_1.matrix.rotate(45, 1,0,0);
    left_arm_1.matrix.scale(0.35,0.75,0.5);
    left_arm_1.render();
  }
  }

  // Right Leg
  {
  let left_arm_control = new CubeMod(body_color);
  // left_arm_control.color = body_color;
  left_arm_control.matrix = new Matrix4(leg_body_matrix);
  left_arm_control.matrix.translate(0.03,0.0, 0.075);
  left_arm_control.matrix.rotate(-30 - rl_sho_mov, 1,0,0);
  left_arm_control.matrix.rotate(-150 - rl_sho_rot, 0,1,0);
  var left_arm_coords = new Matrix4(left_arm_control.matrix);
  left_arm_control.matrix.scale(0.03,0.01,0.03);
  left_arm_control.render();

  let left_arm = new CubeMod(body_color);
  // left_arm.color = body_color;
  left_arm.matrix = new Matrix4(left_arm_coords);
  left_arm.matrix.translate(0.0,-0.1, 0);
  left_arm_coords = new Matrix4(left_arm.matrix);
  // left_arm.matrix.rotate(30, 1,0,0);
  left_arm.matrix.scale(0.045,0.2,0.045);
  left_arm.render();

  var baseMatrix = new Matrix4(left_arm.matrix);
  var left_arm_1 = new RoundedCube(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.modify_color = false;
  left_arm_1.matrix.translate(0,0,-0.65);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.rotate(90,1,0,0);
  left_arm_1.matrix.rotate(-90,0,0,1);
  left_arm_1.render();

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new RoundedCube(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.modify_color = false;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(0,0,0.65);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.rotate(90,1,0,0);
  left_arm_1.matrix.rotate(90,0,0,1);
  left_arm_1.render();

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new RoundedCube(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.modify_color = false;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(-0.65,0,0);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.rotate(90,1,0,0);
  left_arm_1.matrix.rotate(180,0,0,1);
  left_arm_1.render();

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new RoundedCube(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.modify_color = false;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(0.65,0,0);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.rotate(90,1,0,0);
  left_arm_1.render();

  // control point 2

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_control = new CubeMod(body_color);
  // left_arm_control.color = body_color;
  left_arm_control.matrix = new Matrix4(left_arm_coords);
  left_arm_control.matrix.translate(0.0,-0.065, 0.0);
  left_arm_control.matrix.rotate(30 + rl_elb_mov, 0,0,1);
  left_arm_coords = new Matrix4(left_arm_control.matrix);
  left_arm_control.matrix.scale(0.04,0.01,0.04);
  left_arm_control.render();

  left_arm = new CubeMod(body_color);
  // left_arm.color = body_color;
  left_arm.matrix = new Matrix4(left_arm_coords);
  left_arm.matrix.translate(0.0,-0.08, 0);
  // left_arm.matrix.rotate(30, 1,0,0);
  left_arm.matrix.scale(0.035,0.2,0.035);
  left_arm.render();


  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new RoundedCube(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.modify_color = false;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(0,0,-0.65);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.rotate(90,1,0,0);
  left_arm_1.matrix.rotate(-90,0,0,1);
  left_arm_1.render();

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new RoundedCube(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.modify_color = false;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(0,0,0.65);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.rotate(90,1,0,0);
  left_arm_1.matrix.rotate(90,0,0,1);
  left_arm_1.render();

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new RoundedCube(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.modify_color = false;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(-0.65,0,0);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.rotate(90,1,0,0);
  left_arm_1.matrix.rotate(180,0,0,1);
  left_arm_1.render();

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new RoundedCube(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.modify_color = false;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(0.65,0,0);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.rotate(90,1,0,0);
  left_arm_1.render();

  // Control Point 3

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_control = new CubeMod(accent_color_yellow);
  // left_arm_control.color = accent_color_yellow;
  left_arm_control.matrix = new Matrix4(left_arm_coords);
  left_arm_control.matrix.translate(0.0,-0.17, 0.0);
  left_arm_control.matrix.rotate(30 - rl_wrt_mov, 1,0,0); // wrist
  left_arm_control.matrix.rotate(30 - rl_wrt_rot, 0,1,0); // wrist twist
  left_arm_coords = new Matrix4(left_arm_control.matrix);
  left_arm_control.matrix.scale(0.03,0.005,0.015);
  left_arm_control.render();

  baseMatrix = left_arm_coords;
  left_arm = new CubeMod(body_color);
  // left_arm.color = body_color;
  left_arm.matrix = baseMatrix;
  left_arm.matrix.translate(0,-0.022, 0);
  left_arm.matrix.scale(0.04,0.06,0.03);
  left_arm.render();

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new Triangle3D(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(-0.7,0, 0);
  left_arm_1.matrix.rotate(90,0,1,0);
  left_arm_1.matrix.scale(1.0,1,0.5);
  left_arm_1.render();

  baseMatrix = new Matrix4(left_arm.matrix);
  left_arm_1 = new Triangle3D(body_color);
  // left_arm_1.color = body_color;
  left_arm_1.matrix = baseMatrix;
  left_arm_1.matrix.translate(0.75,0, 0);
  left_arm_1.matrix.rotate(-90,0,1,0);
  left_arm_1.matrix.scale(1.0,1,0.5);
  left_arm_1.render();

  // claws
  for (i = -0.65; i <= 0.65; i += 0.65) {
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new CubeMod([1,1,1,0.8]);
    // left_arm_1.color = [1,1,1,0.8];
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(i,-0.65, 0);
    left_arm_1.matrix.rotate(45, 1,0,0);
    left_arm_1.matrix.scale(0.35,0.75,0.5);
    left_arm_1.render();
  }
  }

  // Left Arm
  {
    // control point 1
    let left_arm_control = new CubeMod(body_color);
    // left_arm_control.color = body_color;
    left_arm_control.matrix = new Matrix4(arm_body_matrix);
    left_arm_control.matrix.translate(0.03,0, -0.08);
    left_arm_control.matrix.rotate(30 + la_sho_mov, 1,0,0);
    left_arm_control.matrix.rotate(-200 + la_sho_rot, 0,1,0);
    var left_arm_coords = new Matrix4(left_arm_control.matrix);
    left_arm_control.matrix.scale(0.03,0.01,0.03);
    left_arm_control.render();
  
    let left_arm = new CubeMod(body_color);
    // left_arm.color = body_color;
    left_arm.matrix = new Matrix4(left_arm_coords);
    left_arm.matrix.translate(0.0,-0.1, 0);
    left_arm_coords = new Matrix4(left_arm.matrix);
    // left_arm.matrix.rotate(30, 1,0,0);
    left_arm.matrix.scale(0.045,0.2,0.045);
    left_arm.render();
  
    var baseMatrix = new Matrix4(left_arm.matrix);
    var left_arm_1 = new RoundedCube(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.modify_color = false;
    left_arm_1.matrix.translate(0,0,-0.65);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.rotate(90,1,0,0);
    left_arm_1.matrix.rotate(-90,0,0,1);
    left_arm_1.render();
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new RoundedCube(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.modify_color = false;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(0,0,0.65);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.rotate(90,1,0,0);
    left_arm_1.matrix.rotate(90,0,0,1);
    left_arm_1.render();
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new RoundedCube(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.modify_color = false;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(-0.65,0,0);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.rotate(90,1,0,0);
    left_arm_1.matrix.rotate(180,0,0,1);
    left_arm_1.render();
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new RoundedCube(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.modify_color = false;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(0.65,0,0);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.rotate(90,1,0,0);
    left_arm_1.render();
  
    // control point 2
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_control = new CubeMod(body_color);
    // left_arm_control.color = body_color;
    left_arm_control.matrix = new Matrix4(left_arm_coords);
    left_arm_control.matrix.translate(0.0,-0.065, 0.0);
    left_arm_control.matrix.rotate(30 + la_elb_mov, 0,0,1);
    left_arm_coords = new Matrix4(left_arm_control.matrix);
    left_arm_control.matrix.scale(0.04,0.01,0.04);
    left_arm_control.render();
  
    left_arm = new CubeMod(body_color);
    // left_arm.color = body_color;
    left_arm.matrix = new Matrix4(left_arm_coords);
    left_arm.matrix.translate(0.0,-0.08, 0);
    // left_arm.matrix.rotate(30, 1,0,0);
    left_arm.matrix.scale(0.035,0.2,0.035);
    left_arm.render();
  
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new RoundedCube(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.modify_color = false;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(0,0,-0.65);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.rotate(90,1,0,0);
    left_arm_1.matrix.rotate(-90,0,0,1);
    left_arm_1.render();
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new RoundedCube(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.modify_color = false;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(0,0,0.65);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.rotate(90,1,0,0);
    left_arm_1.matrix.rotate(90,0,0,1);
    left_arm_1.render();
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new RoundedCube(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.modify_color = false;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(-0.65,0,0);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.rotate(90,1,0,0);
    left_arm_1.matrix.rotate(180,0,0,1);
    left_arm_1.render();
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new RoundedCube(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.modify_color = false;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(0.65,0,0);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.rotate(90,1,0,0);
    left_arm_1.render();
  
    // Control Point 3
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_control = new CubeMod(accent_color_yellow);
    // left_arm_control.color = accent_color_yellow;
    left_arm_control.matrix = new Matrix4(left_arm_coords);
    left_arm_control.matrix.translate(0.0,-0.17, 0.0);
    left_arm_control.matrix.rotate(30 - la_wrt_mov, 1,0,0); // wrist
    left_arm_control.matrix.rotate(30 - la_wrt_rot, 0,1,0); // wrist twist
    left_arm_coords = new Matrix4(left_arm_control.matrix);
    left_arm_control.matrix.scale(0.03,0.005,0.015);
    left_arm_control.render();
  
    baseMatrix = left_arm_coords;
    left_arm = new CubeMod(body_color);
    // left_arm.color = body_color;
    left_arm.matrix = baseMatrix;
    left_arm.matrix.translate(0,-0.022, 0);
    left_arm.matrix.scale(0.04,0.06,0.03);
    left_arm.render();
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new Triangle3D(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(-0.7,0, 0);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.scale(1.0,1,0.5);
    left_arm_1.render();
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new Triangle3D(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(0.75,0, 0);
    left_arm_1.matrix.rotate(-90,0,1,0);
    left_arm_1.matrix.scale(1.0,1,0.5);
    left_arm_1.render();
  
    // claws
    for (i = -0.65; i <= 0.65; i += 0.65) {
      baseMatrix = new Matrix4(left_arm.matrix);
      left_arm_1 = new CubeMod([1,1,1,0.8]);
      // left_arm_1.color = [1,1,1,0.8];
      left_arm_1.matrix = baseMatrix;
      left_arm_1.matrix.translate(i,-0.65, 0);
      left_arm_1.matrix.rotate(45, 1,0,0);
      left_arm_1.matrix.scale(0.35,0.75,0.5);
      left_arm_1.render();
    }
  }

  // Right Arm
  {
    let left_arm_control = new CubeMod(body_color);
    // left_arm_control.color = body_color;
    left_arm_control.matrix = new Matrix4(arm_body_matrix);
    left_arm_control.matrix.translate(0.03,0.0, 0.075);
    left_arm_control.matrix.rotate(-30 - ra_sho_mov, 1,0,0);
    left_arm_control.matrix.rotate(-150 - ra_sho_rot, 0,1,0);
    var left_arm_coords = new Matrix4(left_arm_control.matrix);
    left_arm_control.matrix.scale(0.03,0.01,0.03);
    left_arm_control.render();
  
    let left_arm = new CubeMod(body_color);
    // left_arm.color = body_color;
    left_arm.matrix = new Matrix4(left_arm_coords);
    left_arm.matrix.translate(0.0,-0.1, 0);
    left_arm_coords = new Matrix4(left_arm.matrix);
    // left_arm.matrix.rotate(30, 1,0,0);
    left_arm.matrix.scale(0.045,0.2,0.045);
    left_arm.render();
  
    var baseMatrix = new Matrix4(left_arm.matrix);
    var left_arm_1 = new RoundedCube(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.modify_color = false;
    left_arm_1.matrix.translate(0,0,-0.65);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.rotate(90,1,0,0);
    left_arm_1.matrix.rotate(-90,0,0,1);
    left_arm_1.render();
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new RoundedCube(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.modify_color = false;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(0,0,0.65);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.rotate(90,1,0,0);
    left_arm_1.matrix.rotate(90,0,0,1);
    left_arm_1.render();
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new RoundedCube(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.modify_color = false;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(-0.65,0,0);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.rotate(90,1,0,0);
    left_arm_1.matrix.rotate(180,0,0,1);
    left_arm_1.render();
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new RoundedCube(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.modify_color = false;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(0.65,0,0);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.rotate(90,1,0,0);
    left_arm_1.render();
  
    // control point 2
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_control = new CubeMod(body_color);
    // left_arm_control.color = body_color;
    left_arm_control.matrix = new Matrix4(left_arm_coords);
    left_arm_control.matrix.translate(0.0,-0.065, 0.0);
    left_arm_control.matrix.rotate(30 + ra_elb_mov, 0,0,1);
    left_arm_coords = new Matrix4(left_arm_control.matrix);
    left_arm_control.matrix.scale(0.04,0.01,0.04);
    left_arm_control.render();
  
    left_arm = new CubeMod(body_color);
    // left_arm.color = body_color;
    left_arm.matrix = new Matrix4(left_arm_coords);
    left_arm.matrix.translate(0.0,-0.08, 0);
    // left_arm.matrix.rotate(30, 1,0,0);
    left_arm.matrix.scale(0.035,0.2,0.035);
    left_arm.render();
  
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new RoundedCube(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.modify_color = false;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(0,0,-0.65);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.rotate(90,1,0,0);
    left_arm_1.matrix.rotate(-90,0,0,1);
    left_arm_1.render();
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new RoundedCube(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.modify_color = false;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(0,0,0.65);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.rotate(90,1,0,0);
    left_arm_1.matrix.rotate(90,0,0,1);
    left_arm_1.render();
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new RoundedCube(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.modify_color = false;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(-0.65,0,0);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.rotate(90,1,0,0);
    left_arm_1.matrix.rotate(180,0,0,1);
    left_arm_1.render();
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new RoundedCube(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.modify_color = false;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(0.65,0,0);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.rotate(90,1,0,0);
    left_arm_1.render();
  
    // Control Point 3
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_control = new CubeMod(accent_color_yellow);
    // left_arm_control.color = accent_color_yellow;
    left_arm_control.matrix = new Matrix4(left_arm_coords);
    left_arm_control.matrix.translate(0.0,-0.17, 0.0);
    left_arm_control.matrix.rotate(30 - ra_wrt_mov, 1,0,0); // wrist
    left_arm_control.matrix.rotate(30 - ra_wrt_rot, 0,1,0); // wrist twist
    left_arm_coords = new Matrix4(left_arm_control.matrix);
    left_arm_control.matrix.scale(0.03,0.005,0.015);
    left_arm_control.render();
  
    baseMatrix = left_arm_coords;
    left_arm = new CubeMod(body_color);
    // left_arm.color = body_color;
    left_arm.matrix = baseMatrix;
    left_arm.matrix.translate(0,-0.022, 0);
    left_arm.matrix.scale(0.04,0.06,0.03);
    left_arm.render();
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new Triangle3D();
    left_arm_1.color = body_color;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(-0.7,0, 0);
    left_arm_1.matrix.rotate(90,0,1,0);
    left_arm_1.matrix.scale(1.0,1,0.5);
    left_arm_1.render();
  
    baseMatrix = new Matrix4(left_arm.matrix);
    left_arm_1 = new Triangle3D(body_color);
    // left_arm_1.color = body_color;
    left_arm_1.matrix = baseMatrix;
    left_arm_1.matrix.translate(0.75,0, 0);
    left_arm_1.matrix.rotate(-90,0,1,0);
    left_arm_1.matrix.scale(1.0,1,0.5);
    left_arm_1.render();
  
    // claws
    for (i = -0.65; i <= 0.65; i += 0.65) {
      baseMatrix = new Matrix4(left_arm.matrix);
      left_arm_1 = new CubeMod([1,1,1,0.8]);
      // left_arm_1.color = [1,1,1,0.8];
      left_arm_1.matrix = baseMatrix;
      left_arm_1.matrix.translate(i,-0.65, 0);
      left_arm_1.matrix.rotate(45, 1,0,0);
      left_arm_1.matrix.scale(0.35,0.75,0.5);
      left_arm_1.render();
    }
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
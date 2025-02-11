// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_GlobalScaleMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalScaleMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor; // uniform
  uniform sampler2D u_Sampler0;
  uniform int u_WhichTexture;
  void main() {

    if (u_WhichTexture == -2) { // Use color
      gl_FragColor = u_FragColor;

    } else if (u_WhichTexture == -1) { // use uv debug color
      gl_FragColor = vec4(v_UV, 1.0, 1.0);

    } else if (u_WhichTexture == 0) { // use texture0
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }
  }`

// Global variables
let canvas;
let gl;
let a_UV;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_GlobalScaleMatrix;
let u_Sampler0

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

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
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

  // Get the storage location of u_GlobalRotateMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_Sampler
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // Get the storage location of u_Sampler
  u_WhichTexture = gl.getUniformLocation(gl.program, 'u_WhichTexture');
  if (!u_WhichTexture) {
    console.log('Failed to get the storage location of u_WhichTexture');
    return false;
  }

  // set baseline matrix
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

let g_globalXAngle = 0;
let g_globalYAngle = 0;
let g_globalZAngle = 0;
let g_globalScale = 0;

let g_Animation = false;
let g_rotation_factor = 1;
let camera;

function addActionsForHtmlUI() {

  // Button events

  document.getElementById('clear').onclick = function() {  g_shapesList = []; g_vertices = []; renderAllShapes();};
  document.getElementById('resRot').onclick = function() {  g_globalXAngle = 0; g_globalYAngle = 0; g_globalScale = 0; camera.resetView(); renderAllShapes();};
  document.getElementById('topView').onclick = function() {  g_globalXAngle = 90; g_globalYAngle = 0; renderAllShapes();};
  document.getElementById('leftView').onclick = function() {  g_globalXAngle = 0; g_globalYAngle = 90; renderAllShapes();};
  document.getElementById('backView').onclick = function() {  g_globalXAngle = 0; g_globalYAngle = 180; renderAllShapes();};

  document.getElementById('onP').onclick = function() {  g_Animation = true;}
  document.getElementById('offP').onclick = function() {  g_Animation = false;};
  
  // attribute slide events
  document.getElementById('rotationFactor').addEventListener('mousemove', function() { g_rotation_factor = Number(this.value); renderAllShapes(); });

}


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


  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
 
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function initTextures() {
  
  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }

  // Register the event handler to be called on loading an image
  image.onload = function(){ sendTextureToTEXTURE0(image); };
  // Tell the browser to load an image
  image.src = '../img/sky.jpg';

  return true;
}

function sendTextureToTEXTURE0(image) {

  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
  
  // gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 0); // Draw the rectangle
}


var g_shapesList = [];
var g_vertices = [];
var previous_x = 0;
var previous_y = 0;
let startedShake = null;

function click(ev) {

  [x, y] = converCoordinatesEventToGL(ev);

  angleUpdater(x,y, g_rotation_factor);

  //Draw eveyr shape that is supposed to be in the canvas
  renderAllShapes();
}

let keys = {};

function keydown(ev) {
  let key = ev.key;

  keys[key] = true;
  renderAllShapes();
}

function keyup(ev) {
  keys[ev.key] = false;
}

var g_map = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
]

function drawMap() {
  var body = new CubeMod([1,1,1,1]);
  for (x = 0; x < 32; x++) {
    for (y = 0; y < 32; y++) {
      // if (g_map[x][y] == 1) {
      // if (x ==0 || x == 31 || y == 0 || y == 31) {
        // var body = new CubeMod([1,1,1,1]);
        body.textureNum = -2;
        body.color = [x/32, x/64 + y/64, y/64, 1]
        body.matrix.setTranslate(0, -0.25, 0);
        body.matrix.scale(0.5,0.5,0.5)
        // body.matrix.translate(x - 16, 0, y - 16);
        body.matrix.translate(x - 16, Math.abs(y - 16) / 2 + Math.abs(x - 16) / 2, y - 16);
        body.render()

        // var body
      // } 
      // else if (Math.random() < 0.25) {
      //   var body = new CubeMod([1,1,1,1]);
      //   body.textureNum = -2;
      //   body.matrix.translate(0, -0.25, 0);
      //   body.matrix.scale(0.5,0.5,0.5)
      //   body.matrix.translate(x - 16, 0, y - 16);
      //   body.render()
      // }
    }
  }
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

function angleUpdater(x,y, rotationFactor) {

  rotationFactor = rotationFactor * 3;

  // if (previous_x != 0 || previous_y != 0) {

  //   if (x - previous_x > 0) {
  //     g_globalYAngle = (g_globalYAngle + rotationFactor) % 360;
  //   } else if (x - previous_x < 0) {
  //     g_globalYAngle = (g_globalYAngle - rotationFactor) % 360;
  //   }

  //   if (y - previous_y < 0) {
  //     if (Math.abs(g_globalYAngle) < 90 || Math.abs(g_globalYAngle) > 270) {
  //       g_globalXAngle = (g_globalXAngle + rotationFactor) % 360;
  //     } else { 
  //       g_globalXAngle = (g_globalXAngle - rotationFactor) % 360;
  //     }
  //   } else if (y - previous_y > 0) {
  //     if (Math.abs(g_globalYAngle) < 90 || Math.abs(g_globalYAngle) > 270) {
  //       g_globalXAngle = (g_globalXAngle - rotationFactor) % 360;
  //     } else { 
  //       g_globalXAngle = (g_globalXAngle + rotationFactor) % 360;
  //     }
  //   }

  //   previous_x = x;
  //   previous_y = y;
  // }


  if (previous_x != 0 || previous_y != 0) {

    if (x - previous_x > 0) {
      camera.panHorizontal(-1);
    } else if (x - previous_x < 0) {
      camera.panHorizontal(1);
    }

    if (y - previous_y > 0) {
      camera.panVertical(1);
    } else if (y - previous_y < 0) {
      camera.panVertical(-1);
    }

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

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  // canvas.onmousemove = click;
  canvas.onmousemove = function(ev) {if (ev.buttons == 1) {click(ev)}};

  canvas.onwheel = function(ev) {
    ev.preventDefault(); // Prevent page scrolling
    handleScroll(ev);
  };

  if (keys["w"]) {
    camera.moveZAxis(1);
  } 
  if (keys["s"]) {
    camera.moveZAxis(-1);
  } 
  if (keys["a"]) {
    camera.moveHorizontal(1);
  } 
  if (keys["d"]) {
    camera.moveHorizontal(-1);
  }
  if (keys["q"]) {
    camera.panHorizontal(1);
  }
  if (keys["e"]) {
    camera.panHorizontal(-1);
  }
  if (keys["z"]) {
    camera.panVertical(1);
  }
  if (keys["x"]) {
    camera.panVertical(-1);
  }

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

// var g_eye = [0,0,-3];
// var g_at = [0,0,100];
// var g_up = [0,1,0];

function renderAllShapes() {

  var startTime = performance.now();

  // camera.moveZAxis(1); // Forward
  // camera.moveZAxis(-1); // Back
  // camera.moveHorizontal(1); // Left
  // camera.moveHorizontal(-1); // Right

  // camera.panVertical(-1);

  // Pass the projection matrix
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projMat.elements);
  
  // Pass the view matrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMat.elements);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var globalRotMat = new Matrix4().rotate(-g_globalYAngle, 0, 1, 0);
  globalRotMat = globalRotMat.rotate(-g_globalXAngle, 1, 0, 0);
  globalRotMat = globalRotMat.rotate(-g_globalZAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements)

  var globalScaMat = new Matrix4().scale(1 + g_globalScale, 1 + g_globalScale, 1 + g_globalScale);
  gl.uniformMatrix4fv(u_GlobalScaleMatrix, false, globalScaMat.elements);

  drawMap();
  
  var platform = new CubeMod([0.47, 0.31, 0.66, 1]);
  platform.matrix.translate(0.0, -0.5, 0.0);
  platform.matrix.scale(10,0.0,10);
  platform.textureNum = 0;
  platform.render();

  var skybox = new CubeMod([0.47, 0.31, 0.66, 1]);
  skybox.matrix.scale(50,50,50);
  skybox.textureNum = 0;
  skybox.render();

  var cub = new CubeMod([1,1,1,1]);
  cub.textureNum = -1;
  cub.render()



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
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
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor; // uniform
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform sampler2D u_Sampler5;
  uniform sampler2D u_Sampler6;
  uniform sampler2D u_Sampler7;
  uniform sampler2D u_Sampler8;
  uniform sampler2D u_Sampler9;
  uniform sampler2D u_Sampler10;
  uniform sampler2D u_Sampler11;
  uniform sampler2D u_Sampler12;
  uniform sampler2D u_Sampler13;
  uniform int u_WhichTexture;

  void main() {

    if (u_WhichTexture == -2) { // Use color
      gl_FragColor = u_FragColor;

    } else if (u_WhichTexture == -1) { // use uv debug color
      gl_FragColor = vec4(v_UV, 1.0, 1.0);

    } else if (u_WhichTexture == 0) { // use sky
      gl_FragColor = texture2D(u_Sampler0, v_UV);

    } else if (u_WhichTexture == 1) { // use starry_sky_blue
      gl_FragColor = texture2D(u_Sampler1, v_UV);

    } else if (u_WhichTexture == 2) { // use starry_sky
      gl_FragColor = texture2D(u_Sampler2, v_UV);

    } else if (u_WhichTexture == 3) { // use floor
      vec4 texColor = texture2D(u_Sampler3, v_UV);
      gl_FragColor = texColor;

    } else if (u_WhichTexture == 4) { // use wall_1
      vec4 texColor = texture2D(u_Sampler4, v_UV);
      gl_FragColor = texColor;

    } else if (u_WhichTexture == 5) { // use horizontal stairs
      vec4 texColor = texture2D(u_Sampler5, v_UV);
      gl_FragColor = texColor;

    } else if (u_WhichTexture == 6) { // use zombie_man
      vec4 texColor = texture2D(u_Sampler6, v_UV);
      if (texColor.a < 0.1) discard; // Discard fully transparent pixels
      gl_FragColor = texColor;
    
    } else if (u_WhichTexture == 7) { // use zombie_man_death
      vec4 texColor = texture2D(u_Sampler7, v_UV);
      if (texColor.a < 0.1) discard; // Discard fully transparent pixels
      gl_FragColor = texColor;
    
    } else if (u_WhichTexture == 8) { // use cieling_1
      vec4 texColor = texture2D(u_Sampler8, v_UV);
      gl_FragColor = texColor;

    } else if (u_WhichTexture == 9) { // use vertical stairs
      vec4 texColor = texture2D(u_Sampler9, v_UV);
      gl_FragColor = texColor;

    } else if (u_WhichTexture == 10) { // use cyber_demon
      vec4 texColor = texture2D(u_Sampler10, v_UV);
      if (texColor.a < 0.1) discard; // Discard fully transparent pixels
      gl_FragColor = texColor;

    } else if (u_WhichTexture == 11) { // use cyber_demon death
      vec4 texColor = texture2D(u_Sampler11, v_UV);
      if (texColor.a < 0.1) discard; // Discard fully transparent pixels
      gl_FragColor = texColor;

    } else if (u_WhichTexture == 12) { // use health pack
      vec4 texColor = texture2D(u_Sampler12, v_UV);
      if (texColor.a < 0.1) discard; // Discard fully transparent pixels
      gl_FragColor = texColor;

    } else if (u_WhichTexture == 13) { // use ammo pack
      vec4 texColor = texture2D(u_Sampler13, v_UV);
      if (texColor.a < 0.1) discard; // Discard fully transparent pixels
      gl_FragColor = texColor;

    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }
  }`

// Global variables
let canvas, hud;
let gl, ctx;
let a_UV;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_Sampler0, u_Sampler1, u_Sampler2, u_Sampler3, u_Sampler4, u_Sampler5, u_Sampler6, u_Sampler7;
let u_Sampler8, u_Sampler9, u_Sampler10, u_Sampler11, u_Sampler12, u_Sampler13;
var crosshair, shotgun, pistol, health, ammo, BlockSelected;

function setupWebGL() {
    // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  hud = document.getElementById('hud');  

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  ctx = hud.getContext('2d');
  if (!gl || !ctx) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  crosshair = new Crosshair();
  shotgun = new Shotgun();
  pistol = new Pistol();
  health = new Health();
  ammo = new Ammo();
  BlockSelected = new BlockSelect();

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function draw2D(ctx, currentAngle) {
  ctx.clearRect(0, 0, 400, 400); // Clear <hud>
  // Draw triangle with white lines
  ctx.beginPath();                      // Start drawing
  ctx.moveTo(120, 10); ctx.lineTo(200, 150); ctx.lineTo(40, 150);
  ctx.closePath();
  ctx.strokeStyle = 'rgba(255, 255, 255, 1)'; // Set white to color of lines
  ctx.stroke();                           // Draw Triangle with white lines
  // Draw white letters
  ctx.font = '18px "Times New Roman"';
  ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Set white to the color of letters
  ctx.fillText('HUD: Head Up Display', 40, 180); 
  ctx.fillText('Triangle is drawn by Canvas 2D API.', 40, 200); 
  ctx.fillText('Cube is drawn by WebGL API.', 40, 220); 
  ctx.fillText('Current Angle: '+ Math.floor(currentAngle), 40, 240); 
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

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  // Get the storage location of u_Sampler2
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  // Get the storage location of u_Sampler3
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return false;
  }

  // Get the storage location of u_Sampler4
  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4) {
    console.log('Failed to get the storage location of u_Sampler4');
    return false;
  }

  // Get the storage location of u_Sampler5
  u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
  if (!u_Sampler5) {
    console.log('Failed to get the storage location of u_Sampler5');
    return false;
  }

  // Get the storage location of u_Sampler6
  u_Sampler6 = gl.getUniformLocation(gl.program, 'u_Sampler6');
  if (!u_Sampler6) {
    console.log('Failed to get the storage location of u_Sampler6');
    return false;
  }

  // Get the storage location of u_Sampler7
  u_Sampler7 = gl.getUniformLocation(gl.program, 'u_Sampler7');
  if (!u_Sampler7) {
    console.log('Failed to get the storage location of u_Sampler7');
    return false;
  }
  
  // Get the storage location of u_Sampler8
  u_Sampler8 = gl.getUniformLocation(gl.program, 'u_Sampler8');
  if (!u_Sampler8) {
    console.log('Failed to get the storage location of u_Sampler8');
    return false;
  }

  // Get the storage location of u_Sampler9
  u_Sampler9 = gl.getUniformLocation(gl.program, 'u_Sampler9');
  if (!u_Sampler9) {
    console.log('Failed to get the storage location of u_Sampler9');
    return false;
  }

  // Get the storage location of u_Sampler10
  u_Sampler10 = gl.getUniformLocation(gl.program, 'u_Sampler10');
  if (!u_Sampler10) {
    console.log('Failed to get the storage location of u_Sampler10');
    return false;
  }

  // Get the storage location of u_Sampler11
  u_Sampler11 = gl.getUniformLocation(gl.program, 'u_Sampler11');
  if (!u_Sampler11) {
    console.log('Failed to get the storage location of u_Sampler11');
    return false;
  }

  // Get the storage location of u_Sampler12
  u_Sampler12 = gl.getUniformLocation(gl.program, 'u_Sampler12');
  if (!u_Sampler12) {
    console.log('Failed to get the storage location of u_Sampler12');
    return false;
  }

  // Get the storage location of u_Sampler11
  u_Sampler13 = gl.getUniformLocation(gl.program, 'u_Sampler13');
  if (!u_Sampler13) {
    console.log('Failed to get the storage location of u_Sampler13');
    return false;
  }

  // Get the storage location of u_WhichTexture
  u_WhichTexture = gl.getUniformLocation(gl.program, 'u_WhichTexture');
  if (!u_WhichTexture) {
    console.log('Failed to get the storage location of u_WhichTexture');
    return false;
  }

  // set baseline matrix
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

let g_Animation = false;
let g_rotation_factor = 1;
let camera;

function addActionsForHtmlUI() {

  // Button events
  document.getElementById('restart').onclick = function() {  restart();};
  document.getElementById('resRot').onclick = function() {  camera.resetView();};
  document.getElementById('onP').onclick = function() {  g_Animation = !g_Animation;}
  document.getElementById('playground').onclick = function() {  playgroundMode();}


}
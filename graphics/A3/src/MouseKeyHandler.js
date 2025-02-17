function mouseHandler() {
    // Register function (event handler) to be called on a mouse press
    hud.onmousedown = click;
  
    hud.onmousemove = function(ev) {mouseMove(ev)};
  
    // canvas.onwheel = function(ev) {
    //   ev.preventDefault(); // Prevent page scrolling
    //   handleScroll(ev);
    // };
  }
  
  function keydown(ev) {
    let key = ev.key;
  
    keys[key] = true;
    renderAllShapes();
  }
  
  function keyup(ev) {
    keys[ev.key] = false;
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
  
  function click(ev) {
  
    // [x, y] = converCoordinatesEventToGL(ev);
  
    // angleUpdater(x,y, g_rotation_factor, ev);
  
  
    if (document.pointerLockElement === hud) {
      if (ev.buttons === 1 && camera.ammo > 0) {
        if (!shotgun.shooting) {
          initalizeTargetVec(0);
          camera.ammo -= 1;
        }
        shotgun.startAnimation();
      } else if (ev.buttons === 2) {
        initalizeTargetVec(1);
      }
    }
  
    hud.requestPointerLock();
  
    //Draw eveyr shape that is supposed to be in the canvas
    renderAllShapes();
  }
  
  function mouseMove(ev) {
  
    if (ev.buttons === 1) {
      initalizeTargetVec(0);
    } else if (ev.buttons === 2) {
      initalizeTargetVec(1);
    }
  
    target_vectors = camera.clickTarget();
  
    if (document.pointerLockElement === hud) {
      if (ev.movementX > 0) {
        camera.panHorizontal(-1, ev.movementX);
      } else if (ev.movementX < 0) {
        camera.panHorizontal(1, ev.movementX);
      }
    
      if (ev.movementY > 0) {
        camera.panVertical(-1, ev.movementY);
      } else if (ev.movementY < 0) {
        camera.panVertical(1, ev.movementY);
      }
    }
  }
  
  // function converCoordinatesEventToGL(ev) {
  //   var x = ev.clientX; // x coordinate of a mouse pointer
  //   var y = ev.clientY; // y coordinate of a mouse pointer
  //   var rect = ev.target.getBoundingClientRect();
  
  //   x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  //   y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  
  //   return([x,y]);
  
  // }
  
  function keyHandler() {
    if (keys["Escape"] && document.pointerLockElement === hud) {
      // Exit pointer lock on ESC key
      document.exitPointerLock();
    }
  
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
    // if (keys["q"]) {
    //   camera.panHorizontal(1);
    // }
    // if (keys["e"]) {
    //   camera.panHorizontal(-1);
    // }
    // if (keys["z"]) {
    //   camera.panVertical(1);
    // }
    // if (keys["x"]) {
    //   camera.panVertical(-1);
    // }
    if (keys["o"]) {
      camera.moveYAxis(1);
    }
    if (keys["p"]) {
      camera.moveYAxis(-1);
    }
  }
class Camera {
  constructor() {
    this.type = 'camera';
    this.projMat = new Matrix4();
    this.viewMat = new Matrix4();
    this.startingHeight = 0.6;
    this.g_eye = [0,this.startingHeight,-4.5];
    this.g_at = [0,this.startingHeight,95.5];
    this.g_up = [0,1,0];
    this.speed = 0.25;
    this.cameraSpeed = 1.25;
    this.targetThreshold = 6;
    this.actualHeight = this.startingHeight;
    this.health = 50;
    this.lastDamageTime = 0;
    this.ammo = 20;

    this.projMat.setPerspective(60, canvas.width/canvas.height, 0.01, 200);
    this.projMat.scale(-1, 1, 1); // Flip X-axis back

    this.viewMat.setLookAt(...this.g_eye, ...this.g_at, ...this.g_up); // (eye, at, up)

    this.hurt = new Audio("../sounds/dsoof.wav"); // Change path if needed
    this.hurt.volume = 0.5; // Adjust volume if necessary
  }

  damagePlayer(enemyDamage, enemyPos) {
    
    var d = new Vector3([enemyPos[0], 0, enemyPos[2]]);
    var player = new Vector3([this.g_eye[0], 0, this.g_eye[2]]);

    d.sub(player);

    var distance = d.magnitude();

    let damageCooldown = 0.5; 

    if (distance < 0.3 && g_seconds - this.lastDamageTime > damageCooldown) {
      this.health -= enemyDamage;
      this.lastDamageTime = g_seconds;
      this.hurt.currentTime = 0; // Reset sound to start
      this.hurt.play(); // Play sound on firing
    }
  }

  clickTarget() {
    var d = new Vector3(this.g_at);
    var vg_eye = new Vector3(this.g_eye);

    d.sub(vg_eye);

    d.normalize();

    var target_vectors = []

    var temp = new Vector3(d.elements);

    // Doubled temp and reduced mul factor to account for halved cubes
    for (var i = 0; i < this.targetThreshold * 2; i++ ) {
      target_vectors[i] = temp.mul(0.5 * (i + 1)).elements;
      temp = new Vector3(d.elements);
    }

    return target_vectors;
  }

  resetView() {
    this.g_eye = [0,this.startingHeight,-4.5];
    this.g_at = [0,this.startingHeight,95.5];

    this.viewMat.setLookAt(...this.g_eye, ...this.g_at, ...this.g_up); // (eye, at, up)
  }

  mapCheck(c) {
    var c_Xcoords = Math.round(c[0] * 2);
    var c_Zcoords = Math.round(c[2] * 2);

    // console.log( mapMatrix[c_Xcoords + 50][c_Zcoords + 50]);

    var map_output_1 = mapMatrix[c_Xcoords + 100][c_Zcoords + 100][0];
    var map_output_2 = mapMatrix[c_Xcoords + 100][c_Zcoords + 100][1];

    if (map_output_1 === 1 
        && map_output_2[0] < this.g_eye[1] 
        && map_output_2[1] > this.g_eye[1]) {

      this.g_eye[1] = this.actualHeight;
      this.g_eye[1] += this.speed * Math.abs(Math.sin(2 * g_seconds * Math.PI));

      this.viewMat.setLookAt(...this.g_eye, ...this.g_at, ...this.g_up); // (eye, at, up)

      return null;

    } else if (map_output_1 === 0
      && Math.abs(map_output_2 - this.actualHeight) < 0.5) {

      let targetHeight = map_output_2; // reset to base height
      let stepSpeed = 0.5; // Speed of transition (adjust as needed)

      // Smoothly interpolate height
      this.actualHeight += (targetHeight - this.actualHeight) * stepSpeed;
      return 1;
    }
  }

  moveZAxis(direction) {

    var vg_at = new Vector3(this.g_at);
    var d = new Vector3(this.g_at);
    var vg_eye = new Vector3(this.g_eye);

    d.sub(vg_eye);

    d.elements[1] = 0;
    d.normalize();
    
    // positive is forward
    d.mul(direction * this.speed);

    var c = vg_eye.add(d).elements;

    if (this.mapCheck(c) === null) {
      return;
    }

    this.g_eye = c;
    this.g_at = vg_at.add(d).elements;

    this.g_eye[1] = this.actualHeight;
    this.g_eye[1] += this.speed * Math.abs(Math.sin(2 * g_seconds * Math.PI));

    // console.log(this.g_eye[1]);

    this.viewMat.setLookAt(...this.g_eye, ...this.g_at, ...this.g_up); // (eye, at, up)

    // console.log(Math.round(this.g_eye[0] * 2) / 2, Math.round(this.g_eye[2] * 2) / 2);
  }

  moveYAxis(direction) {

    this.g_eye[1] += direction * this.speed;
    this.g_at[1] += direction * this.speed;
    this.actualHeight = this.g_eye[1];

    this.viewMat.setLookAt(...this.g_eye, ...this.g_at, ...this.g_up); // (eye, at, up)
  }

  moveHorizontal(direction) {

    var vg_at = new Vector3(this.g_at);
    var d = new Vector3(this.g_at);
    var vg_eye = new Vector3(this.g_eye);
    var vg_up = new Vector3(this.g_up);


    d.sub(vg_eye);
    
    var ortho_v = Vector3.cross(d, vg_up);

    ortho_v.normalize();

    // positive is left
    ortho_v.mul(direction * this.speed);
    ortho_v.elements[1] = 0;

    var c = vg_eye.add(ortho_v).elements;

    if (this.mapCheck(c) === null) {
      return;
    }

    this.g_eye = c;
    this.g_at = vg_at.add(ortho_v).elements;

    this.g_eye[1] = this.actualHeight;
    this.g_eye[1] += this.speed * Math.abs(Math.sin(2 * g_seconds * Math.PI));

    this.viewMat.setLookAt(...this.g_eye, ...this.g_at, ...this.g_up); // (eye, at, up)
    // console.log(Math.round(this.g_eye[0] * 2) / 2, Math.round(this.g_eye[2] * 2) / 2);
  }

  panHorizontal(direction, speed) {
    var d = new Vector3(this.g_at);
    var vg_eye = new Vector3(this.g_eye);

    d.sub(vg_eye);

    var radius = Math.sqrt(d.elements[0] ** 2 + d.elements[2]**2)

    var theta = Math.atan2(d.elements[2], d.elements[0]);

    // positive is left
    theta = theta + direction * this.cameraSpeed * Math.abs(speed) / 10 * (Math.PI / 180);

    var new_x = radius * Math.cos(theta);
    var new_z = radius * Math.sin(theta);

    d = new Vector3 ([new_x, d.elements[1], new_z]);

    this.g_at = vg_eye.add(d).elements;

    this.viewMat.setLookAt(...this.g_eye, ...this.g_at, ...this.g_up); // (eye, at, up)

  }

  // fix it
  panVertical(direction, speed) {

    var d = new Vector3(this.g_at);
    var vg_eye = new Vector3(this.g_eye);

    d.sub(vg_eye);

    var radius = d.magnitude();
    var radiusXZ = Math.sqrt(d.elements[0] ** 2 + d.elements[2]**2);

    var theta = Math.atan2(d.elements[1], radiusXZ);

    // positive is up
    theta = theta + direction * this.cameraSpeed * Math.abs(speed) / 10 * (Math.PI / 180);

    // Clamp theta between -90 and 90 degrees
    theta = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, theta));

    d.elements[1] = radius * Math.sin(theta);
    var new_radiusXZ = radius * Math.cos(theta);

    d.elements[0] *= new_radiusXZ / radiusXZ
    d.elements[2] *= new_radiusXZ / radiusXZ

    this.g_at = vg_eye.add(d).elements;

    this.viewMat.setLookAt(...this.g_eye, ...this.g_at, ...this.g_up); // (eye, at, up)

  }
}
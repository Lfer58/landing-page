class Camera {
  constructor() {
    this.type = 'camera';
    this.projMat = new Matrix4();
    this.viewMat = new Matrix4();
    this.g_eye = [0,0,-5];
    this.g_at = [0,0,95];
    this.g_up = [0,1,0];
    this.speed = 0.05;
    this.cameraSpeed = 1.5;

    this.projMat.setPerspective(90, canvas.width/canvas.height, 1, 100);
    this.projMat.scale(-1, 1, 1); // Flip X-axis back

    this.viewMat.setLookAt(...this.g_eye, ...this.g_at, ...this.g_up); // (eye, at, up)
  }

  resetView() {
    this.g_eye = [0,0,-5];
    this.g_at = [0,0,100];
    this.g_up = [0,1,0];

    this.viewMat.setLookAt(...this.g_eye, ...this.g_at, ...this.g_up); // (eye, at, up)
  }

  moveZAxis(direction) {

    var vg_at = new Vector3(this.g_at);
    var d = new Vector3(this.g_at);
    var vg_eye = new Vector3(this.g_eye);


    d.sub(vg_eye);

    d.normalize();
    
    // positive is forward
    d.mul(direction * this.speed);

    this.g_eye = vg_eye.add(d).elements;
    this.g_at = vg_at.add(d).elements;

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


    this.g_eye = vg_eye.add(ortho_v).elements;
    this.g_at = vg_at.add(ortho_v).elements;

    this.viewMat.setLookAt(...this.g_eye, ...this.g_at, ...this.g_up); // (eye, at, up)
  }

  panHorizontal(direction) {
    var d = new Vector3(this.g_at);
    var vg_eye = new Vector3(this.g_eye);

    d.sub(vg_eye);

    var radius = Math.sqrt(d.elements[0] ** 2 + d.elements[2]**2)

    var theta = Math.atan2(d.elements[2], d.elements[0]);

    // positive is left
    theta = theta + direction * this.cameraSpeed * (Math.PI / 180);

    var new_x = radius * Math.cos(theta);
    var new_z = radius * Math.sin(theta);

    d = new Vector3 ([new_x, this.g_at[1], new_z]);

    this.g_at = vg_eye.add(d).elements;

    console.log(this.g_at);

    this.viewMat.setLookAt(...this.g_eye, ...this.g_at, ...this.g_up); // (eye, at, up)

  }

  // fix it
  panVertical(direction) {

    var d = new Vector3(this.g_at);
    var vg_eye = new Vector3(this.g_eye);

    d.sub(vg_eye);

    var radius = Math.sqrt(d.elements[0] ** 2 + d.elements[1] ** 2 + d.elements[2]**2)
    var radiusXZ = Math.sqrt(d.elements[0] ** 2 + d.elements[2]**2)

    var theta = Math.atan2(d.elements[1], radiusXZ);

    // positive is up
    theta = theta + direction * this.cameraSpeed * (Math.PI / 180);

    // Clamp theta between -90 and 90 degrees
    theta = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, theta));

    d.elements[1] = radius * Math.sin(theta);
    var new_radiusXZ = radius * Math.cos(theta);

    d.elements[0] *= new_radiusXZ / radiusXZ
    d.elements[2] *= new_radiusXZ / radiusXZ

    console.log("d", d.elements);

    this.g_at = vg_eye.add(d).elements;

    this.viewMat.setLookAt(...this.g_eye, ...this.g_at, ...this.g_up); // (eye, at, up)

  }
}
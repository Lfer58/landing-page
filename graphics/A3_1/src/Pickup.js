class Pickup {
  constructor(position, scale, textureNum) {
    this.cornerPos = position;
    this.scale = scale;
    this.textureNum = textureNum;

    this.monster = new CubeMod_Rep(base_color, 1.0, 1, 0, 1, this.textureNum);
    this.center = centerFind(this.cornerPos, this.scale);
  }

  render() {
    let dx = camera.g_eye[0] - this.center[0];
    let dz = camera.g_eye[2] - this.center[2];
    let angle = Math.atan2(dx, dz) * (180 / Math.PI);

    this.monster.matrix.setTranslate(...this.center);
    this.monster.matrix.rotate(angle, 0, 1, 0);
    this.monster.matrix.scale(...this.scale);
    this.monster.render();
  }
}
  
class Monster {
  constructor(position, track_form, index, health, height_basis, 
      color, scale, sight, speed, damage, top, bottom, textureNum) {
    this.track_form = track_form;
    this.cornerPos = position;
    this.index = index;
    this.scale = scale;
    this.sight = sight;
    this.speed = speed;
    this.damage = damage;
    this.health = health;
    this.textureNum = textureNum;
    this.height_basis = height_basis;

    this.monster = new CubeMod_Rep(color, 1.0, 1, 0, 1, this.textureNum);
    this.center = centerFind(this.cornerPos, this.scale);

    currentPos[index] = [...this.center];
    currentPos[index][1] = height_basis;
    // sets how far up we need to look for while killing enemies
    currentPos[index][4] = top;
    // sets how far down we need to look for while killing enemies
    currentPos[index][5] = bottom;

    if (prevPos.length > 0 && mapMatrix[prevPos[index][0]][prevPos[index][1]][1] === 0) {
      this.health -= 25;
      monsterHealth[index] -= 25;
      monsterPos[index][1] *= 2;
      console.log(this.health);
    }
  }

  render() {
    let dx = camera.g_eye[0] - this.center[0];
    let dz = camera.g_eye[2] - this.center[2];
    let angle = Math.atan2(dx, dz) * (180 / Math.PI); 

    if (this.health > 0) {
      this.track();
    } else {
      this.monster.textureNum = this.textureNum + 1;
    }

    this.monster.matrix.setTranslate(...this.center);
    this.monster.matrix.rotate(angle, 0, 1, 0);
    this.monster.matrix.scale(...this.scale);
    this.monster.render();
  }

  track() {

    if (Math.abs(this.height_basis - camera.actualHeight) > 0.76) {
      return;
    }

    let dx = camera.g_eye[0] - this.center[0];
    let dz = camera.g_eye[2] - this.center[2];

    var d = new Vector3([dx, 0, dz]);
    d.normalize();

    if (this.track_form == 0) {
      if (Math.abs(dz) < this.sight && Math.abs(dx) < this.sight) {
        this.move(d);
      }

    } else if (this.track_form == 1) {

      if (Math.abs(dz) < this.sight && Math.abs(dx) < 2) {
        this.move(d);
      }

    } else if (this.track_form == 2) {
      if (Math.abs(dx) < this.sight && Math.abs(dz) < 2) {
        this.move(d);
      }
    }
  }

  move(d) {

    this.center[0] += this.speed * d.elements[0];
    this.center[2] += this.speed * d.elements[2];
    monsterPos[this.index][0][0] += this.speed * d.elements[0];
    monsterPos[this.index][0][2] += this.speed * d.elements[2];
  }
}
  
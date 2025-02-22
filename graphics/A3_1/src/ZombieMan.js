class ZombieMan {

  constructor(position, track_form, index, health, height_basis) {

    this.track_form = track_form;
    this.cornerPos = position;
    this.zomIndex = index;
    this.scale = [1.0, 1.5, 0];
    this.monster = new CubeMod_Rep(yellow_hue, 1.0, 1, 0, 1, 6);
    this.center = centerFind(this.cornerPos, this.scale);
    this.sight = 5;
    this.speed = 0.05;
    this.damage = 5;
    this.health = health;
    // console.log(this.center);

    currentPos[index] = [...this.center];
    currentPos[index][1] = height_basis;
    if (prevPos.length > 0 && mapMatrix[prevPos[index][0]][prevPos[index][1]][1] === 0) {
      this.health -= 10;
      zombieHealth[index] -= 10;
      console.log(this.health);
    }
  }

  render() {

    // vector from zombie to player
    let dx = camera.g_eye[0] - this.center[0];
    let dz = camera.g_eye[2] - this.center[2];
    let angle = Math.atan2(dx, dz) * (180 / Math.PI); 

    if (this.health > 0) {
      this.track(this.center);
    } else {
      this.monster.textureNum = 7;
    }

    this.monster.matrix.setTranslate(...this.center);

    this.monster.matrix.rotate(angle,0,1,0);
    this.monster.matrix.scale(...this.scale);
    this.monster.render();
  }

  track() {

    let dx = camera.g_eye[0] - this.center[0];
    let dz = camera.g_eye[2] - this.center[2];

    var d = new Vector3([dx, 0, dz]);
    d.normalize();

    if (this.track_form == 0) {

    } else if (this.track_form == 1) {

      if (Math.abs(dz) < this.sight) {
        this.center[0] += this.speed * d.elements[0];
        this.center[2] += this.speed * d.elements[2];
        zombiePos[this.zomIndex][0] += this.speed * d.elements[0];
        zombiePos[this.zomIndex][2] += this.speed * d.elements[2];
      }

    } else if (this.track_form == 2) {
      if (Math.abs(dx) < this.sight) {
        this.center[0] += this.speed * d.elements[0];
        this.center[2] += this.speed * d.elements[2];
        zombiePos[this.zomIndex][0] += this.speed * d.elements[0];
        zombiePos[this.zomIndex][2] += this.speed * d.elements[2];
      }
    }
  }
}
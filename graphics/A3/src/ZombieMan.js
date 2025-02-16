class ZombieMan {

  constructor(position, track_form) {

    this.track_form = track_form;
    this.cornerPos = position;
    this.scale = [1.0, 1.5, 0];
    this.monster = new CubeMod_Rep(yellow_hue, 1.0, 1, 0, 1, 6);
    this.sight = 5;
    this.speed = 0.001;
    this.damage = 5;
    this.health = 50;
    console.log(this.monster.matrix);
  }

  render() {

    let center = centerFind(this.cornerPos, this.scale);

    // vector from zombie to player
    let dx = camera.g_eye[0] - center[0];
    let dz = camera.g_eye[2] - center[2];
    let angle = Math.atan2(dx, dz) * (180 / Math.PI); 

    // center = this.track(center);
    // this.cornerPos = center;

    this.monster.matrix.setTranslate(...center);

    this.monster.matrix.rotate(angle,0,1,0);
    this.monster.matrix.scale(...this.scale);
    this.monster.render();
  }

  track(center) {

    let dx = camera.g_eye[0] - center[0];
    let dz = camera.g_eye[2] - center[2];

    var d = new Vector3([dx, 0, dz]);
    d.normalize();

    if (this.track_form == 0) {

    } else if (this.track_form == 1) {

      if (dx < this.sight) {
        center[0] += this.speed * d.elements[0];
        center[2] += this.speed * d.elements[2];
      }

    } else if (this.track_form == 2) {
      
    }

    return center;
  }
}
class CyberDemon extends Monster {
    constructor(position, sight, track_form, height_basis, index, health) {
      // extra parameters are: scale, sight, speed, damage, height (top/bottom), texture
      super(position, track_form, index, health, height_basis, 
        yellow_hue, [1.5, 2.2, 0], sight, 0.1, 10, 1.1, 1.1, 10);
    }
  }
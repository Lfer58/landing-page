class ZombieMan extends Monster {
  constructor(position, sight, track_form, height_basis, index, health) {

    super(position, track_form, index, health, height_basis, 
      yellow_hue, [1.0, 1.5, 0], sight, 0.05, 5, 0.4, 1.1, 6, 0);
  }
}
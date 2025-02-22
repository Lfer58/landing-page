class Pistol {
    constructor() {
        this.frames = [
            "../img/weapons/pistol/PISFD0.png",
            "../img/weapons/pistol/PISFA0.png",
            "../img/weapons/pistol/PISFB0.png",
            "../img/weapons/pistol/PISFC0.png"
        ];
        this.currentFrame = 0;
        this.lastLoad = 0;
        this.images = [];
        this.fps = 0.1;
        this.isAnimating = false;

        // Preload all images to avoid flashing
        for (let src of this.frames) {
            let img = new Image();
            img.src = src;
            this.images.push(img);
        }
    }

    startAnimation() {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.currentFrame = 0;
            this.lastLoad = g_seconds;
        }
    }

    cycle() {
        if (!this.isAnimating) return;

        if (g_seconds - this.lastLoad > this.fps) {
            ctx.clearRect(400 - 150, 400 + 100, 300, 300);

            let img = this.images[this.currentFrame];
            ctx.drawImage(img, 400 - 150, 400 + 100, 300, 300);

            this.currentFrame++;

            if (this.currentFrame >= this.frames.length) {
                this.isAnimating = false; // Stop animation after the last frame
            }

            this.lastLoad = g_seconds;
        }
    }
}

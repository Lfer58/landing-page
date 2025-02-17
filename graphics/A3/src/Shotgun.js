class Shotgun {
    constructor() {
        this.frames = [
            "../img/weapons/shotgun/SHTFC0.png",
            "../img/weapons/shotgun/SHTFB0.png",
            "../img/weapons/shotgun/SHTFA0.png",
            "../img/weapons/shotgun/SHTFD0.png",
            "../img/weapons/shotgun/SHTFC0.png"
        ];
        this.currentFrame = 0;
        this.lastLoad = 0;
        this.images = [];
        this.fps = 0.1;
        this.isAnimating = false;
        this.shooting = false;

        // Preload all images to avoid flashing
        for (let src of this.frames) {
            let img = new Image();
            img.src = src;
            this.images.push(img);
        }

        this.shotSound = new Audio("../sounds/doom_shotgun.mp3"); // Change path if needed
        this.shotSound.volume = 0.5; // Adjust volume if necessary
    }

    startAnimation() {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.currentFrame = 0;
            this.lastLoad = g_seconds;
            this.shooting = true;
            this.shotSound.currentTime = 0; // Reset sound to start
            this.shotSound.play(); // Play sound on firing
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
                this.shooting = false;
            }

            this.lastLoad = g_seconds;
        }
    }
}

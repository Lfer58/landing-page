class BlockSelect {
    constructor() {
        this.frames = [
            '../img/sky/starry_sky.png',
            '../img/sky/starry_sky1.png',
            '../img/floor/SDFLTAC.png',
            '../img/walls/SPACECL.png',
            '../img/stairs/SPACEAP.png',
            '../img/ceiling/SDFLTBB.png',
            '../img/stairs/SPACEAP_V.png'
        ];

        this.images = [];
        this.c_midx = canvas.width / 2;
        this.c_midy = canvas.height / 2;

        // Preload all images to avoid flashing
        for (let src of this.frames) {
            let img = new Image();
            img.src = src;
            this.images.push(img);
        }
    }

    render(index) {
        let img = this.images[index - 1];
        let x = this.c_midx - 500;
        let y = this.c_midy + 200;
        let width = 100;
        let height = 100;
    
        // Define padding for the background box
        let padding = 10;
    
        // Clear previous content
        ctx.clearRect(x - padding, y - padding, width + padding * 2, height + padding * 2);

        ctx.clearRect(x + 100, y - 100, 800, 500);
    
        // Draw semi-transparent gray background
        ctx.fillStyle = "rgba(100, 100, 100, 0.5)";  // Gray with 50% transparency
        ctx.fillRect(x - padding, y - padding, width + padding * 2, height + padding * 2);
    
        // Draw the image
        ctx.drawImage(img, x, y, width, height);
    
        // Draw white border
        ctx.strokeStyle = "rgba(21, 21, 21, 0.5)";  // Set border color
        ctx.lineWidth = 3;          // Set border thickness
        ctx.strokeRect(x - padding, y - padding, width + padding * 2, height + padding * 2);
    }
}

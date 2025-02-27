class Health {
    constructor() {
        this.frames = [
            "../img/hud_elements/numbers/STTNUM0.png",
            "../img/hud_elements/numbers/STTNUM1.png",
            "../img/hud_elements/numbers/STTNUM2.png",
            "../img/hud_elements/numbers/STTNUM3.png",
            "../img/hud_elements/numbers/STTNUM4.png",
            "../img/hud_elements/numbers/STTNUM5.png",
            "../img/hud_elements/numbers/STTNUM6.png",
            "../img/hud_elements/numbers/STTNUM7.png",
            "../img/hud_elements/numbers/STTNUM8.png",
            "../img/hud_elements/numbers/STTNUM9.png"
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

        let img = new Image();
        
        img.src = "../img/hud_elements/HTEXA0.png"; // Path to your crosshair image
        this.images.push(img);
    }

    render() {

        if (camera.health < 0) {
            camera.health = 0;
        }
        let health = camera.health.toString().padStart(3, '0'); // Ensures at least 3 digits

        let health_1 = parseInt(health[2]); // Ones place
        let health_2 = parseInt(health[1]); // Tens place
        let health_3 = parseInt(health[0]); // Hundreds place

        ctx.clearRect(this.c_midx - 400, this.c_midy, 250, 400);
        let img = this.images[10];
        ctx.drawImage(img, this.c_midx - 300, this.c_midy + 200, 150, 20);

        img = this.images[health_1];
        ctx.drawImage(img, this.c_midx - 200, this.c_midy + 250, 50, 50);

        img = this.images[health_2];
        ctx.drawImage(img, this.c_midx - 250, this.c_midy + 250, 50, 50);
        
        img = this.images[health_3];
        ctx.drawImage(img, this.c_midx - 300, this.c_midy + 250, 50, 50);
    }
}

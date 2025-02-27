class Ammo {
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
            "../img/hud_elements/numbers/STTNUM9.png",
            "../img/hud_elements/letters/STCFN065.png",
            "../img/hud_elements/letters/STCFN077.png",
            "../img/hud_elements/letters/STCFN079.png"
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

    render() {

        let ammo = camera.ammo.toString().padStart(2, '0'); // Ensures at least 3 digits

        let ammo_1 = parseInt(ammo[1]); // Ones place
        let ammo_2 = parseInt(ammo[0]); // Tens place

        ctx.clearRect(this.c_midx+100, 400, 300, 400);

        let letter_size = 30

        // A
        let img = this.images[10];
        ctx.drawImage(img, this.c_midx + 180, this.c_midy + 200, letter_size, letter_size - 10);

        // M
        img = this.images[11];
        ctx.drawImage(img, this.c_midx + 210, this.c_midy + 200, letter_size, letter_size - 10);

        ctx.drawImage(img, this.c_midx + 240, this.c_midy + 200, letter_size, letter_size - 10);

        // O
        img = this.images[12];
        ctx.drawImage(img, this.c_midx + 270, this.c_midy + 200, letter_size, letter_size - 10);

        img = this.images[ammo_1];
        ctx.drawImage(img, this.c_midx + 240, this.c_midy + 250, 50, 50);

        img = this.images[ammo_2];
        ctx.drawImage(img, this.c_midx + 190, this.c_midy + 250, 50, 50);
    }
}

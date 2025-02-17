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

        ctx.clearRect(400+100, 400, 300, 400);

        let letter_size = 30

        // A
        let img = this.images[10];
        ctx.drawImage(img, 400 + 180, 400 + 200, letter_size, letter_size - 10);

        // M
        img = this.images[11];
        ctx.drawImage(img, 400 + 210, 400 + 200, letter_size, letter_size - 10);

        ctx.drawImage(img, 400 + 240, 400 + 200, letter_size, letter_size - 10);

        // O
        img = this.images[12];
        ctx.drawImage(img, 400 + 270, 400 + 200, letter_size, letter_size - 10);

        img = this.images[ammo_1];
        ctx.drawImage(img, 400 + 240, 400 + 250, 50, 50);

        img = this.images[ammo_2];
        ctx.drawImage(img, 400 + 190, 400 + 250, 50, 50);
    }
}

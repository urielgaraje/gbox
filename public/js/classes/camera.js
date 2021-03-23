export class Camera {
    constructor(videoNode) {
        this.videoNode = videoNode;
    }

    on() {
        var front = false;
        navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: { height: 300, width: 300, facingMode: (front? "user" : "environment")  }
            })
            .then((stream) => {
                console.log(stream);
                this.videoNode.srcObject = stream;
                this.stream = stream;
            });
    }

    off() {
        this.videoNode.pause();
        if (this.stream) {
            this.stream.getTracks()[0].stop();
        }
    }

    takePhoto() {
        // crear un elemento para renderizar la photo en el
        let canvas = document.createElement('canvas');

        // colocar las dimensiones igual al elemento del video;
        canvas.setAttribute('width', 300);
        canvas.setAttribute('height', 300);

        // obtener el contexto de canvas
        let ctx = canvas.getContext('2d');

        // dibujar la imagen dentro del canvas
        ctx.drawImage(this.videoNode, 0, 0, canvas.width, canvas.height);

        this.photo = ctx.canvas.toDataURL();

        canvas = null;
        ctx = null;

        return this.photo;
    }
}

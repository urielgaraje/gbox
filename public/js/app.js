import { Camera } from './classes/camera.js';

const SERVER_URL =  window.location.origin;
const API_URL = `${SERVER_URL}/api/v1`;
const GOOGLE_MAP_KEY = 'AIzaSyA5mjCwx1TRLuBAjwQw84WE6h5ErSe7Uj8';

const modalCreate = $('.g-modal.modal--create');
const modalDetail = $('.g-modal.modal--detail');

const btnSend = $('#g-btn-send');
const btnLocation = $('#g-btn-location');
const btnPhoto = $('#g-btn-photo');
const btnTakePhoto = $('#g-btn-take-photo');
const btnNotiActive = $('.g-noti-active');
const btnNotiDisabled = $('.g-noti-disabled');
const btnAddBox = $('#add-box');
const btnClose = $('#g-close');

const cameraContainer = $('.g-camera-container');
const boxList = $('#g-box-list');

const txtTitle = $('#g-txt-title');
const txtDescription = $('#g-txt-description');
const txtDirection = $('#g-txt-direction');
const txtCount = $('.g-count');

const player = $('#player')[0];
const camera = new Camera(player);

const btnVibrate = $('#g-vibrate');

let coords = null;
let photo = null;
let swReg = null;

const boxes = [];

const url = window.location.href;
let swLocation = '/gbox/sw.js';

if (navigator.serviceWorker) {
    if (url.includes('localhost')) {
        swLocation = '/sw.js';
    }

    window.addEventListener('load', function () {
        navigator.serviceWorker.register(swLocation).then((register) => {
            swReg = register;
            swReg.pushManager.getSubscription().then(checkSubsciption);
        });
    });
}

// push notifications

function checkSubsciption(active) {
    if (active) {
        btnNotiActive.removeClass('g-hide');
        btnNotiDisabled.addClass('g-hide');
    } else {
        btnNotiActive.addClass('g-hide');
        btnNotiDisabled.removeClass('g-hide');
    }
}

function getPublicKey() {
    return (
        fetch(`${API_URL}/push/key`)
            .then((res) => res.arrayBuffer())
            // returnar arreglo, pero como un Uint8array
            .then((key) => new Uint8Array(key))
    );
}

function cancelSubscription() {
    swReg.pushManager.getSubscription().then((subs) => {
        subs.unsubscribe().then(() => checkSubsciption(false));
    });
}

function createBox(box) {
    boxes.push(box);

    let boxItem = `
        <li class="box-item"
        data-id=${box._id}>
        <img src="${box.offline ? 'img/box-offline.png' : 'img/box-default.png'}" alt="box" />
        <div class="box-item__detail ${box.offline ? 'g-offline' : ''}">
            <h3>${box.title}</h3>
            <span>${box.direction}</span>
        </div>
    </li>
    `;

    boxList.prepend(boxItem);
}

function getBoxes() {
    fetch(`${API_URL}/box`)
        .then((res) => res.json())
        .then((res) => {
            txtCount.text(res.results);
            res.data.boxes.forEach(createBox);
        });
}

function cleanFeatures() {
    coords = null;
    photo = null;
    player.srcObject = null;

    $('.g-map-container').remove();
    cameraContainer.addClass('g-hide');
    modalCreate.addClass('g-hide');
    txtDirection.val('');
    txtTitle.val('');
    txtDescription.val('');

    camera.off();
}

function showBoxDetail(boxSelected) {
    modalDetail.removeClass('g-hide');

    console.log('box seleted: ', boxSelected);

    let content = `
    <div class="g-box">
        <div class="g-box__header"></div>
        <div class="g-box__body">`;

    if (boxSelected.photo) {
        content += `
        <img src="${boxSelected.photo}" alt="photo" />
        `;
    } else {
        content += `
        <img src="img/g-box-unboxing.png" alt="photo" />
        `;
    }

    content += `
            <h3>${boxSelected.title}</h3>

            <p>${boxSelected.direction}</p>

            <p>${boxSelected.description}</p>

            `;

    if (boxSelected.coords) {
        content += `
        <div class="g-box__map">
            <i class="fas fa-map-marker-alt"></i>
            <div class="g-map-container">
                <iframe 
                width="100%"
                height="250"
                frameborder="0"
                src="https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAP_KEY}&center=${boxSelected.coords.lat},${boxSelected.coords.lng}&zoom=15" allowfullscreen>
                </iframe>
            </div>
        </div> `;
    }

    content += `</div></div>`;

    modalDetail.find('.g-modal-content').html(content);
}

// Mostrar modal al crear el envío
function showMap(lat, lng) {
    $('.g-map-container').remove();

    var content = `<div class="g-map-container">
                    <iframe 
                    width="100%"
                    height="250"
                    frameborder="0"
                    src="https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAP_KEY}&center=${lat},${lng}&zoom=15" allowfullscreen>
                    </iframe>
            </div>
    `;

    modalCreate.append(content);
}

btnNotiDisabled.on('click', function () {
    if (!swReg) return console.log('No hay registro de SW');

    getPublicKey().then(function (key) {
        swReg.pushManager
            .subscribe({
                userVisibleOnly: true,
                applicationServerKey: key
            })
            .then((res) => res.toJSON())
            .then((subs) => {
                console.log(subs);
                fetch(`${API_URL}/push/subscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(subs)
                })
                    .then(checkSubsciption)
                    .catch(cancelSubscription);
            });
    });
});

btnNotiActive.on('click', cancelSubscription);

btnAddBox.on('click', function () {
    modalCreate.removeClass('g-hide');
});

btnClose.on('click', function () {
    modalDetail.addClass('g-hide');
});

btnSend.on('click', () => {
    const title = txtTitle.val();
    const description = txtDescription.val();
    const direction = txtDirection.val();

    if (title === '' || description === '' || direction === '') return;

    const data = {
        title,
        description,
        direction,
        photo,
        coords
    };

    fetch(`${API_URL}/box`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then((res) => res.json())
        .then((res) => {
            console.log(res);
            const box = res.data.box;

            if (res.offline) {
                box._id = boxes.length + 1;
                box.offline = true;
            }

            createBox(box);
        })
        .catch(console.log);

    cleanFeatures();
});

btnLocation.on('click', () => {
    navigator.geolocation.getCurrentPosition((pos) => {
        showMap(pos.coords.latitude, pos.coords.longitude);

        coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
        };
    });
});

// botón encender camara
btnPhoto.on('click', () => {
    console.log('Inicializar camara');

    cameraContainer.removeClass('g-hide');
    camera.on();
});

// botón para tomar la foto
btnTakePhoto.on('click', () => {
    console.log('Botón tomar foto');

    photo = camera.takePhoto();

    camera.off();
});


boxList.on('click', 'li', function () {
    const id = $(this).data('id');
    const box = boxes.find((b) => +b._id === id);

    if (box) showBoxDetail(box);
});


btnVibrate.on('click', function () {
    if (navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate) {
        let startWar = [500,110,500,110,450,110,200,110,170,40,450,110,200,110,170,40,500];
        let power = [150,150,150,150,75,75,150,150,150,150,450];
        let mk = [100,200,100,200,100,200,100,200,100,100,100,100,100,200,100,200,100,200,100,200,100,100,100,100,100,200,100,200,100,200,100,200,100,100,100,100,100,100,100,100,100,100,50,50,100,800];

        function getRandomIntBetween(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
          }

        switch (getRandomIntBetween(1,3)){
            case 1 : 
            navigator.vibrate(startWar);
            break;
            case 2 : 
            navigator.vibrate(power);

            break;
            case 3 : 
            navigator.vibrate(mk);
            break;
        }
    }
});


// Detectar cambios de conexión
function isOnline() {
    if (navigator.onLine) {
        // tenemos conexión
        console.log('online');
    } else {
        // No tenemos conexión
        console.log('offline');
    }
}


window.addEventListener('online', isOnline);
window.addEventListener('offline', isOnline);

getBoxes();

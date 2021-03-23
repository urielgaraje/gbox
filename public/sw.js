importScripts('https://cdn.jsdelivr.net/npm/pouchdb@7.0.0/dist/pouchdb.min.js');

importScripts('js/utils/sw-db.js');
importScripts('js/utils/sw-utils.js');

const CACHE_STATIC = 'static-v1';
const CACHE_DYNAMIC = 'dynamic-v1';
const CACHE_INMUTABLE = 'inmutable-v1';

const APP_SHELL = [
    //'/',
    'index.html',
    'css/style.css',
    'js/app.js',
    'js/classes/camera.js',
    'js/utils/sw-db.js',
    'js/utils/sw-utils.js',
    'manifest.json',
    'img/box-default.png',
    'img/box-offline.png',
    'img/no-img.png',
    'img/icons/apple-icon-180.png',
    'img/icons/favicon-196.png',
    'img/icons/manifest-icon-192.png',
    'img/icons/manifest-icon-512.png',
    'img/g-truck.png'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Lato:300,400,400i,700',
    'https://pro.fontawesome.com/releases/v5.10.0/css/all.css',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js',
    'https://cdn.jsdelivr.net/npm/pouchdb@7.0.0/dist/pouchdb.min.js'
];

self.addEventListener('install', (event) => {
    // creamos nuestro cache estático & dinámico
    const cacheStatic = caches.open(CACHE_STATIC).then((cache) => cache.addAll(APP_SHELL));

    const cacheInmutable = caches.open(CACHE_INMUTABLE).then((cache) => cache.addAll(APP_SHELL_INMUTABLE));

    event.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

self.addEventListener('activate', (event) => {
    // limpiamos los chaches viejos comparandolos con la nueva versión ej: 'static-v2'
    const cleanCaches = caches.keys().then((keys) => {
        return Promise.all(
            keys.map((key) => {
                if (key !== CACHE_STATIC && key.includes('static')) {
                    return caches.delete(key);
                }

                if (key !== CACHE_DYNAMIC && key.includes('dynamic')) {
                    return caches.delete(key);
                }
            })
        ).then(console.log('SW Activated: Cache cleaned!'));
    });

    event.waitUntil(cleanCaches);
});

self.addEventListener('fetch', (event) => {
    // estrategias de cacheo
    // 1- cache only

    //event.respondWith(caches.match(event.request));

    // 2- cache first, fall back to network
    /*     const response = caches.match(event.request).then((cacheResponse) => {
        // si existe la respues en el cache
        // tengo que ir a la red
        return (
            cacheResponse ||
            fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_DYNAMIC).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
        );

    });

    event.respondWith(response); */

    // 3- network first, fall back to cache
    /*     const response = fetch(event.request)
        .then((networkResponse) => {
            return caches.open(CACHE_DYNAMIC).then((cache) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            });
        })
        .catch(() => caches.match(event.request));

    event.respondWith(response); */

    // 4- stale while revalidate
    /*   const response = caches.match(event.request).then((cacheResponse) => {
        const fetchPromise = caches.open(CACHE_DYNAMIC).then((cache) => {
            return fetch(event.request).then((networkResponse) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            });
        });

        return cacheResponse || fetchPromise;
    });

    event.respondWith(response); */

    // 5- network only
    //event.respondWith(fetch(event.request));

    // 6- personalized

    let response;

    // identifico si la petición proviene de mi API
    if (event.request.url.includes('/api/v1')) {
        response = useApiManager(CACHE_DYNAMIC, event.request);
    } else {
        // estrategia cache first, me interesa tener una rápida respuesta si no es una petición de mi API
        response = useNetworkFirst(CACHE_DYNAMIC, event.request);
    }

    event.respondWith(response);
});

// tareas asíncronas
self.addEventListener('sync', (event) => {
    console.log('SW: Sync');

    if (event.tag === 'new-box') {
        // postear a la API cuando haya conexión
        const respuesta = postBoxes();

        event.waitUntil(respuesta);
    }
});

// Escuchar PUSH
self.addEventListener('push', (event) => {
    const data = JSON.parse(event.data.text());

    console.log(data);

    const title = data.title;
    const options = {
        body: data.body,
        icon: 'img/icons/favicon-196.png',
        badge: 'img/g-box.png',
        image: 'https://assets.browserlondon.com/app/uploads/2019/03/pwa-banner-768x432.png',
        data: {
            url: `${PROD ? '/gbox' : '/'}?utm_tag=homescreen`,
            discount: true
        },
        actions: [
            {
                action: 'action-clean',
                title: 'Vaciar Garaje'
            },
            {
                action: 'action-skip',
                title: 'Seguir Recibiendo'
            }
        ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    const notificacion = event.notification;
    const accion = event.action;

    console.log({ notificacion, accion });

    const response = clients.matchAll().then((clientsArr) => {
        let client = clientsArr.find((c) => {
            return c.visibilityState === 'visible';
        });
        console.log(client);
        if (client !== undefined) {
            client.navigate(notificacion.data.url);
            client.focus();
        } else {
            clients.openWindow(notificacion.data.url);
        }
        return notificacion.close();
    });

    event.waitUntil(response);
});

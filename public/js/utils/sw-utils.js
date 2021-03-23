function useNetworkFirst(cacheName, request) {
    return fetch(request)
        .then((networkResponse) => {
            return caches.open(cacheName).then((cache) => {
                cache.put(request, networkResponse.clone());
                return networkResponse;
            });
        })
        .catch(() => caches.match(request));
}

function useCacheFirst(cacheName, request) {
    return caches.match(request).then((cacheResponse) => {
        const fetchPromise = caches.open(cacheName).then((cache) => {
            return fetch(request).then((networkResponse) => {
                cache.put(request, networkResponse.clone());
                return networkResponse;
            });
        });

        return cacheResponse || fetchPromise;
    });
}

function handlePostMethod(request) {
    if (self.registration.sync) {
        // pasamos a menejar la petición por medio de la indexDB si falla el fetch
        return fetch(request.clone()).catch((err) => {
            console.log('Error sw-util: ',err);
            return request.clone().json().then(saveBox);
        });
    } else {
        console.log('paso fuera del sync');
        // manejar los métodos post offline de otra forma que no sea con 'sync'
        return fetch(request);
    }
}

function useApiManager(cacheName, request) {
    if (request.method === 'POST') {
        return handlePostMethod(request);
    } else {
        return useNetworkFirst(cacheName, request);
    }
}

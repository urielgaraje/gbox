const fs = require('fs');

const urlsafeBase64 = require('urlsafe-base64');
const vapid = require('./../vapid.json');

const webpush = require('web-push');

webpush.setVapidDetails('mailto:uriel.blanco@garajedeideas.com', vapid.publicKey, vapid.privateKey);

let subscriptions = require('./../subs-db.json');

module.exports.getKey = () => {
    return urlsafeBase64.decode(vapid.publicKey);
};

module.exports.addSubscription = (subs) => {
    subscriptions.push(subs);

    fs.writeFile(`${__dirname}/../subs-db.json`, JSON.stringify(subscriptions), (err) => {
        console.log('Nueva subscripción!');
    });
};

module.exports.sendPush = (post) => {
    console.log('Mandando Push a todos');

    const notificationsSended = [];

    subscriptions.forEach((subs, i) => {
        const pushPromise = webpush
            .sendNotification(subs, JSON.stringify(post))
            .then(console.log('Notificación enviada '))
            .catch((err) => {
                console.log('Notificación falló');

                if (err.statusCode === 410) {
                    // GONE, ya no existe
                    subscriptions[i].delete = true;
                }
            });

        notificationsSended.push(pushPromise);
    });

    Promise.all(notificationsSended).then(() => {
        subscriptions = subscriptions.filter((subs) => !subs.delete);

        fs.writeFile(`${__dirname}/../subs-db.json`, JSON.stringify(subscriptions), (err) => {
            console.log('Subscripciones actualizadas!');
        });
    });
};

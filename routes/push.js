const express = require('express');
const pushManager = require('./../utils/pushManager');

const router = express.Router();

// enviamos nuestra clave publica
router.route('/key').get((req, res) => {
    const key = pushManager.getKey();

    res.send(key);
});

// almacenamos la subscripcion de nuestros clientes
router.route('/subscribe').post((req, res) => {
    const subscription = req.body;

    pushManager.addSubscription(subscription);

    res.json('Subscrito!');
});

// enviar una notificación a todos nuestros clientes
// ES UN EJEMPLO NO SE DEBE REALIZAR DE ESTA MANERA
router.post('/send', (req, res) => {

    const post = {
      title: req.body.title,
      body: req.body.body,
    };

    pushManager.sendPush( post );
  
    res.json( post );

  });

module.exports = router;

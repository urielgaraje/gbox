const multer = require('multer');
const fs = require('fs');

const boxes = [
    {
        _id: '1',
        title: 'Cartera',
        description: 'Material cuero, color negro.',
        direction: 'Av Brasil 300'
    },
    {
        _id: '2',
        title: 'Parlante',
        description: 'Color azul, en fragil.',
        direction: 'Orense 1200'
    },
    {
        _id: '3',
        title: 'Mouse',
        description: 'Marca microsoft',
        direction: 'Magallanes 450'
    }
];

const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];

        cb(null, `box-${Date.now()}.${ext}`);
    }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Please upload only images.'), false);
    }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter }).single('img');

const extractPhoto = (photoBase64) => {
    let base64Image = photoBase64.split(';base64,').pop();

    const ext = photoBase64.split(';base64,')[0].split('/')[1];
    const path = `box-${Date.now()}.${ext}`;

    fs.writeFile(`uploads/${path}`, base64Image, { encoding: 'base64' }, function (err) {
        if (err) console.log(err);
        console.log('Imagen creada!');
    });

    return path;
};

exports.getBoxes = (req, res) => {
    res.status(200).json({
        status: 'success',
        results: boxes.length,
        data: {
            boxes
        }
    });
};

exports.extractImg = (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            return res.status(400).json({
                status: 'fail',
                message: err.message
            });
        }
        // Everything went fine.
        next();
    });
};

exports.createBox = (req, res) => {
    try {
        console.log(req.body);

        const box = {
            title: req.body.title,
            description: req.body.description,
            coords: req.body.coords,
            direction: req.body.direction
        };

        if (req.body.photo) {
            box.photo = extractPhoto(req.body.photo);
        }

        box._id = boxes.length + 1;
        boxes.push(box);

        res.status(201).json({
            status: 'success',
            data: {
                box
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

const PROD = true;
const SERVER_URL = PROD ? 'https://frozen-mesa-12659.herokuapp.com' : 'http://localhost:3000';
const API_URL = `${SERVER_URL}/api/v1`;

const db = new PouchDB('boxes');

function saveBox(box) {
    box._id = new Date().toISOString();

    return db.put(box).then(() => {
        self.registration.sync.register('new-box');

        const fakeBox = {
            title: box.title,
            description: box.description,
            photo: box.photo,
            coords: box.coords,
            direction: box.direction
        };
        const fakeBody = { offline: true, status: 'success', data: { box: fakeBox } };

        return new Response(JSON.stringify(fakeBody), { status: 201 });
    });
}

function postBoxes() {
    const posts = [];

    return db.allDocs({ include_docs: true }).then((docs) => {
        docs.rows.forEach((row) => {
            const doc = row.doc;
            const box = {
                title: doc.title,
                description: doc.description,
                photo: doc.photo,
                coords: doc.coords,
                direction: doc.direction
            };

            const fetchPromise = fetch(`${API_URL}/box`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(box)
            }).then(db.remove(doc));

            posts.push(fetchPromise);
        }); // fin del foreach

        return Promise.all(posts);
    });
}

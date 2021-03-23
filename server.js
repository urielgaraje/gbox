const dotenv = require('dotenv');
const app = require('./app.js');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

mongoose.connect('mongodb+srv://urielblanco:Xlxd02tUz0m3GUSV@cluster0.3an29.mongodb.net/gboxdb?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log('Connected to database!'))
.catch(() => console.log('Connection to database failed!'));


const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`App running on port ${port}`);
});
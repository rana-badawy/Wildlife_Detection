const express = require('express');
const path = require('path');
const ejs = require('ejs');
const fileUpload = require('express-fileupload');
const main_router = require('./routes/main_router');

const app = express();

app.listen(5000, function() {
    console.log('server is listening...')
});

app.use('/stylesheets', express.static(path.join(__dirname, "stylesheets")));
app.use('/services', express.static(path.join(__dirname, "services")));

app.use(fileUpload());
app.use(express.json());

app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

app.use(main_router);
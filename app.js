const express = require('express');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');

const app = express();

app.listen(5000, function() {
    console.log('server is listening...')
});

app.use('/stylesheets', express.static(path.join(__dirname, "stylesheets")));
app.use('/services', express.static(path.join(__dirname, "services")));

app.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
})


app.use(fileUpload());

app.post('/upload', function(req, res, next){    
    console.log(req.files.file.name);

    fs.writeFile(`./recordings/${req.files.file.name}`, req.files.file.data, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 

    res.json("saved");
})
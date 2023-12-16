const express = require('express');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const { doQuery } = require('./services/dbServices');

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
app.use(express.json());

app.post('/upload', function(req, res, next){    
    console.log(req.files.file.name);

    fs.writeFile(`./recordings/${req.files.file.name}`, req.files.file.data, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 

    res.json("Saved");
})

app.post('/insert', async function(req, res) {
    let name = req.body.name;
    let country = req.body.location.country;
    let state = req.body.location.state;
    let city = req.body.location.city;
    let location_id, animal_id;
    
    const locationQuery = "select location_id from location where country = '" + country +
    "' and state = '" + state + "' and city = '" + city + "'";
    let locationResult = await doQuery(locationQuery);
    location_id = locationResult[0].location_id;

    const animalQuery = "select animal_id from animal where animal_name = '" + name + "'";
    let animalResult = await doQuery(animalQuery);
    animal_id = animalResult[0].animal_id;

    const animalLocationQuery = "select * from animal_location where animal_id = " + animal_id + " and location_id = " + location_id;
    let animalLocationResult = await doQuery(animalLocationQuery);
    
    if (!animalLocationResult || animalLocationResult.length <= 0) {
        const insertQuery = "insert into animal_location values (" + animal_id + ", " + location_id + ", 1)";
        await doQuery(insertQuery);
    }
    else {
        const updateQuery = "update animal_location set count = count + 1 where animal_id = " + animal_id + " and location_id = " + location_id;
        await doQuery(updateQuery);
    }

    res.json("Added to DB");
})
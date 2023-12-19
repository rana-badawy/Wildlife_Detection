const path = require('path');
const fs = require('fs');
const connection = require('./db_config');

async function doQuery(query){
    return new Promise((resolve) => {
        connection.query(query,
            function (err, result) {
                if (err) {
                    console.log('Error executing the query - ${err}')
                }
                else {
                    resolve(JSON.parse(JSON.stringify(result)));
                }
            }
        );
    })
}

function home(req, res, next) {
    res.sendFile(path.join(__dirname, '../views', 'index.html'));
}

function upload(req, res, next){    
    fs.writeFile(`./recordings/${req.files.file.name}`, req.files.file.data, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 

    res.json("Saved");
}

async function insert(req, res, next) {
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
}

async function getData(req, res, next) {
    let query = "select animal.animal_name, location.country, location.state, location.city, animal_location.count " +
    "from animal_location inner join animal on animal.animal_id = animal_location.animal_id inner join location " +
    "on animal_location.location_id = location.location_id " +
    "order by location.country, location.state, location.city, animal.animal_name";

    let data = await doQuery(query);

    console.log(data);

    res.render('data', {data: data});
}

module.exports = {home, upload, insert, getData}
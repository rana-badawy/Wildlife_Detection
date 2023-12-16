const connection = require('../db_config');

async function doQuery(query){
    return new Promise((resolve) => {
        connection.query(query,
            function (err, result) {
                if (err) {
                    console.log('Error executing the query - ${err}')
                }
                else {
                    resolve(result);
                }
            }
        );
    })
}

module.exports = {doQuery}
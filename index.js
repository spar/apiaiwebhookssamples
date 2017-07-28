const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const recipepuppyHost = 'http://www.recipepuppy.com/api/?q=';

app.get('/dummyget', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ 'speech': 'dummy speech', 'displayText': 'dummy get works!' }));
});


app.post('/webhook', function (req, res) {
    if (req.body.result.parameters['FoodItem']) {
        var fooditem = req.body.result.parameters['FoodItem'];
        callRecipePuppy(fooditem)
            .then((output) => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ 'speech': output, 'displayText': output }));
            })
            .catch((error) => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ 'speech': error, 'displayText': error }));
            });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ 'speech': "No Proper hook found", 'displayText': "No Proper hook found" }));
    }
});


function callRecipePuppy(fooditem) {
    return new Promise((resolve, reject) => {
        http.get(recipepuppyHost + fooditem, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                let jO = JSON.parse(body);
                let firstItem = jO.results[0];

                let output = firstItem.title + " using " + firstItem.href;
                resolve(output);
            });

            res.on('error', (error) => {
                reject(error);
            });
        });
    });
}

app.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});
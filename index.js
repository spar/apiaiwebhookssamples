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
                res.send(JSON.stringify({ 'speech': 'Found Recipe for: ' + output.title + '\n' + output.href, 'displayText': output.title + '\n' + output.href, 'data': { 'telegram': output } }));
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
                let firstItem = jO.results[Math.floor((Math.random() * jO.results.length))];

                let output = "Found a recipe for: " + firstItem.title + ". Go to:  " + firstItem.href;
                var obj = {
                    text: htmlEntities('<b><Title:/b> ' + firstItem.title + '\n' + '<b>Ingredients:</b> ' + firstItem.ingredients + '\n' + '<b>Link:</b> ' + firstItem.href),
                    parse_mode: 'HTML'
                }
                resolve(obj);
            });

            res.on('error', (error) => {
                reject(error);
            });
        });
    });
}
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
app.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});
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

                let displayText = `Found recipe for: ${output.title} at ${output.href}`;
                let telegramText = htmlEntities('<b><Title:/b> ' + output.title + '\n' + '<b>Ingredients:</b> ' + output.ingredients + '\n' + '<b>Link:</b> ' + output.href);
                let result = toApiAiResponseMessage(displayText, displayText, toTelgramObject(telegramText, 'HTML'));
                console.log(result);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result));
            })
            .catch((error) => {
                console.log(error);
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
                console.log(firstItem);
                resolve(firstItem);
            });

            res.on('error', (error) => {
                reject(error);
            });
        });
    });
}

function toTelgramObject(text, parse_mode) {
    return {
        text: text,
        parse_mode: parse_mode
    }
}

function toApiAiResponseMessage(speech, displayText, telegramObject = null) {
    return {
        speech: speech,
        displayText: displayText,
        data: {
            telegram: telegramObject
        }
    }
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

app.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});

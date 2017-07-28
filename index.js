const http = require('http');
const express = require('express');
const app = express();

app.get('/dummyget', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ 'speech': 'dummy speech', 'displayText':'dummy get works!' }));
})

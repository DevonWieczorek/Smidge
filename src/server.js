const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dns = require('dns');

const app = express();

// Handle serving of static assets
app.use(express.static(path.join(__dirname, 'public')));

// Parse requests as json
app.use(bodyParser.json())

// Serve static homepage
app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(htmlPath);
});

// Create new shortlink
app.post('/:userID/new', (req, res) => {
    console.log(req.body);

    const fullURL = req.body.url;
    const userID = req.params.userID || null;

    if(!userID){
        return res.status(403).send({error: 'Missing credential "userID".'});
    }

    // Check if this is a valid URL structure
    try {
        fullURL = new URL(fullURL);
    } catch (err){
        return res.status(400).send({error: 'Invalid URL.'});
    }

    // Check if the hostname is a live domain
    dns.lookup(fullURL.hostname, (err) => {
        if(err){
            return res.status(404).send({error: 'Address not found.'});
        }
        else{
            return res.status(200).send({message: 'Success.'});
        }
    });
});

// Start the server
app.set('port', process.env.PORT || 4100);
const server = app.listen(app.get('port'), () => {
    console.log(`Express is running on port ${server.address().port}.`);
});

const express = require('express');

const app = express();

app.set('port', process.env.PORT || 4100);
const server = app.listen(app.get('port'), () => {
    console.log(`Express is running on port ${server.address().port}.`);
});

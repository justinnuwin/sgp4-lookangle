let express = require('express');
let app = express();


app.get('/', function (req, res) {
    res.send('Hello, World!');
});

app.listen(4000);
console.log('server is running');
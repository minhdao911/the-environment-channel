var express = require('express'),
      path = require('path'),
      app = express();  

var publicPath = path.join(__dirname, "./public");
var port = process.env.PORT || 3000;
app.use(express.static(publicPath));

app.listen(port, (req, res) => {
    console.log('Server is running at port ' + port);
});
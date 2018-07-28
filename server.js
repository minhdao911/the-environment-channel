var express = require('express'),
      path = require('path'),
      app = express();

var port = process.env.PORT || 3000;

var displayDataPath = path.join(__dirname, "./displayData");
var publicPath = path.join(__dirname, "./public");

app.use(express.static(publicPath));
app.use("/display",express.static(displayDataPath));

app.listen(port, (req, res) => {
    console.log('Server is running at port ' + port);
});

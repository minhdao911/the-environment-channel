var express = require('express'),
      path = require('path'),
      app = express();

var port = process.env.PORT || 3000;

var displayDataPath = path.join(__dirname, "./displayData");
var publicPath = path.join(__dirname, "./public");

app.use(express.static(publicPath));
app.use("/display",express.static(displayDataPath));

app.get("/data/:stationName", function(req,res){
  const stationName = req.params.stationName;
  const data = require(`./data/historical-data/${stationName}`);

  res.send(data);
})

app.listen(port, (req, res) => {
    console.log('Server is running at port ' + port);
});

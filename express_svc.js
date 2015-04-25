var express = require('express');
var fs      = require('fs');
var mongo   = require('mongodb');
//var bodyParser = require('body-parser');
var Grid    = require('gridfs-stream');
var db      = new mongo.Db('test', new mongo.Server("127.0.0.1", 27017), { safe : false });
var multipart = require('connect-multiparty');

db.open(function (err) {
  if (err) {
    throw err;
  }
  var gfs = Grid(db, mongo);
  var app = express();

  //app.use(bodyParser());
  app.post('/upload',multipart(), function(req, res) {
    var tempfile    = req.files.filename.path;
    var origname    = req.files.filename.name;
    var writestream = gfs.createWriteStream({ filename: origname });
    // open a stream to the temporary file created by Express...
    fs.createReadStream(tempfile)
      .on('end', function() {
        res.send('OK');
      })
      .on('error', function() {
        res.send('ERR');
      })
      // and pipe it to gfs
      .pipe(writestream);
  });

  app.get('/download', function(req, res) {
    // TODO: set proper mime type + filename, handle errors, etc...
    gfs
      // create a read stream from gfs...
      .createReadStream({ filename: req.param('filename') })
      // and pipe it to Express' response
      .pipe(res);
  });

  app.listen(3012);
});

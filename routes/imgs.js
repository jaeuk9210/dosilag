var express = require('express');
var fs = require('fs');
var path = require('path');
var router = express.Router();

router.get('/nocover', function(req, res){
  var stream;
  var filePath = path.join(__dirname,'..','public','img','nocover.png');
  var fileExists = fs.existsSync(filePath);

  if(fileExists){
    stream = fs.createReadStream(filePath);
  }
  if(stream){
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
      });
      stream.pipe(res);
    } else {
      res.statusCode = 404;
      res.end();
    }
});


router.get('/noprofile', function(req, res){
  var stream;
  var filePath = path.join(__dirname,'..','public','img','noprofile.png');
  var fileExists = fs.existsSync(filePath);

  if(fileExists){
    stream = fs.createReadStream(filePath);
  }
  if(stream){
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
      });
      stream.pipe(res);
    } else {
      res.statusCode = 404;
      res.end();
    }
});

router.get('/:serverFileName', function(req, res){
  var stream;
  var filePath = path.join(__dirname,'..','uploadedProfileImg', req.params.serverFileName);
  var fileExists = fs.existsSync(filePath);
  if(fileExists) {
    stream = fs.createReadStream(filePath);
  }

  if(stream) {
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'profileimg; filename=' + req.params.serverFileName
    });
    stream.pipe(res);
  } else {
    res.statusCode = 404;
    res.end();
  }
});

module.exports = router;
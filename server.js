const http = require('http'),
  fs = require ('fs'),
  url = require('url');

http.createServer((request, response) => {
  let addr = request.url, //this request is the same request that is an argument above
  q = url.parse(addr, true),
  filePath = ''; //this is empty because the filePath is set later in the next if-statement

  //this block will create a log of the URL visited and at what time. 
  fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp:' + new Date() + '\n\n', (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Added to log.');
    }
  });
  
  if (q.pathname.includes('documentation')) { //this is checking if the request pathname (the part of the URL that comes after the first single slash) contains the word documentation
    filePath = (__dirname + '/documentation.html'); //if that is true it sets the files path to be equal to the documentation.html file, because that is what's being requested
  } else {
    filePath = 'index.html'; //otherwise it defaults to index.html if that file cannot be found or it is not being requested. 
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      throw err;
    }

    response.writeHead(200, {'Content-Type': 'text/html' });
    response.write(data);
    response.end();

  });

}).listen(8080);
console.log('My test server is running on Port 8080. ');
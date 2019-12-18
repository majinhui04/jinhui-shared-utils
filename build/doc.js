var PORT = 3200;

var http = require('http');
var url = require('url');
var fs = require('fs');
var mine = {
    'css': 'text/css',
    'gif': 'image/gif',
    'htm': 'text/html',
    'html': 'text/html',
    'ico': 'image/x-icon',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'text/javascript',
    'json': 'application/json',
    'pdf': 'application/pdf',
    'png': 'image/png',
    'svg': 'image/svg+xml',
    'swf': 'application/x-shockwave-flash',
    'tiff': 'image/tiff',
    'txt': 'text/plain',
    'wav': 'audio/x-wav',
    'wma': 'audio/x-ms-wma',
    'wmv': 'video/x-ms-wmv',
    'xml': 'text/xml'
};
var path = require('path');
var Tools = {
    guessPage(curDir, pathname) {
        // console.log('pathname: ' + pathname);
        if (!pathname) {
            pathname = pathname + '/';
        }
        var realPath = path.join(curDir, pathname);
        // console.log('realPath: ' + realPath);
        var ext = path.extname(realPath);
        // console.log('before ext: ' + ext);
        if (!ext) {
            // guess index.html, is not exist, then index.htm.
            var tmpPath = realPath + 'index.html';
            ext = 'html';
            realPath = tmpPath;
        } else {
            ext = ext.slice(1);
        }
        // console.log('ext: ' + ext);
        var result = {};
        result.realPath = realPath;
        result.ext = ext;
        return result;
    }
};
//var tools = new Tools();

var server = http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;
    var guessPage = Tools.guessPage(path.resolve(__dirname, '../out'), pathname);
    var realPath = guessPage.realPath;
    var ext = guessPage.ext;

    fs.exists(realPath, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });

            response.write('This request URL ' + realPath + ' was not found on this server.');
            response.end();
        } else {
            fs.readFile(realPath, 'binary', function (err, file) {
                if (err) {
                    response.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    response.end(err);
                } else {
                    var contentType = mine[ext] || 'text/plain';
                    // console.log('contentType: ' + contentType);
                    response.writeHead(200, {
                        'Content-Type': contentType
                    });
                    response.write(file, 'binary');
                    response.end();
                }
            });
        }
    });
});
server.listen(PORT);
console.log(`Server runing at port:  http://localhost:${PORT}`);

var express = require('express');
var path = require('path');
// 创建应用实例
var app = express();
var http = require('http');

// 以下皆为注册中间件
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(path.join(__dirname, '..', 'libs')));
function sleep (n) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, n)
    })
}
// 路由中间件
app.use('/api/aa', function (req, res) {
    sleep(2000).then(()=>{
        res.json({
            code: 0,
            message: 'ok',
            data: {
                a: 1
            }
        });
    })
    console.log(111);
    // res.json({
    //     code: 0,
    //     message: 'ok',
    //     data: {
    //         a: 1
    //     }
    // });

});
app.use('/h5/user/lower/upper', function (req, res) {
    console.log(1,req);
    res.json({
        code: 0,
        message: 'ok',
        data: {
            a: 1234523
        }
    });
});
app.use('/user/login', function (req, res) {
    console.log(1,req);
    res.json({
        code: 0,
        message: 'ok',
        data: {
            a: 1234523
        }
    });
});

//
// // 错误处理中间件
// app.use(function(err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
// });


// 设置应用监听的端口
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// 创建http服务器
var server = http.createServer(app);

// 监听端口
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// 格式化应用监听的端口
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

// http的错误监听函数
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

// http端口监听函数
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

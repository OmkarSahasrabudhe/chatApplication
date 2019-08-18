var http = require('http');
var fs = require('fs');

const getResponse = (response, contentType, fileURL) => {
    response.writeHead(200, { 'Content-type': contentType });
    fs.readFile(fileURL, (err, html) => {
        if (err) {
            throw err;
        }
        response.write(html);
        response.end();
    });
}
var activeUsers = [];
var sayings = new Map();


http.createServer(function (request, response) {

    let fileName = './login.html';
    let filetype = 'text/html';
    if (request.url.includes(".html")) {
        fileName = `.${request.url}`;
    } else if (request.url.includes(".css")) {
        fileName = `.${request.url}`;
        filetype = 'text/css';
    } else if (request.url.includes(".js")) {
        fileName = `.${request.url}`;
        filetype = 'text/javascript';
    } else if (request.url.includes('.svg')) {

        fileName = `.${request.url}`;
        filetype = `image/svg+xml`;
    }

    switch (request.url) {
        case '/user':
            response.writeHead(200, { 'Content-type': 'application/json' });
            request.on('data', (data) => {

                response.write(JSON.stringify(activeUsers));
                response.end();
            });
            break;
        case '/setChat':
            response.writeHead(200, { 'Content-type': 'application/json' });

            request.on('data', (data) => {
                let info = JSON.parse(data);
                let mymap = sayings.get(info.loginuser);
                if (mymap.has(info.u_name)) {
                    mymap.get(info.u_name).push(info.msg);
                }
                else {
                    let a = [];
                    a.push(info.msg);
                    mymap.set(info.u_name, a);

                }
                response.end();
            });
            break;
        case '/getChat':
            response.writeHead(200, { 'Content-type': 'application/json' });

            request.on('data', (data) => {
                let info = JSON.parse(data);
                let mymap = sayings.get(info.u_name);
                let msg;
                if (mymap.has(info.loginuser)) {
                    msg = mymap.get(info.loginuser);
                    response.write(JSON.stringify(msg));
                    response.end();
                    while (msg.length > 0) {
                        msg.pop();
                    }
                }
                else {
                    //response.write('hiii');
                    response.end();
                }
            });
            break;
        case '/valReq':
            response.writeHead(200, { 'Content-type': 'text/javascript' });
            request.on('data', (data) => {
                let queryData = JSON.parse(data);
                activeUsers.push(queryData.username);
                let mymap = new Map();
                sayings.set(queryData.username, mymap);

                response.write("success");
                response.end();

                // db.selectStatement(queryData.username, (result) => {
                //     let res = "Failed";
                //     if (result[0] != undefined) {
                //         let pass = result[0].password;
                //         if (queryData.password.toString() == pass) {
                //             res = "success";
                //             activeUsers.push(queryData.username);
                //         }
                //     }
                //     response.write(res);
                //     response.end();

                // });
            });
            break;
        default:
            getResponse(response, filetype, fileName);
    }
}).listen(8080);
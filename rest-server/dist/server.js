"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var jsonServer = require("json-server");
var log = console.log;
var dbFile = path.join(__dirname, '..', 'db.json');
var port = 3000;
var server = jsonServer.create();
var router = jsonServer.router(dbFile);
var middlewares = jsonServer.defaults();
// const interceptor = (req: any, res: any, next: any) => {
//   log(req);
//   next();
// };
// server.use(interceptor);
server.use(middlewares);
server.use(router);
server.listen(port, function () {
    log("JSON Server is running at http://localhost:" + port + ".");
});
//# sourceMappingURL=server.js.map
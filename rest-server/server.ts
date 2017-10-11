import * as path from 'path';
import * as jsonServer from 'json-server';

const log = console.log;
const dbFile = path.join(__dirname, '..', 'db.json');

const port = 3000;
const server = jsonServer.create();
const router = jsonServer.router(dbFile);
const middlewares = jsonServer.defaults();

// const interceptor = (req: any, res: any, next: any) => {
//   log(req);
//   next();
// };
// server.use(interceptor);

server.use(middlewares);
server.use(router);
server.listen(port, () => {
  log(`JSON Server is running at http://localhost:${port}.`);
});

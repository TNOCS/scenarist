/**
 * Module dependencies.
 */
import * as express from 'express';
import * as compression from 'compression';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as config from 'config';
import {
  IPlayerConfig
} from './config/IPlayerConfig';
import {
  IDbConfig
} from './config/IDatabaseConfig';

var playerConfig: IPlayerConfig = config.get('Player');
if (!playerConfig) playerConfig = < IPlayerConfig > {};
if (!playerConfig.port) playerConfig.port = 3002;

var dbConfig: IDbConfig = config.get('Database');
if (!dbConfig) dbConfig = < IDbConfig > {};
if (!dbConfig.host) dbConfig.host = 'http://localhost:3000';
if (!dbConfig.scenarioRoute) dbConfig.scenarioRoute = '/scenarios';
if (!dbConfig.entityRoute) dbConfig.entityRoute = '/entityTypes';

/**
 * Controllers (route handlers).
 */
import {
  ScenarioController
} from './controllers/ScenarioController';

/**
 * Create Express server.
 */
const app = express();
app.set('port', playerConfig.port);
app.use(cors());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 31557600000
}));

var scenarioController = new ScenarioController(dbConfig, playerConfig);
/**
 * Primary app routes.
 */
app.get('/', (req, res) => {
  scenarioController.index(req, res)
});
app.get('/play/:scenarioId', (req, res) => {
  scenarioController.play(req, res)
});
app.get('/pause/:scenarioId', (req, res) => {
  scenarioController.pause(req, res)
});
app.get('/stop/:scenarioId', (req, res) => {
  scenarioController.stop(req, res)
});
app.get('/state/:scenarioId', (req, res) => {
  scenarioController.state(req, res)
});
app.get('/speed/:scenarioId/:speed', (req, res) => {
  scenarioController.speed(req, res)
});
app.get('/reload/:scenarioId', (req, res) => {
  scenarioController.reload(req, res)
});
app.get('/allscenarios', (req, res) => {
  scenarioController.scenarios(req, res);
});
app.get('/scenarios', (req, res) => {
  scenarioController.playableScenarios(req, res);
});
app.get('/current/:scenarioId', (req, res) => {
  // scenarioController.current(req, res);
  scenarioController.currentPlaying(req, res);
});

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log(('  App is running at http://localhost:%d'), app.get('port'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
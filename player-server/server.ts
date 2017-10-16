/**
 * Module dependencies.
 */
import * as express from 'express';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as config from 'config';
import { IPlayerConfig} from './config/PlayerConfig';

var playerConfig: IPlayerConfig = config.get('Player');
if (!playerConfig) playerConfig = <IPlayerConfig>{};
if (!playerConfig.port) playerConfig.port = 3001;

/**
 * Controllers (route handlers).
 */
import * as scenarioController from './controllers/scenario';

/**
 * Create Express server.
 */
const app = express();
app.set('port', process.env.PORT || 3002);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', scenarioController.index);
app.get('/play/:scenarioId', scenarioController.play);
app.get('/pause/:scenarioId', scenarioController.pause);
app.get('/stop/:scenarioId', scenarioController.stop);
app.get('/speed/:scenarioId', scenarioController.speed);
app.get('/reload/:scenarioId', scenarioController.reload);
app.get('/scenarios', scenarioController.scenarios);

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log(('  App is running at http://localhost:%d'), app.get('port'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
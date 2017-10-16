"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module dependencies.
 */
const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");
const path = require("path");
const config = require("config");
var playerConfig = config.get('Player');
if (!playerConfig)
    playerConfig = {};
if (!playerConfig.port)
    playerConfig.port = 3001;
/**
 * Controllers (route handlers).
 */
const scenarioController = require("./controllers/scenario");
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
/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log(('  App is running at http://localhost:%d'), app.get('port'));
    console.log('  Press CTRL-C to stop\n');
});
module.exports = app;
//# sourceMappingURL=server.js.map
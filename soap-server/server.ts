import * as fs from 'fs-extra';
import * as soap from 'soap';
import * as http from 'http-server';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as config from 'config';
import {Soap} from './soap/SoapService';
import {IPlayerConfig} from './soap/IPlayerConfig';

var soapConfig: Soap.ISoapConfig = config.get('Soap');
if (!soapConfig.wsdlRoute) soapConfig.wsdlRoute = '/wsdl';
if (!soapConfig.wsdlFile) soapConfig.wsdlFile = './wsdl/schema.wsdl';
if (!soapConfig.xmlFolder) soapConfig.xmlFolder = './xml';
if (!soapConfig.port) soapConfig.port = 3001;

var playerConfig: IPlayerConfig = config.get('Player');
if (!playerConfig.host) playerConfig.host = 'http://localhost:3002';
if (!playerConfig.scenarioUpdateDebounceSeconds) playerConfig.scenarioUpdateDebounceSeconds = 5;
if (!playerConfig.scenarioRoute) playerConfig.scenarioRoute = '/scenarios';
if (!playerConfig.currentSituationRoute) playerConfig.currentSituationRoute = '/current';

var wsdl = fs.readFileSync(soapConfig.wsdlFile, 'utf8');

var soapService = new Soap.SoapService(playerConfig);

var app = express();
app.use(cors());
//body parser middleware are supported (optional)
app.use(bodyParser.raw({
    type: () => {
        return true;
    },
    limit: '10mb'
}));

app.listen(soapConfig.port, () => {
    //Note: /wsdl route will be handled by soap module, all other routes will continue to work
    var soapServer = soap.listen(app, {
        path: soapConfig.wsdlRoute, 
        services: soapService.NvgSoapService, 
        xml: wsdl,
        skipXmlDeclaration: true
    }
    );
    soapServer.log = (type, data) => {
        console.log(`Type: ${type}, Data: ${data}`);
    };
    console.log(`SOAP server listening on ${soapConfig.port}`);
});

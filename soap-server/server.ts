import * as fs from 'fs-extra';
import * as soap from 'soap';
import * as http from 'http-server';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as config from 'config';
import {Soap} from './soap/SoapService';

var soapConfig: Soap.ISoapConfig = config.get('Soap');
if (!soapConfig.wsdlRoute) soapConfig.wsdlRoute = '/wsdl';
if (!soapConfig.wsdlFile) soapConfig.wsdlFile = './wsdl/schema.wsdl';
if (!soapConfig.xmlFolder) soapConfig.xmlFolder = './xml';
if (!soapConfig.port) soapConfig.port = 3001;

var wsdl = fs.readFileSync(soapConfig.wsdlFile, 'utf8');

var soapService = new Soap.SoapService(soapConfig.xmlFolder);

var app = express();
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
        xml: wsdl
    }
    );
    soapServer.log = (type, data) => {
        console.log(`Type: ${type}, Data: ${data}`);
    };
    console.log(`SOAP server listening on ${soapConfig.port}`);
});

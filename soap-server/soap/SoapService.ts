import * as http from 'http';
import * as requestJson from 'request-json';
import {
    GeojsonToNvgConverter,
    IFeatureCollection
} from './GeojsonToNvgConverter';
import {
    ScenariosToNvgConverter
} from './ScenariosToNvgConverter';
import {
    IPlayerConfig
} from './IPlayerConfig';
import * as httpcodes from 'http-status-codes';
const testJson = require('./TestJson.json');

export namespace Soap {
    export interface ISoapConfig {
        wsdlRoute: string;
        xmlFolder: string;
        wsdlFile: string;
        port: number;
    }

    export class SoapService {
        private nvgConverter = new GeojsonToNvgConverter();
        private scenariosConverter = new ScenariosToNvgConverter();
        private requestClient;

        constructor(private playerOptions: IPlayerConfig) {
            this.requestClient = new requestJson.createClient(playerOptions.host);
        }

        GetCapabilities(args, cb, headers, req) {
            this.GetScenarios(args, cb, headers, req, (scenarios: any[]) => {
                cb(this.scenariosConverter.convert(scenarios));
            });
        }

        GetNvg(args, cb, headers, req) {
            this.GetSituation(args, cb, headers, req, (ftCollection: IFeatureCollection) => {
                cb(this.nvgConverter.convert(ftCollection));
            });
        }

        private GetScenarios(args, cb, headers, req, innerCb) {
            let opts: requestJson.CoreOptions = {
                timeout: 5000
            };
            this.requestClient.get(this.playerOptions.scenarioRoute, opts, (err, res, body) => {
                if (err || res.statusCode !== httpcodes.OK) {
                    innerCb();
                    return;
                }
                innerCb(body);
            });
        }

        private GetSituation(args, cb, headers, req, innerCb) {
            innerCb(this.getTestJson());
        }

        /**
         * The structure required for node-soap to find the correct SOAP-commands.
         * Do not change the names of the keys!!!
         */
        public NvgSoapService = {
            NvgV15WebService: {
                Soap_NVGPortType2009: {
                    GetCapabilities: (args, cb, headers, req) => {
                        return this.GetCapabilities(args, cb, headers, req);
                    },
                    GetNvg: (args, cb, headers, req) => {
                        return this.GetNvg(args, cb, headers, req);
                    }
                }
            }
        }

        private getTestJson(): IFeatureCollection {
            return testJson;
        }
    }
}
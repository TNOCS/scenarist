import * as http from 'http';
import * as xml2js from 'xml2js';
import * as requestJson from 'request-json';
import {
    IScenarioState
} from '../models/playstate';
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
import * as soap from 'soap';
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
        private xmlParser = new xml2js.Parser();

        private lastScenarioUpdate: number = 0;
        private scenarioCache;

        constructor(private playerOptions: IPlayerConfig) {
            this.requestClient = new requestJson.createClient(playerOptions.host);
            this.updateScenarioCache();
        }

        private updateScenarioCache() {
            this.GetScenarios(null, null, null, null, (result) => {
                if (!result) {
                    console.warn(`Error getting scenarios from the player.`);
                } else {
                    console.log(`Scenarios update success.`);
                }
            });
        }

        GetCapabilities(args, cb, headers, req) {
            this.GetScenarios(args, cb, headers, req, (scenarios) => {
                cb(this.scenariosConverter.convert(scenarios));
            });
        }

        GetNvg(args, cb, headers, req) {
            if (!req || !req.body) {
                console.warn('No nvg-filter supplied');
                cb(null);
                return;
            }
            this.parseFilter(req.body.toString(), (err, result) => {
                // console.log(JSON.stringify(result, null, 2));
                let selectionObj, scenarioId;
                var selectionArr = this.findNestedKey(result, 'select_response');
                if (selectionArr && Array.isArray(selectionArr)) {
                    selectionObj = selectionArr[0];
                    Object.keys(selectionObj).forEach((key) => {
                        if (key.indexOf('selected') >= 0) {
                            scenarioId = selectionObj[key][0];
                        }
                    }); 
                }
                if (scenarioId == null) {
                    console.warn(`Could not extract scenario id from nvg-filter. Send nothing.`);
                }
                this.GetSituation(args, cb, headers, req, scenarioId, (ftCollection: IFeatureCollection) => {
                    cb(this.nvgConverter.convert(ftCollection));
                });
            });
        }

        private findNestedKey(tree, findKey) {
            let found = false;
            let result;
            const findKeys = Object.keys(tree);
            findKeys.forEach((key) => {
                if (key.indexOf(findKey) >= 0) {
                    found = true;
                    result = tree[key];
                } else {
                    found = false;
                }
            });
            if (found) {
                return result;
            } else {
                findKeys.forEach((key) => {
                    if (typeof tree[key] === 'object') {
                        result = this.findNestedKey(tree[key], findKey);
                        found = true;
                    }
                });
                if (found) {
                    return result;
                }
            }
        }

        private parseFilter(input: string, cb: Function) {
            this.xmlParser.parseString(input, (err, data) => {
                if (err) {
                    console.warn(`Error parsing xml: ${err}`);
                    cb(err);
                    return;
                }
                cb(err, data);
            });
        }

        private GetScenarios(args, cb, headers, req, innerCb) {
            // If the scenarios were recently updated, return the cached values
            if ((Date.now() - this.lastScenarioUpdate) < this.playerOptions.scenarioUpdateDebounceSeconds * 1000) {
                innerCb(this.scenarioCache);
                return;
            }
            let opts: requestJson.CoreOptions = {
                timeout: 5000
            };
            this.requestClient.get(this.playerOptions.scenarioRoute, opts, (err, res, body) => {
                if (err || res.statusCode !== httpcodes.OK) {
                    innerCb();
                    return;
                }
                this.scenarioCache = body;
                this.lastScenarioUpdate = Date.now();
                innerCb(body);
            });
        }

        private GetSituation(args, cb, headers, req, scenarioId, innerCb) {
            if (!scenarioId) {
                innerCb();
                return;
            };
            let opts: requestJson.CoreOptions = {
                timeout: 5000
            };
            let urlPath = `${this.playerOptions.currentSituationRoute}/${scenarioId}`;
            this.requestClient.get(urlPath, opts, (err, res, body) => {
                if (err || res.statusCode !== httpcodes.OK) {
                    innerCb();
                    return;
                }
                innerCb(body);
                // innerCb(this.getTestJson());
            });
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
import * as fs from 'fs-extra';
import * as path from 'path';

export namespace Soap {

    export interface ISoapConfig {
        wsdlRoute: string;
        xmlFolder: string;
        wsdlFile: string;
        port: number;
    }

    export class SoapService {

        private GetCapabilitiesXml;
        private GetNvgXml;

        constructor(private xmlFolder = './xml') {
            this.GetCapabilitiesXml = fs.readFileSync(path.join(xmlFolder, 'GetCapabilities.xml'), 'utf8');
            this.GetNvgXml = fs.readFileSync(path.join(xmlFolder, 'GetNvg.xml'), 'utf8');
        }

        GetCapabilities(args, cb, headers, req) {
            return {
                // _xml: this.GetCapabilitiesXml
                attributes: {
                    xmlns: "http://tide.act.nato.int/wsdl/2009/nvg"
                },
                nvg_capabilities: {
                    attributes: {
                        version: "1.5.0",
                        xmlns: "http://tide.act.nato.int/schemas/2009/10/nvg"
                    },
                    select: {
                        attributes: {
                            name: "Situation Overlays",
                            id: "Situation Overlays",
                            list: "true",
                            multiple: "true"
                        },
                        values: {
                            value: [{
                                    attributes: {
                                        id: "0",
                                        name: "BFT"
                                    }
                                },
                                {
                                    attributes: {
                                        id: "1",
                                        name: "Friendly Actors"
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }

        GetNvg(args, cb, headers, req) {
            return {
                _xml: this.GetNvgXml
            }
        }

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
    }
}
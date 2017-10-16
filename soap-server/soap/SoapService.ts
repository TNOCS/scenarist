import {
    GeojsonToNvgConverter,
    IFeatureCollection
} from './GeojsonToNvgConverter';

export namespace Soap {
    export interface ISoapConfig {
        wsdlRoute: string;
        xmlFolder: string;
        wsdlFile: string;
        port: number;
    }

    export class SoapService {
        private nvgConverter = new GeojsonToNvgConverter();

        constructor(private xmlFolder = './xml') {

        }

        GetCapabilities(args, cb, headers, req) {
            return {
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
                            name: "Simulation Overlay",
                            id: "Simulation Overlay",
                            list: "true",
                            multiple: "false"
                        },
                        values: {
                            value: [{
                                attributes: {
                                    id: "0",
                                    name: "Selected Scenario"
                                }
                            }]
                        }
                    }
                }
            }
        }

        GetNvg(args, cb, headers, req) {
            return this.nvgConverter.convert(this.getTestJson());
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
            return {
                "type": "FeatureCollection",
                "features": [{
                        "type": "Feature",
                        "id": "{bbwerdsfger-000}",
                        "properties": {
                            "Name": "Piet",
                            "icon": "app6a:SHGAUCATW-MO---"
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                5.0734375,
                                52.38901106223458
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "id": "{werdsfger-000}",
                        "properties": {
                            "Name": "Pietsland",
                            "icon": "app6a:SHF-GS------GM-"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        5.339012145996094,
                                        52.40032417190779
                                    ],
                                    [
                                        5.327339172363281,
                                        52.36092526159479
                                    ],
                                    [
                                        5.413856506347656,
                                        52.31225685947289
                                    ],
                                    [
                                        5.433769226074218,
                                        52.373083994540266
                                    ],
                                    [
                                        5.339012145996094,
                                        52.40032417190779
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "id": "{mnwedhfgger-000}",
                        "properties": {
                            "Name": "Pietslijn",
                            "icon": "app6a:GFC-BOAWS-----X"
                        },
                        "geometry": {
                            "type": "LineString",
                            "coordinates": [
                                [
                                    5.398063659667969,
                                    52.41163438166172
                                ],
                                [
                                    5.3551483154296875,
                                    52.41791657858491
                                ],
                                [
                                    5.310859680175781,
                                    52.41205322263206
                                ]
                            ]
                        }
                    }
                ]
            }
        }
    }
}
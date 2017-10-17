import {
    IScenarioState
} from '../models/playstate';
/**
 * The JSON-structure that node-soap converts into a valid
 * nvg-format according to the GetCapabilities schema
 */
export const nvgStructure = {
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
                multiple: "false" // true to select multiple scenarios
            },
            values: {}
        }
    }
}

/**
 * The JSON-structure that node-soap converts into a valid
 * nvg-feature, e.g. scenario id and name.
 */
export interface IScenarioNvgStructure {
    attributes: {
        id: string;
        name: string;
    }
};

export interface IScenarioStateData {
    [id: string]: IScenarioState;
}

export class ScenariosToNvgConverter {

    constructor() {}

    convert(scenarios: IScenarioStateData): any {
        if (!scenarios) scenarios = {};
        var result = JSON.parse(JSON.stringify(nvgStructure));
        var nvgScenarios = [];
        Object.keys(scenarios).forEach((scenKey: string) => {
            let scen: IScenarioState = scenarios[scenKey];
            let scenObj: IScenarioNvgStructure = {
                attributes: {
                    name: scen.title,
                    id: scenKey.toString()
                }
            }
            nvgScenarios.push(scenObj);
        })
        result.nvg_capabilities.select.values['value'] = nvgScenarios;
        return result;
    }
}
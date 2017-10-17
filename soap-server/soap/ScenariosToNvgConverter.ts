import {
    IScenario
} from '../models/scenario';
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
                multiple: "true"
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

export class ScenariosToNvgConverter {

    constructor() {}

    convert(scenarios: IScenario[]): any {
        if (!scenarios) scenarios = [];
        var result = JSON.parse(JSON.stringify(nvgStructure));
        var nvgScenarios = [];
        scenarios.forEach((scen: IScenario) => {
            let scenObj: IScenarioNvgStructure = {
                attributes: {
                    name: scen.title,
                    id: scen.id.toString()
                }
            }
            nvgScenarios.push(scenObj);
        })
        result.nvg_capabilities.select.values['value'] = nvgScenarios;
        return result;
    }
}
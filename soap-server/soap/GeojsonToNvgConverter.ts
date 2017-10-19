import * as fs from 'fs-extra';
import * as path from 'path';

export interface IFeatureCollection {
    type: 'FeatureCollection',
        features: IFeature[]
}

export interface IFeature {
    id ? : string;
    type: 'Feature',
        geometry: IGeoJsonGeometry;
    properties ? : IProperty;
}

export interface IGeoJsonGeometry {
    type: string;
    coordinates: any;
}

export interface IProperty {
    [key: string]: any;
}

export const ICON_PROPERTY = 'sidc';

/**
 * The JSON-structure that node-soap converts into a valid
 * nvg-format according to the GetNvgResponse schema
 */
export const nvgStructure = {
    attributes: {
        xmlns: "http://tide.act.nato.int/wsdl/2009/nvg"
    },
    nvg: {
        attributes: {
            version: "1.5.0",
            xmlns: "http://tide.act.nato.int/schemas/2009/10/nvg"
        },
        g: {
            attributes: {
                uri: "0",
                label: "Selected Scenario"
            }
        }
    }
}

/**
 * The JSON-structure that node-soap converts into a valid
 * nvg-feature, e.g. a point, polyline or polygon.
 */
export const geomNvgStructure = {
    attributes: {},
    ExtendedData: {}
};

export const geomTypes = {
    Point: 'point',
    LineString: 'polyline',
    Polygon: 'polygon'
};

export class GeojsonToNvgConverter {

    constructor() {}

    convert(input: IFeatureCollection): any {
        if (!input) input = < IFeatureCollection > {
            type: 'FeatureCollection',
            features: []
        };
        var fts: IFeature[];
        if (Array.isArray(input)) {
            fts = input;
        } else {
            fts = input.features;
        }
        var result = JSON.parse(JSON.stringify(nvgStructure));
        var nvgGeometries = {};
        Object.keys(geomTypes).forEach((type) => {
            nvgGeometries[geomTypes[type]] = this.convertAllOfType(fts, type);
        })
        result.nvg.g = Object.assign({}, result.nvg.g, nvgGeometries);
        return result;
    }

    private convertAllOfType(fts: IFeature[], type: string): any[] {
        var res = [];
        fts.forEach((f) => {
            if (f && f.geometry && f.geometry.type === type) {
                let converted = this.convertType(f, type);
                if (converted) res.push(converted);
            }
        });
        return res;
    }

    private convertType(f: IFeature, type: string): any {
        switch (type) {
            case "Point":
                return this.convertPoint(f, type);
            case "LineString":
                return this.convertLine(f, type);
            case "Polygon":
                break;
            default:
                break;
        }
        return null;
    }

    private convertPoint(f: IFeature, type: string) {
        var res = JSON.parse(JSON.stringify(geomNvgStructure));
        res.attributes['x'] = f.geometry.coordinates[0];
        res.attributes['y'] = f.geometry.coordinates[1];
        res.attributes['uri'] = f.id;
        res.attributes['label'] = (f.properties && f.properties.title ? f.properties.title : f.id);
        res.attributes['symbol'] = f.properties[ICON_PROPERTY];
        res['ExtendedData'] = {
            SimpleData: []
        };
        Object.keys(f.properties).forEach((fkey) => {
            res['ExtendedData']['SimpleData'].push({
                attributes: {
                    key: fkey
                },
                $value: f.properties[fkey]
            });
        });
        return res;
    }

    private convertLine(f: IFeature, type: string) {
        var res = JSON.parse(JSON.stringify(geomNvgStructure));
        var pointsString = f.geometry.coordinates.reduce((str, xy) => {
            return '' + str + ' ' + xy.join(',');
        });
        res.attributes['points'] = pointsString;
        res.attributes['uri'] = f.id;
        res.attributes['label'] = f.id;
        res.attributes['symbol'] = f.properties[ICON_PROPERTY];
        res['ExtendedData'] = {
            SimpleData: []
        };
        Object.keys(f.properties).forEach((fkey) => {
            res['ExtendedData']['SimpleData'].push({
                attributes: {
                    key: fkey
                },
                $value: f.properties[fkey]
            });
        });
        return res;
    }
}
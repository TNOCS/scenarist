import {
    IDbConfig
} from '../config/IDatabaseConfig';
import {
    IPlayerConfig
} from '../config/IPlayerConfig';
import {
    IScenario,
    ITrack
} from '../models/scenario';
import {
    IEntityType
} from '../models/entity';
import {
    IProperty
} from '../models/property';
import * as Utils from '../utils/utils';
import {
    IScenarioState,
    PlayState,
    SerializeScenarioState
} from '../models/playstate';
import * as request from 'request';
import * as async from 'async';
import * as _ from 'underscore';
import * as httpcodes from 'http-status-codes';

const requestOpts: request.CoreOptions = {
    timeout: 5000
};
const MILLIS_TO_MINUTES = 1000 * 60;

export class InterpolationController {

    private entityTypes: {
        [id: string]: IEntityType
    } = {};
    private propertyTypes: {
        [id: string]: IProperty;
    } = {};

    constructor(public dbOptions: IDbConfig, public playerOptions: IPlayerConfig) {

    }

    /**
     * Calculate and return a featurecollection for the simulation time (in IScenarioState)
     */
    public getCurrentSituation(state: IScenarioState, cb: Function) {
        let scenarioId = state.id;
        let simulationTimeMinutes = (state.currentTime - state.startTime) / MILLIS_TO_MINUTES;
        let url = `${this.getUrl(this.dbOptions.scenarioRoute)}/${scenarioId}?_embed=tracks`;
        request.get(url, requestOpts, (err, innerRes, body) => {
            if (err || innerRes.statusCode !== httpcodes.OK || !body) {
                return cb();
            }
            let scenario;
            if (typeof body == 'string') {
                try {
                    scenario = JSON.parse(body);
                } catch (error) {
                    console.warn('Error parsing scenario');
                }
                if (!scenario) {
                    return cb();
                }
                this.calculateCurrentSituation(scenario, simulationTimeMinutes, cb);
            }
        });
    }

    /**
     * Loads all entities present in the scenario and
     * converts the tracks of the scenario to a 
     * FeatureCollection, based on the current simulation time.
     */
    private calculateCurrentSituation(scenario: IScenario, simTimeMins: number, cb: Function) {
        if (!scenario.tracks || !Array.isArray(scenario.tracks)) {
            console.warn('No tracks found in scenario');
            return cb();
        }
        let fc = Utils.createFeatureCollection();
        this.getEntityTypes(scenario, (err) => {
            if (err) {
                console.warn(`Error getting entityTypes: ${err}`);
                return cb();
            }
            scenario.tracks.forEach((tr) => {
                let ft = this.convertTrackToFeature(tr, simTimeMins);
                if (ft) fc.features.push(ft);
            })
            cb(fc);
        });
    }

    /**
     * Loads all entities and the accompanying properties present in the scenario.
     */
    private getEntityTypes(scenario: IScenario, cb: Function) {
        // Extract all unique entityTypes
        let entityIds = _.chain(scenario.tracks)
            .pluck('entityTypeId')
            .uniq()
            .value();
        // Request entityTypes from db
        async.each(entityIds, (id: string, callback: Function) => {
            return this.getEntityType(id, callback);
        }, (err) => {
            if (err) {
                return cb(err);
            }
            console.log(`Got ${entityIds.length} entityTypes`);
            cb();
        });
    }

    /**
     * Loads one entity from the db and the accompanying properties.
     */
    private getEntityType(id: string, callback: Function) {
        let url = `${this.getUrl(this.dbOptions.entityRoute)}/${id}`;
        request.get(url, requestOpts, (err, innerRes, body) => {
            if (err || innerRes.statusCode !== httpcodes.OK || !body) {
                return callback(err);
            }
            let entity;
            if (typeof body == 'string') {
                try {
                    entity = JSON.parse(body);
                } catch (error) {
                    console.warn('Error parsing entity');
                }
                if (!entity) {
                    return callback('Error parsing entity');
                }
                this.entityTypes[id] = entity;
                if (entity.hasOwnProperty('propertyIds')) {
                    this.getPropertyTypes(entity.propertyIds, (err) => {
                        callback(err);
                    });
                } else {
                    callback(); //success
                }
            }
        });
    }

    /**
     * Loads all properties for the provided propertyIds from the db.
     */
    private getPropertyTypes(propertyIds: string[], cb: Function) {
        if (!propertyIds || !Array.isArray(propertyIds)) return cb();
        // Request propertyTypes from db
        async.each(propertyIds, (id: string, callback: Function) => {
            return this.getPropertyType(id, callback);
        }, (err) => {
            if (err) {
                return cb(err);
            }
            console.log(`Got ${propertyIds.length} propertyTypes`);
            cb();
        });
    }

    /**
     * Loads one property from the db.
     */
    private getPropertyType(id: string, callback: Function) {
        let url = `${this.getUrl(this.dbOptions.propertyRoute)}/${id}`;
        request.get(url, requestOpts, (err, innerRes, body) => {
            if (err || innerRes.statusCode !== httpcodes.OK || !body) {
                return callback(err);
            }
            let property;
            if (typeof body == 'string') {
                try {
                    property = JSON.parse(body);
                } catch (error) {
                    console.warn('Error parsing property');
                }
                if (!property) {
                    return callback('Error parsing property');
                }
                this.propertyTypes[id] = property;
                callback(); //success
            }
        });
    }

    /**
     * Converts a track to a Feature. Interpolates features at multiple 
     * keyframes to a single feature.
     */
    private convertTrackToFeature(track: ITrack, simTimeMins: number) {
        if (!track.features || !Array.isArray(track.features)) {
            console.warn('No features found in track');
            return;
        }

        // Preprocess features to prevent null errors
        track.features.forEach((f) => {
            if (!f.properties) f.properties = {};
        })

        let timeFeatures: {
            [keyFrame: number]: GeoJSON.Feature < GeoJSON.Point >
        };
        timeFeatures = this.getFeaturesWithTimestring(track);

        // If no features with timestamps are found
        if (_.isEmpty(timeFeatures) || Object.keys(timeFeatures).length === 0) {
            console.warn(`Track ${track.id} has no valid features with timestamps.`);
            if (track.features.length > 0) {
                console.log(`Fallback to first feature of ${track.id}, ignoring missing timestamps.`);
                let ft = this.enrichFeature(track.features[0], track);
                return ft;
            }
        }

        // Interpolate features based on current player time
        let keyFrames: number[] = _.map(Object.keys(timeFeatures), (key) => {
            return +key;
        });

        let ft;
        if (keyFrames.length === 1 && keyFrames[0] > simTimeMins) {
            // Get first item if its the only one
            ft = timeFeatures[keyFrames[0]];
        } else if (keyFrames[0] > simTimeMins) {
            // Return no item if its first keyframe is in the future
            ft = null;
        } else if (keyFrames[keyFrames.length - 1] < simTimeMins) {
            // Return the last keyframe if that is in the past
            ft = timeFeatures[keyFrames[keyFrames.length - 1]];
        } else {
            // Interpolate
            let firstIndex;
            keyFrames.some((kf, index) => {
                if (kf > simTimeMins) {
                    firstIndex = index - 1;
                    return true;
                }
            });
            let progressPerc = (simTimeMins - keyFrames[firstIndex]) / (keyFrames[firstIndex + 1] - keyFrames[firstIndex]);
            ft = this.interpolateFeatures(timeFeatures[keyFrames[firstIndex]], timeFeatures[keyFrames[firstIndex + 1]], progressPerc);
        }

        return (ft ? this.enrichFeature(ft, track) : ft);
    }

    /**
     * Interpolates two features at sequential keyframes to a single feature.
     * Uses the first feature as basis for all properties, only the 
     * coordinates are interpolated.
     */
    private interpolateFeatures(f1: GeoJSON.Feature < GeoJSON.Point > , f2: GeoJSON.Feature < GeoJSON.Point > , progressPerc: number) {
        let f = JSON.parse(JSON.stringify(f1));
        f.geometry.coordinates[0] = this.interpolateCoordinate(f1.geometry.coordinates[0], f2.geometry.coordinates[0], progressPerc);
        f.geometry.coordinates[1] = this.interpolateCoordinate(f1.geometry.coordinates[1], f2.geometry.coordinates[1], progressPerc);
        console.log(`Interpolate [${f1.geometry.coordinates[0]},${f1.geometry.coordinates[1]}] and [${f2.geometry.coordinates[0]},${f2.geometry.coordinates[1]}] to  [${f.geometry.coordinates[0]},${f.geometry.coordinates[1]}] for progress ${progressPerc}`);
        return f;
    }

    /**
     * Interpolates two coordinate-points
     * TODO: geodetic transformation
     */
    private interpolateCoordinate(a: number, b: number, progress: number) {
        return a + ((b - a) * progress);
    }

    /**
     * Return all features with a valid timestring in their props
     */
    private getFeaturesWithTimestring(track: ITrack) {
        let timeFeatures = {};
        track.features.forEach((f) => {
            if (!f.properties.hasOwnProperty('time')) return;
            let t = f.properties.time;
            if (typeof t !== 'string' || !t.match(/(\d+)(:)(\d+)/)) return;
            timeFeatures[Utils.timeStringToMinutes(f.properties.time)] = f;
        });
        return timeFeatures;
    }

    /**
     * Convert propertyIds to titles and add nvg-specific keys (e.g. id, sidc) to the feature props.
     */
    private enrichFeature(f: any, track: ITrack) {
        Object.keys(f.properties).forEach((key) => {
            if (this.propertyTypes.hasOwnProperty(key)) {
                f.properties[this.propertyTypes[key].title] = f.properties[key];
                delete f.properties[key];
            }
        });
        f.properties['sidc'] = `app6a:${this.entityTypes[track.entityTypeId].sidc}`;
        f.properties['title'] = track.title;
        f.properties['description'] = track.description;
        f.id = `t${track.id}e${track.entityTypeId}`;
        return f;
    }

    private getUrl(route: string) {
        return `${this.dbOptions.host}${route}`;
    }
}
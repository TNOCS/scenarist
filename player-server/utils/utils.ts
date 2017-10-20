export function dateTimeToMillis(date: string, time: string) {
    if (!date || !time) return null;
    let longTimeString = time.concat(':00.000Z');
    let dateString = date.split('T').shift();
    let totalString = dateString + 'T' + longTimeString;
    return Date.parse(totalString);
}

export function createFeatureCollection() {
    return {
        type: "FeatureCollection",
        features: []
    };
}

export function createPointFeature(lon: number, lat: number, properties?: any) {
    var gjson = {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [lon, lat]
        },
        properties: properties
    }
    return gjson;
}

export function compareTimeFeatures(a: GeoJSON.Feature<any>, b: GeoJSON.Feature<any>) {
    return timeStringToMinutes(a.properties.time) - timeStringToMinutes(b.properties.time);
}

export function timeStringToMinutes(t: string) {
    let hourMinute = t.match(/(\d+)(:)(\d+)/);
    if (!hourMinute || hourMinute.length < 4) return 0;
    let minutes = (+hourMinute[3] + (60 * +hourMinute[1]));
    return minutes;
}
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
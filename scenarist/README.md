# Scenarist

The GUI which allows you to create entities and simulate them on a map.

## Installation

```console
npm i -g aurelia-cli
yarn
au run --watch
```

The web application should be running on [localhost:8080](http://localhost:8080).

NOTE: The backend REST service, which can be found in `../rest-server`, should be running already.

## Deployment



# Scenario Editor requirements

## Entity editor GUI
- Create/edit/delete attributes (id, name, unit, default values, isDefault)
- [optional] Create/edit/delete factions (id, name, color, [line type]) so we can easily visualise different factions on the map
- Create new entity type (id, name, image or AAP6 code so we can generate it, faction, and a list of attribute ids)
- ? What do we do when we change/delete an existing entity. Do we also remove it from existing tracks that are using it?
- Copy the mil-symbol-editor from here: https://www.spatialillusions.com/unitgenerator.html. It allows you to create the SIDC code based on a number of questions.

## Scenario editor GUI
- Create/edit/delete scenario
- Show map
- [optional] Show/hide overlays
- [optional] Create/edit/delete groups
- [optional] Group entities, e.g. so we can mimic an ORBAT, and hide a group of related entities with a single click.
- Show/hide entities on the map (basically, an entity is a kind of overlay) -
- Create/edit/delete new entity (based on entity type) in scenario
- Select entity and show (edit) property values
- Move entity thereby creating a new feature (location at timestamp). These locations can also be deleted.
- Timeline (e.g. vis.js)
  - min/max is based on the start/end time of the scenario.
  - When changing the current time, the entity positions are recalculated by interpolating between the two nearest time stamps (before and after the current time, if available).
- [optional] Time shift of whole scenario (set the new start time) or single entity
- [optional] Add tracks from other scenarios
- ? What do we do when we delete a track from the current scenario? It may be used by another scenario, so keep it.

### Scenario

A scenario has a:
- name
- id
- start time
- end time
- list of track IDs

It also contains a list of settings, e.g.
- the bounding box of the area,
- the URL of a base layer
- [optional] A list of overlay layers
- Logging timestep, e.g. each minute

### Entity tracks
Each entity track is a GeoJSON object with the positions of a single entity at different points in time as feature. Each feature has a position, and a time stamp relative to the start time of the scenario. It also has all entity attributes, which may change between positions.
The first feature is special - it contains a polyline going through all entity positions, so we can easily visualise the whole track.

## Scenario editor service
- REST service
- Stores scenarios (e.g. /scenarios, /scenarios/:id)
- Stores tracks (e.g. /tracks, /tracks/:id)
- Logs a scenario as NVG (e.g. scenarios/log?timestep=60)
- [optional] Plays a scenario (publish locations of entities to clients via websockets)

## NEW
- Enter coordinates by hand
- Enter coordinates as MGRS (military grid reference system) or lat lng
- Support KML overlays

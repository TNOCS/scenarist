# NVG Player

The GUI allows you to select a scenario, and serve the NVG-files through a SOAP-service.

## Installation

```console
npm i -g aurelia-cli
yarn
au run --watch
```

The web application should be running on [localhost:8081](http://localhost:8081).

NOTE: The backend REST service, which can be found in `../rest-server`, should be running already.

## Deployment


# Scenario Editor requirements

## Scenario selector GUI
- Show a list of available scenario's
- [optional] Link to scenario editor for creating new scenario's

## Scenario player GUI
- Play/pause/stop scenario
- Forward/backward function

export class ScenarioEditorCustomElement {
  public attached() {
    const mapMargin = 65;
    const map = $('#map');
    const w = $(window);
    // https://gis.stackexchange.com/questions/62491/sizing-leaflet-map-inside-bootstrap
    const resize = () => {
      const height = w.height();
      map.css('height', height - mapMargin);
      // map.css('margin-top', 50);
      // if (w.width() >= 980) {
      //   map.css('height', height - mapMargin);
      //   map.css('margin-top', 50);
      // } else {
      //   map.css('height', height - (mapMargin + 12));
      //   map.css('margin-top', -21);
      // }
    };
    w.on('resize', resize);
    resize();
  }
}

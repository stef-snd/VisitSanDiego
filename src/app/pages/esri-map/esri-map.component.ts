/*
  Copyright 2019 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from "@angular/core";
import { setDefaultOptions, loadModules } from 'esri-loader';
import { Point } from "esri/geometry";
import {map, Observable, Subscription} from "rxjs";
// import { FirebaseService, ITestItem } from "src/app/services/database/firebase";
// import { FirebaseMockService } from "src/app/services/database/firebase-mock";
import esri = __esri;
import GraphicsLayer = __esri.GraphicsLayer;
import {MapLocationService} from "../../services/store/map-location.service"; // Esri TypeScript Types

@Component({
  selector: "app-esri-map",
  templateUrl: "./esri-map.component.html",
  styleUrls: ["./esri-map.component.scss"]
})
export class EsriMapComponent implements OnInit, OnDestroy {
  // The <div> where we will place the map
  @ViewChild("mapViewNode", { static: true }) private mapViewEl: ElementRef;

  // register Dojo AMD dependencies
  _Map;
  _MapView;
  _FeatureLayer;
  _Graphic;
  _GraphicsLayer;
  _Route;
  _RouteParameters;
  _FeatureSet;
  _Point;
  _locator;

  // Instances
  map: esri.Map;
  view: esri.MapView;
  pointGraphic: esri.Graphic;
  graphicsLayer: esri.GraphicsLayer;

  // Attributes
  zoom = 10;
  center: Array<number> = [-117.161087, 32.715736];
  basemap = "arcgis-navigation";
  loaded = false;
  pointCoords: number[] = [-117.161087, 32.715736];
  dir: number = 0;
  count: number = 0;
  timeoutHandler = null;

  // firebase sync
  isConnected: boolean = false;
  subscriptionList: Subscription;
  subscriptionObj: Subscription;

  constructor(
    private mapLocationService: MapLocationService
  ) { }

  async initializeMap() {
    try {
      // configure esri-loader to use version x from the ArcGIS CDN
      // setDefaultOptions({ version: '3.3.0', css: true });
      setDefaultOptions({ css: true });

      // Load the modules for the ArcGIS API for JavaScript
      const [esriConfig, Map, MapView, FeatureLayer, Graphic, Point, GraphicsLayer, route, RouteParameters, FeatureSet, Search, LayerList,
             Home] = await loadModules([
        "esri/config",
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/Graphic",
        "esri/geometry/Point",
        "esri/layers/GraphicsLayer",
        "esri/rest/route",
        "esri/rest/support/RouteParameters",
        "esri/rest/support/FeatureSet",
        "esri/widgets/Search",
        "esri/widgets/LayerList",
        "esri/widgets/Home"
      ]);

      esriConfig.apiKey = "AAPKce79efafa9074f87a8e2a607b5ecb2d7RleSnQZAUk01Hkse_K3ZHGBWFdsfmOZCqaRpsBlFL6J1k48s5qCwbSgg9hNsQ2Ey";

      this._Map = Map;
      this._MapView = MapView;
      this._FeatureLayer = FeatureLayer;
      this._Graphic = Graphic;
      this._GraphicsLayer = GraphicsLayer;
      this._Route = route;
      this._RouteParameters = RouteParameters;
      this._FeatureSet = FeatureSet;
      this._Point = Point;

      // Configure the Map
      const mapProperties = {
        basemap: this.basemap
      };

      this.map = new Map(mapProperties);

      this.addFeatureLayers();
      this.buildGraphicLayer().subscribe(layer => this.map.layers.add(layer, -1));

      //this.addPoint(this.pointCoords[1], this.pointCoords[0], true);

      // Initialize the MapView
      const mapViewProperties = {
        container: this.mapViewEl.nativeElement,
        center: this.center,
        zoom: this.zoom,
        map: this.map
      };

      this.view = new MapView(mapViewProperties);

      // Fires `pointer-move` event when user clicks on "Shift"
      // key and moves the pointer on the view.
      this.view.on('pointer-move', ["Shift"], (event) => {
        let point = this.view.toMap({ x: event.x, y: event.y });
        console.log("map moved: ", point.longitude, point.latitude);
      });

      await this.view.when(); // wait for map to load
      console.log("ArcGIS map loaded");
      this.addRouter()

      const search = new Search({
        view: this.view
      });

      this.view.ui.add(search, "top-right");


      let layerList = new LayerList({
        view: this.view
      });
      this.view.ui.add(layerList, {
        position: "bottom-left",
      });

      let homeBtn = new Home({
        view: this.view
      });
      this.view.ui.add(homeBtn, "top-leading");

      var point = this.pointCoords
      this.findPlace(point)
      console.log("Map center: " + this.view.center.latitude + ", " + this.view.center.longitude);
      return this.view;
    } catch (error) {
      console.log("EsriLoader: ", error);
    }
  }

  buildGraphicLayer(): Observable<GraphicsLayer> {
    return this.mapLocationService.fetchLocations().pipe(
      map(locations => new this._GraphicsLayer({
        graphics: locations,
        title: "Attractions of Sand Diego"
      }))
    );
  }

  addFeatureLayers() {
    var cityOfSanDiegoRoads: __esri.FeatureLayer = new this._FeatureLayer({
      url:
        "https://services8.arcgis.com/KciNm1Iv5DgViAnE/arcgis/rest/services/City_of_San_Diego_Roads/FeatureServer",
        title: "Roads of San Diego"
    });

    this.map.add(cityOfSanDiegoRoads, -1);

    console.log("feature layers added");
  }

  addPoint(lat: number, lng: number, register: boolean) {
    const point = { //Create a point
      type: "point",
      longitude: lng,
      latitude: lat
    };
    const simpleMarkerSymbol = {
      type: "simple-marker",
      color: [226, 119, 40],  // Orange
      outline: {
        color: [255, 255, 255], // White
        width: 1
      }
    };
    let pointGraphic: esri.Graphic = new this._Graphic({
      geometry: point,
      symbol: simpleMarkerSymbol
    });

    //this.graphicsLayer.add(pointGraphic);
    if (register) {
      this.pointGraphic = pointGraphic;
    }
  }

  removePoint() {
    if (this.pointGraphic != null) {
      this.graphicsLayer.remove(this.pointGraphic);
    }
  }

  addRouter() {
    const routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";

    this.view.on("click", (event) => {
      console.log("point clicked: ", event.mapPoint.latitude, event.mapPoint.longitude);
      if (this.view.graphics.length === 0) {
        addGraphic("origin", event.mapPoint);
      } else if (this.view.graphics.length === 1) {
        addGraphic("destination", event.mapPoint);
        getRoute(); // Call the route service
      } else {
        this.view.ui.empty("bottom-right");
        this.view.graphics.removeAll();
        //addGraphic("origin", event.mapPoint);
      }
    });

    var addGraphic = (type: any, point: any) => {
      const graphic = new this._Graphic({
        symbol: {
          type: "simple-marker",
          color: (type === "origin") ? "blue" : "red",
          size: "8px"
        } as any,
        geometry: point
      });
      this.view.graphics.add(graphic);
    }

    var getRoute = () => {
      const routeParams = new this._RouteParameters({
        stops: new this._FeatureSet({
          features: this.view.graphics.toArray()
        }),
        returnDirections: true
      });

      this._Route.solve(routeUrl, routeParams).then((data: any) => {
        for (let result of data.routeResults) {
          result.route.symbol = {
            type: "simple-line",
            color: [5, 150, 255],
            width: 3
          };
          this.view.graphics.add(result.route);
        }

        // Display directions
        if (data.routeResults.length > 0) {
          const directions: any = document.createElement("ol");
          directions.classList = "esri-widget esri-widget--panel esri-directions__scroller";
          directions.style.marginTop = "0";
          directions.style.padding = "15px 15px 15px 30px";
          const features = data.routeResults[0].directions.features;

          let sum = 0;
          // Show each direction
          features.forEach((result: any, i: any) => {
            sum += parseFloat(result.attributes.length);
            const direction = document.createElement("li");
            direction.innerHTML = result.attributes.text + " (" + result.attributes.length + " miles)";
            directions.appendChild(direction);
          });

          sum = sum * 1.609344;
          console.log('dist (km) = ', sum);

          this.view.ui.empty("bottom-right");
          this.view.ui.add(directions, "bottom-right");

        }

      }).catch((error: any) => {
        console.log(error);
      });
    }
  }

  findPlace(pt) {
    const geocodingServiceUrl = "http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

    const params = {
      address: {
        address: "Starbucks"
      },
      location: pt,  // San Francisco (-122.4194, 37.7749)
      outFields: ["PlaceName", "Place_addr"]
    }

    this._locator.addressToLocations(geocodingServiceUrl, params).then((results) => {
      this.showResults(results);
    });

  }

  showResults(results) {
    this.view.popup.close();
    this.view.graphics.removeAll();
    results.forEach((result) => {
      this.view.graphics.add(
        new this._Graphic({
          attributes: result.attributes,
          geometry: result.location,
          symbol: {
            type: "simple-marker",
            color: "black",
            size: "10px",
            outline: {
              color: "#ffffff",
              width: "2px"
            }
          },
          popupTemplate: {
            title: "{PlaceName}",
            content: "{Place_addr}" + "<br><br>" + result.location.x.toFixed(5) + "," + result.location.y.toFixed(5)
          }
        }));
    });
    if (results.length) {
      const g = this.view.graphics.getItemAt(0);
      this.view.popup.open({
        features: [g],
        location: g.geometry
      });
    }
  }


  runTimer() {
    this.timeoutHandler = setTimeout(() => {
      // code to execute continuously until the view is closed
      // ...
      this.animatePointDemo();
      this.runTimer();
    }, 200);
  }

  animatePointDemo() {
    this.removePoint();
    switch (this.dir) {
      case 0:
        this.pointCoords[1] += 0.01;
        break;
      case 1:
        this.pointCoords[0] += 0.02;
        break;
      case 2:
        this.pointCoords[1] -= 0.01;
        break;
      case 3:
        this.pointCoords[0] -= 0.02;
        break;
    }

    this.count += 1;
    if (this.count >= 10) {
      this.count = 0;
      this.dir += 1;
      if (this.dir > 3) {
        this.dir = 0;
      }
    }

    this.addPoint(this.pointCoords[1], this.pointCoords[0], true);
  }

  stopTimer() {
    if (this.timeoutHandler != null) {
      clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  connectFirebase() {
    // if (this.isConnected) {
    //   return;
    // }
    // this.isConnected = true;
    // this.fbs.connectToDatabase();
    // this.subscriptionList = this.fbs.getChangeFeedList().subscribe((items: ITestItem[]) => {
    //   console.log("got new items from list: ", items);
    //   this.graphicsLayer.removeAll();
    //   for (let item of items) {
    //     this.addPoint(item.lat, item.lng, false);
    //     this.fbs.syncPointItem(this.view.center.latitude, this.view.center.longitude);
    //   }
    // });
    // this.subscriptionObj = this.fbs.getChangeFeedObj().subscribe((stat: ITestItem[]) => {
    //   console.log("item updated from object: ", stat);
    // });
  }

  addPointItem() {
    // console.log("Map center: " + this.view.center.latitude + ", " + this.view.center.longitude);
    // this.fbs.addPointItem(this.view.center.latitude, this.view.center.longitude);
  }

  disconnectFirebase() {
    if (this.subscriptionList != null) {
      this.subscriptionList.unsubscribe();
    }
    if (this.subscriptionObj != null) {
      this.subscriptionObj.unsubscribe();
    }
  }

  ngOnInit() {
    // Initialize MapView and return an instance of MapView
    console.log("initializing map");
    this.initializeMap().then(() => {
      // The map has been initialized
      console.log("mapView ready: ", this.view.ready);
      this.loaded = this.view.ready;
      this.runTimer();
    });
  }

  ngOnDestroy() {
    if (this.view) {
      // destroy the map view
      this.view.container = null;
    }
    this.stopTimer();
    this.disconnectFirebase();
  }
}

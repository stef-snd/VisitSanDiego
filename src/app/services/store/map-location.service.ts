import {Injectable} from "@angular/core";
import {LocationService} from "../database/firebase";
import {Location} from "../database/types";
import {map, Observable, tap} from "rxjs";

interface Symbol {
  type: string;
  url: string;
  width: string;
  height: string;
}

interface MapLocation {
  attributes: {
    address: string;
  },
  geometry: {
    type: "point",
    longitude: number,
    latitude: number
  },
  symbol: Symbol,
  popupTemplate: {
    title: string,
    content: [{
      type: "fields",
      fieldInfos: [
        {
          fieldName: "address",
          label: "Address",
          visible: true
        }
      ]
    }]
  },
}

@Injectable({
  providedIn: 'root'
})
export class MapLocationService {

  constructor(private locationService: LocationService) {
  }

  save(location: Location): Observable<{entity: Location; key: string}> {
    return this.locationService.create(location);
  }

  delete(key: string): Observable<void> {
    return this.locationService.delete(key);
  }

  fetchLocations(): Observable<MapLocation[]> {
    return this.locationService.findAll().pipe(
      tap(console.log),
      map(locations => locations.map(({entity}) => this.map(entity)))
    )
  }

  private map(location: Location): MapLocation {
    return {
      attributes: {
        address: location.address
      },
      geometry: {
        type: "point",
        longitude: location.longitude,
        latitude: location.latitude,
      },
      symbol: this.SYMBOLS[location.symbol],
      popupTemplate: {
        title: location.title,
        content: [{
          type: "fields",
          fieldInfos: [
            {
              fieldName: "address",
              label: "Address",
              visible: true
            }
          ]
        }]
      }
    }
  }


  SYMBOLS: Record<string, Symbol> = {
    park: {
      type: "picture-marker",
      url: "https://static.arcgis.com/images/Symbols/PeoplePlaces/Forest.png",
      width: "40px",
      height: "40px"
    },
    reservoir: {
      type: "picture-marker",
      url: "https://static.arcgis.com/images/Symbols/PeoplePlaces/Reservoir.png",
      width: "40px",
      height: "40px"
    },
    beach: {
      type: "picture-marker",
      url: "https://static.arcgis.com/images/Symbols/OutdoorRecreation/Swimming.png",
      width: "40px",
      height: "40px"
    },
    museum: {
      type: "picture-marker",
      url: "http://static.arcgis.com/images/Symbols/PeoplePlaces/Museum.png",
      width: "35px",
      height: "35px"
    }
  }
}

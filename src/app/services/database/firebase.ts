import {AngularFireDatabase, AngularFireList, AngularFireObject} from '@angular/fire/compat/database';
import {from, map, Observable, tap} from "rxjs";
import {Inject, Injectable} from "@angular/core";
import {User} from "./types";

export const FIREBASE_OBJECT_KEY = 'FIREBASE_OBJECT_KEY';

export class FirebaseService<T> {

    protected readonly list: AngularFireList<T>;

    constructor(protected readonly db: AngularFireDatabase,
                @Inject(FIREBASE_OBJECT_KEY) protected readonly objKey) {
      this.list = this.db.list<T>(this.objKey);
    }

    public create(entity: T): Observable<{entity: T, key: string}> {
      return from(this.list.push(entity)).pipe(
        map(({ key }) => ({ key, entity }))
      )
    }

    public findByKey(key: string): Observable<T> {
      return this.findReference(key).valueChanges();
    }

    public findAll(): Observable<{entity: T, key: string}[]> {
      return this.list.snapshotChanges().pipe(
        map(snapshot => snapshot.map(data => ({key: data.key, entity: data.payload.val()})))
      );
    }

    public update(key: string, entity: T): Observable<void> {
      return from(this.findReference(key).update(entity));
    }

    public delete(key: string): Observable<void> {
      return from(this.findReference(key).remove())
    }

    public find(func): Observable<{entity: T, key: string}> {
      return this.findAll().pipe(
        tap(console.log),
        map(data => data.find(func))
      )
    }

    private findReference(key: string): AngularFireObject<T> {
      return this.db.object<T>(`${this.objKey}/${key}`)
    }
}

@Injectable({
  providedIn: "root",
})
export class UserService extends FirebaseService<User> {

  constructor(protected readonly db: AngularFireDatabase) {
    super(db, "users");
  }
}

@Injectable({
  providedIn: "root",
})
export class LocationService extends FirebaseService<Location> {

  constructor(protected readonly db: AngularFireDatabase) {
    super(db, "locations");
  }
}

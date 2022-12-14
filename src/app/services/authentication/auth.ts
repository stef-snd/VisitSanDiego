import {Injectable} from "@angular/core";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {UserService} from "../database/firebase";
import {User} from "../database/types";
import {BehaviorSubject, from, map, Observable, switchMap, tap} from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AuthService {

  private _currentUser$ = new BehaviorSubject<User>(null);

  public readonly currentUser$ = this._currentUser$.asObservable();
  public readonly isLogged$ = this._currentUser$.pipe(map(user => user !== null));

  constructor(private auth: AngularFireAuth,
              private userService: UserService) {
  }

  public register(user: User & {password: string}): Observable<void> {
    console.log(user)

    const {password, ...entity} = user;

    console.log(entity)

    return from(this.auth.createUserWithEmailAndPassword(user.email, user.password)).pipe(
      switchMap(() => this.userService.create(entity)),
      map(() => this._currentUser$.next(entity))
    )
  }

  public login(email: string, password: string): Observable<void> {
    return from(this.auth.signInWithEmailAndPassword(email, password)).pipe(
      switchMap(() => this.userService.find(data => data.entity.email === email)),
      map(user => this._currentUser$.next(user.entity))
    )
  }
}

import { Component } from '@angular/core';
import {AuthService} from "../../services/authentication/auth";
import {Event, NavigationEnd, Router} from "@angular/router";
import {Observable} from "rxjs";

interface ITab {
  name: string;
  link: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  tabs: ITab[] = [{
    name: 'Home',
    link: '/home'
  }, {
    name: 'Map',
    link: '/map'
  }];

  activeTab = this.tabs[0].link;

  constructor(private router: Router, private authService: AuthService) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.activeTab = event.url;
      }
    });
  }

  public get isLogged$(): Observable<boolean> {
    return this.authService.isLogged$;
  }
}

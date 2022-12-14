import { Component } from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../services/authentication/auth";
import {catchError} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  form = this.fb.group({
    email: "",
    password: ""
  });

  error: string = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
  }

  public login() {
    const data = this.form.value;

    this.authService.login(data.email, data.password)
      .pipe(
        catchError(err => this.error = err)
      )
      .subscribe(() => this.router.navigate(["/"]))
  }

}

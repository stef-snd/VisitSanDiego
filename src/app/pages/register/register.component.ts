import { Component } from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../services/authentication/auth";
import {Router} from "@angular/router";
import {catchError} from "rxjs";
import {User} from "../../services/database/types";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  form = this.fb.group({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  error: string = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
  }

  public register() {
    const data = this.form.value as User & {password: string};
    this.authService.register(data)
      .pipe(
        catchError(err => this.error = err)
      )
      .subscribe(() => this.router.navigate(["/"]))
  }

}

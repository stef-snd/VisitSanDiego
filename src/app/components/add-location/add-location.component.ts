import { Component, OnInit } from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {LocationService} from "../../services/database/firebase";
import {Location} from "../../services/database/types";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.component.html',
  styleUrls: ['./add-location.component.scss']
})
export class AddLocationComponent {

  form = this.fb.group({
    longitude: null,
    latitude: null,
    symbol: null,
    title: null,
    address: null
  })

  constructor(private locationService: LocationService,
              private fb: FormBuilder,
              private dialogRef: MatDialogRef<AddLocationComponent>) {
  }

  addLocation() {
    const location = this.form.value as Location;
    this.locationService.create({...location, type: "point"}).subscribe(() => this.dialogRef.close());
  }
}

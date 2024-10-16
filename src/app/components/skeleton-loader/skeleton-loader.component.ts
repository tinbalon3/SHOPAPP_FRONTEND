import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.scss'
})
export class SkeletonLoaderComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    console.log('Skeleton loader initialized');
  }
}

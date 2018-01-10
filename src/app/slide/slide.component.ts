import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { swipeLeftSwipeRight } from '../animation/swipe-left-swipe-right';
import { ShowElement } from './show/show-element';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { async } from 'rxjs/scheduler/async';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss'],
  animations: [ swipeLeftSwipeRight() ]
})
export class SlideComponent implements OnInit, OnDestroy {

  @Input() showElements: ShowElement[];
  @Input() showIndicator: boolean = false;

  currentIndex: number = 0;

  positions: string[];

  autoSwipeSubscription: Subscription;

  lastClickedTime: number;
  
  constructor() {
  }

  ngOnInit() {
    if(this.showElements.length === 0) {
      this.positions = [];
      return;
    }

    var positions: string[] = [];
    for(let _ of this.showElements) {
      positions.push('right');
    }
    positions[0] = 'center';

    this.positions = positions;
    
    this.lastClickedTime = Date.now();

    this.autoSwipeSubscription = this.autoSwipe();
  }

  ngOnDestroy() {
    this.autoSwipeSubscription.unsubscribe();
  }

  swipeTo(index: number, forceDirection?: string) {
    if(index === this.currentIndex) return;

    if(forceDirection === 'left' || index > this.currentIndex) {
      this.positions[index] = 'right';

      Observable.of(null, async).map( value => {
        this.positions[this.currentIndex] = 'left';
        this.positions[index] = 'center';
        this.currentIndex = index;
        return value;
      }).subscribe();
    }
    else if(forceDirection === 'right' || index < this.currentIndex) {
      this.positions[index] = 'left';

      Observable.of(null, async).map( value => {
        this.positions[this.currentIndex] = 'right';
        this.positions[index] = 'center';
        this.currentIndex = index;
        return value;
      }).subscribe();
    }
  }

  autoSwipe(): Subscription {
    return Observable.interval(8000).filter( (_, _2) => {
      return Date.now() - this.lastClickedTime >= 8000;
    }).subscribe( _ => {
      this.swipeTo( (this.currentIndex + 1) % this.showElements.length, 'left');
    });
  }

  moveTo(index: number) {
    this.lastClickedTime = Date.now();
    this.swipeTo(index);
  }
}

import { Component, OnInit, Inject, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AccountService } from '../services/account.service';
import { Observable } from 'rxjs/Observable';
import { Picture } from '../shared/picture';
import { FeaturedPictureService } from '../services/featured-picture.service';
import { SignInInfo } from '../shared/signInInfo';
import { Account } from '../shared/account';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  featuredPicture: Picture;

  usernameGroup: FormGroup;

  passwordGroup: FormGroup;

  signInGroup: FormGroup;

  styleLeft: number = 0;

  backgroundCanvasAnimation: string;

  showableAnimation: string;

  accountSignedIn: Observable<Account>;

  constructor(private accountService: AccountService,
    private featuredPictureService: FeaturedPictureService,
    private formBuilder: FormBuilder,
    private router: Router,
    @Inject('baseURL') private baseURL: string
  ) {
      this.accountSignedIn = this.accountService.getAccountSignedIn();
  }

  ngOnInit() {
    this.usernameGroup = this.formBuilder.group({
      usernameControl: ['', [ Validators.minLength(2), Validators.maxLength(10) ]]
    });

    this.passwordGroup = this.formBuilder.group({
      passwordControl: ['', [ Validators.minLength(2), Validators.maxLength(10) ]]
    });

    this.signInGroup = this.formBuilder.group( {usernameGroup: this.usernameGroup, passwordGroup: this.passwordGroup} );

    this.backgroundCanvasAnimation = "appear";
    this.showableAnimation = "dropDown";
    
    this.featuredPictureService.getList("sign-in").subscribe(pictures => {
      this.featuredPicture = pictures[0];
    });

    this.accountSignedIn.subscribe(
      account => {
        if(account !== null) {
          this.router.navigate( [{ outlets: { action: null } }] );
        }
      },
      errorResponse => {
        this.signInGroup.reset();
        this.styleLeft = -200;
      }
    );
  }

  toEnterPasswordStep() {
    if(this.usernameGroup.valid) {
      this.styleLeft = -100;
    }
  }

  signIn() {
    if(this.signInGroup.valid) {
      let signInInfo = this.deepCopySignInInfo();
      this.accountService.signIn(signInInfo);
    }
  }

  deepCopySignInInfo(): SignInInfo {
    var signInInfo = new SignInInfo();
    signInInfo.username = this.signInGroup.get('usernameGroup.usernameControl').value as string;
    signInInfo.password = this.signInGroup.get('passwordGroup.passwordControl').value as string;
    return signInInfo;
  }

  closeAnimation(): Observable<any> {
    this.backgroundCanvasAnimation = "disappear";
    this.showableAnimation = "fallDown";
    return Observable.of(null).delay(200);
  }

  close() {
    this.closeAnimation().subscribe( _ => {
      this.router.navigate( [{ outlets: { action: null } }] );
    })
  }

  navigateToSignUp() {
    this.closeAnimation().subscribe( _ => {
      this.router.navigate( [{ outlets: { action: 'sign-up' } }] );
    })
  }

  tryAgain() {
    this.styleLeft = 0;
  }
}

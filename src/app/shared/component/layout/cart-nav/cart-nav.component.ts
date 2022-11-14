import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  forkJoin,
  fromEvent,
  map,
  mergeMap,
  takeUntil,
  tap,
  finalize,
} from 'rxjs';
import { User } from 'src/app/shared/model/account.model';
import { AuthService } from 'src/app/shared/service/auth.service';
import { ProductsService } from 'src/app/shared/service/products.service';
import { UserService } from 'src/app/shared/service/user.service';
import { BaseComponent } from '../../base.component';

@Component({
  selector: 'app-cart-nav',
  templateUrl: './cart-nav.component.html',
  styleUrls: ['./cart-nav.component.scss'],
})
export class CartNavComponent extends BaseComponent implements OnInit {
  public isLogin$!: BehaviorSubject<boolean>;
  public cart = new BehaviorSubject<User.CartDetail[]>([]);
  public totalPrice: BehaviorSubject<number> = this.userSv.total;
  public userCart!: User.Cart;
  constructor(
    private userSv: UserService,
    private productSv: ProductsService,
    private authsv: AuthService,
    private router:Router
  ) {
    super();
    this.isLogin$ = this.authsv.isLogin;
  }
  cartButton: boolean = false;
  public cartMenu() {
    const me = this;
    me.cartButton = !this.cartButton;
  }
  private getData() {
    const me = this;

    me.userSv
      .getCart()
      .pipe(
        takeUntil(me.destroy$),
        tap((res) => {
          res.cartDetail.map((item) => {
            me.productSv
              .getProduct(String(item.product))
              .pipe(
                tap((data) => {
                  item.product = data;
                  console.log(item.product);
                }),
                finalize(() => {
                  me.cart.next(res.cartDetail);
                })
              )
              .subscribe();
          });
        })
        // mergeMap((res) =>
        //   res.cartDetail.map((item) => {
        //     me.productSv
        //       .getProduct(String(item.product))
        //       .pipe(
        //         tap((data) => {
        //           item.product = data;
        //           me.userCart = res;
        //           console.log(me.userCart)
        //           console.log(item.product);
        //         })
        //       )
        //   })

        // )
      )
      .subscribe();
  }
  public checkOut(){
    const  me = this
    me.router.navigateByUrl('/checkout')
  }
  public removeCartDetail(id: string) {
    const me = this;
    me.userSv.removeFromCart(id).subscribe({
      next: () => {
        me.getData()
      },
    });
  }
  ngOnInit(): void {
    const me = this;

    me.isLogin$.subscribe((result) => {
      if (result) {
        setTimeout(() => {
          me.getData();
        }, 2000);
      }
    });
  }
  onDestroy(): void {
    const me = this;
    me.destroy$.next();
    me.destroy$.complete();
    me.destroy$.unsubscribe();
  }
}

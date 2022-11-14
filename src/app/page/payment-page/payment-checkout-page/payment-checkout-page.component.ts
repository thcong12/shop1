import { Component, OnInit } from '@angular/core';
import { forkJoin, map, mergeMap, takeUntil, tap } from 'rxjs';
import { BaseComponent } from 'src/app/shared/component/base.component';
import { User } from 'src/app/shared/model/account.model';
import { ProductsService } from 'src/app/shared/service/products.service';
import { UserService } from 'src/app/shared/service/user.service';

@Component({
  selector: 'app-payment-checkout-page',
  templateUrl: './payment-checkout-page.component.html',
  styleUrls: ['./payment-checkout-page.component.scss'],
})
export class PaymentCheckoutPageComponent
  extends BaseComponent
  implements OnInit
{
  public products!: User.CartDetail[];
  public userCart!: User.Cart;

  constructor(private userSv: UserService, private productSv: ProductsService) {
    super();
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
                })
              )
              .subscribe();
            setTimeout(() => {
              me.userCart  = { ...res };
            }, 1000);
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
  ngOnInit(): void {
    const me = this;
    me.getData();
    setTimeout(() => {
      console.log(me.userCart);
    }, 2000);
    console.log(me.userCart);
  }
  onDestroy(): void {
    const me = this;
    me.destroy$.next();
    me.destroy$.complete();
    me.destroy$.unsubscribe();
  }
}

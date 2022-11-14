import { Component, OnInit } from '@angular/core';
import { async, forkJoin, map, tap } from 'rxjs';
import { User } from 'src/app/shared/model/account.model';
import { Product, Store } from 'src/app/shared/model/products.model';
import { ProductsService } from 'src/app/shared/service/products.service';
import { StoreService } from 'src/app/shared/service/store.service';
import { UserService } from 'src/app/shared/service/user.service';

@Component({
  selector: 'app-home-page-slide',
  templateUrl: './home-page-slide.component.html',
  styleUrls: ['./home-page-slide.component.scss'],
})
export class HomePageSlideComponent implements OnInit {
  public productSlider!: Store.Slider[];
  public selectedIndex = 0;
  constructor(
    private storeSv: StoreService,
    private productSv: ProductsService,
    private userSv: UserService
  ) {}
  public getData() {
    const me = this;
    me.storeSv
      .getProductsSlider()
      .pipe(
        map((res) => {
          res.map((item) => {
            let idPr = String(item.productId);
            forkJoin({
              info: me.productSv.getProduct(idPr),
              detail: me.productSv.getProductDetail(idPr),
            })
              .pipe(
                map(({ info, detail }) => {
                  (item.productId = { ...info }),
                    (item.productDetail = { ...detail }),
                    (item.priceAfterSale =
                      info.price -
                      info.price * (Number(info.sale.salePersent) / 100));
                })
              )
              .subscribe();
          });
          setTimeout(() => {
            me.productSlider = [...res];
          }, 2000);
        })
      )
      .subscribe();
  }
  public slideShow(index: number) {
    this.selectedIndex = index;
    console.log(index);
  }
  public addToCart(item: Store.Slider) {
    const me = this;
    let dataFormat: User.CartDetail = {
      product: item.productId,
      quantity: 1,
    };
    this.userSv.cartList.subscribe((data) => {
     const aa = data.map(item =>{
      return item.product._id
     })
     if(aa.includes(dataFormat.product._id)){
      alert("product had been in your cart")
     }else{
      me.userSv.addToCart(dataFormat).subscribe({complete:()=>{
        data.push(dataFormat)
      }});
      
     }
    });
    
  }
  ngOnInit(): void {
    const me = this;
    me.getData();
  }
}

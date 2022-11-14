import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap, forkJoin, tap } from 'rxjs';
import { BaseComponent } from 'src/app/shared/component/base.component';
import { Product } from 'src/app/shared/model/products.model';
import { CategloryService } from 'src/app/shared/service/categlory.service';
import { DevelopersService } from 'src/app/shared/service/developers.service';
import { FeatureService } from 'src/app/shared/service/feature.service';
import { ProductsService } from 'src/app/shared/service/products.service';
import { StoreService } from 'src/app/shared/service/store.service';
import { UserService } from 'src/app/shared/service/user.service';

@Component({
  selector: 'app-product-detail-page',
  templateUrl: './product-detail-page.component.html',
  styleUrls: ['./product-detail-page.component.scss'],
})
export class ProductDetailPageComponent
  extends BaseComponent
  implements OnInit
{
  public commentForm!: FormGroup;
  onDestroy(): void {
    const me = this;
    me.destroy$.next();
    me.destroy$.complete();
    me.destroy$.unsubscribe();
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private prodSv: ProductsService,
    private devSv: DevelopersService,
    private feaSv: FeatureService,
    private cateSv: CategloryService,
    private userSv: UserService,
    private formBd: FormBuilder,
    private storeSv: StoreService
  ) {
    super();
  }
  public responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];
  public selectedIndex: number = 0;
  public productInfo!: Product.Product;
  public productDetail!: Product.Detail;
  public listProductSimilar!: Product.Product[];
  public listCateSimilar!: any[];
  public productId!: string;
  id: string = 'info';
  color: string = '';
  public display(ids: any) {
    this.id = ids;
    this.color = 'blue';
  }
  public controlName = {
    title: 'title',
    rating: 'rating',
    comment: 'comment',
  };
  private getProduct(): void {
    const me = this;
    me.route.paramMap
      .pipe(
        mergeMap((prama) =>
          forkJoin({
            product: me.prodSv.getProduct(String(prama.get('id'))),
            detail: me.prodSv.getProductDetail(String(prama.get('id'))),
          }).pipe(
            tap(({ product, detail }) => {
              me.productId = String(prama.get('id'));
              me.productInfo = { ...product };
              me.listCateSimilar = detail.categlory.slice(1, 4);
            }),
            mergeMap(({ detail }) =>
              forkJoin({
                developer: me.devSv.getDeveloper(String(detail.developer)),
                categlory: forkJoin(
                  detail.categlory.map((item) => {
                    return me.cateSv.getCateglory(String(item));
                  })
                ),
                feature: forkJoin(
                  detail.feature.map((item) => {
                    return me.feaSv.getFeature(String(item));
                  })
                ),
                // user: forkJoin(
                //   detail.reviews.map((item) => {
                //     return me.userSv.userDetail(String(item.user));
                //   })
                // ),
              }).pipe(
                tap(({ developer, categlory, feature }) => {
                  console.log(developer);
                  me.productInfo.detail = {
                    ...detail,
                    developer: developer,
                    categlory: categlory,
                    feature: feature,
                  };
                  // me.productInfo.detail.reviews.map((item, index) => {
                  //   item.user = user[index];
                  // });
                })
              )
            )
          )
        )
      )
      .subscribe({
        next: () => {
          me.storeSv
            .findSameProduct(me.listCateSimilar.join('+'))
            .pipe(
              mergeMap((res: any) =>
                forkJoin(
                  res.map((item: any) => {
                    return me.prodSv.getProduct(item.productId);
                  })
                ).pipe(
                  tap((data: any) => {
                    me.listProductSimilar = [...data];
                  })
                )
              )
            )
            .subscribe((x) => {
              console.log(x);
            });
        },
      });
  }
  public postComment() {
    const me = this;
    me.userSv.postComment(me.productId, me.commentForm.value).subscribe();
  }
  private formInit() {
    const me = this;
    me.commentForm = me.formBd.group({
      [me.controlName.title]: ['', Validators.required],
      [me.controlName.rating]: ['', Validators.required],
      [me.controlName.comment]: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    const me = this;
    me.getProduct();
    me.formInit();
  }
}

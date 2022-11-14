import { Component, OnInit } from '@angular/core';
import { forkJoin, map, mergeMap, tap } from 'rxjs';
import { Product } from 'src/app/shared/model/products.model';
import { CategloryService } from 'src/app/shared/service/categlory.service';
import { DevelopersService } from 'src/app/shared/service/developers.service';
import { FeatureService } from 'src/app/shared/service/feature.service';
import { ProductsService } from 'src/app/shared/service/products.service';
import { trigger, transition, query, style, animate, group } from '@angular/animations';
const left = [
  query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
  group([
    query(':enter', [style({ transform: 'translateX(-100%)' }), animate('.3s ease-out', style({ transform: 'translateX(0%)' }))], {
      optional: true,
    }),
    query(':leave', [style({ transform: 'translateX(0%)' }), animate('.3s ease-out', style({ transform: 'translateX(100%)' }))], {
      optional: true,
    }),
  ]),
];

const right = [
  query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
  group([
    query(':enter', [style({ transform: 'translateX(100%)' }), animate('.3s ease-out', style({ transform: 'translateX(0%)' }))], {
      optional: true,
    }),
    query(':leave', [style({ transform: 'translateX(0%)' }), animate('.3s ease-out', style({ transform: 'translateX(-100%)' }))], {
      optional: true,
    }),
  ]),
];
@Component({
  selector: 'app-home-page-list',
  templateUrl: './home-page-list.component.html',
  styleUrls: ['./home-page-list.component.scss'],
  animations: [
    trigger('animImageSlider', [
      transition(':increment', right),
      transition(':decrement', left),
    ]),
  ]
})
export class HomePageListComponent implements OnInit {
  counter: number = 0;
  public releaseseProducts!: Product.Product[];
  public topSellerProducts!: Product.Product[];
  public recommendProducts!: Product.Product[];
  public selectedIndex = 0;
  public listLink: any = [
    {
      id: '1',
      content: 'New Releaseses',
      products: [] as Product.Product[],
    },
    {
      id: '2',
      content: 'Top seller',
      products: [] as Product.Product[],
    },
    {
      id: '3',
      content: 'Recommend',
      products: [] as Product.Product[],
    },
  ];
  public id = '1';
  constructor(
    private productSv: ProductsService,
    private devSv: DevelopersService,
    private cateSv: CategloryService,
    private feaSv: FeatureService
  ) {}

  public display(id: any) {
    this.selectedIndex = 0;
    this.id = id;
  }
  public getData() {
    const me = this;
    me.productSv
      .getProducts()
      .pipe(
        map((res) => {
          res.map((item) => {
            let idPr = String(item._id);
            return me.productSv
              .getProductDetail(idPr)
              .pipe(
                mergeMap((data) =>
                  forkJoin({
                    developer: me.devSv.getDeveloper(String(data.developer)),
                    categlory: forkJoin(
                      data.categlory.map((item) => {
                        return me.cateSv.getCateglory(String(item));
                      })
                    ),
                    feature: forkJoin(
                      data.feature.map((item) => {
                        return me.feaSv.getFeature(String(item));
                      })
                    ),
                  }).pipe(
                    tap(({ developer, categlory, feature }) => {
                      item.detail = {
                        ...data,
                        developer: developer,
                        categlory: categlory,
                        feature: feature,
                      };
                    })
                  )
                )
              )
              .subscribe();
          });
          me.releaseseProducts = [...res.slice(0, 5)];
          me.topSellerProducts = [...res.slice(2, 7)];
          me.recommendProducts = [...res.slice(4, 9)];
        })
        // map((res) => {

        // })
      )
      .subscribe({
        next: (_res) => {
          me.listLink[0].products = me.releaseseProducts;
          me.listLink[1].products = me.topSellerProducts;
          me.listLink[2].products = me.recommendProducts;
        },
      });
  }
  public slideShow(index: number) {
    this.selectedIndex = index;
  }
  ngOnInit(): void {
    const me = this;
    me.getData();
  }
  onNext(productList:any) {
    if (this.counter != productList - 1) {
      this.counter++;
    }
  }

  onPrevious() {
    if (this.counter > 0) {
      this.counter--;
    }
  }
}

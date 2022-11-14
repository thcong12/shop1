import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { SelectItem } from 'primeng/api';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  filter,
  forkJoin,
  fromEvent,
  map,
  pluck,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { BaseComponent } from 'src/app/shared/component/base.component';
import { User } from 'src/app/shared/model/account.model';
import { Product } from 'src/app/shared/model/products.model';
import { CategloryService } from 'src/app/shared/service/categlory.service';
import { ProductsService } from 'src/app/shared/service/products.service';
import { StoreService } from 'src/app/shared/service/store.service';
import { UserService } from 'src/app/shared/service/user.service';

@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.scss'],
})
export class ProductPageComponent
  extends BaseComponent
  implements OnInit, AfterViewInit
{
  public listProduct!: Product.Product[];
  public listCateglory!: Product.Categlory[];
  public numberProduct:number = 8;
  public page:number = 1;

  public rangeValues: number[] = [20, 80];
  public sortOptions!: SelectItem[];
  public sortSelect: SelectItem = { label: 'All ', value: '-1' };
  @ViewChild('input') inputElement!: ElementRef;
  @ViewChild('numberPage') numberPage!: ElementRef;
  constructor(
    private productSv: ProductsService,
    private categlorySv: CategloryService,
    private userSv: UserService,
    private storeSv: StoreService,
    private renderer:Renderer2
  ) {
    super();
  }

  public getData() {
    const me = this;
    forkJoin({
      products: me.productSv.getProducts(),
      categlory: me.categlorySv.getCateglorys(),
    })
      .pipe(
        map(({ products, categlory }) => {
          (me.listProduct = [...products]), (me.listCateglory = [...categlory]);
        })
      )
      .subscribe({ next: (_res) => {} });
  }
  public addToCart(cart: any) {
    const me = this;
    let item: User.CartDetail = { product: cart, quantity: 1 };
    me.userSv
      .addToCart(item)
      .pipe(
        tap((res: any) => {
          console.log(cart);
        })
      )
      .subscribe();
  }

  private regisSearchEvent(): void {
    const me = this;
    fromEvent(me.inputElement.nativeElement, 'keyup')
      .pipe(
        takeUntil(me.destroy$),
        pluck('target', 'value'),
        debounceTime(400),
        distinctUntilChanged<any>(),
        filter((value: string) => value.length > 3),
        switchMap((keyword) => {
          return me.storeSv
            .search(keyword)
            .pipe(map((res) => (me.listProduct = res)));
        })
      )
      .subscribe();
  }
  public changePage(value:number){
    const me = this;
    me.page = value
  }
  private renderNumberPage(){
    const me = this;
    let totalPage = Math.ceil(me.listProduct?.length / me.numberProduct);
    console.log(totalPage)
    for (let i = 1; i <= totalPage; i++){
      let newElement  = me.renderer.createElement('span')
      let value = me.renderer.createText(`${i}`)
      me.renderer.setStyle(newElement,'color','#eeeeee')
      me.renderer.setStyle(newElement,'background-color','#ff8503')
      me.renderer.addClass(newElement,'btn')
      me.renderer.listen(newElement,'click',(event)=>{me.page = i})
      me.renderer.appendChild(newElement, value);
      me.renderer.appendChild(me.numberPage.nativeElement, newElement);
    }
  
  }
  ngOnInit(): void {
    const me = this;
    me.getData();
    me.sortOptions = [
      { label: 'Release', value: 'updatedAt' },
      { label: 'Price High to Low', value: 'price' },
      { label: 'Price Low to High', value: '!price' },
      { label: 'Sort by Name', value: 'productName' },
    ];
  }
  ngAfterViewInit(): void {
    const me = this;
    me.regisSearchEvent();
    me.renderNumberPage();
  }
  onDestroy(): void {
    const me = this;
    me.destroy$.next();
    me.destroy$.complete();
    me.destroy$.unsubscribe();
  } 
  
}

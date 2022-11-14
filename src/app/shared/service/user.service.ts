import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, shareReplay, Subject, tap } from 'rxjs';
import { User } from '../model/account.model';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseService {
  public cartList = new BehaviorSubject<User.CartDetail[]>([]);
  public total = new BehaviorSubject<number>(0)
  constructor(http: HttpClient) {
    super(http);
  }
  public getCart(): Observable<User.Cart> {
    const me = this;
    const url = `/cart`;
    return me.get(url)
    .pipe(
      shareReplay<any>(),
      tap((res) => {
        me.cartList.next(res.cartDetail);
      })
    );
  }
  public addToCart(product:User.CartDetail) {
    const me = this;
    const url = `/cart`;
    return me.post(url,product);
  }
  public removeFromCart(id:string){
    const me = this;
    const url = `/cart/removeproduct/${id}`;
    return me.get(url);
  }
  public postComment(id:string,comment:User.Comment):Observable<User.Comment>{
    const me = this;
    const url = `/store/product/newcomment/${id}`
    return me.put(url,comment)
  }
  public userDetail(id:string):Observable<User.Detail>{
    const me = this;
    const url = `/user/userDetail/${id}`
    return me.get(url)
  }
}

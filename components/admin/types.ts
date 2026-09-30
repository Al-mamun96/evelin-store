import type {Product} from '@/lib/catalog';
import type {StoreSettings} from '@/lib/store-settings';
import type {Order} from '@/lib/orders';
export type Stock={product_id:string;size:string;stock:number};
export type AdminData={products:Product[];inventory:Stock[];settings:StoreSettings;courier:{configured:boolean;baseUrl:string;autoBook:boolean;needsReset?:boolean};orders:Order[];total:number;page:number;stats:{orders:number;pending:number|null;sales:number|null};activity:{id:number;action:string;target:string;detail:string;created_at:string}[];stockLog:{id:number;product_id:string;size:string;delta:number;balance:number;reason:string;created_at:string}[]};
export type Mutate=(path:string,body:unknown,method?:string,success?:string)=>Promise<any>;

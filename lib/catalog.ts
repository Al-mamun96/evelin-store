export type Variation = {id: string; label: string; image: string};
export type Product = {
  id: string; name: string; category: string; price: number; image: string;
  color: string; hex: string; description: string; fabric: string;
  sizes: string[]; badge?: string; sizeGuide?: string;
  gallery?: string[]; variations?: Variation[]; showVariations?: boolean;
  active?: boolean; deleted?: boolean; version?: number;
};
export const categories = ['Panjabi', 'Jubba', 'Kabli', 'Abaya', 'Katua'];
export const products: Product[] = [
  {id:'ivory-panjabi',name:'The Ivory Panjabi',category:'Panjabi',price:2450,image:'/images/panjabi.webp',color:'Ivory',hex:'#e4ddce',fabric:'Cotton blend',sizes:['S','M','L','XL','XXL'],badge:'NEW',description:'A quiet classic. A clean band collar, considered details and an easy silhouette for the moments that matter.'},
  {id:'signature-jubba',name:'The Signature Jubba',category:'Jubba',price:2950,image:'/images/jubba.webp',color:'Burgundy',hex:'#582631',fabric:'Soft woven blend',sizes:['50','52','54','56'],badge:'SIGNATURE',description:'A full-length silhouette in a deep, rich burgundy. Minimal detailing lets thoughtful tailoring speak for itself.'},
  {id:'olive-kabli',name:'The Olive Kabli Set',category:'Kabli',price:3850,image:'/images/kabli.webp',color:'Olive',hex:'#626651',fabric:'Cotton blend',sizes:['S','M','L','XL','XXL'],description:'An effortless two-piece set with a relaxed cut. Designed for a complete, considered look from morning to evening.'},
  {id:'noir-abaya',name:'The Noir Abaya',category:'Abaya',price:3250,image:'/images/abaya.webp',color:'Black',hex:'#282828',fabric:'Fluid crepe',sizes:['50','52','54','56'],badge:'NEW',description:'A flowing full-length abaya with a matching hijab. Understated detail and a graceful silhouette, made for everyday ease.'},
  {id:'sand-katua',name:'The Sand Katua',category:'Katua',price:1850,image:'/images/katua.webp',color:'Sand',hex:'#a79881',fabric:'Textured woven blend',sizes:['S','M','L','XL','XXL'],description:'The finishing layer. A structured waistcoat in a versatile neutral, worn over your favourite panjabi. Waistcoat only.'},
  {id:'midnight-panjabi',name:'The Midnight Panjabi',category:'Panjabi',price:2650,image:'/images/midnight.webp',color:'Midnight',hex:'#263341',fabric:'Cotton blend',sizes:['S','M','L','XL','XXL'],description:'A modern wardrobe staple in midnight blue. A refined band collar and long, clean lines give this piece its character.'}
];
export const money = (value: number) => '৳ ' + new Intl.NumberFormat('en-BD').format(value);
export const shipping = (zone: string) => zone === 'dhaka' ? 80 : 130;

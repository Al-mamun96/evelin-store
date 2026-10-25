import {publicReviews} from '../lib/reviews.ts';
import {catalogSummary,categoryUrl,normalizeShopParams,relatedProducts} from '../lib/seo-content.ts';
import {products} from '../lib/catalog.ts';
import {productSchema,breadcrumbs} from '../lib/structured-data.ts';
import {isIndexable} from '../lib/seo.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {siteOrigin,serializeJsonLd,hasAvailableSize,seoDescription} from '../lib/seo.ts';
test('SEO origin validation does not invent domains or retain credentials',()=>{
 assert.equal(siteOrigin('https://example.com/'),'https://example.com');
 for(const value of ['', 'not-a-url','javascript:alert(1)','https://secret@example.com','https://example.com/subpath','https://example.com/?key=x'])assert.equal(siteOrigin(value),undefined);
});
test('JSON-LD remains valid data and cannot close its script element',()=>{
 const data={name:'</script><script>alert(1)</script>',description:'Cotton & linen'};
 const encoded=serializeJsonLd(data);assert.ok(!encoded.includes('<'));assert.deepEqual(JSON.parse(encoded),data);
});
test('availability only includes purchasable sizes with positive stock',()=>{
 assert.equal(hasAvailableSize(['S'],[{size:'M',stock:10},{size:'S',stock:0}]),false);
 assert.equal(hasAvailableSize(['S'],[{size:'S',stock:2}]),true);
});
test('metadata descriptions normalize multiline store content',()=>{
 assert.equal(seoDescription(' A   description '),'A description');
 assert.ok(seoDescription('x'.repeat(200)).length<=160);
});
test('category summaries use actual catalog attributes and preserve query URLs',()=>{
 const summary=catalogSummary(products,'Panjabi');
 assert.match(summary.description,/2 Panjabi/);
 assert.ok(summary.sizes.includes('XL'));
 assert.ok(summary.fabrics.includes('Cotton blend'));
 assert.equal(categoryUrl('Men & Women'),'/shop?category=Men+%26+Women');
 assert.match(catalogSummary([],'Panjabi').description,/no published/);
});
test('search and arbitrary facets are noindex; tracking parameters retain canonical category',()=>{
 assert.equal(normalizeShopParams({category:'Panjabi',utm_source:'test'}).noindex,false);
 for(const params of [{q:''},{size:'XL'},{sort:'price'},{category:['Panjabi','Abaya']}])assert.equal(normalizeShopParams(params).noindex,true);
 assert.equal(normalizeShopParams({category:['Panjabi','Abaya']}).category,'Panjabi');
});
test('published stores can preserve indexing while orders are paused',()=>{
 assert.equal(isIndexable(false,'true'),true);
 assert.equal(isIndexable(true,'false'),false);
 assert.equal(isIndexable(false,''),false);
 assert.equal(isIndexable(true,''),true);
});
test('related products prioritize the same category',()=>{
 assert.equal(relatedProducts(products,products[0])[0].category,products[0].category);
 assert.ok(!relatedProducts(products,products[0]).some(p=>p.id===products[0].id));
});
test('breadcrumbs use absolute canonical URLs',()=>{
 const schema=breadcrumbs('https://example.com',[{name:'Home',path:'/'},{name:'Panjabi',path:categoryUrl('Panjabi')}]);
 assert.equal(schema.itemListElement[1].item,'https://example.com/shop?category=Panjabi');
 assert.equal(schema.itemListElement[1].position,2);
});
test('confirmed live store remains indexable while checkout is paused',()=>{
 assert.equal(isIndexable(false,'','https://evelinbd.site'),true);
 assert.equal(isIndexable(false,'false','https://evelinbd.site'),false);
 assert.equal(isIndexable(false,'','https://staging.example.com'),false);
});
test('old review starter is hidden without changing stored reviews',()=>{
 const reviews=[{name:'Customer name',rating:5,text:'Loved the fit and finish.'},{name:'Actual Reviewer',rating:4,text:'My submitted feedback.'}];
 assert.deepEqual(publicReviews(reviews),[reviews[1]]);
 assert.equal(reviews.length,2);
});
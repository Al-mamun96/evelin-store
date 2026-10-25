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
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fontStack,fontUrl} from '../lib/shared.ts';
test('current and default storefront fonts avoid external stylesheets',()=>{
 assert.equal(fontUrl('Playfair Display','Poppins'),'');
 assert.equal(fontUrl('Italiana','DM Sans'),'');
 assert.equal(fontStack('Playfair Display','Georgia'),"'Playfair Display Variable',Georgia");
});
test('other admin font choices remain available without duplicate local fonts',()=>{
 const url=fontUrl('Lora','Poppins');
 assert.ok(url.includes('family=Lora:'));
 assert.ok(!url.includes('Poppins')&&!url.includes('Inter'));
 assert.equal((fontUrl('Lora','Lora').match(/family=/g)||[]).length,1);
 assert.equal(fontStack('Lora','Georgia'),"'Lora',Georgia");
});

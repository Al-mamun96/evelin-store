import {Catalog} from '@/components/catalog';
export const metadata={title:'Shop the Collection'};
export default async function Shop({searchParams}:{searchParams:Promise<{category?:string;q?:string}>}){const params=await searchParams;return <section className="section shop-page"><div className="page-intro"><span className="eyebrow">THE EVELIN WARDROBE</span><h1>Made to be <em>yours.</em></h1><p>Quiet classics. Modern silhouettes. Find the piece that feels like you.</p></div><Catalog key={(params.category||'')+(params.q||'')} category={params.category} query={params.q}/></section>;}

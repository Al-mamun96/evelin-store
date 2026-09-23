import Link from 'next/link';
export default function NotFound(){return <section className="empty-state"><span className="eyebrow">404</span><h1>This piece is missing.</h1><p>Let’s get you back to the collection.</p><Link className="button" href="/shop">Explore Evelin</Link></section>;}

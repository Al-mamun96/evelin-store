/**
 * Store logo with a text fallback.
 *
 * Renders the uploaded logo when one is set, and the store name as a
 * serif wordmark otherwise, so an existing store never shows a broken or
 * empty header. Used in the desktop header, the mobile menu and the footer,
 * which is why it accepts a class name per placement.
 *
 * `logoSize` is a percentage of the default and is published as a CSS custom
 * property. The stylesheet multiplies every logo height by it, so one number
 * scales the header, mobile menu and footer together and keeps their
 * proportions identical.
 */
export function StoreLogo({logo,storeName,logoSize=100,className='wordmark',label}:{logo:string;storeName:string;logoSize?:number;className?:string;label?:string}){
  if(logo)return <img className={className+' logo'} src={logo} alt={label||storeName} width={240} height={60} style={{'--logo-scale':logoSize/100} as React.CSSProperties}/>;
  return <span className={className}>{storeName.toLowerCase()}</span>;
}

/**
 * Store logo with a text fallback.
 *
 * Renders the uploaded logo when one is set, and the store name as a
 * serif wordmark otherwise, so an existing store never shows a broken or
 * empty header. Used in the desktop header, the mobile menu and the footer,
 * which is why it accepts a class name per placement.
 */
export function StoreLogo({logo,storeName,className='wordmark',label}:{logo:string;storeName:string;className?:string;label?:string}){
  if(logo)return <img className={className+' logo'} src={logo} alt={label||storeName} width={240} height={60}/>;
  return <span className={className}>{storeName.toLowerCase()}</span>;
}

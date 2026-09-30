import {getSettings} from '@/lib/store-settings';
import {Checkout} from '@/components/checkout';
export const dynamic='force-dynamic';
export const metadata={title:'Checkout',robots:{index:false}};
export default function Page(){const settings=getSettings();return <Checkout live={settings.storeLive} zones={settings.zones}/>;}

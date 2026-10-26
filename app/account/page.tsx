import {getSettings} from '@/lib/store-settings';
import {AccountHub} from '@/components/account-hub';
import './account.css';
export const metadata={title:'Your Account',robots:{index:false,follow:false}};
export default function Page(){return <AccountHub settings={getSettings()}/>;}
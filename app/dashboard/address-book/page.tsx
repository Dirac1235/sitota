import { redirect } from 'next/navigation';

export default function AddressBookRedirectPage() {
  redirect('/dashboard?tab=directory');
}

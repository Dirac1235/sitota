import { redirect } from 'next/navigation';

export default function DesignsRedirectPage() {
  redirect('/dashboard?tab=vault');
}

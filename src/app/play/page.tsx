import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PlayClient } from './PlayClient';

export default async function PlayPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  return <PlayClient />;
}

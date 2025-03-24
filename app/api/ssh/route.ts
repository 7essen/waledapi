import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export async function GET(req: NextRequest) {
  try {
    const accountsRef = ref(database, 'vpsAccounts');
    const snapshot = await get(accountsRef);

    if (snapshot.exists()) {
      const accounts = snapshot.val();
      const sshAccounts = [];
      for (const id in accounts) {
        if (accounts[id].type && accounts[id].type.toLowerCase() === 'ssh') {
          sshAccounts.push(accounts[id]);
        }
      }
      console.log("Found SSH accounts:", sshAccounts.length);
      return NextResponse.json(sshAccounts);
    } else {
      console.log("No accounts found in database");
      return NextResponse.json([]); // Return empty array if no accounts
    }
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
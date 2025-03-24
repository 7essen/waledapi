import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export async function GET(req: NextRequest) {
  try {
    const accountsRef = ref(database, 'vpsAccounts');
    const snapshot = await get(accountsRef);

    if (snapshot.exists()) {
      const accounts = snapshot.val();
      
      const trojanAccounts = [];
      for (const id in accounts) {
        // Try a case-insensitive match
        if (accounts[id].type && accounts[id].type.toLowerCase() === 'trojan') {
          trojanAccounts.push(accounts[id]);
        }
      }
      
      console.log("Found Trojan accounts:", trojanAccounts.length);
      return NextResponse.json(trojanAccounts);
    } else {
      console.log("No accounts found in database");
      return NextResponse.json([]); // Return empty array if no accounts
    }
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
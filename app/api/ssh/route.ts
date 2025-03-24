import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export async function GET(req: NextRequest) {
  try {
    const accountsRef = ref(database, 'vpsAccounts');
    const snapshot = await get(accountsRef);

    // Create response with data
    const response = NextResponse.json(
      snapshot.exists() 
        ? Object.values(snapshot.val()).filter((account: any) => 
            account.type && account.type.toLowerCase() === 'ssh'
          )
        : []
    );

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    console.log("Returning fresh SSH data from the database");
    return response;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return new NextResponse('Internal Server Error', { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  }
}
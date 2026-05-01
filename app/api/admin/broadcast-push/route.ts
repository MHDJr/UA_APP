
import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabase } from '@/lib/supabase';

// Helper to get supabase client with admin rights (if needed) or just use standard client
// In a real app we'd use service role key for admin tasks, but here we can reuse the client or env vars
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
};

webpush.setVapidDetails(
  'mailto:admin@usthad.academy',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function POST(request: Request) {
  try {
    const { message, title, icon } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch all profiles with subscriptions
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('subscription')
      .not('subscription', 'is', null);

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const payload = JSON.stringify({
      title: title || 'CEO Broadcast',
      body: message,
      icon: icon || '/images/alert-icon.png'
    });

    const sendPromises = profiles.map(profile => {
        const sub = profile.subscription;
        if (!sub) return Promise.resolve();
        return webpush.sendNotification(sub, payload).catch(err => {
            console.error('Error sending to sub:', err);
            // Optionally remove invalid subscriptions here
            return null;
        });
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, count: profiles.length });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    return NextResponse.json({ error: 'Failed to broadcast' }, { status: 500 });
  }
}

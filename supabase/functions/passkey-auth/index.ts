// Supabase Edge Function for Server-Side WebAuthn & Passkey Authentication
// Deploy to Supabase: `supabase functions deploy passkey-auth --no-verify-jwt`
// Uses Deno + @simplewebauthn/server for RFC-compliant biometric verification.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from 'https://esm.sh/@simplewebauthn/server@13.1.1';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory challenge cache with 5-minute TTL
const challengeStore = new Map<string, { challenge: string; userId?: string; expiresAt: number }>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.pathname.split('/').pop();
  const origin = req.headers.get('origin') || 'http://localhost:5173';
  const rpID = new URL(origin).hostname;

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Generate Registration Options
    if (action === 'register-options') {
      const { user } = await req.json();
      if (!user?.id || !user?.email) {
        return new Response(JSON.stringify({ error: 'User is required' }), { status: 400, headers: corsHeaders });
      }

      const options = await generateRegistrationOptions({
        rpName: 'Clean Quest',
        rpID,
        userID: new TextEncoder().encode(user.id),
        userName: user.email,
        userDisplayName: user.name || user.email.split('@')[0],
        attestationType: 'none',
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
      });

      challengeStore.set(options.challenge, {
        challenge: options.challenge,
        userId: user.id,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      return new Response(JSON.stringify(options), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 2. Verify Registration
    if (action === 'register-verify') {
      const { user, response, deviceName, challenge } = await req.json();
      const expectedRecord = challengeStore.get(challenge);
      challengeStore.delete(challenge); // Consume to prevent replay

      if (!expectedRecord || Date.now() > expectedRecord.expiresAt) {
        return new Response(JSON.stringify({ error: 'Challenge expired or invalid' }), { status: 400, headers: corsHeaders });
      }

      const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: expectedRecord.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: false,
      });

      if (!verification.verified || !verification.registrationInfo) {
        return new Response(JSON.stringify({ error: 'Verification failed' }), { status: 400, headers: corsHeaders });
      }

      const { credential, aaguid } = verification.registrationInfo;
      const credentialPublicKey = btoa(String.fromCharCode(...credential.publicKey));

      await supabase.from('user_passkeys').upsert({
        user_id: user.id,
        credential_id: credential.id,
        public_key: credentialPublicKey,
        counter: credential.counter,
        aaguid,
        credential_name: deviceName || 'Personal Device',
        authenticator_attachment: 'platform',
        created_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      }, { onConflict: 'credential_id' });

      return new Response(JSON.stringify({ verified: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 3. Generate Auth Options
    if (action === 'auth-options') {
      const options = await generateAuthenticationOptions({
        rpID,
        userVerification: 'preferred',
      });

      challengeStore.set(options.challenge, {
        challenge: options.challenge,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      return new Response(JSON.stringify(options), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 4. Verify Auth Assertion
    if (action === 'auth-verify') {
      const { response, challenge } = await req.json();
      const expectedRecord = challengeStore.get(challenge);
      challengeStore.delete(challenge); // Consume to prevent replay

      if (!expectedRecord || Date.now() > expectedRecord.expiresAt) {
        return new Response(JSON.stringify({ error: 'Challenge expired or invalid' }), { status: 400, headers: corsHeaders });
      }

      const { data: passkey } = await supabase
        .from('user_passkeys')
        .select('*')
        .eq('credential_id', response.id)
        .single();

      if (!passkey) {
        return new Response(JSON.stringify({ error: 'Passkey not found' }), { status: 404, headers: corsHeaders });
      }

      const binaryString = atob(passkey.public_key);
      const credentialPublicKey = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        credentialPublicKey[i] = binaryString.charCodeAt(i);
      }

      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: expectedRecord.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: passkey.credential_id,
          publicKey: credentialPublicKey,
          counter: Number(passkey.counter || 0),
          transports: passkey.transports,
        },
        requireUserVerification: false,
      });

      if (!verification.verified || !verification.authenticationInfo) {
        return new Response(JSON.stringify({ error: 'Signature verification failed' }), { status: 400, headers: corsHeaders });
      }

      await supabase
        .from('user_passkeys')
        .update({
          counter: verification.authenticationInfo.newCounter,
          last_used_at: new Date().toISOString(),
        })
        .eq('credential_id', passkey.credential_id);

      // Create or fetch Supabase user session
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', passkey.user_id)
        .single();

      return new Response(JSON.stringify({
        verified: true,
        userId: passkey.user_id,
        userEmail: profile?.email,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 404, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders });
  }
});

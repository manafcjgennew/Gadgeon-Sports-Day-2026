import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return new Response(JSON.stringify({ success: false, message: 'Method not allowed.' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!turnstileSecret || !supabaseUrl || !serviceRoleKey) {
    const missing = [
      !turnstileSecret ? 'TURNSTILE_SECRET_KEY' : '',
      !supabaseUrl ? 'SUPABASE_URL' : '',
      !serviceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : '',
    ].filter(Boolean);
    console.error('[registration] Missing Edge Function configuration:', missing);
    return new Response(JSON.stringify({ success: false, message: `Server registration configuration is missing: ${missing.join(', ')}.` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  let body: { turnstileToken?: string; email?: string; name?: string; businessUnit?: string; eventName?: string; eventNames?: string[] };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ success: false, message: 'Invalid registration request.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const token = typeof body.turnstileToken === 'string' ? body.turnstileToken.trim() : '';
  if (!token) return new Response(JSON.stringify({ success: false, message: 'Please complete CAPTCHA verification.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const form = {
    email: typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : '',
    name: typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ').slice(0, 120) : '',
    business_unit: typeof body.businessUnit === 'string' ? body.businessUnit.trim().slice(0, 120) : '',
  };
  const suppliedNames = Array.isArray(body.eventNames) ? body.eventNames : (typeof body.eventName === 'string' ? [body.eventName] : []);
  const eventNames = [...new Set(suppliedNames.map((name) => name.trim().slice(0, 120)).filter(Boolean))];
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || !form.name || !form.business_unit || !eventNames.length) {
    return new Response(JSON.stringify({ success: false, message: 'Please provide valid values for all required fields.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  let verifyResult: { success: boolean; 'error-codes'?: string[]; hostname?: string };
  try {
    const verifyBody = new URLSearchParams({ secret: turnstileSecret, response: token });
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (clientIp) verifyBody.set('remoteip', clientIp);
    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyBody,
    });
    verifyResult = await verifyResponse.json();
  } catch {
    return new Response(JSON.stringify({ success: false, message: 'CAPTCHA verification service is unavailable. Please try again.' }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (!verifyResult.success) {
    const expired = verifyResult['error-codes']?.some((code) => code.includes('timeout') || code.includes('expired'));
    return new Response(JSON.stringify({ success: false, message: expired ? 'CAPTCHA verification expired. Please try again.' : 'Verification failed. Please try again.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const verify = verifyResult as { success: boolean; action?: string; hostname?: string; 'error-codes'?: string[] };
  if (verify.action !== 'sports_registration') {
    return new Response(JSON.stringify({ success: false, message: 'Verification failed. Please try again.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const allowedHostnames = (Deno.env.get('TURNSTILE_HOSTNAMES') ?? '')
    .split(',')
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean);
  if (allowedHostnames.length && (!verify.hostname || !allowedHostnames.includes(verify.hostname.toLowerCase()))) {
    return new Response(JSON.stringify({ success: false, message: 'Verification failed. Please try again.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data: existingRows, error: lookupError } = await supabase
    .from('sports_day_registrations')
    .select('event_name')
    .eq('email', form.email);
  if (lookupError) {
    return new Response(JSON.stringify({ success: false, message: 'Existing registrations could not be checked. Please try again.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const existingEvents = new Set((existingRows ?? []).map((row: { event_name: string }) => row.event_name.trim().toLowerCase()));
  const registered: string[] = [];
  const duplicates: string[] = [];
  const failed: string[] = [];

  for (const eventName of eventNames) {
    if (existingEvents.has(eventName.toLowerCase())) {
      duplicates.push(eventName);
      continue;
    }
    const { error } = await supabase.from('sports_day_registrations').insert({ ...form, event_name: eventName });
    if (error) {
      const code = error.code?.toLowerCase() ?? '';
      const message = error.message?.toLowerCase() ?? '';
      if (code === '23505' || message.includes('duplicate') || message.includes('unique')) {
        duplicates.push(eventName);
      } else {
        failed.push(eventName);
      }
    } else {
      registered.push(eventName);
      existingEvents.add(eventName.toLowerCase());
    }
  }

  if (failed.length) {
    return new Response(JSON.stringify({ success: registered.length > 0, status: registered.length ? 'partial' : 'error', registered, duplicates, failed, message: `${registered.length ? `${registered.length} event(s) registered successfully. ` : ''}${failed.length} event(s) could not be saved. Please try again.${duplicates.length ? ` ${duplicates.length} event(s) were already registered.` : ''}` }), { status: registered.length || duplicates.length ? 207 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  if (registered.length && duplicates.length) {
    return new Response(JSON.stringify({ success: true, status: 'partial', registered, duplicates, message: `${registered.length} event(s) registered successfully. ${duplicates.length} event(s) were already registered and were skipped.` }), { status: 207, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  if (duplicates.length) {
    return new Response(JSON.stringify({ success: false, status: 'duplicate', registered: [], duplicates, message: `Already registered for: ${duplicates.join(', ')}. No duplicate registrations were created.` }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({ success: true, status: 'success', registered }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});

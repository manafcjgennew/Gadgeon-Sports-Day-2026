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
    return new Response(JSON.stringify({ success: false, message: 'Server registration configuration is missing.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  let body: { turnstileToken?: string; email?: string; name?: string; businessUnit?: string; eventName?: string };
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ success: false, message: 'Invalid registration request.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const token = typeof body.turnstileToken === 'string' ? body.turnstileToken.trim() : '';
  if (!token) return new Response(JSON.stringify({ success: false, message: 'Please complete CAPTCHA verification.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const form = {
    email: typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : '',
    name: typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ').slice(0, 120) : '',
    business_unit: typeof body.businessUnit === 'string' ? body.businessUnit.trim().slice(0, 120) : '',
    event_name: typeof body.eventName === 'string' ? body.eventName.trim().slice(0, 120) : '',
  };
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || !form.name || !form.business_unit || !form.event_name) {
    return new Response(JSON.stringify({ success: false, message: 'Please provide valid values for all required fields.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  let verifyResult: { success: boolean; 'error-codes'?: string[]; hostname?: string };
  try {
    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: turnstileSecret, response: token }),
    });
    verifyResult = await verifyResponse.json();
  } catch {
    return new Response(JSON.stringify({ success: false, message: 'CAPTCHA verification service is unavailable. Please try again.' }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (!verifyResult.success) {
    const expired = verifyResult['error-codes']?.some((code) => code.includes('timeout') || code.includes('expired'));
    return new Response(JSON.stringify({ success: false, message: expired ? 'CAPTCHA verification expired. Please try again.' : 'Verification failed. Please try again.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { error } = await supabase.from('sports_day_registrations').insert(form);
  if (error) {
    const code = error.code?.toLowerCase() ?? '';
    const message = error.message?.toLowerCase() ?? '';
    if (code === '23505' || message.includes('duplicate') || message.includes('unique')) {
      return new Response(JSON.stringify({ success: false, message: 'This email is already registered for the selected event.' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ success: false, message: 'Database insertion failed. Please try again.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});

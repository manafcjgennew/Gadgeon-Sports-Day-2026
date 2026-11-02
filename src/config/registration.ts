import { isSupabaseConfigured, supabase } from './supabase';

export const registrationConfig = {
  businessUnits: ['Business Unit placeholder 1', 'Business Unit placeholder 2', 'Business Unit placeholder 3'],
  events: [
    { group: 'Sports', options: ['Football', 'Badminton', 'Cricket', 'Table Tennis'] },
    { group: 'Athletics', options: ['100m Run', '200m Run', '400m Run', 'Shot Put Throw', 'Rope Skipping'] },
    { group: 'Board Games', options: ['Carroms', 'Chess'] },
    { group: 'Online Games', options: ['PES', 'Ludo', 'Carroms', 'PUBG'] },
    { group: 'PS5 Games', options: ['FIFA', 'Cricket', 'WWE', 'Racing'] },
  ],
};
export const defaultEventNames = [
  'Sports — Football',
  'Sports — Badminton',
  'Sports — Cricket',
  'Athletics — 100m Run',
  'Board Games — Carroms',
];

export type RegistrationPayload = { email: string; name: string; businessUnit: string; eventNames: string[] };
export type RegistrationResult = {
  status: 'success' | 'captcha' | 'duplicate' | 'partial' | 'configuration' | 'permission' | 'network' | 'database';
  message?: string;
  errorCode?: string;
  registered?: string[];
  duplicates?: string[];
  failed?: string[];
};

export async function submitRegistration(payload: RegistrationPayload, turnstileToken: string): Promise<RegistrationResult> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('[registration] Submission blocked because the browser-side Supabase client is not initialized.');
    return { status: 'configuration', message: 'Registration is unavailable because Supabase is not configured. Please contact the website administrator.' };
  }
  if (!turnstileToken) return { status: 'captcha', message: 'Please complete CAPTCHA verification.' };

  try {
    const { data, error } = await supabase.functions.invoke('register-sports-day', {
      body: {
        turnstileToken,
        email: payload.email.trim(),
        name: payload.name.trim().replace(/\s+/g, ' ').slice(0, 120),
        businessUnit: payload.businessUnit.trim().slice(0, 120),
        eventNames: payload.eventNames.map((name) => name.trim().slice(0, 120)).filter(Boolean),
        eventName: payload.eventNames[0]?.trim().slice(0, 120) || '',
      },
    });

    if (error) {
      const context = error.context as Response | undefined;
      let responseMessage = '';
      let responseData: { message?: string; errorCode?: string; registered?: string[]; duplicates?: string[]; failed?: string[] } = {};
      if (context && typeof context.clone === 'function') {
        try {
          responseData = await context.clone().json();
          responseMessage = responseData.message || '';
        } catch { /* The response may be empty */ }
      }
      const status = context?.status;
      if (status === 207) return { status: 'partial', message: responseMessage, registered: responseData.registered || [], duplicates: responseData.duplicates || [], failed: responseData.failed || [] };
      if (status === 409) return { status: 'duplicate', message: responseMessage || 'You have already registered for this event using this email address. Each participant can register only once for the same event. Please select another event if you wish to participate in additional events.' };
      if (status === 403) return { status: 'captcha', errorCode: responseData.errorCode, message: responseMessage || 'Verification failed. Please try again.' };
      if (status === 400) return { status: 'captcha', message: responseMessage || 'Please complete CAPTCHA verification.' };
      if (status === 404) return { status: 'configuration', message: 'Registration service is not deployed. Please deploy the register-sports-day Edge Function.' };
      if (status === 401 || status === 405) return { status: 'configuration', message: responseMessage || 'Registration service configuration is invalid.' };
      if (responseData.errorCode?.startsWith('turnstile_')) {
        return responseData.errorCode === 'turnstile_secret_invalid'
          ? { status: 'configuration', errorCode: responseData.errorCode, message: responseMessage || 'CAPTCHA verification is temporarily unavailable.' }
          : { status: 'captcha', errorCode: responseData.errorCode, message: responseMessage || 'Please complete CAPTCHA verification again.' };
      }
      if (status >= 500) return { status: 'database', message: responseMessage || 'The registration database service is temporarily unavailable.' };
      return { status: 'database', message: responseMessage || error.message || 'The registration could not be submitted.' };
    }
    if (!data?.success) return { status: 'database', message: data?.message || 'The registration could not be submitted.' };
    if (data?.duplicates?.length && data?.registered?.length) return { status: 'partial', message: data.message, registered: data.registered, duplicates: data.duplicates, failed: data.failed || [] };
    if (data?.duplicates?.length) return { status: 'duplicate', message: data.message, duplicates: data.duplicates };
    return { status: 'success', registered: data.registered || [] };
  } catch (error) {
    console.error('[registration] Edge Function invocation threw an unexpected error.', {
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
    return { status: 'network', message: 'Network connection failed. Check your internet connection and try again.' };
  }
}

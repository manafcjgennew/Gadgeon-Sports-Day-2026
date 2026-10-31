import { isSupabaseConfigured, supabase } from './supabase';

export const registrationConfig = {
  businessUnits: ['Business Unit placeholder 1', 'Business Unit placeholder 2', 'Business Unit placeholder 3'],
  events: [
    { group: 'Sports', options: ['Football', 'Cricket', 'Badminton', 'Table Tennis', 'Athletics – 100m', 'Athletics – 200m', 'Athletics – 400m', 'Shot Put Throw', 'Rope Skipping'] },
    { group: 'Board Games', options: ['Carroms', 'Chess'] },
    { group: 'Online Games', options: ['PES', 'Ludo', 'Carroms', 'PUBG'] },
    { group: 'PS5 Games', options: ['FIFA', 'Cricket', 'WWE', 'Racing'] },
  ],
};

export type RegistrationPayload = { email: string; name: string; businessUnit: string; eventName: string };
export type RegistrationResult = { status: 'success' | 'captcha' | 'duplicate' | 'configuration' | 'permission' | 'network' | 'database'; message?: string };

export async function submitRegistration(payload: RegistrationPayload, turnstileToken: string): Promise<RegistrationResult> {
  if (!isSupabaseConfigured || !supabase) return { status: 'configuration', message: 'Registration is unavailable because Supabase is not configured.' };
  if (!turnstileToken) return { status: 'captcha', message: 'Please complete CAPTCHA verification.' };

  try {
    const { data, error } = await supabase.functions.invoke('register-sports-day', {
      body: {
        turnstileToken,
        email: payload.email.trim(),
        name: payload.name.trim().replace(/\s+/g, ' ').slice(0, 120),
        businessUnit: payload.businessUnit.trim().slice(0, 120),
        eventName: payload.eventName.trim().slice(0, 120),
      },
    });

    if (error) {
      const context = error.context as Response | undefined;
      let responseMessage = '';
      if (context && typeof context.clone === 'function') {
        try { responseMessage = (await context.clone().json())?.message || ''; } catch { /* The response may be empty */ }
      }
      const status = context?.status;
      if (status === 409) return { status: 'duplicate', message: responseMessage || 'This email is already registered for the selected event.' };
      if (status === 403) return { status: 'captcha', message: responseMessage || 'Verification failed. Please try again.' };
      if (status === 400) return { status: 'captcha', message: responseMessage || 'Please complete CAPTCHA verification.' };
      if (status === 404) return { status: 'configuration', message: 'Registration service is not deployed. Please deploy the register-sports-day Edge Function.' };
      if (status === 401 || status === 405) return { status: 'configuration', message: responseMessage || 'Registration service configuration is invalid.' };
      if (status >= 500) return { status: 'database', message: responseMessage || 'The registration database service is temporarily unavailable.' };
      return { status: 'database', message: responseMessage || error.message || 'The registration could not be submitted.' };
    }
    if (!data?.success) return { status: 'database', message: data?.message || 'The registration could not be submitted.' };
    return { status: 'success' };
  } catch {
    return { status: 'network', message: 'Network connection failed. Check your internet connection and try again.' };
  }
}

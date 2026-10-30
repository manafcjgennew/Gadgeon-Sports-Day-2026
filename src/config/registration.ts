export const registrationConfig = {
  submissionUrl: '', // Connect a secure endpoint later. Never place API secrets in this frontend value.
  businessUnits: [
    'Business Unit placeholder 1',
    'Business Unit placeholder 2',
    'Business Unit placeholder 3',
  ],
  events: [
    { group: 'Sports', options: ['Football', 'Cricket', 'Badminton', 'Table Tennis', 'Athletics – 100m', 'Athletics – 200m', 'Athletics – 400m', 'Shot Put Throw', 'Rope Skipping'] },
    { group: 'Board Games', options: ['Carroms', 'Chess'] },
    { group: 'Online Games', options: ['PES', 'Ludo', 'Carroms', 'PUBG'] },
    { group: 'PS5 Games', options: ['FIFA', 'Cricket', 'WWE', 'Racing'] },
  ],
};

export type RegistrationPayload = {
  email: string;
  name: string;
  businessUnit: string;
  eventName: string;
};

export async function submitRegistration(payload: RegistrationPayload) {
  if (!registrationConfig.submissionUrl) {
    return { status: 'demo' as const };
  }

  const response = await fetch(registrationConfig.submissionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Registration submission failed');
  return { status: 'success' as const };
}

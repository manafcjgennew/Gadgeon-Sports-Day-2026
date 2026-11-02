import { Users, Trophy, Sparkles, HeartHandshake } from 'lucide-react';

export const highlights = [
  { icon: HeartHandshake, title: 'Team Spirit', text: 'Stronger together through every challenge.', number: '01' },
  { icon: Trophy, title: 'Athletic Excellence', text: 'Push limits and celebrate peak performance.', number: '02' },
  { icon: Users, title: 'Friendly Competition', text: 'Rivalries that inspire, respect that lasts.', number: '03' },
  { icon: Sparkles, title: 'Fun & Celebration', text: 'Moments, memories, and a shared victory.', number: '04' },
];

export const sports = [
  { name: 'Football', tag: 'Team Sport', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80' },
  { name: 'Cricket', tag: 'Bat & Ball', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=900&q=80' },
  { name: 'Badminton', tag: 'Rally', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80' },
  { name: 'Volleyball', tag: 'Team Sport', image: 'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=900&q=80' },
  { name: 'Basketball', tag: 'Fast Break', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80' },
  { name: 'Table Tennis', tag: 'Quick Reflexes', image: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=900&q=80' },
  { name: 'Athletics', tag: 'Track & Field', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=80' },
  { name: 'Tug of War', tag: 'Power Team', image: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=900&q=80' },
];

export const teams = [
  { name: 'Avial Avengers', color: '#1687ff', initials: 'AA', points: 0 },
  { name: 'Thumbapoo Squad', color: '#ff8a00', initials: 'TS', points: 0 },
  { name: 'Sharkara Upperi Syndicate', color: '#e8efff', initials: 'SU', points: 0 },
  { name: 'Prakmbanam', color: '#20c997', initials: 'P', points: 0 },
];

export const leaderboard = teams.map((team) => ({ ...team }));

export const schedule = [
  { time: 'November 9–13, 2026', title: 'Football', venue: 'USC Kakkanad', status: 'Scheduled' },
  { time: 'November 10–12, 2026', title: 'Table Tennis', venue: 'USC Kakkanad', status: 'Scheduled' },
  { time: 'November 9, 2026 onwards', title: 'Online Games', venue: 'Venue not specified', status: 'Onwards' },
  { time: 'November 14, 2026 onwards', title: 'Board Games', venue: 'Gadgeon SmartCity', status: 'Onwards' },
  { time: 'November 28, 2026', title: 'Badminton', venue: 'USC Kakkanad', status: 'Scheduled' },
  { time: 'December 1–3, 2026', title: 'Cricket', venue: 'Backyard Kakkanad', status: 'Scheduled' },
  { time: 'December 6, 2026', title: 'Sports Day Grand Finale', venue: 'The Indian Public School, Kakkanad', status: 'Grand Finale' },
];

export const gallery = [
  { category: 'Action', src: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=85', alt: 'Runner racing on a track' },
  { category: 'Team', src: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=85', alt: 'Team athletes training together' },
  { category: 'Action', src: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=85', alt: 'Athletes competing outdoors' },
  { category: 'Celebration', src: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=85', alt: 'Football match celebration' },
  { category: 'Team', src: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=85', alt: 'Basketball team on court' },
  { category: 'Action', src: 'https://images.unsplash.com/photo-1530137075202-2f5b1d9c98b3?auto=format&fit=crop&w=1200&q=85', alt: 'Sports equipment and event activity' },
];

export const stats = [
  { value: 500, label: 'Participating Employees', suffix: '+' },
  { value: 12, label: 'Teams', suffix: '+' },
  { value: 8, label: 'Sports Categories', suffix: '' },
  { value: 40, label: 'Matches', suffix: '+' },
];

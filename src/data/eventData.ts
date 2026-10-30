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
  { name: 'Blue Thunder', color: '#1687ff', initials: 'BT', captain: 'Captain placeholder', members: 24 },
  { name: 'Orange Force', color: '#ff8a00', initials: 'OF', captain: 'Captain placeholder', members: 22 },
  { name: 'White Lightning', color: '#e8efff', initials: 'WL', captain: 'Captain placeholder', members: 20 },
  { name: 'Green Titans', color: '#20c997', initials: 'GT', captain: 'Captain placeholder', members: 21 },
];

export const leaderboard = teams.map((team, index) => ({
  ...team,
  gold: [4, 3, 2, 1][index], silver: [2, 3, 2, 4][index], bronze: [1, 2, 4, 2][index],
  points: [28, 24, 18, 16][index], demo: true,
}));

export const schedule = [
  { time: '09:00 AM', title: 'Opening Ceremony & Team Parade', venue: 'Main Arena — placeholder', status: 'Placeholder' },
  { time: '10:30 AM', title: 'Football & Volleyball', venue: 'Sports Ground — placeholder', status: 'Sample' },
  { time: '12:30 PM', title: 'Lunch & Team Activities', venue: 'Central Pavilion — placeholder', status: 'Sample' },
  { time: '02:00 PM', title: 'Cricket & Badminton Finals', venue: 'Main Arena — placeholder', status: 'Sample' },
  { time: '04:30 PM', title: 'Awards & Closing Celebration', venue: 'Main Stage — placeholder', status: 'Sample' },
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

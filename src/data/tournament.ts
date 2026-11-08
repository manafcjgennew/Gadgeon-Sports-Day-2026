export type EventItem = { id:string; shortDate:string; date:string; title:string; category:string; description:string; games?:string[]; finale?:boolean; image:string };
export type EventScheduleItem = EventItem & { venue?: string };

export const teams = [
  { name: 'Avial Avengers', points: 0, color: '#1687ff' },
  { name: 'Thumbapoo Squad', points: 0, color: '#ff7424' },
  { name: 'Sharkara Upperi Syndicate', points: 0, color: '#875cff' },
  { name: 'Prakmbanam', points: 0, color: '#f6f8fc' },
];

export const rankedTeams = teams.every((team) => team.points === teams[0].points)
  ? teams
  : [...teams].sort((a, b) => b.points - a.points);

export const eventSchedule: EventScheduleItem[] = [
  { id:'football',shortDate:'NOV 09–13',date:'November 9–13, 2026',title:'Football',category:'Outdoor Sports',venue:'USC Kakkanad',description:'Experience the thrill of football, teamwork, strategy, and competition.',image:'/images/football.jpg' },
  { id:'online',shortDate:'NOV 09 ONWARDS',date:'November 9, 2026 onwards',title:'Online Games',category:'Online Gaming',venue:'Venue not specified',description:'Challenge your colleagues, sharpen your gaming skills, and compete for digital glory.',games:['PES','LUDO','CARROMS','BGMI','Mini Militia'],image:'/images/gaming.jpg' },
  { id:'table-tennis',shortDate:'NOV 10–12',date:'November 10–12, 2026',title:'Table Tennis',category:'Indoor Sports',venue:'USC Kakkanad',description:'Fast reactions, precision, and incredible sporting action.',image:'/images/table-tennis.jpg' },
  { id:'board',shortDate:'NOV 14 ONWARDS',date:'November 14, 2026 onwards',title:'Board Games',category:'Indoor Games',venue:'Gadgeon SmartCity',description:'Strategy, patience, and intelligence. Every move counts.',games:['Carroms','Chess'],image:'/images/board-games.jpg' },
  { id:'badminton',shortDate:'NOV 28',date:'November 28, 2026',title:'Badminton',category:'Indoor Sports',venue:'USC Kakkanad',description:'Speed, focus, and finesse.',image:'/images/badminton.jpg' },
  { id:'cricket',shortDate:'DEC 01–03',date:'December 1–3, 2026',title:'Cricket',category:'Outdoor Sports',venue:'Backyard Kakkanad',description:'Gear up for the ultimate cricket showdown. Bat, bowl, field, and lead your team to victory.',image:'/images/cricket.jpg' },
  { id:'finale',shortDate:'DEC 06',date:'December 6, 2026',title:'Sports Day Grand Finale',category:'Grand Finale',venue:'Venue not yet finalized',description:"One final stage. One ultimate celebration. It's time to showcase your talent and celebrate Gadgeon Sports Day 2026.",games:['Athletics','Board Games Finals','Online Games Finals','PS5 Championship'],finale:true,image:'/images/finale.jpg' }
];
export const events = eventSchedule;
export const onlineGames=['PES','LUDO','CARROMS','BGMI','Mini Militia'];
export const ps5Games=['Football: EA Sports FC 27','Cricket: Cricket 26','Wrestling & Combat: WWE 2K26 & UFC 5','Racing: WRC Generations & Dirt 5'];
export const athletics=['100 Meter Run','200 Meter Run','400 Meter Run','Skipping Rope'];
export const sportsDetails: EventScheduleItem[] = [
  {
    id: 'athletics',
    shortDate: 'DEC 06',
    date: 'December 6, 2026',
    title: 'Athletics',
    category: 'Grand Finale',
    venue: 'Venue not yet finalized',
    description: 'Sprint, throw, and leap for glory in the Grand Finale athletics events.',
    games: athletics,
    finale: true,
    image: '/images/athletics.jpg',
  },
  {
    id: 'ps5',
    shortDate: 'DEC 06',
    date: 'December 6, 2026',
    title: 'PS5 Gaming',
    category: 'Grand Finale',
    venue: 'Venue not yet finalized',
    description: 'Compete in Football, Cricket, Wrestling & Combat, and Racing during the PS5 Championship.',
    games: ps5Games,
    finale: true,
    image: '/images/ps5.jpg',
  },
];
export const gallery=[
 {category:'Football',src:'/images/football.jpg',alt:'Football action'},
 {category:'Cricket',src:'/images/cricket.jpg',alt:'Cricket match'},
 {category:'Badminton',src:'/images/badminton.jpg',alt:'Badminton play'},
 {category:'Gaming',src:'/images/gaming.jpg',alt:'Gaming arena'},
 {category:'Athletics',src:'/images/athletics.jpg',alt:'Athletics track'},
 {category:'Celebration',src:'/images/finale.jpg',alt:'Team celebration'}];
export const sportsShowcase = [
 ...eventSchedule.filter((event) => event.id !== 'finale').map((event) => ({
   id:event.id,title:event.title,date:event.date,category:event.category,description:event.description,image:event.image,
 })),
 {id:'athletics',title:'Athletics',date:'December 6, 2026',category:'Grand Finale',description:'Sprint, throw, and leap for glory.',image:'/images/athletics.jpg'},
 {id:'ps5',title:'PS5 Gaming',date:'December 6, 2026',category:'Grand Finale',description:'Football, Cricket, Wrestling & Combat, and Racing.',image:'/images/ps5.jpg'},
];
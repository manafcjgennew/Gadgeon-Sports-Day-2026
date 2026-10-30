export type EventItem = { id:string; shortDate:string; date:string; title:string; category:string; description:string; games?:string[]; finale?:boolean; image:string };
export const events: EventItem[] = [
 {id:'football',shortDate:'NOV 09–11',date:'November 9, 10 and 11, 2026',title:'Football',category:'Outdoor Sports',description:'Experience the thrill of football, teamwork, strategy, and competition.',image:'/images/football.jpg'},
 {id:'online',shortDate:'NOV 09 ONWARDS',date:'Starting November 9, 2026',title:'Online Games',category:'Online Gaming',description:'Challenge your colleagues, sharpen your gaming skills, and compete for digital glory.',games:['PES','LUDO','CARROMS','PUBG'],image:'/images/gaming.jpg'},
 {id:'board',shortDate:'NOV 09 ONWARDS',date:'Starting November 9, 2026',title:'Board Games',category:'Indoor Games',description:'Strategy, patience, and intelligence. Every move counts.',games:['Carroms','Chess'],image:'/images/board-games.jpg'},
 {id:'rackets',shortDate:'NOV 20',date:'November 20, 2026',title:'Table Tennis & Badminton',category:'Indoor Sports',description:'Fast reactions, precision, and incredible sporting action.',games:['Table Tennis','Badminton'],image:'/images/badminton.jpg'},
 {id:'cricket',shortDate:'DEC 01–03',date:'December 1, 2 and 3, 2026',title:'Cricket',category:'Outdoor Sports',description:'Gear up for the ultimate cricket showdown. Bat, bowl, field, and lead your team to victory.',image:'/images/cricket.jpg'},
 {id:'finale',shortDate:'DEC 05',date:'December 5, 2026',title:'The Grand Sports Finale',category:'Grand Finale',description:"One final stage. One ultimate celebration. It's time to showcase your talent, celebrate your achievements, and crown the champions of Gadgeon Sports Day 2026.",games:['Athletics','Board Games Finals','Online Games Finals','PS5 Championship'],finale:true,image:'/images/finale.jpg'}
];
export const onlineGames=['PES','LUDO','CARROMS','PUBG'];
export const ps5Games=['FIFA','Cricket','WWE','Racing'];
export const athletics=['100 Meter Run','200 Meter Run','400 Meter Run','Shot Put Throw','Rope Skipping'];
export const gallery=[
 {category:'Football',src:'/images/football.jpg',alt:'Football action'},
 {category:'Cricket',src:'/images/cricket.jpg',alt:'Cricket match'},
 {category:'Badminton',src:'/images/badminton.jpg',alt:'Badminton play'},
 {category:'Gaming',src:'/images/gaming.jpg',alt:'Gaming arena'},
 {category:'Athletics',src:'/images/athletics.jpg',alt:'Athletics track'},
 {category:'Celebration',src:'/images/finale.jpg',alt:'Team celebration'}];
export const demoTeams=[
 {name:'Team Alpha — Demo',gold:3,silver:2,bronze:1,color:'#1687ff',points:23},
 {name:'Team Blaze — Demo',gold:2,silver:3,bronze:2,color:'#ff7a00',points:21},
 {name:'Team Unity — Demo',gold:1,silver:2,bronze:4,color:'#8b5cf6',points:16},
];
export const sportsShowcase = [
 {id:'football',title:'Football',date:'Nov 09–11, 2026',category:'Outdoor Sports',description:'Teamwork, strategy, and competition.',image:'/images/football.jpg'},
 {id:'online',title:'Online Games',date:'Starting Nov 09, 2026',category:'Online Gaming',description:'PES, LUDO, CARROMS, and PUBG.',image:'/images/gaming.jpg'},
 {id:'board',title:'Board Games',date:'Starting Nov 09, 2026',category:'Indoor Games',description:'Carroms and Chess. Every move counts.',image:'/images/board-games.jpg'},
 {id:'table-tennis',title:'Table Tennis',date:'Nov 20, 2026',category:'Indoor Sports',description:'Fast reactions and precision.',image:'/images/table-tennis.jpg'},
 {id:'badminton',title:'Badminton',date:'Nov 20, 2026',category:'Indoor Sports',description:'Speed, focus, and finesse.',image:'/images/badminton.jpg'},
 {id:'cricket',title:'Cricket',date:'Dec 01–03, 2026',category:'Outdoor Sports',description:'The ultimate cricket showdown.',image:'/images/cricket.jpg'},
 {id:'athletics',title:'Athletics',date:'Dec 05, 2026',category:'Grand Finale',description:'Sprint, throw, and leap for glory.',image:'/images/athletics.jpg'},
 {id:'ps5',title:'PS5 Gaming',date:'Dec 05, 2026',category:'Grand Finale',description:'FIFA, Cricket, WWE, and Racing.',image:'/images/ps5.jpg'},
];
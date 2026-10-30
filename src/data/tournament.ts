export type EventItem = { id:string; shortDate:string; date:string; title:string; category:string; description:string; games?:string[]; finale?:boolean; image:string };
export const events: EventItem[] = [
 {id:'football',shortDate:'NOV 09–11',date:'November 9, 10 and 11, 2026',title:'Football',category:'Outdoor Sports',description:'Experience the thrill of football, teamwork, strategy, and competition.',image:'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=85'},
 {id:'online',shortDate:'NOV 09 ONWARDS',date:'Starting November 9, 2026',title:'Online Games',category:'Online Gaming',description:'Challenge your colleagues, sharpen your gaming skills, and compete for digital glory.',games:['PES','LUDO','CARROMS','PUBG'],image:'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85'},
 {id:'board',shortDate:'NOV 09 ONWARDS',date:'Starting November 9, 2026',title:'Board Games',category:'Indoor Games',description:'Strategy, patience, and intelligence. Every move counts.',games:['Carroms','Chess'],image:'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&q=85'},
 {id:'rackets',shortDate:'NOV 20',date:'November 20, 2026',title:'Table Tennis & Badminton',category:'Indoor Sports',description:'Fast reactions, precision, and incredible sporting action.',games:['Table Tennis','Badminton'],image:'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=85'},
 {id:'cricket',shortDate:'DEC 01–03',date:'December 1, 2 and 3, 2026',title:'Cricket',category:'Outdoor Sports',description:'Gear up for the ultimate cricket showdown. Bat, bowl, field, and lead your team to victory.',image:'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=85'},
 {id:'finale',shortDate:'DEC 05',date:'December 5, 2026',title:'The Grand Sports Finale',category:'Grand Finale',description:"One final stage. One ultimate celebration. It's time to showcase your talent, celebrate your achievements, and crown the champions of Gadgeon Sports Day 2026.",games:['Athletics','Board Games Finals','Online Games Finals','PS5 Championship'],finale:true,image:'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=85'}
];
export const onlineGames=['PES','LUDO','CARROMS','PUBG'];
export const ps5Games=['FIFA','Cricket','WWE','Racing'];
export const athletics=['100 Meter Run','200 Meter Run','400 Meter Run','Shot Put Throw','Rope Skipping'];
export const gallery=[
 {category:'Football',src:'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=85',alt:'Football action'},
 {category:'Cricket',src:'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=85',alt:'Cricket match'},
 {category:'Badminton',src:'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=85',alt:'Badminton play'},
 {category:'Gaming',src:'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85',alt:'Gaming arena'},
 {category:'Athletics',src:'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=85',alt:'Athletics track'},
 {category:'Celebration',src:'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=85',alt:'Team celebration'}];
export const demoTeams=[
 {name:'Team Alpha — Demo',gold:3,silver:2,bronze:1,color:'#1687ff',points:23},
 {name:'Team Blaze — Demo',gold:2,silver:3,bronze:2,color:'#ff7a00',points:21},
 {name:'Team Unity — Demo',gold:1,silver:2,bronze:4,color:'#8b5cf6',points:16},
];

export const sportsShowcase = [
 {id:'football',title:'Football',date:'Nov 09–11, 2026',category:'Outdoor Sports',description:'Teamwork, strategy, and competition.',image:events[0].image},
 {id:'online',title:'Online Games',date:'Starting Nov 09, 2026',category:'Online Gaming',description:'PES, LUDO, CARROMS, and PUBG.',image:events[1].image},
 {id:'board',title:'Board Games',date:'Starting Nov 09, 2026',category:'Indoor Games',description:'Carroms and Chess. Every move counts.',image:events[2].image},
 {id:'table-tennis',title:'Table Tennis',date:'Nov 20, 2026',category:'Indoor Sports',description:'Fast reactions and precision.',image:'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=1200&q=85'},
 {id:'badminton',title:'Badminton',date:'Nov 20, 2026',category:'Indoor Sports',description:'Speed, focus, and finesse.',image:events[3].image},
 {id:'cricket',title:'Cricket',date:'Dec 01–03, 2026',category:'Outdoor Sports',description:'The ultimate cricket showdown.',image:events[4].image},
 {id:'athletics',title:'Athletics',date:'Dec 05, 2026',category:'Grand Finale',description:'Sprint, throw, and leap for glory.',image:events[5].image},
 {id:'ps5',title:'PS5 Gaming',date:'Dec 05, 2026',category:'Grand Finale',description:'FIFA, Cricket, WWE, and Racing.',image:'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1200&q=85'},
];
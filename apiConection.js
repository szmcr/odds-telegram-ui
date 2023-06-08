
const LNAMES = ['NBA', 'NCAAB', 'Soccer Premier League', 'Soccer UCL'];
const URL = 'https://api.the-odds-api.com/v4/sports/';
const API_KEY = '?apiKey=45e40cd47765e8a30df6e1567ec39574';

const findSports = async () => {
    try {
      const response = await fetch(`https://api.the-odds-api.com/v4/sports/${API_KEY}`);
      const data = await response.json();
      let key = data.map((sport)=> {
        let short_name = [];

        if (sport.active) { 
            short_name.push(sport.key);
            return short_name; 
        } else {
            return(sport.title + ' does not have odds.');
        }
      });
      
      return key;
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
const generateOdds = async () => {
    let active_sports = await findSports();
    console.log(active_sports);
    let sports = [
        {
            short_name: '',
            matches: [
                {
                   home_team: '',
                   away_team: '',
                   money_home: '',
                   money_away: '',
                   spread_home: '',
                   spread_away: '',
                   over: '',
                   under: ''
                }
            ]
        }
    ]
    try {    
        active_sports.forEach(async temp => {
            const url = `https://api.the-odds-api.com/v4/sports/${temp}/odds/${API_KEY}&regions=us&oddsFormat=american&markets=h2h,spreads,totals&bookmakers=betus`;
            try {
                
                const response = await fetch(url);
                const data = await response.json();

            console.log(data);
            } catch (error) {
                console.log('Error: ' + error)
            }
            

        })
    } catch (err) {
        console.log('Error: ', err);
    }
}


generateOdds();
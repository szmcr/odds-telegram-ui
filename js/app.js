import API_KEY from './config.js';
const URL = 'https://api.the-odds-api.com/v4/sports/';
const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const findSports = async () => {
  try {
    const response = await fetch(`${URL}${API_KEY}`);
    const data = await response.json();
    let objectSport = {
      title: '',
      short_name: ''
    };
    let sportsArray = data.map((sport) => {
      if (sport.active) {
        objectSport = {
          title: sport.title,
          short_name: sport.key
        }
        return objectSport;
      } else {
        return (sport.title + ' does not have odds.');
      }
    });
    let html = '';
    sportsArray.forEach(item => {
      html += `<div class="sport-opt"><input type="checkbox" name="${item.short_name}" id="${item.short_name + 'id'}"/><label for="${item.short_name}">${item.title}</label> </div>`
    });

    document.getElementById('sportsCheck').innerHTML += html;
  } catch (error) {
    console.error('Error:', error);
  }
}

findSports();

const selectedSportsArray = () => {
  let arr = [];
  let checkboxes = document.querySelectorAll('input[type=checkbox]:checked');

  checkboxes.forEach(box => {
    arr.push(box.name);
  });

  return arr;
}

const validateSelection = () => {
  if (selectedSportsArray().length === 0) {
    Swal.fire('Please select a sport competition.');
  } else {
    generateOdds();
  }
}

const getOdds = async () => {
  let active_sports = selectedSportsArray();
  let dataArray = [];
  for (let temp of active_sports) {
    let url = `https://api.the-odds-api.com/v4/sports/${temp}/odds/${API_KEY}&regions=us&oddsFormat=american&markets=h2h,spreads,totals&bookmakers=betus`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      let oddsObject = {
        sport: temp,
        title: data[0].sport_title,
        data: data
      };
      dataArray.push(oddsObject);
    } catch (error) {
      console.error('Error:', error);
    }
    console.log(url);
  }

  return dataArray;
}

const generateOdds = async () => {
  const data = await getOdds();
  let html = '';
  
  for (let temp of data) {
    html += `<h2>${temp.title}</h2><section class="odds-sct">`;

    const currentDate = new Date();
    const endDate = new Date();
    endDate.setDate(currentDate.getDate() + 10);

    let hasMatches = false; 
    try {

      for (let [index, game] of temp.data.entries()) {
        const originalDate = game.commence_time;
        const date = new Date(originalDate);
        if (date >= currentDate && date <= endDate){
          hasMatches = true;
          const month = monthNames[date.getUTCMonth()];
          const day = date.getUTCDate();
          const gameDate = `${month} ${day}`;
          const hours = date.getUTCHours();
          const minutes = date.getUTCMinutes();
          const formattedHours = hours % 12 || 12;
          const meridiem = hours >= 12 ? "PM" : "AM";
          const gameTime = `${formattedHours}:${minutes.toString().padStart(2, "0")} ${meridiem}`;
          
  
  
          if (game.bookmakers[0] && game.bookmakers[0].markets[0] && game.bookmakers[0].markets[0].outcomes) {
            const team1 = game.away_team;
            const team2 = game.home_team;
            const ml1 = game.bookmakers[0].markets[0] ? game.bookmakers[0].markets[0].outcomes[0].price : 'N/A';
            const ml2 = game.bookmakers[0].markets[0] ? game.bookmakers[0].markets[0].outcomes[1].price : 'N/A';   
            const spreadOdds1 = game.bookmakers[0].markets[1].outcomes[0].price > 0 ? '+' + game.bookmakers[0].markets[1].outcomes[0].price : game.bookmakers[0].markets[1].outcomes[0].price
            const spreadOdds2 = game.bookmakers[0].markets[1].outcomes[1].price > 0 ? '+' + game.bookmakers[0].markets[1].outcomes[1].price : game.bookmakers[0].markets[1].outcomes[1].price
            const price1 = game.bookmakers[0].markets[1].outcomes[0].point + '  ' + spreadOdds1;
            const price2 = game.bookmakers[0].markets[1].outcomes[1].point + '  ' +  spreadOdds2;
            const over = game.bookmakers[0].markets[2] ? game.bookmakers[0].markets[2].outcomes[0].price : 'N/A';
            const under = game.bookmakers[0].markets[2] ? game.bookmakers[0].markets[2].outcomes[1].price : 'N/A';
            const total = game.bookmakers[0].markets[2] ? game.bookmakers[0].markets[2].outcomes[1].point : 'N/A';
            
            html += `<div class="card" id="${game.id}" 
            data-sport="${temp.title}" 
            data-team1="${team1}" 
            data-team2="${team2}" 
            data-date="${gameDate}" 
            data-time="${gameTime}"
            data-ml1="${ml1}"
            data-ml2="${ml2}" 
            data-price1="${price1}" 
            data-price2="${price2}" 
            data-over="${over}" 
            data-under="${under}" 
            data-totals="${total}">
              <span class="date">${gameDate}</span>
              <span class="time">${gameTime}</span>
              <span class="team1">${team1}</span>
              <span class="team2">${team2}</span>
              <span class="price1">${price1}</span>
              <span class="price2">${price2}</span>
              <span class="over">Over ${over}</span>
              <span class="under">Under ${under}</span>
            </div>`;
          } else {
            const team1 = game.away_team;
            const team2 = game.home_team;
          
            if(index < 20){
            html += `<div class="card non-selectable">
            <span class="date">${gameDate}</span>
            <span class="time">${gameTime}</span>
            <span class="team1">${team1}</span>
            <span class="team2">${team2}</span>
            <span>No Odds</span>
            <span>No Odds</span>
            </div>`
            }
            console.log("Error: can't access the data for this game.");
          }
        }
      }
      if (!hasMatches) {
        html += `<div class="card non-selectable no-matches">No matches/fights scheduled for the next 10 days</div>`;
      }
      
    } catch (error) {
      console.error('Error:', error);
    }

    html += '</section>';
  }

  document.getElementById('oddsContent').innerHTML = html;

  cardSelection();
  addClass('selectSports', 'hide');
  removeClass('btnSect', 'hide');
  removeClass('oddsContent', 'hide');
  removeClass('btnGoBack', 'hide');
}


const addClass = (id, className) => {
  let tag = document.getElementById(id);
  tag.classList.add(className);
}

const removeClass = (id, className) => {
  let tag = document.getElementById(id);
  tag.classList.remove(className);
}

const cardSelection = () => {
  const cards = document.querySelectorAll('.card');
  const selectedCards = [];

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      if (!card.classList.contains('non-selectable')) {
        card.classList.toggle('selected');
        const cardId = card.id;

        if (card.classList.contains('selected')) {
          const cardObject = { id: cardId };
          selectedCards.push(cardObject);
        } else {
          const index = selectedCards.findIndex((obj) => obj.id === cardId);
          if (index > -1) {
            selectedCards.splice(index, 1);
          }
        }
      }
    });
  });
};

const validateSportEmoji = (sport) => {
  let emojis = ['🏈', '🏀','⚾', '⚽', '🏉', '🏒', '🎾', '🥊', '🏓', '⛳'];
  let football = ['CFL', 'NCAAF', 'NFL', 'NFL Super Bowl Winner', 'XFL', 'NFL Preseason'];
  let basketball = ['Basketball Euroleague', 'NBA', 'NBA Championship Winner', 'WNBA', 'NCAAB']
  let baseball = ['MLB', 'MLB Preseason', 'MLB World Series Winner', 'NCAA Baseball'];
  let iceHockey = ['NHL', 'NHL Championship Winner', 'SHL', 'HockeyAllsvenskan']
  let soccer = ['Africa Cup of Nations', 'Primera División - Argentina', 'A-League', 'Austrian Football Bundesliga', 'Belgium First Div', 'Brazil Série A', 'Brazil Série B', 'Primera División - Chile', 'Super League - China', 'Denmark Superliga', 'Championship', 'EFL Cup', 'League 1', 'League 2', 'EPL', 'FA Cup', 'FIFA World Cup', 'Veikkausliiga - Finland', 'Ligue 1 - France', 'Ligue 2 - France', 'Bundesliga - Germany', 'Bundesliga 2 - Germany', '3. Liga - Germany', 'Super League - Greece', 'Serie A - Italy', 'Serie B - Italy', 'J League', 'K League 1', 'League of Ireland', 'Liga MX', 'Dutch Eredivisie', 'Eliteserien - Norway', 'Ekstraklasa - Poland', 'Primeira Liga - Portugal', 'Premier League - Russia', 'La Liga - Spain', 'La Liga 2 - Spain', 'Premiership - Scotland', 'Allsvenskan - Sweden', 'Superettan - Sweden', 'Swiss Superleague', 'Turkey Super League', 'UEFA Europa Conference League', 'UEFA Champions League', 'UEFA Europa League', 'UEFA Nations League', 'Copa Libertadores', 'MLS']
  let tennis = ['ATP Australian Open', 'ATP French Open', 'ATP US Open', 'ATP Wimbledon', 'WTA Australian Open', 'WTA French Open', 'WTA US Open', 'WTA Wimbledon']
  let rugby = ['NRL']

  if (football.includes(sport) || sport === 'AFL') {
    return emojis[0];
  } else if (basketball.includes(sport)) {
    return emojis[1];
  }else if (baseball.includes(sport)) {
    return emojis[2];
  }else if (sport === 'Boxing' || sport === 'MMA') {
    return emojis[7];
  }else if (iceHockey.includes(sport)) {
    return emojis[6];
  }else if (soccer.includes(sport)) {
    return emojis[3];
  }else if (tennis.includes(sport)) {
    return emojis[6];
  }else if (rugby.includes(sport)) {
    return emojis[4];
  }

}



const generateTextMessage = () => {
  const selectedCards = document.querySelectorAll('.card.selected');
  const sportMap = new Map();

  selectedCards.forEach((card, index) => {
    const team1 = card.dataset.team1;
    const team2 = card.dataset.team2;
    const price1 = card.dataset.price1;
    const price2 = card.dataset.price2;
    const ml1 = Number(card.dataset.ml1) > 0 ? `+${card.dataset.ml1}` : card.dataset.ml1;
    const ml2 = Number(card.dataset.ml2) > 0 ? `+${card.dataset.ml2}` : card.dataset.ml2;
    const date = card.dataset.date;
    const time = card.dataset.time;
    const over = card.dataset.over ? card.dataset.over : '';
    const under = card.dataset.under ? card.dataset.under : '';
    const totals = card.dataset.totals;
    
    const sportTitle = card.dataset.sport;
    let gameInfo;

    if (totals != 'N/A'){
      gameInfo = sportTitle === 'Boxing' || sportTitle === 'MMA' ? `${team1} ${ml1}\n${team2} ${ml2}\nTOTAL ${totals}\n${time} EST` : `${team1} ${price1}\n${team2} ${price2}\nTOTAL ${totals}\n${time} EST`;
    } else { 
      gameInfo = sportTitle === 'Boxing' || sportTitle === 'MMA' ? `${team1} ${ml1}\n${team2} ${ml2}\n${time} EST` : `${team1} ${price1}\n${team2} ${price2}\n${time} EST`;
    }
    

    if (sportMap.has(sportTitle)) {
      sportMap.get(sportTitle).push(gameInfo);
    } else {
      sportMap.set(sportTitle, [gameInfo]);
    }
  });

  let message = 'Top Games of the Day\n';
  message += new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  message += '\n\n';

  sportMap.forEach((games, sport) => {
    let emoji = validateSportEmoji(sport);
    message += `${sport}${emoji}\n\n`;
    games.forEach((game) => {
      message += `${game}\n\n`;
    });
  });

  return message;
};

let btnSports = document.getElementById('btnSports');
let btnGoBack = document.getElementById('btnGoBack');
let btnGenerate = document.getElementById('btnGenerate');
let btnCopy = document.getElementById('btnCopy')
let btnGoBackOdds = document.getElementById('btnGoBackOdds')
let btnHome = document.getElementById('btnHome')

btnSports.addEventListener('click', validateSelection);
btnGoBack.addEventListener('click', () => {
  let checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
  removeClass('selectSports', 'hide');
  addClass('btnSect', 'hide');
  addClass('oddsContent', 'hide');
  addClass('btnGoBack', 'hide');
  addClass('messageSect', 'hide');
  checkboxes.forEach(box => {
    box.checked = false;
  });
});
btnGoBackOdds.addEventListener('click', () => {
  addClass('messageSect', 'hide');
  removeClass('oddsContent','hide');
  removeClass('btnSect', 'hide');
  removeClass('btnGoBack', 'hide');
})
btnGenerate.addEventListener('click', () => {
  const textMessage = generateTextMessage();

document.getElementById('message').innerHTML = `<textarea rows="4" cols="50">${textMessage}</textarea>` ;
  removeClass('messageSect', 'hide');
  addClass('oddsContent','hide');
  addClass('btnSect', 'hide');
  addClass('btnGoBack', 'hide');
});

btnCopy.addEventListener('click', () => {
  let copyText = generateTextMessage();
navigator.clipboard.writeText(copyText );
Swal.fire('Copied to clipboard.');
console.log(copyText);
})
btnHome.addEventListener('click', () => {
  location.reload();
})

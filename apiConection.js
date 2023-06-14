const URL = 'https://api.the-odds-api.com/v4/sports/';
const API_KEY = '?apiKey=8f8be8b7a86adaaba12d6e8d4645326a'; //45e40cd47765e8a30df6e1567ec39574
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
    html += `<h2>${temp.sport}</h2><section class="odds-sct">`;
    try {
      for (let game of temp.data) {
        const originalDate = game.commence_time;
        const date = new Date(originalDate);
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
          const price1 = game.bookmakers[0].markets[1].outcomes[0].point + ' ' + game.bookmakers[0].markets[1].outcomes[0].price;
          const price2 = game.bookmakers[0].markets[1].outcomes[1].point + ' ' +  game.bookmakers[0].markets[1].outcomes[1].price;
          const over = game.bookmakers[0].markets[2].outcomes[0].price;
          const under = game.bookmakers[0].markets[2].outcomes[1].price;
          const total = game.bookmakers[0].markets[2].outcomes[1].point;
          
          html += `<div class="card" id="${game.id}" data-sport="${temp.title}" data-team1="${team1}" data-team2="${team2}" data-date="${gameDate}" data-time="${gameTime}" data-price1="${price1}" data-price2="${price2}" data-over="${over}" data-under="${under}" data-totals="${total}">
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
          console.log("Error: can't access the data for this game.");
        }
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


const unselectAll = () => {

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
    });
  });
};

const generateTextMessage = () => {
  const selectedCards = document.querySelectorAll('.card.selected');
  const sportMap = new Map();

  selectedCards.forEach((card, index) => {
    const team1 = card.dataset.team1;
    const team2 = card.dataset.team2;
    const price1 = card.dataset.price1;
    const price2 = card.dataset.price2;
    const date = card.dataset.date;
    const time = card.dataset.time;
    const over = card.dataset.over;
    const under = card.dataset.under;
    const totals = card.dataset.totals;

    const gameInfo = `<p>${team1} ${price1}</p><p>${team2} ${price2}</p><p>TOTAL ${totals}</p><p>${time} EST</p>`;

    const sportTitle = card.dataset.sport;

    if (sportMap.has(sportTitle)) {
      sportMap.get(sportTitle).push(gameInfo);
    } else {
      sportMap.set(sportTitle, [gameInfo]);
    }
  });

  let message = '<h3>Top Games of the Day<br/>';
  message += new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  message += '<br/><br/>';

  sportMap.forEach((games, sport) => {
    message += `<h4><strong>${sport}<strong><h4/><br/>`;
    games.forEach((game) => {
      message += `${game}<br/><br/>`;
    });
  });

  return message;
};

let btnSports = document.getElementById('btnSports');
let btnGoBack = document.getElementById('btnGoBack');
let btnGenerate = document.getElementById('btnGenerate');
let btnFilter = document.getElementById('btnFilter');

btnSports.addEventListener('click', validateSelection);
btnGoBack.addEventListener('click', () => {
  let checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
  removeClass('selectSports', 'hide');
  addClass('btnSect', 'hide');
  addClass('oddsContent', 'hide');
  addClass('btnGoBack', 'hide');
  checkboxes.forEach(box => {
    box.checked = false;
  });
});

btnGenerate.addEventListener('click', () => {
  const textMessage = generateTextMessage();
  document.getElementById('message').innerHTML = `<p>${textMessage}</p>` ;
  removeClass('messageSect', 'hide');
});

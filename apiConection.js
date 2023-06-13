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
      html += `<div class="sport-opt"><label for="${item.short_name}">${item.title}</label> <input type="checkbox" name="${item.short_name}" id="${item.short_name + 'id'}"/></div>`
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
    html += `<h2>${temp.sport}</h2>
      <section class="odds-sct">`;
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
          html += `<div class="card" id="${game.id}">
            <span class="date">${gameDate}</span>
            <span class="time">${gameTime}</span>
            <span class="team1">${game.away_team}</span>
            <span class="team2">${game.home_team}</span>
            <span class="price1">${game.bookmakers[0].markets[0].outcomes[0].price}</span>
            <span class="price2">${game.bookmakers[0].markets[0].outcomes[1].price}</span>
            <span class="over">Over ${game.bookmakers[0].markets[1].outcomes[0].price}</span>
            <span class="under">Under ${game.bookmakers[0].markets[1].outcomes[1].price}</span>
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
    const selectedSports = selectedSportsArray();
    const sportMap = new Map();
  
    selectedCards.forEach((card, index) => {
      const sport = selectedSports[index];
      const dateElement = card.querySelector('.date');
      const timeElement = card.querySelector('.time');
      const team1Element = card.querySelector('.team1');
      const team2Element = card.querySelector('.team2');
      const price1Element = card.querySelector('.price1');
      const price2Element = card.querySelector('.price2');
      const overElement = card.querySelector('.over');
      const underElement = card.querySelector('.under');
  
      if (
        sport && dateElement && timeElement &&
        team1Element && team2Element && price1Element &&
        price2Element && overElement && underElement
      ) {
        const date = dateElement.textContent.trim();
        const time = timeElement.textContent.trim();
        const team1 = team1Element.textContent.trim();
        const team2 = team2Element.textContent.trim();
        const price1 = price1Element.textContent.trim();
        const price2 = price2Element.textContent.trim();
        const over = overElement.textContent.trim();
        const under = underElement.textContent.trim();
  
        if (!sportMap.has(sport)) {
          sportMap.set(sport, []);
        }
  
        const gameInfo = `${team1} vs ${team2}\nPrice 1: ${price1}\nPrice 2: ${price2}\n${over}\n${under}\n${time}`;
  
        sportMap.get(sport).push(gameInfo);
      } else {
        console.error('Error: Missing elements in the selected card.');
        console.log('card:', card);
      }
    });
  
    const currentDate = new Date();
    const month = currentDate.toLocaleString('en-US', { month: 'short' });
    const day = currentDate.getDate();
    const formattedDate = `${month} ${day}th, ${currentDate.getFullYear()}`;
  
    let message = `Top Games of the Day\n${formattedDate}\n\n`;
  
    sportMap.forEach((games, sport) => {
      message += `${sport}\n\n`;
      games.forEach((game) => {
        message += `    ${game}\n\n`;
      });
    });
  
    console.log(message);
    // You can use the generated message as needed (e.g., display it on the page, send it via email, etc.)
  };
  


let btnSports = document.getElementById('btnSports');
let btnGoBack = document.getElementById('btnGoBack');
let btnGenerate = document.getElementById('btnGenerate');

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
  // Replace the following line with your desired action
  console.log(textMessage);
});

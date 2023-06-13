
const LNAMES = ['NBA', 'NCAAB', 'Soccer Premier League', 'Soccer UCL'];
const URL = 'https://api.the-odds-api.com/v4/sports/';
const API_KEY = '?apiKey=8f8be8b7a86adaaba12d6e8d4645326a';
const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

const findSports = async () => {
    try {
      const response = await fetch(`https://api.the-odds-api.com/v4/sports/${API_KEY}`);
      const data = await response.json();
      let objectSport = {
        title: '',
        short_name: ''
    };
      let sportsArray = data.map((sport)=> {
        if (sport.active) { 
            objectSport = {
                title: sport.title,
                short_name: sport.key
            }
           return objectSport;
        } else {
            return(sport.title + ' does not have odds.');
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

    return arr
}

const validateSelection = () => {

    if (selectedSportsArray() == '') {
        Swal.fire('Please select a sport competition.');
    } else {
        generateOdds();
    }
}

const generateOdds = async () => {
    let active_sports = selectedSportsArray();
    console.log(active_sports);   

    let html = '';
    for (let temp of active_sports) {
        html += `<h2>${temp}</h2>
        <section class="odds-sct">`
        let url = `https://api.the-odds-api.com/v4/sports/${temp}/odds/${API_KEY}&regions=us&oddsFormat=american&markets=h2h,spreads,totals&bookmakers=betus`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            for (let game of data) {
                const originalDate = game.commence_time;
                const date = new Date(originalDate);
                const month = monthNames[date.getUTCMonth()];
                const day = date.getUTCDate();
                const gameDate = `${month} ${day}`;
                const hours = date.getUTCHours();
                const minutes = date.getUTCMinutes();
                let formattedHours = hours % 12;
                if (formattedHours === 0) {
                    formattedHours = 12;
                }
                const meridiem = hours >= 12 ? "PM" : "AM";
                const gameTime = `${formattedHours}:${minutes.toString().padStart(2, "0")} ${meridiem}`;

                if(game.bookmakers[0] && game.bookmakers[0].markets[0] && game.bookmakers[0].markets[0].outcomes) {
                    html += `<div class="card">
                    <span class="date">${gameDate}</span>
                    <span class="time">${gameTime}</span>
                    <span class="team1">${game.away_team}</span>
                    <span class="team2">${game.home_team}</span>
                    <span class="price1">${game.bookmakers[0].markets[0].outcomes[0].price}</span>
                    <span class="price2">${game.bookmakers[0].markets[0].outcomes[1].price}</span>
                    <span class="over">Over ${game.bookmakers[0].markets[1].outcomes[0].price}</span>
                    <span class="under">Under ${game.bookmakers[0].markets[1].outcomes[1].price}</span>
                </div>`
                } else {
                    console.log('Error: no se pudo acceder a los resultados para este juego');
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }

        html += '</section>';
    }

    console.log()
    document.getElementById('oddsContent').innerHTML = html;
    
    addClass('selectSports', 'hide');
    removeClass('btnSect', 'hide');
    removeClass('oddsContent', 'hide');
    removeClass('btnGoBack', 'hide');
}


const addClass = (id, className) => {
    let tag = document.getElementById(`${id}`);
    tag.classList.add(`${className}`);
}

const removeClass = (id, className) => {
    let tag = document.getElementById(`${id}`);
    tag.classList.remove(`${className}`);
}

let btnSports = document.getElementById('btnSports');
let btnGoBack = document.getElementById('btnGoBack')

btnSports.addEventListener('click', validateSelection)
btnGoBack.addEventListener('click', () => {
    let checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
    removeClass('selectSports', 'hide');
    addClass('btnSect', 'hide');
    addClass('oddsContent', 'hide');
    addClass('btnGoBack', 'hide');
    checkboxes.forEach(box => {
        box.checked = false;
    });
})

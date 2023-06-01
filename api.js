const LEAGUES = ['basketball_nba', 'basketball_ncaab', 'soccer_epl', 'soccer_uefa_champs_league'];
const LNAMES = ['NBA', 'NCAAB', 'Soccer Premier League', 'Soccer UCL'];
let matchupsList = [];

async function handleChange(checkbox, id, homeTeam, awayTeam) {
  let match = await id;

  if (checkbox.checked == true) {
    console.log("Match selected: " + match);
    matchupsList.push({ id: match, homeTeam, awayTeam });
  } else {
    console.log("Match deselected: " + match);
    matchupsList = matchupsList.filter(matchup => matchup.id !== match);
  }
}

const requestOptions = {
  method: 'GET',
  redirect: 'follow'
};
let time = new Date();

const loadOdds = async (leagues) => {
  let games = '';
  for (let index = 0; index < leagues.length; index++) {
    ligaNombre = LNAMES;
    document.getElementById('content').innerHTML += `<h2>${ligaNombre[index]}</h2>`;
    try {
      const res = await fetch(`https://api.the-odds-api.com/v4/sports/${leagues[index]}/odds/?regions=us&oddsFormat=american&markets=spreads&bookmakers=betus&apiKey=8f8be8b7a86adaaba12d6e8d4645326a`);
      if (res.status === 200) {
        const data = await res.json();
        games = '<section class="odds-sct">';
        for (const game of data) {
          const bookmaker = game.bookmakers.find(b => b.key === 'betus');
          if (!bookmaker) continue;
          const market = bookmaker.markets.find(m => m.key === 'spreads');
          if (!market) continue;
          const outcomes = market.outcomes;
          const team1Price = outcomes.find(outcome => outcome.name === game.home_team).price;
          const team2Price = outcomes.find(outcome => outcome.name === game.away_team).price;

          games += `
            <article class="odds">
                <span class="team1">${game.home_team}</span>
                <span class="team2">${game.away_team}</span>
                <span class="price1">${team1Price > 0 ? '+' + team1Price : team1Price}</span>
                <span class="price2">${team2Price > 0 ? '+' + team2Price : team2Price}</span>
                <div class="side-checkbox">
                    <input type="checkbox" onchange="handleChange(this, ${game.id}, '${game.home_team}', '${game.away_team}')" name="check" id="${game.id}">
                </div>
            </article>`;
        }
        games += '</section>';
        document.getElementById('content').innerHTML += games;
        document.getElementById('content').innerHTML += `<p>No more matches for ${ligaNombre[index]}</p>`;
      } else if (res.status === 401) {
        console.log('API key is invalid or has been revoked.');
      } else if (res.status === 404) {
        console.log('The requested resource was not found.');
      }
    } catch (error) {
      console.log(error);
    }
  }
};


loadOdds(LEAGUES);

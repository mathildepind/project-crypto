window.onload = function(){
  let followedCryptos = ['ETH','BTC','ZEC','DASH','LTC'];
  let coinList = JSON.parse(localStorage.getItem('coinList')) || undefined;
  let cryptoNamesArray = Object.keys(coinList);


  // Searchinh section
  let display = document.getElementById('searchDisplay');

  display.addEventListener("click",addToFollowedCryptos);

  let searchBar = document.getElementById('search-bar');

  function matchingCryptoNames(searchInput) {
    let regex = new RegExp('^'+searchInput+'\w*','ig');
    return cryptoNamesArray.filter(n=>regex.test(n));
  }

  function startSearch(event) {

    let arrayOfNames = matchingCryptoNames(event.target.value);
    displaySearchResults(arrayOfNames);
  }

  searchBar.addEventListener("input", startSearch)

  function displaySearchResults(arrayOfNames) {

    display.innerHTML='';
    let displayResults = document.createElement('ul');
    arrayOfNames.forEach(name=> {
      let cryptoObj = coinList[name];
      let listElement = document.createElement('li');
      listElement.innerHTML = `
        <li>
        <a href='#'><img src=https://www.cryptocompare.com${cryptoObj.ImageUrl} alt=${cryptoObj.CoinName}>${cryptoObj.Name}</a>
      </li>
      `
      displayResults.appendChild(listElement);
    })
    display.appendChild(displayResults);

    display.removeAttribute('class', 'hidden');
    display.setAttribute('class', 'visible');
  }

  function addToFollowedCryptos(event) {
    let newCryptoFavourite = event.target.closest('a').textContent;
    if (!followedCryptos.includes(newCryptoFavourite)) {
      followedCryptos.push(newCryptoFavourite);
    }
    displayFavourites(followedCryptos);
    display.removeAttribute('class', 'visible');
    display.setAttribute('class', 'hidden');
    display.innerHTML = '';
    searchBar.value='';
  }

  //







  fetch("https://min-api.cryptocompare.com/data/all/coinlist")
  .then(function(response) {
    return response.json();
  }) .then(function(jsonData) {
    localStorage.setItem('coinList',JSON.stringify(jsonData.Data));
    coinList=jsonData.Data;
  }).catch(function(error) {
    console.log(error);
  })

  function displayFavourites (followedCryptos){
    let cryptosString= followedCryptos.join();


    fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${cryptosString}&tsyms=BTC,GBP`)
    .then(function(response) {
      return response.json();
    }).then(function(jsonData) {
      createCardsAndAppend(jsonData);
    })

    function createCardsAndAppend(priceList){
    let cards = document.getElementById('cards');
    cards.innerHTML="";
    followedCryptos.forEach(crypto =>{
      let cryptoObj= coinList[crypto];

      let block = document.createElement('div');
      block.setAttribute('class','col-12 col-sm-3');
      block.innerHTML = `
          <div class="card">
          <img class="card-img-top" src=https://www.cryptocompare.com${cryptoObj.ImageUrl} alt=${cryptoObj.CoinName}>
          <div class="card-body text-center">
            <h5 class="card-title">${cryptoObj.Name}</h5>
            <p class="card-text current-price">${priceList[crypto]['GBP']}</p>
          </div>
          <div class="card-footer">
            <p class="card-text">Holdings: <span class="holdings"></span></p>
            <p class="card-text">Total price: <span class="total-holdings"></span></p>
          </div>
        </div>
      `

      cards.appendChild(block);


    })
  }

  }

  displayFavourites(followedCryptos);

}

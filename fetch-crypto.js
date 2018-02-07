window.onload = function(){
  let followedCryptos = ['ETH','BTC'];
  let holdings ={'ETH':2304, 'BTC':10}
  let coinList = JSON.parse(localStorage.getItem('coinList')) || undefined;
  let cryptoNamesArray = Object.keys(coinList);
  let fullNameToName= {}
  let cryptoFullNames = Object.keys(coinList).map(key => {
    let fullName = coinList[key].CoinName
    fullNameToName[fullName] = key;
    return fullName;
  });

  console.log(fullNameToName)

  let cards = document.getElementById('cards');


  // Searching section
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

// Add and remove to followed cryptos
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

  cards.addEventListener("click", removeFromFollowedCryptos);

  function removeFromFollowedCryptos(event) {
    let target = event.target;
    if (target.getAttribute('class') !== 'closeSpan') return;
    let toRemove = target.getAttribute('id');
    let removeIndex = followedCryptos.indexOf(toRemove);
    followedCryptos.splice(removeIndex,1);
    displayFavourites(followedCryptos);
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

  function makePricePretty(string){
    let totalArray = string.split('.')
    let firstPart= totalArray[0].split('');
    let newFirstPart=['.'];
    for(let i =firstPart.length-1;i>=0; i--){

      if(i!==firstPart.length-1 && (firstPart.length-1-i)%3===0) newFirstPart.push(',');
        newFirstPart.push(firstPart[i]);
    }
    return newFirstPart.reverse().concat(totalArray[1]).join('')
  }

  function displayFavourites (followedCryptos){
    let cryptosString= followedCryptos.join();


    fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${cryptosString}&tsyms=BTC,GBP`)
    .then(function(response) {
      return response.json();
    }).then(function(jsonData) {
      createCardsAndAppend(jsonData);
    })

    function createCardsAndAppend(priceList){
    cards.innerHTML="";
    followedCryptos.forEach(crypto =>{
      let cryptoObj= coinList[crypto];

      let block = document.createElement('div');
      block.setAttribute('class','col-12 col-sm-3');

      let cryptoName = cryptoObj.Name;
      let priceInPounds = priceList[crypto]['GBP'];
      let holdingInThisCoin = holdings[crypto];
      let totalPrice= (holdings[crypto] * priceList[crypto]['GBP']).toFixed(2);
      totalPrice= makePricePretty(totalPrice)

      block.innerHTML = `
          <div class="card">
            <button type="button" class="close" aria-label="Close">
              <span class="closeSpan" id=${cryptoName} aria-hidden="true">&times;</span>
            </button>
          <img class="card-img-top" src=https://www.cryptocompare.com${cryptoObj.ImageUrl} alt=${cryptoObj.CoinName}>
          <div class="card-body text-center">
            <h5 class="card-title">${cryptoName}</h5>
            <p class="card-text current-price">£${priceInPounds}</p>
          </div>
          <div class="card-footer">
            <p class="card-text">Holding: <span class="holdings">${holdingInThisCoin} ${cryptoName}</span></p>
            <p class="card-text">Total value: <span class="total-holdings">£${totalPrice}</span></p>
          </div>
        </div>
      `

      cards.appendChild(block);


    })
  }

  }

  displayFavourites(followedCryptos);

}

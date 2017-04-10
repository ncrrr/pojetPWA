// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


(function() {
  'use strict';

  var app = {
    isLoading: true,
    visibleCards: {},
    selectedCities: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.projects'),
    addDialog: document.querySelector('.dialog-container'),
    cvPart: ['Profil', 'Projet', 'Dispo', 'Contact'],
    profilPart: ['Macha', 'Compétences', 'Expériences', 'Formations','Intérêts']
  };


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

 /* document.getElementById('butRefresh').addEventListener('click', function() {
    // Refresh all of the forecasts
    app.loadProject();
  });
*/

  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Updates a weather card with the latest weather forecast. If the card
  // doesn't already exist, it's cloned from the template.
  app.updateProjectCard = function(data) {
    var dataLastUpdated = new Date(data.created);
    var code = data.code
    var url = data.url;
    var description = data.description;
    var name = data.name;

    var card = app.visibleCards[data.key];
    if (!card) {
      card = app.cardTemplate.cloneNode(true);
      card.classList.remove('cardTemplate');
      card.classList.remove('hidden');
      card.querySelector('.name').textContent = name;      
      app.container.appendChild(card);
      app.visibleCards[data.key] = card;
    }

    // Verifies the data provide is newer than what's already visible
    // on the card, if it's not bail, if it is, continue and update the
    // time saved in the card
    var cardLastUpdatedElem = card.querySelector('.card-last-updated');
    var cardLastUpdated = cardLastUpdatedElem.textContent;
    if (cardLastUpdated) {
      cardLastUpdated = new Date(cardLastUpdated);
      // Bail if the card has more recent data then the data
      if (dataLastUpdated.getTime() < cardLastUpdated.getTime()) {
        return;
      }
    }
    cardLastUpdatedElem.textContent = data.created;

    card.querySelector('.description').textContent = description;
    card.querySelector('.fa').classList.add(app.getIconClass(code));
    card.querySelector('.url').href = url;

    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };


  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/

  /*
   * Gets a forecast for a specific city and updates the card with the data.
   * getForecast() first checks if the weather data is in the cache. If so,
   * then it gets that data and populates the card with the cached data.
   * Then, getForecast() goes to the network for fresh data. If the network
   * request goes through, then the card gets updated a second time with the
   * freshest data.
   */
  app.getProject = function(key, label) {
    var statement = 'select * from cv.project where woeid=' + key;
    var url = 'https://query.chillcoding.com/v1/public/yql?format=json&q=' +
        statement;
    // TODO add cache logic here

    // Fetch the latest data.
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          var results = response.query.results;
          results.key = key;
          results.label = label;
          results.created = response.query.created;
          app.updateProjectCard(results);
        }
      } else {
        // Return the initial weather forecast since no data is available.
        app.updateProjectCard(initialProject);
      }
    };
    request.open('GET', url);
    request.send();
  };

  // Iterate all of the cards and attempt to get the latest forecast data
  app.updateProjects = function() {
    var keys = Object.keys(app.visibleCards);
    keys.forEach(function(key) {
      app.getForecast(key);
    });
  };

  // TODO add saveSelectedCities function here

  app.getIconClass = function(projectCode) {
    // Project codes: https://developer.chillcoding.com/project/documentation.html#codes
    projectCode = parseInt(projectCode);
    switch (projectCode) {
      case 1: 
        return 'fa-android';
      case 2: 
        return 'fa-mobile';
      case 3: 
        return 'fa-globe';
      case 7:
        return 'fa-graduation-cap';
      case 4:
        return 'fa-tablet';
      case 5:
        return 'fa-heart';
      case 6: 
        return 'fa-microchip';
    }
  };

  /*
   * Real project
   */
  var initialProject = {
    key: '2459115',
    name: 'Bachamada',
    created: '2016-07-22T01:00:00Z',
    keyword: [
          "GIT",
          "Android",
          "Mobile Natif",
          "App Store Optimisation",
          "Base de Données",
          "Montre Connectée",
          "Publication Play Store"
        ],
    description: "Application Android sur le suivi de la fréquence cardiaque.",
    url:'https://play.google.com/store/apps/details?id=fr.machada.bpm',
    code:1
  };
  // TODO uncomment line below to test app with fake data
  app.updateProjectCard(initialProject);

  // TODO add startup code here

  // TODO add service worker code here
    if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
})();

function offlinemessage(e){
  
}

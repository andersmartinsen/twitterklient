﻿(function(){
  function App(params){
    this.searchField = $(params.searchField);
    this.tweets = $(params.tweets);
    this.searchButton = $(params.searchButton);
    this.twitterUserSearchButton = $(params.twitterUserSearchButton);
    this.searchUsernameField = $(params.searchUsernameField);
	this.usernameResultPage = $(params.usernameResultPage);
	this.user = $(params.user);
    this.geoSearchButton = $(params.geoSearchButton);
    this.resultsPage = $(params.resultsPage);
    this.playButton = $(params.playButton);
    this.recordButton = $(params.recordButton);
    this.isRecording = false;
    this.media = null;
    this.isPlaying = false;
    this.recordCount = 0;
    this.currentRecordingFilename = null;
    this.setupBindings();
  }
  $.extend(App.prototype, {
    setupBindings: function(){
      console.log("Setting up bindings");
      var self = this;
      console.log(self.searchButton);
      self.searchButton.on("click", function(e){
        console.log("Search button clicked");
        e.preventDefault();
        self.search(self.searchField.val());
      });

      self.geoSearchButton.on("click", function(e) {
        e.preventDefault();
        self.searchByLocation();
      });

      self.recordButton.on("click", function(e){
        var captureError = function(error) {
          var msg = 'An error occurred during capture: ' + error.code;
          navigator.notification.alert(msg, null, 'Uh oh!');
        };
        navigator.device.capture.captureAudio(function(mediaFiles){
          mediaFiles.forEach(function(mediaFile){
            var path = mediaFile.fullPath;
            var name = mediaFile.name;
            $("#recording-list").append("<li><a href='#' data-path='" + path + "'>" + name + "</a></li>").listview("refresh");
            $("#recording-list li a").on("click", function(e){
              e.preventDefault();
              console.log("Trying to play media with path = " + $(this).attr("data-path"));
              var media = new Media($(this).attr("data-path"), function(){console.log("found recording");}, function(){console.log("fooooo");});
              media.play();
            });
          });
        }, captureError, {limit: 1});
      });
    },
	renderTweets: function(tweets){
	      var self = this;
	      $.each(tweets, function(i, tweet) {
	        if(tweet.text !== undefined) {
	          var tweet_html = '<li><h1>Tweet</h1><p>' + tweet.text + '</p><\/li>';
	          self.tweets.append(tweet_html);
	        }
	      });
	      self.tweets.listview("refresh");
	},
	renderUser: function(user){
		var self = this;
		var user_html = '<img src="' + user.profile_image_url_https + '"/>'
		user_html += '<p>Navn: ' + user.name + '</p>';
		user_html += '<p>Følgere: ' + user.followers_count + '</p>'
		user_html += '<p>Følger: ' + user.friends_count + '</p>'
		user_html += '<a href="" onClick="lagreAnsattTilKontaktLista(); return false;" class="ui-btn-right" data-role="button" data-icon="check">Save</a>';
		self.user.append(user_html);
    },
	lagreAnsattTilKontaktLista: function() {
		alert('her');
        var contact = navigator.contacts.create();
        contact.displayName = user.name;

        var bilder = [1];
        bilder[0] = new ContactField('Jobb', user.profile_image_url_https, true);
        contact.photos = bilder;

        var name = new ContactName();
        name.formatted = user.name;
        name.givenName = user.name;
        name.familyName = user.name;
        contact.name = name;

        contact.save(onSuccess, onError);

        function onSuccess() {
            navigator.notification.alert('Kontakten ble lagret i adresseboka', null, 'Suksess');
        }

        function onError(contactError) {
            navigator.notification.alert('Feilkode: ' + contactError.code, null, 'En feil inntraff');
        }
    },
    searchByLocation: function(){
      var self = this;
      navigator.geolocation.getCurrentPosition(function(location){
        var twitter_api_url = 'http://search.twitter.com/search.json?geocode=';
        var latitude = location.coords.latitude;
        var longitude = location.coords.longitude;
        twitter_api_url += latitude + ',' + longitude + ',10km&rpp=5&show_user=true';

        $.getJSON(twitter_api_url, function(data) {
          if (data == undefined || data.results == undefined || data.results.length == 0){
            navigator.notification.alert("No results for your location");
          } else {
            $.mobile.changePage(self.resultsPage);
            self.renderTweets(data.results);
          }
        });
      } , function(error){console.log("Something went wrong with location")});
    },
	searchByTwitterName: function(username) {
		console.log("Searching for " + username);
	      var searchUrl = 'http://api.twitter.com/1/users/show.json?callback=?&screen_name=' + username;
	      var self = this;
	      $.ajax({
	        url: searchUrl,
	        dataType: "JSON",
	        type: "GET",
	        success: function(data) {
	          $.mobile.changePage(self.usernameResultPage);
	          self.renderUser(data); 
	        },
	        error: function(xhr, textStatus, errorThrown){
	          console.log(xhr);
	          console.log(textStatus);
	          console.log(errorThrown);
	          alert("Noe gikk galt når vi søkte etter bruker på twitter :(");
	        }
	      });
	},
    search: function(keyword){
      console.log("Searching for " + keyword);
      var searchUrl = 'http://search.twitter.com/search.json?callback=?&q=' + keyword;
      var self = this;
      $.ajax({
        url: searchUrl,
        dataType: "JSON",
        type: "GET",
        success: function(data) {
          $.mobile.changePage(self.resultsPage);
          self.renderTweets(data.results); 
        },
        error: function(xhr, textStatus, errorThrown){
          console.log(xhr);
          console.log(textStatus);
          console.log(errorThrown);
          alert("Noe gikk galt når vi hentet tweets :(");
        }
      });
    }
  });
  window.App = App;
})();
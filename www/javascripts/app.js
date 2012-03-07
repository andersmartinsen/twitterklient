(function(){
  function App(params){
    this.searchField = $(params.searchField);
    this.tweets = $(params.tweets);
    this.searchButton = $(params.searchButton);
    this.geoSearchButton = $(params.geoSearchButton);
    this.twitterUserSearchButton = $(params.twitterUserSearchButton);
    this.searchUsernameField = $(params.searchUsernameField);
    this.resultsPage = $(params.resultsPage);
    this.playButton = $(params.playButton);
    this.recordButton = $(params.recordButton);
    this.isRecording = false;
    this.media = null;
    this.isPlaying = false;
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

	  self.twitterUserSearchButton.on("click", function(e) {
        e.preventDefault();
        self.searchByTwitterName(self.searchUsernameField.val());
      });

      self.recordButton.on("click", function(e){
        e.preventDefault();
        if (self.isRecording){
          self.media.stopRecord();
          self.isRecording = false;
          $(this).find(".ui-btn-text").text("Start opptak");
        } else {
          self.recordAudio();
          $(this).find(".ui-btn-text").text("Stopp opptak");
        }
      });

      self.playButton.on("click", function(e){
        e.preventDefault();
        if (self.isPlaying){
          self.stopAudio();
          $(this).find(".ui-btn-text").text("Spill av")
        } else {
          self.playAudio();
          $(this).find(".ui-btn-text").text("Stopp avspilling");
        }
      });
    },
    recordAudio: function() {
      var src = "myrecording.mp3";
      this.media = new Media(src,
        // success callback
        function() {
            console.log("recordAudio():Audio Success");
        },

        // error callback
        function(err) {
            console.log("recordAudio():Audio Error: "+ err.code);
        });

      // Record audio
      this.media.startRecord();
      this.isRecording = true;
    },
    playAudio: function() {
      // Play audio
      this.media.play();
      this.isPlaying = true;
    },
    stopAudio: function(){
      this.media.stop();
      this.isPlaying = false;
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
	          $.mobile.changePage(self.resultsPage);
	          self.renderTweets(data.results); 
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
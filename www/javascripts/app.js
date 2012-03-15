(function(){
  function App(params){
    this.searchField = $(params.searchField);
    this.tweets = $(params.tweets);
    this.searchButton = $(params.searchButton);
    this.geoSearchButton = $(params.geoSearchButton);
    this.resultsPage = $(params.resultsPage);
    this.playButton = $(params.playButton);
    this.recordButton = $(params.recordButton);
    this.isRecording = false;
    this.media = null;
    this.isPlaying = false;
    this.recordCount = 0;
    this.currentRecordingFilename = null;
    this.audioFiles = [];
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
        navigator.device.capture.captureAudio(function(mediaFiles){
          mediaFiles.forEach(function(mediaFile){
            var path = mediaFile.fullPath;
            new Media(path).play();
          });
        }, function(){}, {limit: 1});
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
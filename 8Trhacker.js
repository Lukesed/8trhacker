$(document).ready(
  function() {
    // Initialize our empty songs container
    var songs = {};
    // Insert the new buttons into the 8tracks page
    insert_button()
    // Every 40 seconds, scrape the page to get previously played songs
    setInterval(function(){scrapePage(songs);},40000);

    $("#spotify_prev_button").click(
      function(){
        // Check to see if any songs have finished playing yet
        var ready = ($("#spotify_prev_button").attr('src') == chrome.extension.getURL("icon_prev.png"))
        if(ready){
          // Create a spotify playlist out of previously played songs in the mix
          alert("Creating a Spotify playlist of the previous tracks!")
          window.open(songsToPlaylist(songs), '_self');
        }
      }
    );

    $("#spotify_all_button").click(
      function(){
        alert("Creating a Spotify playlist of the entire mix!")
        scrapePage(songs)
        var tracksSpan = $('span:contains("tracks"):first');
        var numTracks = tracksSpan.text().match(/\d+/);
        var remainingTracks = numTracks - Object.keys(songs).length + 1
        
        var makingPlaylist = setInterval(function(){
          if (remainingTracks > 0){
            $("#player_skip_button_invisible").trigger('click');
            remainingTracks -= 1
          }else{
            clearInterval(makingPlaylist)
            window.open(songsToPlaylist(songs), '_self');
          }
        },1000);    
      });
  }
);

function scrapePage(songs){
  console.log("checking for new songs!")
  requestStack = new Array()
  // First scrape the page and add each new song to the request stack
  $("#tracks_played .track .title_artist").each(function(idx){
    if (!(idx in songs)){
      console.log("adding song!")
      var song = {}
      song["trackNum"] = idx
      $(this).children().each(function(index){
        if (index == 0){
          song["title"] = sanitize($(this).text())
        }else{
          song["artist"] = sanitize($(this).text())
        }
      });
      requestStack.push(song)
    }
  });  
  // In order to prevent rate limiting by Spotify, we limit ourselves to
  // 10 api requests per second
  var preventRateLimiting = setInterval(function() {
    if (requestStack.length > 0){
      song = requestStack.pop()
      song["uri"] = track_uri(song["title"],song["artist"])
      console.log("added "+song["artist"]+": "+song["title"])
      songs[song["trackNum"]] = song
      console.log(Object.keys(songs).length+"th song added")
    }else{
      clearInterval(preventRateLimiting)
    }
  }, 100);
  if (songs[0] && $("#spotify_prev_button").attr('src') != chrome.extension.getURL("icon_prev.png")){
    readyButton();
  }
};

// Useful helper function for checking what's in the songs dictionary
function songsToString(songs){
  scrapePage(songs)
  s = ""
  for(i=0;i<Object.keys(songs).length;i++){
    s=s+i+": "+songs[i]["artist"]+": "+songs[i]["title"]+"\n"
  }
  return s
}

// Create a Spotify playlist URL which opens the Spotify application with the
// new songs queued
function songsToPlaylist(songs){
  scrapePage(songs)
  s = "spotify:trackset:PlaylistName:"
  for(i=0;i<Object.keys(songs).length;i++){
    if (songs[i]["uri"] != ""){
      s=s+songs[i]["uri"]+','
    }
  }
  output = s.substring(0, s.length-1)
  console.log("spotify url "+output)
  return output
}

// Use the Spotify Metadata API to look up tracks by title and artist
// in order to get the Spotify href for the tracks
function track_uri(track, artist){
  search_url = encodeURI('http://ws.spotify.com/search/1/track.json?q=track:'
    +track+'+artist:' +artist);
  console.log(search_url)
  var uri = ""
  $.ajax({
    url: search_url,
    async: false,
    dataType: 'json',
    success:
    function(json){
      if(json["tracks"].length!=0){
        uri = json["tracks"][0]["href"].substring(14)
      }
    } 
  });
  return uri;
}

// Inserts our custom controls for transforming 8tracks mixes into Spotify playlists
function insert_button(){
  var icon_start_address = chrome.extension.getURL("icon_start.png");
  $("#mix_interactions").append(
    '<img id="spotify_prev_button" src='+icon_start_address+'>')
  var icon_all_address = chrome.extension.getURL("icon_all.png");
  $("#mix_interactions").append(
    '<img id="spotify_all_button" src='+icon_all_address+'>')
  // Here we insert a button that is invisible to users
  // but is used by the script to skip tracks
  $("#mix_interactions").append(
      '<img id="player_skip_button_invisible" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">');    
}

// Changes the image of the 'prev' button when the first track has finished playing
function readyButton(){
  var icon_prev_address = chrome.extension.getURL("icon_prev.png");
  $("#spotify_prev_button").attr('src', icon_prev_address);
}

// Removes anything between parentheses and '&' symbols.
function sanitize(raw){
  open_paren = raw.indexOf("(")
  close_paren = raw.lastIndexOf(")")
  if( open!=-1 && close!=-1 ){
    fixed = raw.substring(0,open_paren-1) +
    raw.substring(close_paren+1,raw.length)
  } else {
    fixed = raw
  }
  return fixed.replace("&", " ")
}


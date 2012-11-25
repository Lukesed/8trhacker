$(document).ready(
  function() {
    // set up GA
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-36582718-1']);
    _gaq.push(['_trackPageview']);

    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = 'https://ssl.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();

    // Initialize our empty songs container
    var songs = {};
    // Insert the new buttons into the 8tracks page
    insert_button();
    if ($("#play_area").length == 1){
      var playedLength = $("#tracks_played .track .title_artist").length;
      // Compare the current length of the played list with the actual length
      var checker = setInterval(function(){playedLength = checkLength(playedLength,songs);},1000);
    }

    // Create a spotify playlist out of previously played songs in the mix
    $("#spotify_prev_button").click(
      function(){
        scrapePage(songs);
        alert("Creating a Spotify playlist of the previously played tracks!")
        var list = songsToPlaylist(songs);
        openSpotify(list);
      }
    );
    // Create a spotify playlist out of all of the songs in the mix
    $("#spotify_all_button").click(
      function(){
        var cont = confirm("This will create a Spotify playlist of the entire mix by skipping through all the tracks! \nWe encourage you to listen to the whole mix on 8tracks first, and then click the 'Open played songs in Spotify' button. \nBut you can use this button if you're in a hurry :)");
        if (cont){
          var tracksSpan = $('span:contains("tracks"):first');
          var numTracks = tracksSpan.text().match(/\d+/);
          var remainingTracks = numTracks - Object.keys(songs).length + 1;

         var makingPlaylist = setInterval(function(){
           if (remainingTracks > 0){
             $("#player_skip_button_invisible").trigger('click');
              remainingTracks -= 1;
            }else{
              clearInterval(makingPlaylist);
              var list = songsToPlaylist(songs);
              openSpotify(list);
            }
          },1000);   
       }
      });
  }
);

function scrapePage(songs){
  var requestStack = new Array();
  // First scrape the page and add each new song to the request stack
  var listLen = getSongsFromList(songs,requestStack);
  getSongNowPlaying(songs,requestStack,listLen);
  // In order to prevent rate limiting by Spotify, we limit ourselves to
  // 10 api requests per second
  var song;
  var preventRateLimiting = setInterval(function() {
    if (requestStack.length > 0){
      song = requestStack.pop();
      song["uri"] = track_uri(song["title"],song["artist"]);
      songs[song["trackNum"]] = song;
    }else{
      clearInterval(preventRateLimiting);
    }
  }, 100);
};

function getSongsFromList(songs,requestStack){
  var listLen = 0;
  $("#tracks_played .track .title_artist").each(function(idx){
    if (!(idx in songs)){
      var song = {};
      $(this).children().each(function(index){
        if (index == 0){
          song["title"] = sanitize($(this).text());
        }else{
          song["artist"] = sanitize($(this).text());
        }
      });
      song["trackNum"] = idx;
      requestStack.push(song);
    }
    listLen += 1;
  }); 
  return listLen;
} 

function getSongNowPlaying(songs,requestStack,listLen){
  $("#now_playing .title_artist").each(function(idx){
    if (!(listLen in songs)){
      var song = {};
      $(this).children().each(function(index){
        if (index == 0){
          song["title"] = sanitize($(this).text());
        }else{
          song["artist"] = sanitize($(this).text());
        }
      });
      song["trackNum"] = listLen;
      requestStack.push(song);
    }
  }); 
}

// Useful helper function for checking what's in the songs dictionary
function songsToString(songs){
  scrapePage(songs);
  var s = "";
  for(i=0;i<Object.keys(songs).length;i++){
    s=s+i+": "+songs[i]["artist"]+": "+songs[i]["title"]+"\n";
  }
  return s;
}

// Create a Spotify playlist URL which opens the Spotify application with the
// new songs queued
function songsToPlaylist(songs){
  scrapePage(songs);
  var s = "spotify:trackset:PlaylistName:";
  for(i=0;i<Object.keys(songs).length;i++){
    if (songs[i]["uri"] != ""){
      s=s+songs[i]["uri"]+',';
    }
  }
  var output = s.substring(0, s.length-1);
  return output;
}

// Use the Spotify Metadata API to look up tracks by title and artist
// in order to get the Spotify href for the tracks
function track_uri(track, artist){
  var search_url = encodeURI('http://ws.spotify.com/search/1/track.json?q=track:'
    +track+'+artist:' +artist);
  var uri = "";
  $.ajax({
    url: search_url,
    async: false,
    dataType: 'json',
    success:
    function(json){
      if(json["tracks"].length!=0){
        uri = json["tracks"][0]["href"].substring(14);
      }
    } 
  });
  return uri;
}

// Inserts our custom controls for transforming 8tracks mixes into Spotify playlists
function insert_button(){
  var icon_start_address = chrome.extension.getURL("icon_prev.png");
  $("#mix_interactions").append(
    '<img id="spotify_prev_button" src='+icon_start_address+'>');
  var icon_all_address = chrome.extension.getURL("icon_all.png");
  $("#mix_interactions").append(
    '<img id="spotify_all_button" src='+icon_all_address+'>');
  // Here we insert a button that is invisible to users
  // but is used by the script to skip tracks
  $("#mix_interactions").append(
      '<img id="player_skip_button_invisible" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">');    
}

// Removes anything between parentheses and '&' symbols.
function sanitize(raw){
  var open_paren = raw.indexOf("(");
  var close_paren = raw.lastIndexOf(")");
  if( open!=-1 && close!=-1 ){
    var fixed = raw.substring(0,open_paren-1) +
                raw.substring(close_paren+1,raw.length);
  } else {
    fixed = raw;
  }
  return fixed.replace("&", " ");
}

function checkLength(playedLength,songs){
  var newLength = $("#tracks_played .track .title_artist").length;
  if (newLength > playedLength || Object.keys(songs).length == 0){
    scrapePage(songs);
    var playedLength = newLength;
  }
  return playedLength;
}

function openSpotify(list){
  window.open(list, '_self');
}

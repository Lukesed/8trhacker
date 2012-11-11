var songs = {};
ready = false;
done = false;

$(document).ready(
  function() {
    // Insert the new buttons into the 8tracks page
    insert_button()
    // Every 40 seconds, scrape the page to get previously played songs
    setInterval(function(){console.log("scraping");scrapePage();},7000);
    
    // When a user clicks the 'prev' button, 
    $("#spotify_prev_button").click(
      function(){
        //stuff to do when clicked prev button
        var ready = ($("#spotify_prev_button").attr('src') == chrome.extension.getURL("icon_prev.png"))
        if(ready){
          //create a spotify playlist out of the songs
          alert("Creating a Spotify playlist of the previous tracks!")
          // Scrape page one more time to make sure we have all the songs
          scrapePage()
          alert(songsToString())
          console.log(songsToPlaylist())
          open_in_new_tab(songsToPlaylist());
        }
      }
    );
    
    $("#spotify_all_button").click(
      function(){
        //stuff to do when clicked button
        //create a spotify playlist out of the songs
        alert("Creating a Spotify playlist of the entire playlist!")
        if(done){
          //clearInterval(makingPlaylist)
          open_in_new_tab(songsToPlaylist());
        }
        making_playlist = setInterval(function(){
          if(!done){
            $("#player_skip_button_invisible").trigger('click');
            entire_mix_to_playlist();
          }else{
            clearInterval(making_playlist)
            open_in_new_tab(songsToPlaylist());
          }},1000);
      }     
      );    
  }
  );


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


function insert_button(){
  var icon_start_address = chrome.extension.getURL("icon_start.png");
  $("#mix_interactions").append(
    '<img id="spotify_prev_button" src='+icon_start_address+'>')
  var icon_all_address = chrome.extension.getURL("icon_all.png");
  $("#mix_interactions").append(
    '<img id="spotify_all_button" src='+icon_all_address+'>')
  // Here we insert a button that is invisible to users
  // but is used by the script to skip tracks.
  $("#mix_interactions").append(
      '<img id="player_skip_button_invisible" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">');
      
}

function readyButton(){
  var icon_prev_address = chrome.extension.getURL("icon_prev.png");
  $("#spotify_prev_button").attr('src', icon_prev_address);
  console.log("image changed")
}

// removes anything between parentheses, and removes '&' symbols.
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

function scrapePage(){
  $("#tracks_played .track .title_artist").each(function(idx){
    if (!(idx in songs)){
      console.log("adding song!")
      var song = {}
      $(this).children().each(function(index){
        if (index == 0){
          song["title"] = sanitize($(this).text())
        }else{
          song["artist"] = sanitize($(this).text())
        }
      });
      href = track_uri(song["title"],song["artist"])
      song["uri"] = href
      console.log("added "+song["artist"]+": "+song["title"])
      songs[idx] = song
      console.log(Object.keys(songs).length+"th song added")
    }
  });  
  if (songs[0] && $("#spotify_prev_button").attr('src') != chrome.extension.getURL("icon_prev.png")){
    alert("changing button")
    readyButton();
  }
};

function songsToString(){
  s = ""
  for(i=0;i<Object.keys(songs).length;i++){
    s=s+i+": "+songs[i]["artist"]+": "+songs[i]["title"]+"\n"
  }
  return s
}

function songsToPlaylist(){
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

function entire_mix_to_playlist(){
  scrapePage()
  //alert("getting mix")
  var tracks_span = $('span:contains("tracks"):first');
  var num_tracks = tracks_span.text().match(/\d+/);
  var remaining_tracks = num_tracks - Object.keys(songs).length
  //alert(remaining_tracks)
  if (remaining_tracks < 2){
    done = true;
  }
  var starting_songs_length = Object.keys(songs).length
  //alert("Total tracks in mix: " + num_tracks);
  //alert("Remaining tracks: " + remaining_tracks);
  var i = starting_songs_length
  console.log("adding song!")
  $("#now_playing .title_artist").each(function(){
    var song = {}
    $(this).children().each(function(index){
      if (index == 0){
        raw_title = $(this).text()
        open_paran = raw_title.indexOf("(")
        close_paran = raw_title.lastIndexOf(")")
        if( open!=-1 && close!=-1 ){
          fixed = raw_title.substring(0,open_paran-1) +
          raw_title.substring(close_paran+1,raw_title.length)
        } else {
          fixed = raw_title
        }
        song["title"] = fixed.replace("&", " ")
      }else{
        song["artist"] = $(this).text().replace("&", " ")
      }
    });
    if (!(i in songs)){
      href = track_uri(song["title"],song["artist"])
      song["uri"] = href
      songs[i] = song
      //alert(songsToString())
    }
  });
}


function open_in_new_tab(url )
{
  window.open(url, '_blank');
  window.focus();
}


var onFooEndFunc = function() {
  var delay = 50; /* milliseconds - vary as desired */
  var executionTimer;

  return function() {
    if (executionTimer) {
      clearTimeout(executionTimer);
    }

    executionTimer = setTimeout(function() {
      // YOUR CODE HERE
    }, delay);
  };
}();




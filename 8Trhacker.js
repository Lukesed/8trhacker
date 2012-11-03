var songs = {};
ready = false;
done = false;

$(document).ready(
  function() {
    insert_button()
    setInterval(function(){console.log("scraping");scrapePage();},7000);
    $("#spotify_prev_button").click(
      function(){
        //stuff to do when clicked prev button
        //create a spotify playlist out of the songs
        alert("Creating a Spotify playlist of the current tracks!")
        console.log(songsToPlaylist())
        open_in_new_tab(songsToPlaylist());
        //open_in_new_tab(songsToPlaylist())
      }     
      );
    $("#spotify_all_button").click(
      function(){
        //stuff to do when clicked button
        //create a spotify playlist out of the songs
        alert("Creating a Spotify playlist of the entire playlist!")
        if(done){
          //alert("done")
          //clearInterval(makingPlaylist)
          open_in_new_tab(songsToPlaylist());
        }
        making_playlist = setInterval(function(){
          if(!done){
            $("#player_skip_button").trigger('click');
            entire_mix_to_playlist();
            console.log("getting playlist");
            //alert(done)
          }else{
            clearInterval(making_playlist)
            open_in_new_tab(songsToPlaylist());
          }},1000);
        //open_in_new_tab(entire_mix_to_playlist());
        //open_in_new_tab(songsToPlaylist())
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
        console.log(json["tracks"])
        uri = json["tracks"][0]["href"].split(":")[2]
        console.log(uri)
      }
    } 
  });
  console.log("2: " + uri)
  return uri;
}


function insert_button(){
  var icon_start_address = chrome.extension.getURL("icon_start.png");
  $("#mix_interactions").append(
    '<img id="spotify_prev_button" src='+ 
    icon_start_address +' alt="some_text">')
  var icon_all_address = chrome.extension.getURL("icon_all.png");
  $("#mix_interactions").append(
    '<img id="spotify_all_button" src='+ 
    icon_all_address +' alt="some_text">')
}

function readyButton(){
  var icon_prev_address = chrome.extension.getURL("icon_prev.png");
  $("#spotify_prev_button").attr('src', icon_prev_address);
  console.log("image changed")
}

function scrapePage(){
  $("#tracks_played .track .title_artist").each(function(idx){
    if (!(idx in songs)){
      console.log("adding song!")
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
      href = track_uri(song["title"],song["artist"])
      song["uri"] = href
      //alert(song["artist"]+": "+song["title"])
      songs[idx] = song
    }
  });  
  if(ready==false && songs[0]){
    ready = true;
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
  console.log("spotify url"+output)
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
    href = track_uri(song["title"],song["artist"])
    song["uri"] = href
    if (!(i in songs)){
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

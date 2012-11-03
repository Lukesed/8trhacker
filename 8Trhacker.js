var songs = {}

$(document).ready(
  function() {
    insert_button()
    setInterval(function(){console.log("scraping");scrapePage();},7000);
    $("#spotify_button").click(
      function(){
        //stuff to do when clicked button
        //create a spotify playlist out of the songs
        alert("Creating a Spotify playlist of the current tracks!")
        console.log(songsToPlaylist())
        open_in_new_tab(songsToPlaylist());
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
      if(json["tracks"]){
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
  var icon_address = chrome.extension.getURL("icon.png");
  $("#mix_interactions").append(
    '<img id="spotify_button" src='+ icon_address +' alt="some_text">')
}

function scrapePage(){
  console.log(songsToString())
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
  console.log(songsToString())
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
  //return "spotify:trackset:PlaylistName:49MsPNQCOmxvIYi9AdoPzY,6fUlrsHaz4QfCNF31rk2dU,5KiTsR2h8jnzkvTeucxoAn,6kidUwWb8tB9ktfy7U76iX,6mlUEdb90RqwUisnp65lG7,6KOEK6SeCEZOQkLj5M1PxH,3psrcZoGRaWh6FMGael1NX,3EHLii6bnZxJxsCfLlIb83,0xJtHBdhpdLuClaSQYddI4,6fsdOFwa9lTG7WKL9sEWRU"
}


function open_in_new_tab(url )
{
  window.open(url, '_blank');
  window.focus();
}

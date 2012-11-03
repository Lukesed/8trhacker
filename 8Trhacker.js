var songs = {}

$(document).ready(
  function() {
    insert_button()
    setInterval(function(){alert("scraping");scrapePage();},7000);
    $("#spotify_button").click(
      function(){
        //stuff to do when clicked button
      }     
    );
  }
);

function track_uri(track, artist){
  search_url = URLEncode('http://ws.spotify.com/search/1/track.json?q=track:"'
              +track+'"+artist:"' +artist+'"');
  result_json = getJSON(search_url);
  if(!result_json.data[0]){
    return "";
  } else{
    result_json["track"][0]["href"].split(":")[2];
  }
}


function insert_button(){
  var icon_address = chrome.extension.getURL("icon.png");
  $("#mix_interactions").append(
    '<img id="spotify_button" src='+ icon_address +' alt="some_text">')
}

function scrapePage(){
  alert(songsToString())
  $("#tracks_played .track .title_artist").each(function(idx){
    if (!(idx in songs)){
      alert("adding song!")
      var song = {}
      
      $(this).children().each(function(index){
        if (index == 0){
          song["artist"] = $(this).text()
        }else{
          song["title"] = $(this).text()
        }
      });
      song["uri"] = track_uri(song["title"],song["artist"])
      //alert(song["artist"]+": "+song["title"])
      songs[idx] = song
    }
  });  
  alert(songsToString())
};

function songsToString(){
  s = ""
  for(i=0;i<Object.keys(songs).length;i++){
    s=s+i+": "+songs[i]["artist"]+": "+songs[i]["title"]+"\n"
  }
  return s
}


$(document).ready(
  function() {
    insert_button()
    var songs = []
    setInterval(scrapePage(songs),5000);
    $("#spotify_button").click(
      function(){
        //stuff to do when clicked button
      }     
    );
  }
);
function insert_button(){
  var icon_address = chrome.extension.getURL("icon.png");
  $("#mix_interactions").append(
    '<img id="spotify_button" src='+ icon_address +' alt="some_text">')
}
function scrapePage(songs){
  alert("scraping page")
  $(".title_artist").each(function(idx){
    alert(idx)
    if (idx >= songs.length){
      var song = {}
      $(this).children().each(function(index){
        if (index == 0){
          song["artist"] = $(this).text()
        }else{
          song["title"] = $(this).text()
        }
      });
      //alert(song["artist"]+": "+song["title"])
      songs.push(song)
    }
  });  
  alert(songsToString(songs))
  return songs  
};
function songsToString(songs){
  s = ""
  for(i=0;i<songs.length;i++){
    s=s+songs[i]["artist"]+": "+songs[i]["title"]+"\n"
  }
  return s
}
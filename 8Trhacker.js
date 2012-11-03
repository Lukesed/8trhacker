
$(document).ready(function() {
  var songs = []
  
  $("a").click(function() {
    alert
    alert("Hello world!");
    setInterval(scrapePage(songs),2000);
  });
  
  
  
  
});

function scrapePage(songs){
  alert("scraping page")
  $(".title_artist").each(function(i){
    if (i >= songs.length){
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
  

  alert(songsToString)
  return songs  
  
};

function songsToString(songs){
  s = ""
  for(i=0;i<songs.length;i++){
    s=s+songs[i]["artist"]+": "+songs[i]["title"]+"\n"
  }
}

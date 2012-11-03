
$(document).ready(function() {
  var songs = []
  var t= setInterval(scrapePage(songs),5000);
  
  $("a").click(function() {
    alert(songsToString(songs))
    alert("Hello world!");
  });
});

function scrapePage(songs){
  alert("scraping page")
  $(".title_artist").each(function(){
   // alert(idx)
   // if (idx >= songs.length){
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
    //}
  });  
  alert(songsToString(songs))
  //return songs  
  
};

function songsToString(songs){
  s = ""
  for(i=0;i<songs.length;i++){
    s=s+songs[i]["artist"]+": "+songs[i]["title"]+"\n"
  }
  return s
}

$(document).ready(
  function() {
    insert_button()
    /*
    $("a").click(function() {
      event.preventDefault()
      alert("Hello world!");
    });
    */
    $("#spotify_button").click(
      function(){
        alert("Hello world!");
      }     
    );
  }
);
function insert_button(){
  var icon_address = chrome.extension.getURL("icon.png");
  $("#mix_interactions").append(
    '<img id="spotify_button" src='+ icon_address +' alt="some_text">')
}
// original code by userscripts user Yamamaya

var executeBrowserContext = function(funcOrString) {
    var code = 'javascript:(' + encodeURIComponent(funcOrString.toString()) 
    							+ ')();';
    location.href = code;
};

executeBrowserContext(function(){

	var EightTracks = {
		init: function(){
			document.body.addEventListener('DOMNodeInserted',this,false);
			document.body.addEventListener('click',this,true);
		},

		handleEvent: function(evt){
			var target = evt.target;
			switch(evt.type){
				case 'click':
					if(target.id === 'player_skip_button_invisible' && !evt.button){
						this.skip();
						evt.preventDefault();
						evt.stopPropagation();
					}
				return;
			}
		},

		skip: function(){
			TRAX.mixPlayer.next();
		},

		get trackUrl(){
			return TRAX.mixPlayer.track.get('track_file_stream_url');
		}
	};
	
	EightTracks.init();
});

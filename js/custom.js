//Connect
function scGetUserData(){
	SC.initialize({
		client_id: "3f89b0cd71fd914ea55be0cc3a918dca",
		redirect_uri: "http://localhost:8888/sc_app/callback.html"
	});
	
	if(SC.isConnected()){
		getUserDetails();
	}else{
		SC.connect(function(){
			getUserDetails();
		});
	}
	
	$("#login a").live("click", function(e){
		e.preventDefault();
		SC.connect(function(){
			getUserDetails();
		});
	});
}	

//User Data
function getUserDetails(){
	SC.get('/me', function(me){
		$('#username').html("<span><b>User: </b></span>" + me.username);
		$('#id').text(me.id);
		$('#img_avatar').attr('src', me.avatar_url);
		$('span#fullname').html("<span><b>Name: </b></span>" + me.full_name);
		$('span#track_count').html("<span><b>Nr of Tracks: </b></span>" + me.track_count);
		$('span#pl_count').text(me.playlist_count);
		$('#login a').html('<a href="#"></a>');
	});
}
    
	    
//Playlists
function findPlayLists(pl_id){
	var items = [];
	var id = pl_id + " ul";
	$(id).empty();

	items.push('<li data-role="list-divider" role="heading">My Playlists</li>');
	SC.get('/me/playlists/', function(playlists){
		$.each(playlists, function(i, playlist) {
		items.push('<li data-rel="external" id="' + playlist.id + '"><a href="player.html" data-rel="external" data-ajax="false"><h3>'
			   + playlist.title + '</h3></a><a href="#" data-icon="delete" data-theme="e"></a></li>');
		});
		
		var list_view = items.join('');
		$(id).append(list_view).listview('refresh');
	});
	
	$(id).listview();	

}

function findAddPlayLists(pl_id){
	var items = [];
	var id = pl_id + " ul";
	$(id).empty();

	//items.push('<li data-role="list-divider" role="heading">Choose the Playlist</li>');
	SC.get('/me/playlists/', function(playlists){
		$.each(playlists, function(i, playlist) {
		items.push('<li data-rel="external" data-icon="plus" id="' + playlist.id + '"><a href="#search-page" ><h3>'
			   + playlist.title + '</h3></a></li>');
		});
		
		var list_view = items.join('');
		$(id).append(list_view).listview('refresh');
	});
	
	$(id).listview();	

}


//Delete Playlists
function deletePlayLists(pl_id){
	var items = [];
	
	var ur="/playlists/" + pl_id;
	
	$('#pl_list ul').empty();
	var oauth = localStorage["SC.accessToken"];
	var ur = "https://api.soundcloud.com/playlists.json";
	
	items.push('<li data-role="list-divider" role="heading">My Playlists</li>');
	SC.get('/me/playlists', function(playlists){
		$.each(playlists, function(i, playlist) {
		if(playlist.id != pl_id ){	
			$.post(ur, { oauth_token: oauth, playlist: playlist }, function() {
				
			});
			items.push('<li data-rel="external" id="' + playlist.id + '"><a href="player.html" data-rel="external" data-ajax="false"><h3>'
			   + playlist.title + '</h3></a><a href="#" data-icon="delete" data-theme="e"></a></li>');			
		}
	});
		var list_view = items.join('');
		$('#pl_list ul').append(list_view).listview('refresh');
		
		alert("Playlist successfully deleted");
	});
	$('#pl_list ul').listview();
	
}
    
//Search Music
function findTracks(music){
	
	$('#search-page #music_list ul').empty();
	
	var jqxhr = $.getJSON("https://api.soundcloud.com/tracks.json?client_id=3f89b0cd71fd914ea55be0cc3a918dca",	      
	{
	q: music,
	//tags: music,
	filter: 'public'	
	},
	
	function(data) {
		var items = [];
		items.push('<li data-role="list-divider" role="heading">Results</li>');
	  
		//Loading    
		$.mobile.showPageLoadingMsg();
		
		$.each(data, function(key, val) {
		var track_title = val['title'];
		var track_id = val['id'];
		var artwork_url = val['artwork_url'];
		if(!artwork_url){
			artwork_url = "images/soundcloud_logo.png";
		}
				
		items.push('<li id="' + track_id + '"><a href="#" data-transition="slide"><img src="' + artwork_url + '" alt="' + artwork_url + ' "/><h3>' + track_title 
			+ '</h3></a><a href="#addpl-page" data-icon="plus" data-rel="dialog" data-transition="pop" data-theme="e" ></a></li>');
		});
		
		if (items.length > 1 )	{
			var list_view = items.join('');
			$('#search-page #music_list ul').append(list_view).listview('refresh');
		}else{
			alert('No Results Found');
		}

		
	  
	})
	.success(function() { /*Success*/ })
	.error(function() { alert("Error Loading Results"); })
	.complete(function() { $.mobile.hidePageLoadingMsg(); });

}

	
//Create Playlist
function createPlaylist(name, description) {
	
	var oauth = localStorage["SC.accessToken"];
	var playlist = new Object();
	playlist['title'] = name;
	playlist['sharing'] = 'public';
	playlist['description'] = description;
	var ur = "https://api.soundcloud.com/playlists.json";
	
	
	$.post(ur, { oauth_token: oauth, playlist: playlist }, function(data) {
		
		//console.log(data);

	}).success(function(){ 
		$.mobile.changePage('#init-page', {transition: 'fade', role: 'page', rel: 'external'});  alert("Playlist Created"); 
	}).error(function(){ $.mobile.changePage('#init-page', {transition: 'fade', role: 'page', rel: 'external' }); alert("Error - Please try again later."); });
	
}

//Go to playlist
function goToPlaylist(id){
	var ur = "/playlists/" + id;
	
	SC.get(ur, function(playlist){
		var p_link = playlist.permalink_url;
		var nr_tracks = playlist.tracks.length;
		
		localStorage.removeItem('playlist_uri');
		localStorage.setItem('playlist_uri', p_link);
		
		
		if (nr_tracks > 0){
		$.mobile.changePage('player.html', {role: 'page'});
		}else{
			alert('This playlist has no tracks to play!!!');
		}
	});	 
}

//Go to track
function goToTrack(id){
	var ur = "/tracks/" + id;
	
	SC.get(ur, function(track){
		var t_link = track.permalink_url;
		//var nr_tracks = playlist.tracks.length;
		
		localStorage.removeItem('playlist_uri');
		localStorage.setItem('playlist_uri', t_link);
		
		
		//if (p_link.length > 0){
		$.mobile.changePage('player.html', {role: 'page'});
		//}
	});	 
}

	
// Add Playlist
function addTrackToPlaylist(music_id, playlist_id){
	
	var oauth = localStorage["SC.accessToken"];
	var playlist = new Object();
	playlist['tracks'] = [{id : music_id}];
	var url = "/me/playlists/" + playlist_id;
	var newTrack = new Object();
	
	SC.get(url, function(pl, error){
		var trackExists = new Boolean();
		$.each(pl.tracks, function(i, track) {
			if(music_id != track.id){
				//newTrack['id'] = track.id; 
				playlist.tracks.push({id:track.id});
				trackExists = false;
			}else{
				trackExists = true;
				alert('Track already exists in the playlist!');				
				return false;
			}
		});
		
		if(!trackExists){
			SC.put(url, {playlist: playlist},function(pl, error){
				if(error){
					alert("Error: " + error.message);
				}else{
					alert("Track added to playlist!");
				}
			});
		}
		
	});

}
	
    
//Init
function refreshPage(page){
	// Page refresh
	$(page).trigger('pagecreate');
	$(page).listview('refresh');
	getUserDetails();
}

// INITIAL PAGE
$('#init-page').live('pageinit',function(event){
	//alert('Init Page!');
	scGetUserData();
	
	
	$('ul li a.pl_create').live("click", function(e){
		e.preventDefault();
		$.mobile.changePage('#create-page', {transition: 'pop', role: 'dialog'}); 
	});

	$('input#bt_create').live("click", function(e){
		e.preventDefault();
		var inName = $('input#createinput').val();
		var inDescription = $('input#createarea').val();
		if(inName.length > 0){
			createPlaylist(inName, inDescription);
		}else{
			alert('Please write something!!');
		}		
	});  
  
});	
		
//SEARCH PAGE	
$('#search-page').live('pageinit',function(event){
	//alert('Search Page!');
	scGetUserData();
	var mid = "";
  	$('input#bt_search').live('click', function(e){
		e.preventDefault();
		e.stopPropagation();
		
		var inMusic = $('input#musicinput').val();
		
		if(inMusic.length > 0){
			findTracks(inMusic);
		}else{
			alert('Please write something!!');
		}
	});
	
	$('#music_list ul li a.ui-link-inherit').live("click", function(e){
		e.preventDefault();
		e.stopPropagation();
		
		var music_id = $(this).closest('li').attr('id');
		goToTrack(music_id);
		
	});
	
	$('#music_list ul li a.ui-li-link-alt').live("click", function(e){
		e.preventDefault();
		e.stopPropagation();
		
		var music_id = $(this).parent().attr('id');
		mid = music_id;
		findAddPlayLists("#addpl_list");
		//$.mobile.changePage('#add-page', {transition: 'pop', role: 'dialog'});
		
	});
	
	//Choose playlist page
	$('#addpl_list ul li a').live("click", function(e){
		e.preventDefault();
		e.stopPropagation();
		
		var pl_id = $(this).closest('li').attr('id');
		addTrackToPlaylist(mid, pl_id);
		//$.mobile.changePage('#add-page', {transition: 'pop', role: 'dialog'});
		
	});
	
	
});	

//PLAYLISTS PAGE
$('#playlists-page').live('pageinit',function(event){
	//alert('Playlists Page!');
	scGetUserData();
	findPlayLists("#pl_list");
	
	$('#pl_list ul li a.ui-li-link-alt').live("click", function(e){
		e.preventDefault();
		var pl_id = $(this).parent().attr('id');
		//alert(pl_id);
		deletePlayLists(pl_id);	 
	});
	
	$('#pl_list ul li a.ui-link-inherit').live("click", function(e){
		e.preventDefault();
		var pl_id = $(this).closest('li').attr('id');
		goToPlaylist(pl_id);		
	});
	
});

//PLAYER PAGE
$('#player-page').live('pageinit',function(event){
	//alert('Playlists Page!');
	scGetUserData();
	
});

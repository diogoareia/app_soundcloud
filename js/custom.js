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
		$('#login a').html('<a href="#">Logout</a>');
	});
}
    
	    
//Playlists
function findPlayLists(){
	var items = [];
		
	SC.get('/me/playlists/', function(p){
		$.each(p, function(i, val) {
		var pl_title = val.title;
		var pl_id = val.id;
		items.push('<li data-rel="external" id="' + pl_id + '"><a href="player.html" data-rel="external" data-ajax="false"><h3>' + pl_title 
			+ '</h3></a><a href="#" data-icon="delete" data-theme="e"></a></li>');
		});
		var list_view = items.join('');
		$('#pl_list ul').append(list_view).listview('refresh');
	});

}

//Load playlists
function loadPlayLists(){		
	if(SC.isConnected()){
		findPlayLists();
		//$('#pl_list ul').listview('refresh');
	}
}


//Delete Playlists
function deletePlayLists(pl_id){
	
	SC.get('/me/playlists/', function(playlists){
		var new_playlists = [];
		
		for (p in playlists) {
			if (playlists[p]['id'] != pl_id) {
				new_playlists.push(playlists[p]);
			}
		}
		
		var oauth = localStorage["SC.accessToken"];
		var ur = "https://api.soundcloud.com/playlists.json";
		
		$.ajax({
			type: "PUT",
			url: ur,
			data: JSON.stringify(new_playlists),
			oauth_token: oauth,
			contentType: 'application/json', // format of request payload
			dataType: 'json', // format of the response
			success: function(msg) {
				alert( "Success: " + msg );
			},
			error: function(err) {
				alert( "Error: " + err);
			}
		});

		/*		
		$.post(ur, { oauth_token: oauth, playlist: new_playlists }, function(data) {

		}).success(function(){ 
			$.mobile.changePage('#init-page', {transition: 'fade', role: 'page', rel: 'external'});  alert("Playlist Created"); refreshPage('#init-page'); 
		}).error(function(){ $.mobile.changePage('#init-page', {transition: 'fade', role: 'page', rel: 'external' }); alert("Error - Please try again later."); });		
			*/		
	});
}
    
//Search Music
function findTracks(music){
	
	var jqxhr = $.getJSON("https://api.soundcloud.com/tracks.json?client_id=3f89b0cd71fd914ea55be0cc3a918dca",	      
	{
	q: music,
	tags: music,
	filter: 'public'	
	},
	
	function(data) {
		var items = [];
	  
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
			+ '</h3></a><a href="#" data-icon="plus" data-theme="e" title="pl_add"></a></li>');
		});
		
		var list_view = items.join('');
		$('#search-page #music_list ul').append(list_view).listview('refresh');
	  
	})
	.success(function() {/*  alert('success');*/})
	.error(function() { alert("Error Loading Results"); })
	.complete(function() { $.mobile.hidePageLoadingMsg(); });

}

	
//Create Playlist
function createPlaylist(name) {
	
	var oauth = localStorage["SC.accessToken"];
	var playlist = new Object();
	playlist['title'] = name;
	playlist['sharing'] = 'public';		
	var ur = "https://api.soundcloud.com/playlists.json";
	
	$.post(ur, { oauth_token: oauth, playlist: playlist }, function(data) {

	}).success(function(){ 
		$.mobile.changePage('#init-page', {transition: 'fade', role: 'page', rel: 'external'});  alert("Playlist Created"); refreshPage('#init-page'); 
	}).error(function(){ $.mobile.changePage('#init-page', {transition: 'fade', role: 'page', rel: 'external' }); alert("Error - Please try again later."); });
}
	
// Add Playlist
	
	
    
//Init
function refreshPage(page){
	// Page refresh
	$(page).trigger('pagecreate');
	$(page).listview('refresh');
	getUserDetails();
}

// INITIAL PAGE
$('#init-page').live('pagecreate',function(event){
	//alert('Init Page!');
	scGetUserData();
	
	
	$('ul li a.pl_create').live("click", function(e){
		e.preventDefault();
		$.mobile.changePage('#create-page', {transition: 'pop', role: 'dialog'}); 
		loadPlayLists();
	});

	$('input#bt_create').live("click", function(e){
		e.preventDefault();
		var inCreate = $('input#createinput').val();
		if(inCreate.length > 0){
			createPlaylist(inCreate);
		}else{
			alert('Please write something!!');
		}		
	});  
  
});	
		
//SEARCH PAGE	
$('#search-page').live('pagecreate',function(event){
	//alert('Search Page!');
	scGetUserData();
  	$('input#bt_search').live('click', function(){
	
		var inMusic = $('input#musicinput').val();
		//console.log(inMusic);
		if(inMusic.length > 0){
			findTracks(inMusic);
		}else{
			alert('Please write something!!');
		}
	});
	
	$('#music_list ul li a.ui-li-link-alt').live("click", function(e){
		e.preventDefault();
		var music_id = $(this).parent().attr('id');
		$.mobile.changePage('#add-page', {transition: 'pop', role: 'dialog'}); 
	});
});	

//PLAYLISTS PAGE
$('#playlists-page').live('pagecreate',function(event){
	//alert('Playlists Page!');
	scGetUserData();
	loadPlayLists();
	
	$('#pl_list ul li a.ui-li-link-alt').live("click", function(e){
		e.preventDefault();
		var pl_id = $(this).parent().attr('id');
		deletePlayLists(pl_id);
		 
	});
	
});	

// Initial Pageload
$(function() {
    // Loads HTML partial files into div elements.
    w3IncludeHTML();

    // Navigation bar for activating pages.
    $('.nav-item').on('click', function(event) {
        clicked_nav_id = $(this).attr('id');
        if (clicked_nav_id + '-section' !== $('.active-section').first().attr('id')) {
            $('.active-section').fadeOut('400', function () {
                $('#' + clicked_nav_id + '-section').fadeIn().addClass('active-section');
            }).removeClass('active-section');
        }
    });
    // test

    // A volume controller for the legacy music player.
    $("#vol_control").slider({
      value: 70,
      orientation: "vertical",
      range: "min",
      animate: true,
      slide: updateVolume,
      change: updateVolume
    });

    SC.initialize({
        client_id: '9374b0b7414d05b19e7a2b5e1bf74428'
    });

    var everythingLoaded = setInterval(function() {
      if (/loaded|complete/.test(document.readyState)) {
        clearInterval(everythingLoaded);
        loadPartials(); // this is the function that gets called when everything is loaded
      }
    }, 10);
});


// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
  if ($(this).attr('class') != 'dropdown-toggle active' && $(this).attr('class') != 'dropdown-toggle') {
    $('.navbar-toggle:visible').click();
  }
});

/*
    Functions
*/

function loadPartials() {
    // Populate the music page with all albums
    SC.get('/users/5177578/playlists').then(function(sets){
        set_count = 0;
        set_max_row_size = 4;
        albums = [];
        var addAlbum = function(set) {
            set_count++;
            var album_cover_img = set.artwork_url.replace("large", "crop")
            var album = $('<div class="album"><img class="album-cover" src="' + album_cover_img + '"></img></div>').attr('data-album-id', set.id);
            album.on('click', function(event) {
                processAudio(set, $(this));
            });
            albums.push(album);
        }

        sets.forEach(addAlbum);

        for (i = 0; i <= set_count; i = i + set_max_row_size) {
            $('<div class="albums" id="albums_' + i + '"></div>').appendTo($('<div class="col-lg-' + (12 - (i * set_max_row_size)) + '">').appendTo($('#album_row')));
            $('#albums_' + i).append(albums[i]);
        }
    });
}

// jQuery to collapse the navbar on scroll
function collapseNavbar() {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
}

// Call this function for enabling the music spectrum for the music player.
function processAudio(set, album_element) {
    if (typeof audio !== 'undefined') {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    } else {
        // Get all of the tracks for the album
        SC.get('/playlists/' + album_element.attr('data-album-id') + '/tracks').then(function(tracks) {
            // Resize album
            var albums_element = album_element.parent();
            var album_col = albums_element.parent();
            album_col.hide();
            album_col.parent().css('overflow', 'hidden');
            $('<div class="col-md-1"></div>').appendTo(album_col.parent());
            var album_spotlight = $('<div id="album-spotlight" class="col-md-3"></div>').appendTo(album_col.parent());
            var album_cover = album_element.children('img').removeClass('album-cover').addClass('album-cover-full');
            album_spotlight.append(album_element);
            album_spotlight.append('<a href="' + set.permalink_url + '"><i class="fa fa-soundcloud fa-2x"></i></a>');
            album_spotlight.append('<a id="track-download"><i class="fa fa-download fa-2x"></i></a>');
            // var player_button = $('<i class="fa fa-play" id="player-play"></i>').appendTo(album_spotlight);
            var track_list = $('<div id="track-list" class="col-md-6"></div>').appendTo(album_col.parent());

            var generateTrackList = function(track) {
                // Build the track element, add to track list. Attach event handlers.
                var track_elm = $('<div class="track"></div>');
                track_elm.appendTo(track_list);
                track_elm.click(function() {setCurrentTrack($(this), track)});
                var track_title_elm = $('<span></span>').html(track.title).appendTo(track_elm);
                $('<i class="fa fa-play-circle"></i>').appendTo(track_title_elm);

                // Set the initial track
                if (tracks[0] == track) {
                    setCurrentTrack(track_elm, track);
                }

            }
            tracks.forEach(generateTrackList)\
        });

        var setCurrentTrack = function (track_elm, track) {
            if (track_elm.attr('id') === 'current-track') {
                if (typeof audio !== 'undefined' && audio.paused) {
                    track_elm.find('.fa-play-circle').attr('class', 'fa fa-pause-circle');
                    audio.play();
                } else {
                    $('#current-track > span > .fa-pause-circle').attr('class', 'fa fa-play-circle');
                    audio.pause();
                }
            } else {
                $('#current-track > span > .fa-pause-circle').attr('class', 'fa fa-play-circle');
                $('#current-track').removeAttr('id');
                track_elm.attr('id', 'current-track');
                track_elm.find('.fa-play-circle').attr('class', 'fa fa-pause-circle');
                $('#track-download').attr('href', track.download_url);
                playTrack(track);
            }
        }

        var playTrack = function (track) {
            if (typeof audio !== 'undefined') {
                audio.pause();
            }

            audio = new Audio();
            audio.crossOrigin = "anonymous";
            audio.src = track.stream_url + '?client_id=9374b0b7414d05b19e7a2b5e1bf74428';
            audio.play();

            gradientCreate(audio, $('#album-visual'));
        }

        var gradientCreate = function(audio_stream, canvas) {
            if (typeof context === 'undefined') {
                context = new AudioContext();
            } else {
                context.close();
                context = new AudioContext();
            }

            var source = context.createMediaElementSource(audio_stream);
            // get the context from the canvas to draw on
            var ctx = canvas.get()[0].getContext("2d");

            // create a gradient for the fill. Note the strange
            // offset, since the gradient is calculated based on
            // the canvas, not the specific element we draw
            var gradient = ctx.createLinearGradient(0,0,0,300);
            gradient.addColorStop(1,'#ffffff');
            gradient.addColorStop(0.75,'#ffffff');
            gradient.addColorStop(0.50,'#ffffff');
            gradient.addColorStop(0.25,'#7a07b5');
            gradient.addColorStop(0,'#ffffff');

            // setup a javascript node
            javascriptNode = context.createScriptProcessor(2048, 1, 1);
            // connect to destination, else it isn't called
            javascriptNode.connect(context.destination);

            // setup a analyzer
            analyser = context.createAnalyser();
            analyser.smoothingTimeConstant = 0.3;
            analyser.fftSize = 512;
            //analyser.maxDecibels = -40;

            // create a buffer source node
            source.connect(context.destination);
            source.connect(analyser);
            analyser.connect(javascriptNode);

            javascriptNode.onaudioprocess = function () {
                fillGradient(gradient, analyser, ctx);
            }
        }

        var fillGradient = function(gradient, analyser, ctx) {
            // Dynamically set the canvas size based on the current window.
            ctx.canvas.width  = $('#spec_canvas').width();
            ctx.canvas.height = window.innerHeight*.2;
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);

            // clear the current state
            ctx.clearRect(0, 0, 1000, 325);

            // set the fill style
            ctx.fillStyle = gradient;

            drawSpectrum(array, ctx);
        }

        var drawSpectrum = function(array, ctx) {
            for ( var i = 0; i < (array.length); i++ ){
                var value = array[i];

                ctx.fillRect(i*15,325-value,10,325);
            }
        };
    }
}

// Simple function to update the volume based on a slider.
function updateVolume() {
    if (typeof audio !== 'undefined') {
        var volume_val = $("#vol_control").slider("value");
        audio.volume = volume_val / 100;
    }
}

// Performs a simple HTTP GET request.
function get(url, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() { 
      if (request.readyState === 4 && request.status === 200) {
        callback(request.responseText);
      }
    }

    request.open("GET", url, true);            
    request.send(null);
}

// Finds a track on the Soundcloud API.
function findTrack() {

    /*var trackPermalinkUrl = "https://soundcloud.com/r3currsion/firestorm-1";
    var clientParameter = "client_id=9374b0b7414d05b19e7a2b5e1bf74428"

    get("http://api.soundcloud.com/resolve.json?url=" + trackPermalinkUrl + "&" + clientParameter,
      function (response) {
        var trackInfo = JSON.parse(response);
        audio.src = trackInfo.stream_url + "?" + clientParameter;
      }
    );*/
};

function findTracks(playlist_id, track_cb) {
    SC.get('/playlists/' + playlist_id + '/tracks').then(track_cb);
}

/*
    Youtube Processing
*/
var player_div = "vod_player";

// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// This function creates an <iframe> (and YouTube player)
// after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player(player_div, {
        height: '563',
        width: '1000',
        playerVars: {
            list: "PLzpFI_Zzc7WTys6GD0j-K444iezRfwNWX", // The playlist identifier
            listType: "playlist",
            fs: 0,
            enablejsapi: 1,
            iv_load_policy: 3,
            modestbranding: 1,
            //origin: "http://r3currsion.com", // The origin website of the JS. Disable this for local development.
            rel: 0,
            showinfo: 0,
            theme: "dark",
        }
    });

    // This sets up a listener on the play button to activate the YouTube player.
    $('.play-button').on('click', function(event) {
        $('.intro-body').fadeOut('400', function () {
            $('.vod-container').fadeIn();
        });
        player.playVideo();
    });

    // If someone clicks outside of the player modal, pause the video and go back to intro.
    $('#overlay').on('click', function(event) {
        $('.vod-container').fadeOut('400', function () {
            $('.intro-body').show();
        });
        player.pauseVideo();
    });
}

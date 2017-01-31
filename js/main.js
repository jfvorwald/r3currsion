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

    // For the "Init()" blinking text.
    $("#cover-title").typed({
        strings: ["Init ();"],
        typeSpeed: 200,
        cursorChar: "█",
        startDelay: 150,
        callback: function() {
            // Can do callback function here after done typing.
        },
    });

    // A volume controller for the legacy music player.
    $("#vol_control").slider({
      value: 70,
      orientation: "vertical",
      range: "min",
      animate: true,
      slide: updateVolume,
      change: updateVolume
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
    $('.album-cover, #player-play').on('click', function(event) {
        processAudio($(this));
    });
    console.log('derp!');
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
function processAudio(element) {
    if (typeof audio !== 'undefined') {
        if (audio.paused) {
            audio.play();
            $('#player-play').removeClass('fa-play');
            $('#player-play').addClass('fa-pause');
        } else {
            audio.pause();
            $('#player-play').removeClass('fa-pause');
            $('#player-play').addClass('fa-play');
        }
    } else {
        audio = new Audio();
        audio.crossOrigin = "anonymous";
        findTrack(audio);
        audio.play();
        $('#player-play').removeClass('fa-play');
        $('#player-play').addClass('fa-pause');
        $('#footer-player').fadeIn();

        var context = new AudioContext();

        var source = context.createMediaElementSource(audio);

        // get the context from the canvas to draw on
        var ctx = $("#player-visual").get()[0].getContext("2d");

        // create a gradient for the fill. Note the strange
        // offset, since the gradient is calculated based on
        // the canvas, not the specific element we draw
        var gradient = ctx.createLinearGradient(0,0,0,300);
        gradient.addColorStop(1,'#ffffff');
        gradient.addColorStop(0.75,'#ffffff');
        gradient.addColorStop(0.50,'#ffffff');
        gradient.addColorStop(0.25,'#488A2D');
        gradient.addColorStop(0,'#ffffff');

        // setup a javascript node
        javascriptNode = context.createScriptProcessor(2048, 1, 1);
        // connect to destination, else it isn't called
        javascriptNode.connect(context.destination);


        // setup a analyzer
        analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0.3;
        analyser.fftSize = 512;

        // create a buffer source node
        source.connect(context.destination);
        source.connect(analyser);
        analyser.connect(javascriptNode);

        javascriptNode.onaudioprocess = function() {
            // get the average for the first channel
            var array =  new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);

            // clear the current state
            ctx.clearRect(0, 0, 1000, 325);

            // set the fill style
            ctx.fillStyle=gradient;
            drawSpectrum(array);
        }

        function drawSpectrum(array) {
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
function findTrack(audio) {
    var trackPermalinkUrl = "https://soundcloud.com/r3currsion/firestorm-1";
    var clientParameter = "client_id=9374b0b7414d05b19e7a2b5e1bf74428"

    get("http://api.soundcloud.com/resolve.json?url=" + trackPermalinkUrl + "&" + clientParameter,
      function (response) {
        var trackInfo = JSON.parse(response);
        audio.src = trackInfo.stream_url + "?" + clientParameter;
      }
    );
};

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

// jQuery to collapse the navbar on scroll
function collapseNavbar() {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
}

//$(window).scroll(collapseNavbar);
//$(document).ready(collapseNavbar);

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });

    $('.play-button').on('click', function(event) {
        processAudio($(this));
    });
});

function processAudio(element) {
    if (typeof audio !== 'undefined') {
        if (audio.paused) {
            audio.play();
            $('#front_play').removeClass('fa-play-circle-o');
            $('#front_play').addClass('fa-pause-circle-o');
            $('#player-play').removeClass('fa-play');
            $('#player-play').addClass('fa-pause');
        } else {
            audio.pause();
            $('#front_play').removeClass('fa-pause-circle-o');
            $('#front_play').addClass('fa-play-circle-o');
            $('#player-play').removeClass('fa-pause');
            $('#player-play').addClass('fa-play');
        }
    } else {
        audio = new Audio();
        audio.crossOrigin = "anonymous";
        findTrack(audio);
        audio.play();
        $('#front_play').removeClass('fa-play-circle-o');
        $('#front_play').addClass('fa-pause-circle-o');
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
        gradient.addColorStop(1,'#000000');
        gradient.addColorStop(0.75,'#BFBFBF');
        gradient.addColorStop(0.25,'#ffffff');
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

                ctx.fillRect(i*5,325-value,3,325);
            }
        };
    }
}

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
  if ($(this).attr('class') != 'dropdown-toggle active' && $(this).attr('class') != 'dropdown-toggle') {
    $('.navbar-toggle:visible').click();
  }
});

// Soundcloud API
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

var clientParameter = "client_id=9374b0b7414d05b19e7a2b5e1bf74428"

var trackPermalinkUrl = 
  "https://soundcloud.com/r3currsion/firestorm-1";

function findTrack(audio) {
    get("http://api.soundcloud.com/resolve.json?url=" + trackPermalinkUrl + "&" + clientParameter,
      function (response) {
        var trackInfo = JSON.parse(response);
        audio.src = trackInfo.stream_url + "?" + clientParameter;
      }
    );
};


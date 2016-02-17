/*!
 * Start Bootstrap - Grayscale Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

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

    $('#front_play').on('click', function(event) {
        if (typeof audio !== 'undefined') {
            if (audio.paused) {
                audio.play();
                $(this).removeClass('fa-play-circle-o');
                $(this).addClass('fa-pause-circle-o');
            } else {
                audio.pause();
                $(this).removeClass('fa-pause-circle-o');
                $(this).addClass('fa-play-circle-o');
            }
        } else {
            audio = new Audio('aud/firestorm.mp3');
            audio.play();
            $(this).removeClass('fa-play-circle-o');
            $(this).addClass('fa-pause-circle-o');
        }
    });
});

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
  if ($(this).attr('class') != 'dropdown-toggle active' && $(this).attr('class') != 'dropdown-toggle') {
    $('.navbar-toggle:visible').click();
  }
});

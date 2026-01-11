/*!
 * Clean Blog v1.0.0 (http://startbootstrap.com)
 * Copyright 2015 Start Bootstrap
 * Licensed under Apache 2.0 (https://github.com/IronSummitMedia/startbootstrap/blob/gh-pages/LICENSE)
 */

 /*!
 * Hux Blog v1.6.0 (http://startbootstrap.com)
 * Copyright 2016 @huxpro
 * Licensed under Apache 2.0 
 */

// Tooltip Init
// Unuse by Hux since V1.6: Titles now display by default so there is no need for tooltip
// $(function() {
//     $("[data-toggle='tooltip']").tooltip();
// });


// make all images responsive
/* 
 * Unuse by Hux
 * actually only Portfolio-Pages can't use it and only post-img need it.
 * so I modify the _layout/post and CSS to make post-img responsive!
 */
// $(function() {
//  $("img").addClass("img-responsive");
// });

// responsive tables
$(document).ready(function() {
    $("table").wrap("<div class='table-responsive'></div>");
    $("table").addClass("table");
});

// responsive embed videos
$(document).ready(function() {
    $('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
    $('iframe[src*="youtube.com"]').addClass('embed-responsive-item');
    $('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
    $('iframe[src*="vimeo.com"]').addClass('embed-responsive-item');
});

// Navigation Scripts to Show Header on Scroll-Up
jQuery(document).ready(function($) {
    var MQL = 1170;

    //primary navigation slide-in effect
    if ($(window).width() > MQL) {
        var headerHeight = $('.navbar-custom').height(),
            bannerHeight  = $('.intro-header .container').height();     
        $(window).on('scroll', {
                previousTop: 0
            },
            function() {
                var currentTop = $(window).scrollTop(),
                    $catalog = $('.side-catalog');

                //check if user is scrolling up by mouse or keyborad
                if (currentTop < this.previousTop) {
                    //if scrolling up...
                    if (currentTop > 0 && $('.navbar-custom').hasClass('is-fixed')) {
                        $('.navbar-custom').addClass('is-visible');
                    } else {
                        $('.navbar-custom').removeClass('is-visible is-fixed');
                    }
                } else {
                    //if scrolling down...
                    $('.navbar-custom').removeClass('is-visible');
                    if (currentTop > headerHeight && !$('.navbar-custom').hasClass('is-fixed')) $('.navbar-custom').addClass('is-fixed');
                }
                this.previousTop = currentTop;


                //adjust the appearance of side-catalog
                $catalog.show()
                if (currentTop > (bannerHeight + 41)) {
                    $catalog.addClass('fixed')
                } else {
                    $catalog.removeClass('fixed')
                }
            });
    }
});

// Reading Time Calculation
function calculateReadingTime() {
    const postContent = document.querySelector('.post-content') || document.querySelector('article') || document.querySelector('.post-container');
    if (!postContent) return;
    
    const text = postContent.innerText || postContent.textContent;
    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute
    
    const readingTimeElement = document.createElement('div');
    readingTimeElement.className = 'reading-time';
    readingTimeElement.innerHTML = `<i class="fa fa-clock-o"></i> ${readingTime} min read`;
    
    const postMeta = document.querySelector('.post-meta');
    if (postMeta) {
        postMeta.appendChild(readingTimeElement);
    }
}

// Initialize reading time calculation when DOM is ready
document.addEventListener('DOMContentLoaded', calculateReadingTime);

// Site Runtime Duration Display
function calculateSiteRuntime() {
    // Set your site launch date here
    const siteLaunchDate = new Date('2016-01-01'); // Default launch date
    const now = new Date();
    const diffTime = Math.abs(now - siteLaunchDate);
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    const remainingDays = diffDays % 365;
    const diffMonths = Math.floor(remainingDays / 30);
    const remainingDaysFinal = remainingDays % 30;
    
    let runtimeText = '';
    if (diffYears > 0) {
        runtimeText = `${diffYears}年 ${diffMonths}个月 ${remainingDaysFinal}天`;
    } else if (diffMonths > 0) {
        runtimeText = `${diffMonths}个月 ${remainingDaysFinal}天`;
    } else {
        runtimeText = `${remainingDaysFinal}天`;
    }
    
    const runtimeElement = document.createElement('div');
    runtimeElement.className = 'site-runtime';
    runtimeElement.innerHTML = `<i class="fa fa-calendar"></i> 站点已运行: ${runtimeText}`;
    
    const footer = document.querySelector('footer');
    if (footer) {
        footer.appendChild(runtimeElement);
    }
}

// Initialize site runtime calculation when DOM is ready
document.addEventListener('DOMContentLoaded', calculateSiteRuntime);

// Timeline Expand/Collapse Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Year expand/collapse
    document.querySelectorAll('.timeline-year-header').forEach(header => {
        header.addEventListener('click', function() {
            const year = this.getAttribute('data-year');
            const monthsContainer = document.getElementById(`year-${year}`);
            const icon = this.querySelector('i');
            
            if (monthsContainer.classList.contains('expanded')) {
                monthsContainer.classList.remove('expanded');
                this.classList.remove('expanded');
                icon.style.transform = 'rotate(0deg)';
            } else {
                monthsContainer.classList.add('expanded');
                this.classList.add('expanded');
                icon.style.transform = 'rotate(90deg)';
            }
        });
    });
    
    // Month expand/collapse
    document.querySelectorAll('.timeline-month-header').forEach(header => {
        header.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling to year header
            
            const month = this.getAttribute('data-month');
            const postsContainer = document.getElementById(`month-${month}`);
            const icon = this.querySelector('i');
            
            if (postsContainer.classList.contains('expanded')) {
                postsContainer.classList.remove('expanded');
                this.classList.remove('expanded');
                icon.style.transform = 'rotate(0deg)';
            } else {
                postsContainer.classList.add('expanded');
                this.classList.add('expanded');
                icon.style.transform = 'rotate(90deg)';
            }
        });
    });
});
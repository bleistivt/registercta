/*global jQuery, gdn*/

jQuery(function ($) {
    'use strict';

    // We only need this for guests.
    if (!gdn.definition('isGuest', false)) {
        return;
    }

    var ls, cta, id;

    // data model
    ls = (function () {

        var key = 'signup-cta',
            defaults = {
                later: 0,
                scroll: 0,
                discussions: []
            };

        function get(item) {
            var data = JSON.parse(localStorage.getItem(key)) || defaults;
            if (item !== undefined) {
                return data[item];
            }
            return data;
        }

        function set(item, value) {
            var data = get();
            data[item] = value;
            localStorage.setItem(key, JSON.stringify(data));
        }

        return {
            // Register user activity through scrolling (debounced to 30sec).
            scroll: (function () {
                var timestamp = 0;
                return function () {
                    var now = Date.now();
                    if (now - timestamp > 30000) {
                        timestamp = now;
                        set('scroll', get('scroll') + 1);
                    }
                };
            }()),

            // Register topics visited.
            discussion: function (id) {
                var ids = get('discussions');
                // Count unique discussions.
                if (ids.indexOf(id) === -1) {
                    ids.push(id);
                    set('discussions', ids);
                }
            },

            // Check if the call to action should be shown.
            ask: function () {
                var data = get();
                return data.scroll > 7 &&
                        data.discussions.length > 2 &&
                        Date.now() - data.later > 86400000;
            },

            // Ask me again (after a day has passed).
            later: function () {
                set('later', Date.now());
            }
        };

    }());


    cta = $('.signup-cta');
    cta.find('button.later').click(function () {
        ls.later();
        cta.slideDown();
    });

    if (ls.ask()) {
        cta.removeClass('Hidden');
        $(document).trigger('signup-cta');
    } else {
        $(window).scroll(ls.scroll);
        id = gdn.definition('DiscussionID', false);
        if (id) {
            ls.discussion(id);
        }
    }

});

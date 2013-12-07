/*jslint browser: true, devel: true, nomen: true*/
/*global jQuery*/

(function ($) {
    "use strict";

    var Stack,
        DATA_NAMES = {
            pinned: 'pinit-pinned',
            stack: 'pinit-stack',
            uid: 'pinit-uid',
            placeholder: 'pinit-placeholder',
            originalCss: 'pinit-original-css'
        };

    Stack = function () {
        var stack = {},
            getStackHeight;

        this.height = 0;

        getStackHeight = function () {
            var uid, item,
                height = 0;
            for (uid in stack) {
                if (stack.hasOwnProperty(uid)) {
                    item = stack[uid];
                    height += item.height;
                }
            }
            return height;
        };

        this.refresh = function () {
            var uid, item,
                top = 0;
            for (uid in stack) {
                if (stack.hasOwnProperty(uid)) {
                    item = stack[uid];
                    item.$el.css({
                        top: top
                    });
                    top += item.height;
                }
            }

            this.height = getStackHeight();
        };

        this.push = function (obj) {
            var uid = obj.$el.data(DATA_NAMES.uid),
                top = getStackHeight();
            stack[uid] = {
                $el: obj.$el,
                el: obj.el,
                height: obj.$el.height(),
                top: top
            };

            this.height = getStackHeight();

            return top;
        };

        this.remove = function (uid) {
            if (stack[uid]) {
                delete stack[uid];
            }
            this.refresh();
        };

        return this;
    };

    $.fn.pinit = function (options) {
        var SCROLL_DIRECTION_UP = -1,
            SCROLL_DIRECTION_DOWN = 1,
            _methods = {},
            _defaults = {
                pinnedClass: 'pinned',
                setOriginalDimensions: false
            },
            breakpoints = [],
            stack,
            lastScroll; // Last scrollTop value

        if ($(window).data(DATA_NAMES.stack)) {
            stack = $(window).data(DATA_NAMES.stack);
        } else {
            stack = new Stack();
            $(window).data(DATA_NAMES.stack, stack);
        }

        options = options || {};
        options = $.extend(_defaults, options);

        stack = new Stack();

        /**
         * Generate UID
         * @returns {string}
         */
        _methods.generateUid = function () {
            var s4 = function () {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            };

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };

        /**
         * Refresh position of every breakpoint
         */
        _methods.refreshBreakpoints = function () {
            var i, l, breakpoint;
            for (i = 0, l = breakpoints.length; i < l; i += 1) {
                breakpoint = breakpoints[i];
                if (!breakpoint.$el.data(DATA_NAMES.pinned)) {
                    breakpoint.height = breakpoint.$el.height();
                }
            }
        };

        /**
         * Create placeholder
         */
        _methods.createPlaceholder = function ($el, uid) {
            if (!uid) {
                uid = _methods.generateUid();
            }
            var placeholder = $('<div id="placeholder-' + uid + '"></div>');
            placeholder
                .css(
                    $el.css(['position', 'top', 'left'])
                )
                .width($el.outerWidth())
                .height($el.outerHeight())
                .hide();
            return placeholder;
        };

        /**
         * Initialize element
         */
        _methods.initElement = function () {
            var $el = $(this),
                uid = _methods.generateUid(),
                placeholder,
                originalCss;
            breakpoints.push({
                el: this,
                $el: $el,
                top: $el.offset().top,
                height: $el.height()
            });

            placeholder = _methods.createPlaceholder($el, uid);
            originalCss = $el.css(['position', 'top', 'left', 'width', 'height']);

            $el
                .after(placeholder)
                .data(DATA_NAMES.uid, uid)
                .data(DATA_NAMES.placeholder, placeholder)
                .data(DATA_NAMES.originalCss, originalCss);
        };

        /**
         * Pin element
         * @param obj
         */
        _methods.pin = function (obj) {
            var top,
                originalCss = obj.$el.data(DATA_NAMES.originalCss);
            if (originalCss.position === 'fixed') {
                return;
            }
            top = stack.push(obj);
            obj.$el
                .css({
                    position: 'fixed',
                    top: top
                })
                .addClass(options.pinnedClass)
                .data(DATA_NAMES.pinned, true);

            if (options.setOriginalDimensions) {
                obj.$el
                    .width(originalCss.width)
                    .height(originalCss.height);
            }

            obj.$el.data(DATA_NAMES.placeholder).show();
            _methods.refreshBreakpoints();
        };

        /**
         * Unpin element
         * @param obj
         */
        _methods.unpin = function (obj) {
            var originalCss = obj.$el.data(DATA_NAMES.originalCss);

            obj.$el
                .css(originalCss)
                .removeClass(options.pinnedClass)
                .data(DATA_NAMES.pinned, false);
            obj.$el.data(DATA_NAMES.placeholder).hide();
            stack.remove(obj.$el.data(DATA_NAMES.uid));
        };

        /**
         * Window onscroll event callback
         */
        _methods.scroll = function () {
            var top = $(window).scrollTop(),
                topModification = 0,
                i,
                l,
                breakpoint,
                pinned,
                scrollDirection = lastScroll < top ? SCROLL_DIRECTION_DOWN : SCROLL_DIRECTION_UP;

            for (i = 0, l = breakpoints.length; i < l; i += 1) {
                breakpoint = breakpoints[i];
                pinned = breakpoint.$el.data(DATA_NAMES.pinned);

                if (scrollDirection === SCROLL_DIRECTION_UP) {
                    // on scroll up
                    topModification = breakpoint.height * -1;
                }

                if (breakpoint.top < top + stack.height + topModification) {
                    if (!pinned) {
                        _methods.pin(breakpoint);
                    }
                } else {
                    if (pinned) {
                        _methods.unpin(breakpoint);
                    }
                }
            }

            lastScroll = top;
        };

        /**
         * Collect breakpoints
         */
        this.each(_methods.initElement);

        _methods.scroll();
        $(window).on('scroll', _methods.scroll);

        return this;
    };
}(jQuery));
/*jslint browser: true, devel: true, nomen: true*/
/*global jQuery*/

(function ($) {
    "use strict";

    var Stack = function () {
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
            var uid = obj.$el.data('pinit-uid'),
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
        var _methods = {},
            _defaults = {
                pinnedClass: 'pinned'
            },
            breakpoints = [],
            stack;

        if ($(window).data('pinit-stack')) {
            stack = $(window).data('pinit-stack');
        } else {
            stack = new Stack();
            $(window).data("pinit-stack", stack);
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
                if (!breakpoint.$el.data('pinned')) {
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
                .data('pinit-uid', uid)
                .data('pinit-placeholder', placeholder)
                .data('pinit-original-css', originalCss);
        };

        /**
         * Pin element
         * @param obj
         */
        _methods.pin = function (obj) {
            var top,
                originalCss = obj.$el.data('pinit-original-css');
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
                .data('pinit-pinned', true);
            obj.$el.data('pinit-placeholder').show();
            _methods.refreshBreakpoints();
        };

        /**
         * Unpin element
         * @param obj
         */
        _methods.unpin = function (obj) {
            var originalCss = obj.$el.data('pinit-original-css');

            obj.$el
                .css(originalCss)
                .removeClass(options.pinnedClass)
                .data('pinit-pinned', false);
            obj.$el.data('pinit-placeholder').hide();
            stack.remove(obj.$el.data('pinit-uid'));
        }

        /**
         * Window onscroll event callback
         */
        _methods.scroll = function () {
            var top = $(window).scrollTop() + stack.height,
                i,
                l,
                breakpoint,
                pinned;

            for (i = 0, l = breakpoints.length; i < l; i += 1) {
                breakpoint = breakpoints[i];
                pinned = breakpoint.$el.data('pinit-pinned');
                console.log(breakpoint.top, top);
                if (breakpoint.top < top - breakpoint.height) {
                    if (!pinned) {
                        console.log("pin", breakpoint.top, breakpoint.height, top);
                        _methods.pin(breakpoint);
                    }
                } else {
                    if (pinned) {
                        console.log("unpin", breakpoint.top, breakpoint.height, top);
                        _methods.unpin(breakpoint);
                    }
                }
            }
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
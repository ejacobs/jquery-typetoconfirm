/*
* jQuery Type to Confirm v0.7
* Repository: https://github.com/ejacobs/typetoconfirm
* Project Page: http://ejacobs.net/projects/typetoconfirm
*
* Copyright 2013, Evan Jacobs
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://www.opensource.org/licenses/mit-license.php
* http://www.opensource.org/licenses/GPL-2.0
*/

(function($) {

    // Class that is applied to all confirm dialogs no matter what
    var dialogClass = 'typeToConfirm-jQuery';

    $.fn.typeToConfirm = function(options) {

        var settings = $.extend({
            class               : 'typeToConfirm',                      // Class to add to the entire dialog
            texttotype          : 'confirm',                            // Text that user must type to confirm
            casesensitive       : true,                                 // Must user typed letters match case
            beforemessage       : false,                                // HTML message that goes before letters
            aftermessage        : 'Please type \'{{t}}\' to confirm',   // {{t}} is replaced with the textotype setting
            align               : 'middle',                             // middle, left, right, top, bottom
            position            : 'above',                              // above, below, left, right, auto
            arrowmargin         : 4,                                    // Number in pixels between arrow and dialog
            dialogmargin        : 2,                                    // Number in pixels between dialog and button
            charsymbol          : '*',                                  // Symbol to be used in place of untyped chars
            closeonconfirm      : true,                                 // Hide the dialog once user has confirmed
            dialogclass         : 'confirmDialog',                      // Class for the entire dialog
            beforemessageclass  : 'messageContainer',                   // Class for the after before container
            aftermessageclass   : 'messageContainer',                   // Class for the after message container
            innerdialogclass    : 'confirmDialogInner',                 // Class for the inner dialog
            untypedlettersclass : 'untypedLettersContainer',            // Class for the untyped letters container
            arrowcontainerclass : 'arrowContainer',                     // Class for the arrow container
            onCreate    : null,
            onConfirm   : null
        }, options);

        var variables = {
            nextletterindex   : 0,
            instantiated      : false,
            submitform        : false,
            confirmedsubmit   : false,
            nextlettertoyype  : null
        }

        return this.each(function() {

            $(this).next('.' + settings.dialogclass).remove();
            if ($.data(this, 'executeonconfirm') != undefined) {
                $(this).attr('onclick', $.data(this, 'executeonconfirm'));
                $.data(this, 'executeonconfirm')
                $.removeData(this)
                $(this).unbind('click');
            }

            if ($(this).is('input[type=submit]')) {
                $(this).closest("form").submit(function(e) {
                    if (!variables.confirmedsubmit) {
                        e.preventDefault();
                    }
                });
                variables.submitform = true;
            }

            $(this).after('<div class="'+ dialogClass + ' ' + settings.dialogclass +'" style="display: none; position: absolute;"></div>');
            this.dialogElement = $(this).next('.' + settings.dialogclass);
            var onClickCode = $(this).attr('onclick');
            if (onClickCode != undefined) {
                $.data(this, 'executeonconfirm', $(this).attr('onclick'));
                $(this).removeAttr('onclick');
            }

            var newHtml = '<div class="'+ settings.innerdialogclass +' '+ settings.class +'">';
            newHtml +=  '<div class="'+ settings.arrowcontainerclass +'"></div>';
            newHtml += '<input type="text" title="'+ settings.texttotype +'" style="width: 0; height: 0; float: left;">';
            if (settings.beforemessage) {
                newHtml += '<div class="'+ settings.beforemessageclass +'">';
                newHtml += settings.beforemessage.replace(/\{\{t\}\}/, settings.texttotype);
                newHtml += '</div>';
            }
            newHtml += '<div class="'+ settings.untypedlettersclass +'">';
            for ( var i = 0; i < settings.texttotype.length; i++ ) {
                newHtml += settings.charsymbol;
            }
            newHtml += '</div>';
            if (settings.aftermessage) {
                newHtml += '<div class="'+ settings.aftermessageclass +'">';
                newHtml += settings.aftermessage.replace(/\{\{t\}\}/, settings.texttotype);
                newHtml += '</div>';
            }
            newHtml += '<div style="position: absolute; width: 10px; height: 10px; background-color: white"></div></div>';

            this.dialogElement.html(newHtml);

            // In case the user clicks on an element within the dialog, make sure the input stays in focus
            this.dialogElement.find('div').click(function() {
                $(this).closest('div.' + settings.dialogclass).find('input[type=text]').focus()
                $(this).focus();
            });

            // Fire the onCreate event
            if(settings.onCreate && typeof settings.onCreate === 'function'){
                settings.onCreate();
            }

            // When user clicks on the button, position the dialog and reset the typing
            $(this).click(function() {

                var dialogElement = this.dialogElement;
                var dialogElementInner = dialogElement.find('.' + settings.innerdialogclass);
                $('.' + settings.dialogclass).hide();
                dialogElement.show();

                var buttonPos = $(this).position();
                var arrowContainerElement = dialogElement.find('.' + settings.arrowcontainerclass);
                var arrowSize = arrowContainerElement.height();

                // If set to auto, determine the best position so that it does not go off the page
                if (settings.position == 'auto') {
                    var determinedAlign = 'middle';     // Alignment is automatically set to middle if position is auto
                    var windowWidth = $(window).width();
                    var windowBottom = $(window).scrollTop() +  $(window).height();
                    if ((buttonPos.top - dialogElementInner.outerHeight() - arrowSize - settings.dialogmargin) > 0) {
                        var determinedPosition = 'above';
                    }
                    else if ((buttonPos.top + $(this).outerHeight() + arrowSize + settings.dialogmargin + $(this).outerHeight() ) <= windowBottom) {                                                                                       // Try below second
                        var determinedPosition = 'below';
                    }
                    else if ((buttonPos.left - dialogElementInner.outerWidth() - arrowSize - settings.dialogmargin) > 0) {                                                                                       // Try left third
                        var determinedPosition = 'left';
                    }
                    else if ((buttonPos.left + $(this).outerWidth() + arrowSize + settings.dialogmargin + $(this).outerWidth()) < windowWidth) {                                                                                       // Try right fourth
                        var determinedPosition = 'right';
                    }
                    else {
                        var determinedPosition = 'above';
                    }
                }
                else {
                    var determinedPosition = settings.position;
                    var determinedAlign = settings.align;
                }

                variables.nextletterindex = 0;
                newConfirmStr = '';
                for (var i = 0; i < settings.texttotype.length; i++) {
                    newConfirmStr += settings.charsymbol;
                }
                dialogElement.find('.' + settings.untypedlettersclass).text(newConfirmStr);

                variables.instantiated = true;

                if ((determinedPosition == 'above') || (determinedPosition == 'below')) {

                    if (determinedAlign == 'left') {
                        dialogElement.css('left',  buttonPos.left );
                        arrowContainerElement.css('margin-left', ($(this).outerWidth() / 2) - (arrowSize / 2) );
                    }
                    else if (determinedAlign == 'right') {
                        dialogElement.css('left',  buttonPos.left - dialogElementInner.outerWidth() + $(this).outerWidth() );
                        arrowContainerElement.css('margin-left', (dialogElementInner.outerWidth()) - ($(this).outerWidth() / 2)  - (arrowSize)  );
                    }
                    else {
                        dialogElement.css('left', (buttonPos.left) - (dialogElementInner.outerWidth() / 2 ) + ($(this).outerWidth() / 2) );
                        arrowContainerElement.css('margin-left', (dialogElementInner.outerWidth() / 2) - (arrowSize / 2) );
                    }

                    if (determinedPosition == 'below') {
                        dialogElement.css('top',  buttonPos.top + $(this).outerHeight() + arrowSize + settings.dialogmargin  );
                        arrowContainerElement.css('margin-top', (-arrowSize) - settings.arrowmargin );
                        arrowContainerElement.addClass('up');
                    }
                    else {
                        dialogElement.css('top',  buttonPos.top - dialogElementInner.outerHeight() - arrowSize - settings.dialogmargin  );
                        arrowContainerElement.css('margin-top', dialogElementInner.outerHeight() + settings.arrowmargin - arrowSize );
                        arrowContainerElement.addClass('down');
                    }

                }
                else {

                    if (determinedAlign == 'top') {
                        dialogElement.css('top',  buttonPos.top );
                        arrowContainerElement.css('margin-top', ($(this).outerHeight() / 2) - (arrowSize / 2) );
                    }
                    else if (determinedAlign == 'bottom') {
                        dialogElement.css('top',  buttonPos.top - dialogElementInner.outerHeight() + $(this).outerHeight() );
                        arrowContainerElement.css('margin-top', (dialogElementInner.outerHeight()) - ($(this).outerHeight() / 2)  - (arrowSize)  );
                    }
                    else {
                        dialogElement.css('top', (buttonPos.top) - (dialogElementInner.outerHeight() / 2 ) + ($(this).outerHeight() / 2) );
                        arrowContainerElement.css('margin-top', (dialogElementInner.outerHeight() / 2) - (arrowSize / 2) );
                    }


                    if (determinedPosition == 'right') {
                        dialogElement.css('left',  buttonPos.left + $(this).outerWidth() + arrowSize + settings.dialogmargin  );
                        arrowContainerElement.css('margin-left', -(arrowSize) - settings.arrowmargin );
                        arrowContainerElement.addClass('left');
                    }
                    else {
                        dialogElement.css('left',  buttonPos.left - dialogElementInner.outerWidth() - arrowSize - settings.dialogmargin  );
                        arrowContainerElement.css('margin-left', dialogElementInner.outerWidth() - (arrowSize) + settings.arrowmargin );
                        arrowContainerElement.addClass('right');
                    }

                }

                dialogElement.find('.' + settings.innerdialogclass).css('margin-left',  $(this).css('margin-left'));
                dialogElement.find('.' + settings.innerdialogclass).css('margin-top',  $(this).css('margin-top'));

                variables.nextlettertoyype = settings.texttotype.charAt(variables.nextletterindex);

                // Use the hidden input to handle clicks
                dialogElement.find('input[type=text]').focus().keypress(function(e) {
                    var typedChar = String.fromCharCode(e.which);
                    if (!settings.casesensitive) {
                        typedChar = typedChar.toLowerCase();
                        variables.nextlettertoyype = variables.nextlettertoyype.toLowerCase();
                    }

                    if (typedChar == variables.nextlettertoyype) {
                        variables.nextletterindex++;
                        variables.nextlettertoyype = settings.texttotype.charAt(variables.nextletterindex);

                        // Reveal the part of the word that the user has typed so far
                        var newConfirmStr = settings.texttotype.substr(0, variables.nextletterindex);

                        // Fill in the rest of the word with the char symbol
                        for (var i = variables.nextletterindex; i < settings.texttotype.length; i++) {
                            newConfirmStr += settings.charsymbol;
                        }
                        dialogElement.find('.' + settings.untypedlettersclass).text(newConfirmStr);

                        if (variables.nextletterindex == settings.texttotype.length) {

                            // Fire the onConfirm event
                            if(settings.onConfirm && typeof settings.onConfirm === 'function'){
                                settings.onConfirm();
                            }

                            eval(onClickCode);
                            if (variables.submitform) {
                                variables.confirmedsubmit = true;
                                dialogElement.closest('form').submit();
                            }
                            if (settings.closeonconfirm) {
                                dialogElement.hide();
                            }
                        }
                        else if (e.keyCode ==  27) {
                            dialogElement.hide();
                        }

                    }
                });

                // Hide the dialog if user hits ESC
                dialogElement.find('input[type=text]').focus().keydown(function(e) {
                    if (e.keyCode == 27) {
                        $('.' + settings.dialogclass).hide();
                    }
                });

            });

        });

    };

    // Hide all dialogs on click out
    $(document).click(function(e) {
        var clickedElement = e.target;
        if ( ($(clickedElement).closest('.' + dialogClass).length == 0) && ($(clickedElement).next('.' + dialogClass).length == 0) ) {
            $('.' + dialogClass).hide();
        }
    });

})(jQuery);
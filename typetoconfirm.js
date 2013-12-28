/*
 * jQuery Type to Confirm v0.7
 * https://github.com/ejacobs/typetoconfirm
 *
 * Copyright 2014, Evan Jacobs
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */


(function($) {

    // Class that is applied to all confirm dialogs no matter what
    var dialogClass = 'jQuery-typeToConfirm';

    $.fn.typeToConfirm = function(options) {

        var settings = $.extend({
            class               : 'typeToConfirm',                      // Class to add to the entire dialog
            texttotype          : 'confirm',                            // Text that user must type to confirm
            casesensitive       : true,                                 // Must user typed letters match case
            beforemessage       : false,                                // HTML message that goes before letters
            aftermessage        : 'Please type \'{{t}}\' to confirm',   // {{t}} is replaced with the textotype setting
            align               : 'middle',                             // left, right
            position            : 'above',                              // above, below
            arrowmargin         : 4,                                    // Number in pixels between arrow and dialog
            dialogmargin        : 2,                                    // Number in pixels between dialog and button
            charsymbol          : '*',                                  // Symbol to be used in place of untyped chars
            closeonconfirm      : true,                                 // Hide the dialog once user has confirmed
            beforemessageclass  : 'messageContainer',                   // Class for the after before container
            aftermessageclass   : 'messageContainer',                   // Class for the after message container
            innerdialogclass    : 'confirmDialogInner',                 // Class for the inner dialog
            untypedlettersclass : 'untypedLettersContainer',            // Class for the untyped letters container
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
                var btnText = $(this).val();
            }
            else {
                if (($(this).attr('type') === undefined) || ($(this).attr('type') == 'submit')) {
                    variables.submitform = true;
                }
                btnText = $(this).text()
            }

            var btnHtml =  '<div class="btn-group ' + dialogClass + '">'
            btnHtml += '<button data-toggle="dropdown" class="' + $(this).attr('class') + '" type="button">' + btnText + '</button>';
            var stylesStr = '';
            if (settings.position == 'above') {
                stylesStr += 'bottom: 100%; top: auto; ';
            }

            if (settings.align == 'right') {
                stylesStr += 'float: right !important; left: auto; right: 0; ';
            }


            btnHtml += '<ul style="' + stylesStr + '" class="dropdown-menu dropup '+ settings.class +'">';
            if (settings.beforemessage) {
                btnHtml += '<li class="'+ settings.beforemessageclass +'"><p>' + settings.beforemessage.replace(/\{\{t\}\}/, settings.texttotype) + '</p></li>';
            }
            btnHtml += '<li style=""><input type="text" title="'+ settings.texttotype +'" style="position: fixed; left: -100px; margin: 0; padding: 0; width: 0; height: 0; float: left;"></li>';
            btnHtml += '<li style="text-align: center" class="'+ settings.untypedlettersclass +'">';

            for ( var i = 0; i < settings.texttotype.length; i++ ) {
                btnHtml += settings.charsymbol;
            }
            btnHtml += '</li>';
            if (settings.aftermessage) {
                btnHtml += '<li class="'+ settings.aftermessageclass +'"><p>' + settings.aftermessage.replace(/\{\{t\}\}/, settings.texttotype) + '</p></li>';
            }
            btnHtml += '</ul>';
            btnHtml += '</div>';
            $(this).after(btnHtml);


            var dialogElement = $(this).next().find('ul');
            var newButton = $(this).next().find('button');

            var onClickCode = $(this).attr('onclick');
            if (onClickCode != undefined) {
                $.data(this, 'executeonconfirm', $(this).attr('onclick'));
                $(this).removeAttr('onclick');
            }


            // In case the user clicks on an element within the dialog, make sure the input stays in focus
            dialogElement.click(function() {
                $(this).find('input[type=text]').focus();

                return false;
            });

            // Fire the onCreate event
            if(settings.onCreate && typeof settings.onCreate === 'function'){
                settings.onCreate();
            }

            // When user clicks on the button, position the dialog and reset the typing
            newButton.click(function() {
                var dialogElement = $(this).next('ul');

                variables.nextletterindex = 0;
                newConfirmStr = '';
                for (var i = 0; i < settings.texttotype.length; i++) {
                    newConfirmStr += settings.charsymbol;
                }
                dialogElement.find('.' + settings.untypedlettersclass).text(newConfirmStr);

                variables.instantiated = true;
                dialogElement.find('input[type=text]').focus();
            });

            dialogElement.find('input[type=text]').keypress(function(e) {

                // Use the hidden input to handle clicks
                variables.nextlettertoyype = settings.texttotype.charAt(variables.nextletterindex);

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
                            $(this).closest('.btn-group').removeClass('open');
                        }
                    }


                }
                else if (e.keyCode ==  27) {
                    $(this).closest('.btn-group').removeClass('open');
                }

            });

            $(this).remove();


        });

    };

    $(document).keydown(function() {
        var openDialogs = $('.jQuery-typeToConfirm ul:visible');
        if (openDialogs.length > 0) {
            openDialogs.each(function() {
                $(this).find('input[type=text]').focus();
            });
        }
    });



})(jQuery);




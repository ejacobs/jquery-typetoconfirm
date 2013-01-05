/*!
* jQuery Type to Confirm v0.7
* https://github.com/ejacobs/typetoconfirm
*
* Copyright 2013, Evan Jacobs
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://www.opensource.org/licenses/mit-license.php
* http://www.opensource.org/licenses/GPL-2.0
*/

(function( $ ) {

    $.fn.typeToConfirm = function(options) {

        var settings = $.extend({
            'class'             : 'typeToConfirm',
            'texttotype'        : 'confirm',
            'casesensitive'     : true,
            'beforemessage'     : false,
            'aftermessage'      : 'Please type the word \'{{t}}\' to confirm',    // {{t}} is replace with the textotype setting
            'align'             : 'middle',              // can be left, right if position is above or below
                                                         // can be top, bottom if position is left or right
            'position'          : 'above',               // above, below, left, right, auto
            'arrowmargin'       : 4,
            'dialogmargin'      : 2,
            'charsymbol'        : '*',
            'closeonconfirm'    : true,
            onCreate: function() { },
            onConfirm: function() { }
        }, options);

        var variables = {
            'nextletterindex'   : 0,
            'instantiated'      : false,
            'submitform'        : false,
            'confirmedsubmit'   : false,
            'nextlettertoyype'  : null
        }

        var methods = {
            destroy: function() {
                $(this).next('.confirmDialog').destroy();
            }
        }

        return this.each(function() {

            if ($(this).is('input[type=submit]')) {
                $(this).closest("form").submit(function(e) {
                    if (!variables.confirmedsubmit) {
                        e.preventDefault();
                    }
                });
                variables.submitform = true;
            }

            $(this).after('<div class="confirmDialog" style="display: none; position: absolute;"></div>');
            this.dialogElement = $(this).next('.confirmDialog');
            var onClickCode = $(this).attr('onclick');
            if (onClickCode != undefined) {
                $.data(this, 'executeonconfirm', $(this).attr('onclick'));
                $(this).removeAttr('onclick');
            }

            var newHtml = '<div class="confirmDialogInner '+ settings.class +'"><div class="arrowContainer"></div>';
            newHtml += '<input type="text" title="'+ settings.texttotype +'" style="width: 0; height: 0; float: left;">';
            if (settings.beforemessage) {
                newHtml += '<div class="messageContainer">'+ settings.beforemessage.replace(/\{\{t\}\}/, settings.texttotype) +'</div>';
            }
            newHtml += '<div class="untypedLettersContainer">';
            for ( var i = 0; i < settings.texttotype.length; i++ ) {
                newHtml += settings.charsymbol;
            }
            newHtml += '</div>';
            if (settings.aftermessage) {
                newHtml += '<div class="messageContainer">'+ settings.aftermessage.replace(/\{\{t\}\}/, settings.texttotype) +'</div>';
            }
            newHtml += '<div style="position: absolute; width: 10px; height: 10px; background-color: white"></div></div>';

            this.dialogElement.html(newHtml);

            // In case the user clicks on an element within the dialog, make sure the input stays in focus
            this.dialogElement.find('div').click(function() {
                $(this).closest('div.confirmDialog').find('input[type=text]').focus()
                $(this).focus();
            });


            if(settings.onCreate && typeof settings.onCreate === 'function'){
                settings.onCreate();
            }

            $(this).click(function() {
                var dialogElement = this.dialogElement;
                var dialogElementInner = dialogElement.find('.confirmDialogInner')
                $('.confirmDialog').hide();
                dialogElement.show();

                variables.nextletterindex = 0;
                newConfirmStr = '';
                for (var i = 0; i < settings.texttotype.length; i++) {
                    newConfirmStr += settings.charsymbol;
                }
                dialogElement.find('.untypedLettersContainer').text(newConfirmStr);

                variables.instantiated = true;

                var buttonPos = $(this).position();
                var arrowContainerElement = dialogElement.find(".arrowContainer")
                var arrowSize = arrowContainerElement.height();


                if ((settings.position == 'above') || (settings.position == 'below')) {

                    if (settings.align == 'left') {
                        dialogElement.css('left',  buttonPos.left );
                        arrowContainerElement.css('margin-left', ($(this).outerWidth() / 2) - (arrowSize / 2) );
                    }
                    else if (settings.align == 'right') {
                        dialogElement.css('left',  buttonPos.left - dialogElementInner.outerWidth() + $(this).outerWidth() );
                        arrowContainerElement.css('margin-left', (dialogElementInner.outerWidth()) - ($(this).outerWidth() / 2)  - (arrowSize)  );
                    }
                    else {
                        dialogElement.css('left', (buttonPos.left) - (dialogElementInner.outerWidth() / 2 ) + ($(this).outerWidth() / 2) );
                        arrowContainerElement.css('margin-left', (dialogElementInner.outerWidth() / 2) - (arrowSize / 2) );
                    }


                    if (settings.position == 'below') {
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

                    if (settings.align == 'top') {
                        dialogElement.css('top',  buttonPos.top );
                        arrowContainerElement.css('margin-top', ($(this).outerHeight() / 2) - (arrowSize / 2) );
                    }
                    else if (settings.align == 'bottom') {
                        dialogElement.css('top',  buttonPos.top - dialogElementInner.outerHeight() + $(this).outerHeight() );
                        arrowContainerElement.css('margin-top', (dialogElementInner.outerHeight()) - ($(this).outerHeight() / 2)  - (arrowSize)  );
                    }
                    else {
                        dialogElement.css('top', (buttonPos.top) - (dialogElementInner.outerHeight() / 2 ) + ($(this).outerHeight() / 2) );
                        arrowContainerElement.css('margin-top', (dialogElementInner.outerHeight() / 2) - (arrowSize / 2) );
                    }


                    if (settings.position == 'right') {
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


                dialogElement.find('.confirmDialogInner').css('margin-left',  $(this).css('margin-left'));
                dialogElement.find('.confirmDialogInner').css('margin-top',  $(this).css('margin-top'));



                variables.nextlettertoyype = settings.texttotype.charAt(variables.nextletterindex);
                dialogElement.find('input[type=text]').focus().keypress(function(e) {

                    var typedChar = String.fromCharCode(e.which);
                    if (!settings.casesensitive) {
                        typedChar = typedChar.toLowerCase();
                        variables.nextlettertoyype = variables.nextlettertoyype.toLowerCase();
                    }

                    if (typedChar == variables.nextlettertoyype) {
                        variables.nextletterindex++;
                        variables.nextlettertoyype = settings.texttotype.charAt(variables.nextletterindex);
                        var newConfirmStr = settings.texttotype.substr(0, variables.nextletterindex);

                        for (var i = variables.nextletterindex; i < settings.texttotype.length; i++) {
                            newConfirmStr += settings.charsymbol;
                        }
                        dialogElement.find('.untypedLettersContainer').text(newConfirmStr);

                        if (variables.nextletterindex == settings.texttotype.length) {

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
            });

        });

    };

    // Hide all on esc
    $(document).keydown(function(e) {
        if (e.keyCode == 27) {
            $('.confirmDialog').hide();
        }
    });

    // Hide all on click out
    $(document).click(function(e) {
        var clickedElement = e.target;
        if ( ($(clickedElement).closest('.confirmDialog').length == 0) && ($(clickedElement).next('.confirmDialog').length == 0) ) {
            $('.confirmDialog').hide();
        }
    });

})(jQuery);
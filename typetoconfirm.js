(function( $ ) {
    $.fn.typeToConfirm = function(options) {


        var settings = $.extend({
            'class'           : 'typetoconfirm',
            'texttotype'      : 'confirm',
            'casesensitive'   : true,
            'message'         : 'Please type the word \'{{t}}\' to confirm',    // {{t}} is replace with the textotype setting
            'arrowposition'   : 'middle',                                       // top, bottom, middle
            'position'        : 'above',                                        // above, below, left, right, auto
            'arrowmargintop'  : 4,
            'dialogmargintop' : 8
        }, options);


        var variables = {
            'nextletterindex'   : 0,
            'instantiated'      : false,
            'submitform'        : false,
            'confirmedsubmit'   : false,
            'nextlettertoyype'  : null
        }

        var methods = {

            reset : function(lettersContainer) {
                variables.nextletterindex = 0;
                newConfirmStr = '';
                for (var i = 0; i < settings.texttotype.length; i++) {
                    newConfirmStr += '*';
                }
                lettersContainer.text(newConfirmStr);

                variables.instantiated = true;
            }

        }

        // Hide the popup menus on click out

        return this.each(function() {

            if ($(this).is('input[type=submit]')) {
                $(this).closest("form").submit(function(e) {
                    if (!variables.confirmedsubmit) {
                        e.preventDefault();
                    }
                });
                variables.submitform = true;
            }

            $(this).after('<div class="confirmDialog '+ settings.class +'" style="display: none"></div>');
            this.dialogElement = $(this).next('.confirmDialog');
            var onClickCode = $(this).attr('onclick');
            if (onClickCode != undefined) {
                $.data(this, 'executeonconfirm', $(this).attr('onclick'));
                $(this).removeAttr('onclick');
            }

            var newHtml = '<div class="arrowContainer"></div>';
            newHtml += '<input type="text" title="'+ settings.texttotype +'" style="width: 0; height: 0; float: left;">';
            newHtml += '<div class="untypedletterscontainer">';
            for ( var i = 0; i < settings.texttotype.length; i++ ) {
                newHtml += '*';
            }
            newHtml += '</div>';
            newHtml += '<div class="messagecontainer">'+ settings.message.replace(/\{\{t\}\}/, settings.texttotype) +'</div>';
            newHtml += '<div style="position: absolute; width: 10px; height: 10px; background-color: white"></div>';


            this.dialogElement.html(newHtml);

            // In case the user clicks on an element within the dialog, make sure the input stays in focus
            this.dialogElement.find('div').click(function() {
                $(this).closest('div.confirmDialog').find('input[type=text]').focus()
                $(this).focus();
            });



            $(this).click(function() {
                var dialogElement = this.dialogElement;
                $('.confirmDialog').hide();
                dialogElement.show();

                methods.reset(dialogElement.find('.untypedletterscontainer'));


                // copy start

                var buttonPosition = $(this).position();
                var arrowContainerElement = dialogElement.find("> .arrowContainer")
                var arrowSize = arrowContainerElement.height();

                if (settings.arrowposition == 'middle') {
                    dialogElement.css('margin-left',  ((dialogElement.width() / 2) - ($(this).width() / 2)) * (-1) );

                    arrowContainerElement.css('margin-left', (dialogElement.outerWidth() / 2) - (arrowSize / 2) );

                }
                else if (settings.arrowposition == 'left') {
                    dialogElement.css('left', buttonPosition.left);
                    arrowContainerElement.css('margin-left', ( ($(this).outerWidth() / 2) - (arrowSize) )  );
                }
                else if (settings.arrowposition == 'right') {
                    dialogElement.css('margin-left', (-1) * (dialogElement.outerWidth() - $(this).outerWidth())  );
                    arrowContainerElement.css('margin-left', (dialogElement.outerWidth() - (($(this).outerWidth() / 2) + (arrowSize))  ) );
                }


                dialogElement.css('top', buttonPosition.top + $(this).height() + arrowSize + settings.dialogmargintop);


                var arrowContainerTop = (-arrowSize) - settings.arrowmargintop ;


                arrowContainerElement.css('top', arrowContainerTop + 'px');

                // copy end


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
                            newConfirmStr += '*';
                        }
                        dialogElement.find('.untypedletterscontainer').text(newConfirmStr);

                        if (variables.nextletterindex == settings.texttotype.length) {
                            eval(onClickCode);
                            if (variables.submitform) {
                                variables.confirmedsubmit = true;
                                dialogElement.closest('form').submit();
                            }
                            dialogElement.hide();
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

})(jQuery);
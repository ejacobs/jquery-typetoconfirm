(function( $ ) {
    $.fn.typeToConfirm = function(options) {


        var settings = $.extend({
            'class'           : 'typetoconfirm',
            'texttotype'      : 'confirm',
            'casesensitive'   : true,
            'message'         : 'Please type the word \'{{t}}\' to confirm',    // {{t}} is replace with the textotype setting
            'arrowposition'   : 'middle',                                       // top, bottom, middle
            'position'        : 'above',                                        // above, below, left, right, auto
            'persist'         : false
        }, options);


        var variables = {
            'nextletterindex'   : 0,
            'instantiated'      : false,
            'submitform'        : false
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


        return this.each(function() {

            $(this).after('<div class="confirmDialog '+ settings.class +'" style="display: none">Confirm here</div>');
            this.dialogElement = $(this).next('.confirmDialog');
            var onClickCode = $(this).attr('onclick');
            if (onClickCode != undefined) {
                $.data(this, 'executeonconfirm', $(this).attr('onclick'));
                $(this).removeAttr('onclick');
            }

            var newHtml = '<input type="text" title="'+ settings.texttotype +'" style="width: 0; height: 0; float: left;">';
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
                dialogElement.show();

                if (!settings.persist || !variables.instantiated) {
                    methods.reset(dialogElement.find('.untypedletterscontainer'));
                }


                var nextLetterToType = settings.texttotype.charAt(variables.nextletterindex);
                dialogElement.find('input[type=text]').focus().keypress(function(e) {

                    var typedChar = String.fromCharCode(e.which);
                    if (!settings.casesensitive) {
                        typedChar = typedChar.toLowerCase();
                        nextLetterToType = nextLetterToType.toLowerCase();
                    }

                    if (typedChar == nextLetterToType) {
                        variables.nextletterindex++;
                        nextLetterToType = settings.texttotype.charAt(variables.nextletterindex);
                        var newConfirmStr = settings.texttotype.substr(0, variables.nextletterindex);

                        for (var i = variables.nextletterindex; i < settings.texttotype.length; i++) {
                            newConfirmStr += '*';
                        }
                        dialogElement.find('.untypedletterscontainer').text(newConfirmStr);

                        if (variables.nextletterindex == settings.texttotype.length) {
                            eval(onClickCode);
                            dialogElement.hide();
                        }
                    }
                });
            });



        });

    };
})(jQuery);
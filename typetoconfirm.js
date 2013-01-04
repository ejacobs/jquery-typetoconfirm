(function( $ ) {
    $.fn.typeToConfirm = function(options) {

        var settings = $.extend({
            'position'        : 'above',
            'class'           : 'typetoconfirm'
        }, options);

        return this.each(function() {
            $(this).after('<div class="confirmDialog '+ settings.class +'" style="display: none">Confirm here</div>');
            var onClickCode = $(this).attr('onclick');
            if (onClickCode != undefined) {
                $.data(this, 'executeonconfirm', $(this).attr('onclick'));
                $(this).removeAttr('onclick');
            }

            $(this).click(function() {
                $(this).next('.confirmDialog').show();
            });
        });

    };
})(jQuery);
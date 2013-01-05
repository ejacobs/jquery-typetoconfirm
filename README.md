jQuery TypeToConfirm by Evan Jacobs
=============

Sometimes user actions are major and cannot be undone. In these situations it's a good idea to make sure the user is
absolutely sure they are aware of what they are doing. Type to confirm forces the user to slow down and read a message
and type in a given word in order to proceed.

Usage:
* $('.mySubmitButton').typeToConfirm({texttotype: 'delete'});

Options:
*class: (string) The name of the class to apply to the dialog that appears when the user clicks the button
*texttotype: (string) The string that a user must type to confirm
*casesensitive: (boolean) True of the letters the user types must match the case of texttotype
*beforemessage: (string/html) HTML that comes before the typing area
*aftermessage: (string/html) HTML that comes before the typing area
*align: (auto, middle, top, bottom, left, right) Alignment of the popup dialog in relation to the button. Can be 'left' or 'right' if position is above or below. Can be 'top' or 'bottom' if position is left or right
*position: (above, below, left, right) Where the dialog appears in relation to the button
*arrowmargin: (integer) Number in pixels of margin between the popup dialog and arrow div
*dialogmargin: (integer) Number in pixels of margin between the popup dialog and the button
*charsymbol: (char) Character to be displayed for untyped characters
*closeonconfirm: (boolean) True if the dialog should be closed after the user has typed in the confirmation string


Events:
*onCreate(): Fired when the element is created
*onConfirm(): Fired after the user successfully enters the confirmation string, before any of the other code is executed or a form is submitted
$(function() {
  // Placeholder polyfill
  $('input, textarea').placeholder();

  // Form validation
  $('form').on('submit', function (event) {
    var $form = $(this);
    var valid = true;

    $form.find('input:visible').each(function () {
      var $input = $(this);

      // check for `name` because `type` does not work in IE9 an below.
      switch ($input.attr('name')) {
        case 'email':
          if ($input.val().indexOf('@') < 1) {
            valid = false;
            $input.addClass('invalid').focus();
          } else {
            $input.removeClass('invalid');
          }
          break;
      }
    });

    if (!valid) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
});

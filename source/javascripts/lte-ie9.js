$(function() {
  // Placeholder polyfill
  $('input, textarea').placeholder();

  // Form validation
  $(document).on('submit', 'form', function (event) {
    var $form = $(this);
    var valid = true;

    $form.find('input:visible').each(function () {
      var $input = $(this);

      switch ($input.attr('type')) {
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
      return false;
    }
  });
});

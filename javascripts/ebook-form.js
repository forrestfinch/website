$(function () {
  // These values should be identical to the ones in _highlight.js
  var cookieExpiresOnSubmit = 30;
  var cookiePath = '/';
  var cookiePrefix = 'defacto_';
  var cookieValue = 'hidden';

  // Hide hightlight
  function hideHighlight () {
    var $highlight = $('#highlight-ebook');

    if ($highlight.length == 0) {
      return;
    }

    $highlight.addClass('highlight-hide');

    setTimeout(function () {
      $highlight.remove();
    }, 400);

    var id = $highlight[0].id;
    if (cookieExpiresOnSubmit && id) {
      Cookies.set(cookiePrefix + id, cookieValue, { expires: cookieExpiresOnSubmit, path: cookiePath });
    }
  }

  // Ebook form submit
  $('#ebook-download form').on('submit', function (event) {
    event.preventDefault();

    var ebookUrl = '/pdf/Handboek Leren en laten Leren.pdf';
    var $form = $(this);
    var $submit = $form.find('button[type=submit]');

    // Submit form
    $.ajax({
      type: 'POST',
      url: $form.prop('action'),
      accept: {
        javascript: 'application/javascript'
      },
      data: $form.serialize(),
      beforeSend: function () {
        $submit.prop('disabled', 'disabled');
      }
    }).always(function () {
      $submit.prop('disabled', false);
    });

    // Download ebook
    window.open(ebookUrl, '_blank');

    // hide hightlight
    hideHighlight();
  });
});

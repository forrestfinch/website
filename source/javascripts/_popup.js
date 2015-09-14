// Make sure Popup elements (.popup) have an ID.
var Defacto = Defacto || {};

Defacto.popup = {
  showScrollTop: 100, // pixels scrolled before showing popups
  showDelay: 400, // ms before showing
  cookieExpiresOnClose: 1 / 24 / 60 * 10, // 10 MINUTES till the cookie expires after closing
  cookieExpiresOnSubmit: 30, // DAYS the cookie expires after submitting
  cookiePath: '/',
  cookiePrefix: 'defacto_',
  cookieValue: 'hidden',
  cookies: Cookies.get(),
  $window: $(window),
  popupsShown: false,

  // console.log(Cookies.get()); // show all coockies
  // Cookies.remove('defacto_popup-ebook', { path: '/' }); // remove ebook cookie

  // Hide hightlight
  hide: function ($popup, cookieExpires) {
    $popup.addClass('popup-hide');

    setTimeout(function () {
      $popup.remove();
    }, 400);

    var id = $popup[0].id;
    if (cookieExpires && id) {
      Cookies.set(this.cookiePrefix + id, this.cookieValue,
        { expires: this.cookieExpires, path: this.cookiePath });
    }
  },

  init: function () {
    // Remove popups the user has closed
    $('.popup').each(function () {
      if (this.id && Defacto.popup.cookies[Defacto.popup.cookiePrefix + this.id] === Defacto.popup.cookieValue) {
        $(this).remove();
      }
    });

    // Show popup after scroll
    this.$window.on('scroll', function () {
      if (!Defacto.popup.popupsShown && Defacto.popup.$window.scrollTop() > Defacto.popup.showScrollTop) {
        setTimeout(function () {
          $('.popup').addClass('popup-show');
          Defacto.popup.popupsShown = true;
        }, Defacto.popup.showDelay);
      }
    });

    // Close popup button
    $(document).on('click', '.popup .close', function (event) {
      event.preventDefault();
      var $popup = $(this).closest('.popup');
      Defacto.popup.hide($popup, Defacto.popup.cookieExpiresOnClose);
    });
  }
};

Defacto.popup.init();

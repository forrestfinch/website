;(function($) {
  var pluginName = 'downloadForm';
  var defaults = {
    downloadUrl: undefined
  };

  function Plugin (form, options) {
    this.form = form;
    this.$form = $(this.form);
    this.options = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  Plugin.prototype.init = function () {
    this.options.downloadUrl = this.options.downloadUrl || this.$form.data('download');
    this.$form.on('submit', this.submit.bind(this));
  };

  Plugin.prototype.submit = function (event) {
    event.preventDefault();

    var $submit = this.$form.find('[type=submit]');
    $submit.prop('disabled', 'disabled');

    // Submit form
    $.ajax({
      type: 'POST',
      url: this.$form.prop('action'),
      accept: {
        javascript: 'application/javascript'
      },
      data: this.$form.serialize()
    }).done(function (data, textStatus, jqXHR) {
      // Track conversion
      if (ga) {
        ga('send', 'pageview', '/bedankt/' + this.$form.find('input[name=form]').val());
      }
      // Callback
      if (typeof this.options.onSubmitSuccess === 'function') {
        this.options.onSubmitSuccess(data, textStatus, jqXHR);
      }
    }.bind(this)).always(function () {
      $submit.prop('disabled', false);
    });

    // Open download
    window.open(this.options.downloadUrl, '_blank');
  };

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
      }
    });
  }
})(jQuery);

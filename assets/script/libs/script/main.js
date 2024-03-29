/**
 * refence form (https://github.com/fritx/silent) in 2016.03.25
 * fix by amen2020 in September 25, 2016
*/

(function () {
  var pageBase = 'assets/script/page/';
  var pageExt = 'md';
  var mainPage = location.search.slice(1).replace(/&.*/, '') || 'main_content';
  var mainTitle = '';

  function config() {
    marked.setOptions({
      renderer: new marked.Renderer(),
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false
    });
  }

  function render(data, options, callback) {
    marked(data, options, callback);
  }

  function load(sel, page, isMain, options, callback) {
    isMain = isMain || false;
    var url = pageBase + page + '.' + pageExt;
    $.ajax({
      url: url,
      error: onNotFound,
      success: function (data) {
        render(data, options, function (err, html) {
          if (err && callback) return callback(err);
          var $el = $(sel);
          $el.hide().html(html);

          $el.find('[src]').each(function () {
            var $el = $(this);
            $el.attr('src', function (x, old) {
              if (isAbsolute(old)) {
                return old;
              }
              return url.replace(
                new RegExp('[^\\/]*$', 'g'), ''
              ) + old;
            });
          });

          $el.find('[href]').each(function () {
            var $el = $(this);
            $el.attr('href', function (x, old) {
              if (isAbsolute(old)) {
                $el.attr('target', '_blank');
                return old;
              }
              var prefixed = url.replace(
                new RegExp('^' + pageBase + '|[^\\/]*$', 'g'), ''
              ) + old;
              var regExt = new RegExp('\\.' + pageExt + '$');
              if (!regExt.test(old)) {
                if (!/(^\.|\/\.?|\.html?)$/.test(old)) {
                  $el.attr('target', '_blank');
                }
                return prefixed;
              }
              return '?' + prefixed.replace(regExt, '');
            });
          });

          if (isMain) {
            mainTitle = '未知';
            $('title').text(function (x, old) {
              return old + ' - ' + mainTitle;
            });
          }

          $el.show();
          if (callback) callback();
        });
      }
    });
  }

  function onNotFound() {
    location.href = '.';
  }

  function start() {
    load('#sidebar-page', 'main_sidebar');
    load('#main-page', mainPage, true);
  }

  function isAbsolute(url) {
    return !url.indexOf('//') || !!~url.indexOf('://');
  }

  config();
  start();

})();
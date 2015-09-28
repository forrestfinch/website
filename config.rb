##
# Compass
###

# Change Compass configuration
# compass_config do |config|
#   config.output_style = :compact
# end

###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
# page "/path/to/file.html", layout: false
#
# With alternative layout
# page "/path/to/file.html", layout: :otherlayout
#
# A path which all have the same layout
# with_layout :admin do
#   page "/admin/*"
# end

# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", locals: {
#  which_fake_page: "Rendering a fake page with a local variable" }

# Automatic image dimensions on image_tag helper
# activate :automatic_image_sizes

# Reload the browser automatically whenever files change
# activate :livereload
# activate :livereload, host: "127.0.0.1"

# Blog
Time.zone = "CET"

activate :i18n, mount_at_root: :nl, langs: [:nl, :de]

activate :blog do |blog|
  blog.prefix = "blog"
  blog.permalink = ":title"
  # blog.tag_template = "blog/tag.html"
  # blog.calendar_template = "blog/calendar.html"
  blog.paginate = false
  # blog.per_page = 10
end

page "blog/*", layout: :blog_post_layout
page "blog/index.html", layout: :blog_layout
page "blog/feed.xml", layout: false

activate :directory_indexes

set :css_dir, "stylesheets"
set :js_dir, "javascripts"
set :images_dir, "images"
set :relative_links, true

# Middleman syntax (https://github.com/middleman/middleman-syntax)
activate :syntax #, line_numbers: true

set :markdown_engine, :kramdown
set :markdown, input: "GFM", auto_ids: false

#set :markdown_engine, :redcarpet
#set :markdown, fenced_code_blocks: true, smartypants: true

# Build-specific configuration
configure :build do
  # For example, change the Compass output style for deployment
  activate :minify_css

  # Minify Javascript on build
  activate :minify_javascript

  # Enable cache buster
  activate :asset_hash #, ignore: [%r{^blog}]

  # Use relative URLs
  # activate :relative_assets

  # Or use a different image path
  # set :http_prefix, "/Content/images/"
end

###
# Ready callback
###

ready do
  # validate data/downloads.yml
  validate_downloads(data.downloads)
end

###
# Helpers
###

helpers do
  # Get full locale (eg. nl_NL)
  def full_locale(lang=I18n.locale)
    case lang
      when "en"
        "en_US"
      else
        "#{lang.downcase}_#{lang.upcase}"
    end
  end

  # Get full url
  def full_url(url)
    URI.join("http://www.defacto.nl", url)
  end

  # Use frontmatter for I18n titles
  def page_title(page, appendCompanyName=true)
    appendTitle = appendCompanyName ? " - Defacto" : ""
    return page.data.title.send(I18n.locale) + appendTitle if
      page.data.title.is_a?(Hash) && page.data.title[I18n.locale]
    return page.data.title + appendTitle if page.data.title
    return "Defacto - Developing People"
  end

  # Localize page_classes
  def page_classes(path=current_path.dup, options={})
    # Prevent page classes from being translated
    unless is_default_locale?
      default_path = sitemap.resources.select do |resource|
        resource.proxied_to == current_page.proxied_to &&
          resource.metadata[:options][:lang] == extensions[:i18n].options.mount_at_root
      end.first
      path = default_path.destination_path.dup if default_path
    end
    # Create classes from path
    classes = super(path.sub(/^[a-z]{2}\//, ""), options)
    # Add class if blog post
    classes += " blog_article" if is_blog_article?
    # Prepend language class
    classes.prepend("#{I18n.locale} ")
  end

  # Check if locale is default aka mount_at_root
  def is_default_locale?(locale=I18n.locale)
    locale == extensions[:i18n].options.mount_at_root
  end

  # Localized link_to
  def locale_link_to(*args, &block)
    url_arg_index = block_given? ? 0 : 1
    options_index = block_given? ? 1 : 2
    args[options_index] ||= {}
    options = args[options_index].dup
    args[url_arg_index] = locale_url_for(args[url_arg_index], options)
    link_to(*args, &block)
  end

  # Localized url_for
  def locale_url_for(url, options={})
    locale = options[:locale] || ::I18n.locale
    options[:relative] = false
    url_parts = url.split("#")
    url_parts[0] = extensions[:i18n].localized_path(url_parts[0], locale) || url_parts[0]
    url = url_parts.join("#")
    url_for(url, options)
  end

  # Localized link_to with active class if current_page
  def nav_link_to(text, url, options={})
    is_active = locale_url_for(url.split("#")[0]) == url_for(current_page.url, relative: false)
    options[:class] ||= ""
    options[:class] << " active" if is_active
    locale_link_to(text, url, options)
  end

  # Country flags
  def country_flags
    flag_titles = { nl: "Nederlands", de: "Deutsch", en: "English" }
    html = ""
    (langs - [I18n.locale]).each do |lang|
      img = image_tag("flags/#{lang}.gif", alt: flag_titles[lang])
      locale_root_path = current_page.locale_root_path
      url = locale_root_path && locale_root_path != "/error.html" ? locale_root_path : "/"
      html << locale_link_to(img, url, title: flag_titles[lang], locale: lang)
    end
    html
  end

  # String to markdown
  def markitdown(string)
    # Kramdown::Document.new(string, config[:markdown]).to_html
    # Redcarpet::Markdown.new(Redcarpet::Render::HTML, config[:markdown]).render(string)
    Tilt['markdown'].new { string }.render(scope=self)
  end

  # Get avatar url for team members
  def team_avatar_url(person)
    return person.avatar if person.avatar
    avatar = gravatar_for(person.email)
    return avatar if avatar
    avatar = "/images/team/#{person.firstname.downcase}.jpg"
    return avatar if sitemap.find_resource_by_path(avatar)
    return false
  end

  # Email to gravatar
  def gravatar_for(email)
    return false unless email
    hash = Digest::MD5.hexdigest(email.chomp.downcase)
    url = "http://www.gravatar.com/avatar/#{hash}.png?d=404"
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    request = Net::HTTP::Get.new(uri.request_uri)
    response = http.request(request)
    return response.code.to_i == 404 ? false : url
  end

  # Get blog author
  def blog_author(article)
    author = article.data.author
    author = author.present? ? author.capitalize : author
    data.team.find{ |person| person[:firstname] == author }
  end

  # Used to validate data/downloads.yml
  def validate_downloads(hash)
    hash.each do |key, value|
      if value.is_a?(Hash)
        validate_downloads(value)
      elsif value.is_a?(String)
        unless sitemap.find_resource_by_path(value)
          hash[key] = false
          puts "\033[31mWARNING: Download link does not exist '#{value}'\033[0m"
        end
      end
    end
  end
end

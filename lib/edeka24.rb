# Modules
require_relative 'modules/whitelist'
require_relative 'modules/blacklist'

class Edeka24
  include Blacklist
  include Whitelist
  attr_reader :products
  attr_reader :data

  def initialize
    @products = {}
    @data = {}
  end

  def save_products_json
    parse_sitemap
    parse_products
    File.open('docs/products.json', 'w') { |file| file.write(@products.to_json) }
  end

  private

  def parse_sitemap
    robots_file = Nokogiri::HTML(URI.open('https://www.edeka24.de/robots.txt'))
    sitemap_url_tag = robots_file.content.split("\r\n").select do |e|
      e.include?('sitemap')
    end
    sitemap_url = sitemap_url_tag.first.split(' ').last
    sitemap_urls = Nokogiri::XML(URI.open(sitemap_url)).css('loc').map(&:text)
    sitemap_urls.each do |url|
      @data[url] = Nokogiri::HTML(URI.open(url)).css('loc').map(&:text)
    end
    self
  end

  def parse_products
    @data.first.last.each_with_index do |item, i|
      # guard clauses
      next unless whitelist.any? { |word| item.downcase.include?(word.downcase) }
      next if blacklist.any? { |word| item.downcase.include?(word.downcase) }

      url = item.gsub('https://www.edeka24.de', '')
      name = item.split('/').last.chomp('.html').tr('-', ' ')
      signature = name.downcase.delete(' ').chars.sort(&:casecmp).join
      @products[i] = { name: name, url: url, signature: signature }
    end
    self
  end
end

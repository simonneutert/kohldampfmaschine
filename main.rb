require 'open-uri'
require 'nokogiri'
require 'json'

class Edeka24
  attr_reader :products
  attr_reader :data

  def initialize
    @products = {}
    @data = {}
  end

  def whitelist
    [
      'Lebensmittel', 'Getraenke'
    ]
  end

  def blacklist
    [
      'Wein', 'Spirituosen', 'Sekt',
      'Drogerie', 'Knabber', 'Kaffee',
      'Whisky', 'brot', 'Likoere',
      'Tee', 'Sportlernahrung', 'Kaugummi',
      'Konfituere', 'zucker', 'Wrigleys',
      'Mixgetraenke', 'Riegel', 'Bonbons',
      'Muesli', 'Kuchen', 'Aufstrich',
      'Saefte', 'Trolli', 'Backzutaten',
      'Haribo', 'Marmelade', 'Suesswaren',
      'glutenfrei', 'laktosefrei', 'Essig',
      'Erfrischungsgetraenke'
    ]
  end

  def parse_sitemap
    robots = Nokogiri::HTML(open('https://www.edeka24.de/robots.txt'))
    sitemap_url_tag = robots.content.split("\r\n").select do |e|
      e.include?('sitemap')
    end
    sitemap_url = sitemap_url_tag.first.split(' ').last

    sitemap_xml = Nokogiri::XML(open(sitemap_url))
    sitemap_urls = sitemap_xml.css('loc').map(&:text)

    sitemap_urls.each do |url|
      @data[url] = Nokogiri::HTML(open(url)).css("loc").map(&:text)
    end
    self
  end

  def parse_products
    @data.first.last.each_with_index do |item, i|
      # guard clauses
      next unless whitelist.any? { |word| item.downcase.include?(word.downcase) }
      next if blacklist.any? { |word| item.downcase.include?(word.downcase) }

      url = item.gsub('https://www.edeka24.de', '')
      name = item.split("/").last.chomp(".html").gsub("-", " ")
      signature = name.downcase.delete(" ").chars.sort(&:casecmp).join
      @products[i] = {
        name: name,
        url: url,
        signature: signature
      }
    end
    self
  end

  def save_json
    json_file = "docs/products.json"
    File.open(json_file, 'w') { |file| file.write(@products.to_json) }
  end
end

Edeka24.new.parse_sitemap.parse_products.save_json

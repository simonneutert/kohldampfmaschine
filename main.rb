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

  def parse_sitemap
    robots = Nokogiri::HTML(open('https://www.edeka24.de/robots.txt'))
    sitemap_url = robots.content.split("\r\n").select { |e| e.include?('sitemap') }.first.split(' ').last

    sitemap_xml = Nokogiri::XML(open(sitemap_url))
    sitemap_urls = sitemap_xml.css('loc').map(&:text)

    sitemap_urls.each { |url| @data[url] = Nokogiri::HTML(open(url)).css("loc").map(&:text) }
    self
  end

  def parse_products
    @data.first.last.each do |item|
      url = item
      name = item.split("/").last.chomp(".html").gsub("-", " ")
      signature = name.downcase.delete(" ").chars.sort(&:casecmp).join
      @products[url] = {
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

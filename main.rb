# Gems
require 'open-uri'
require 'nokogiri'
require 'json'
# Classes
require_relative 'lib/edeka24'

# Execution
Edeka24.new.save_products_json

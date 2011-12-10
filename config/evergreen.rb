#require 'capybara/envjs'

Evergreen.configure do |config|
#  config.driver = :envjs
  config.public_dir = 'src'
  config.template_dir = 'templates'
  config.spec_dir = 'spec'
end


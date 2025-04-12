require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module WeatherApp
  class Application < Rails::Application
    config.load_defaults 8.0

    config.assets.enabled = false

  end
end

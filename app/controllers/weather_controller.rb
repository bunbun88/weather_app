require 'net/http'
require 'json'
require 'uri'

class WeatherController < ApplicationController
  def index
  end

  def search
    city = params[:city]
    lat = params[:lat]
    lng = params[:lng]
    api_key = ENV["OPENWEATHER_API_KEY"]

    if lat.present? && lng.present?
      current_url = "https://api.openweathermap.org/data/2.5/weather?lat=#{lat}&lon=#{lng}&appid=#{api_key}&units=metric&lang=ja"
      forecast_url = "https://api.openweathermap.org/data/2.5/forecast?lat=#{lat}&lon=#{lng}&appid=#{api_key}&units=metric&lang=ja"
    elsif city.present?
      current_url = "https://api.openweathermap.org/data/2.5/weather?q=#{URI.encode_www_form_component(city)}&appid=#{api_key}&units=metric&lang=ja"
      forecast_url = "https://api.openweathermap.org/data/2.5/forecast?q=#{URI.encode_www_form_component(city)}&appid=#{api_key}&units=metric&lang=ja"
    else
      flash[:alert] = "都市名または座標を指定してください。"
      redirect_to root_path
      return
    end
  
    current_response = Net::HTTP.get(URI(current_url))
    current_data = JSON.parse(current_response)  
    forecast_response = Net::HTTP.get(URI(forecast_url))
    forecast_data = JSON.parse(forecast_response)

    if forecast_data["cod"] == "200"
      today_forecast = forecast_data["list"].first

      chart_data = forecast_data["list"].map do |forecast|
        time_utc = Time.parse(forecast["dt_txt"])
        time_jst = time_utc + (9 * 60 * 60)
      
        {
          time: time_jst.strftime("%Y-%m-%d %H:%M:%S"),
          temp: forecast["main"]["temp"]
        }
      end
      
      render json: {
        name: forecast_data["city"]["name"],
        temp: today_forecast["main"]["temp"],
        humidity: today_forecast["main"]["humidity"],
        wind_speed: today_forecast["wind"]["speed"],
        description: today_forecast["weather"][0]["description"],
        icon: "https://openweathermap.org/img/wn/#{force_day_icon(today_forecast["weather"][0]["icon"])}.png",
        chart_data: chart_data,
        current_data: {
          date: Time.at(current_data["dt"]).strftime("%Y-%m-%d %H:%M:%S"),
          name: current_data["name"],
          temp: current_data["main"]["temp"],
          humidity: current_data["main"]["humidity"],
          wind_speed: current_data["wind"]["speed"],
          description: current_data["weather"][0]["description"],
          icon: "https://openweathermap.org/img/wn/#{force_day_icon(current_data["weather"][0]["icon"])}.png"
        }
      }
    else
      render json: { error: "都市が見つかりません" }, status: :not_found
    end
  end

  def force_day_icon(icon_code)
    icon_code.gsub("n", "d")
  end
end

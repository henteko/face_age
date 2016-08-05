require 'sinatra'
require 'sinatra/json'
require 'microsoft_computer_vision'
require 'json'

set :public_folder, File.dirname(__FILE__) + '/public'

get '/' do
  erb :index
end

post '/api/v1/age' do
  file = params[:file][:tempfile]
  res = MicrosoftComputerVision::Client.new(ENV['SUBSCRIPTION_KEY']).analyze(file.path, {visual_features: 'Faces'})
  data = JSON.parse(res.body)
  result = {
      error: false,
      faces: data['faces']
  }

  result = {error: true} if result[:faces].nil?
  json result
end

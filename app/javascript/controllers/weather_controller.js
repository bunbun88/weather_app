import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["city", "result", "chart", "loader"];

  search(event) {
    event.preventDefault();
    const city = this.cityTarget.value;

    if (!city) {
      this.resultTarget.innerHTML = "<p style='color: red;'>都市名を入力してください。</p>";
      return;
    }

    this.loaderTarget.classList.add("is-loading");

    fetch(`/weather/search?city=${encodeURIComponent(city)}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          this.resultTarget.innerHTML = `<p style="color: red;">${data.error}</p>`;
          return;
        }

        this.resultTarget.innerHTML = `
          <h2 class="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 text-center text-xl rounded-md shadow-sm mt-6 mb-4">
            <span>現在の${data.current_data.name}</span>
          </h2>
          <div class="flex">
            <div class="w-1/2 bg-white rounded-lg shadow-md p-6 mt-2 border border-gray-200">
              <div class="flex flex-col mb-2">
                <p class="text-gray-700 mr-2">天気: <span class="font-medium">${data.current_data.description}</span></p>
                <img src="${data.current_data.icon}" alt="${data.current_data.description}" class="w-24 h-24">
              </div>
            </div>
            <div class="w-1/2 bg-white rounded-lg shadow-md p-6 mt-2 border border-gray-200">
              <p class="text-gray-700 mb-2">日時: <span class="font-medium">${data.current_data.date}</span></p>
              <p class="text-gray-700 mb-2">気温: <span class="font-medium">${data.current_data.temp}°C</span></p>
              <p class="text-gray-700 mb-2">湿度: <span class="font-medium">${data.current_data.humidity}%</span></p>
              <p class="text-gray-700 mb-2 wind-speed">風速: <span class="font-medium">${data.current_data.wind_speed} m/s</span></p>
            </div>
          </div>
          <h2 class="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 text-center text-xl rounded-md shadow-sm mt-6 mb-4">
              <span>５日間の気温変化</span>
          </h2>
          <div class="bg-white rounded-lg shadow-md p-6 mt-6 border border-gray-200">  
            <canvas id="weather-chart" data-weather-target="chart"></canvas>
          </div>
        `;

        this.updateChart(data.chart_data);
      })
      .catch(error => {
        console.error("API Error:", error);
        this.resultTarget.innerHTML = `<p style="color: red;">APIエラーが発生しました。</p>`;
      })
      .finally(() => {
        // ローダー非表示
        this.loaderTarget.classList.remove("is-loading");
      });
  }

  updateChart(chartData) {
    const ctx = this.chartTarget.getContext("2d");

    if (this.weatherChart) {
      this.weatherChart.destroy();
    }

    this.weatherChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: chartData.map(d => d.time),
        datasets: [{
          label: "気温 (°C)",
          data: chartData.map(d => d.temp),
          borderColor: "blue",
          backgroundColor: "rgba(0, 0, 255, 0.2)",
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: { display: true, text: "時間" }
          },
          y: {
            title: { display: true, text: "気温 (°C)" }
          }
        }
      }
    });
  }
}

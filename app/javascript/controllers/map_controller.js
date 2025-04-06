import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["select", "result", "chart", "loader"];

  connect() {
    this.initMap();
  }

  initMap() {
    const map = new google.maps.Map(this.selectTarget, {
      center: { lat: 34.6937, lng: 135.5023 },
      zoom: 10,
    });

    google.maps.event.addListener(map, 'click', (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      this.searchWeather(lat, lng);
    });
  }

  searchWeather(lat, lng) {
    this.loaderTarget.classList.add("is-loading");

    fetch(`/weather/search?lat=${lat}&lng=${lng}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        this.resultTarget.innerHTML = `<p style="color: red;">${data.error}</p>`;
        return;
      }

      this.resultTarget.innerHTML = `
        <h2 class="bg-animate">
          <span class="bg-wrap"><span class="text-animate">現在の${data.current_data.name}</span></span>
        </h2>
        <p>日時: ${data.current_data.date}</p>
        <p>気温: ${data.current_data.temp}°C</p>
        <p>湿度: ${data.current_data.humidity}%</p>
        <p class="wind-speed">風速: ${data.current_data.wind_speed} m/s</p>
        <div style="display: flex; align-items: center;">
          <p style="margin-right: 10px;">天気: ${data.current_data.description}</p>
          <img src="${data.current_data.icon}" alt="${data.current_data.description}" style="width: 50px; height: 50px;">
        </div>
        <p>
          <h2 class="bg-animate">
            <span class="bg-wrap"><span class="text-animate">５日間の気温変化</span></span>
          </h2>
        </p>
      `;

      this.updateChart(data.chart_data);
    })
    .catch(error => {
      console.error("API Error:", error);
      this.resultTarget.innerHTML = `<p style="color: red;">APIエラーが発生しました。</p>`;
    })
    .finally(() => {
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

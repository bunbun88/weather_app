// app/javascript/controllers/tom_select_city_controller.js
import { Controller } from "@hotwired/stimulus";
import TomSelect from "tom-select";

export default class extends Controller {

  connect() {
    this.initializeTomSelect();
  }

  initializeTomSelect() {
    let settings = {
      maxItems: 1,
      hideSelected: true,
      hidePlaceholder: true,
      render: {
        option: function(data, escape) {
          return `<div><img src="${data.image}" style="width: 80px; height: 80px;">${escape(data.text)}</div>`;
        }
      }
    }
    new TomSelect(this.element, settings);
  }
}
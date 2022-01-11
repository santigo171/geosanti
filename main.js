let departments = [];
const data_list = document.getElementById("data_list");
const data_total = document.getElementById("data_total");
let data_total_value = 0;

function percentageToColor(percentage) {
  if (percentage == 0 || isNaN(percentage)) return "#CAF0F8";
  else if (percentage > 15) return "#03045E";
  else if (percentage > 10) return "#0077B6";
  else if (percentage > 5) return "#00B4D8";
  else if (percentage > 0) return "#6CD5EA";
}

function percentageToColorText(percentage) {
  if (percentage == 0 || isNaN(percentage)) return "#6CD5EA";
  else if (percentage > 15) return "#03045E";
  else if (percentage > 10) return "#023E8A";
  else if (percentage > 5) return "#0077B6";
  else if (percentage > 0) return "#0096C7";
}

class Map {
  constructor() {}

  static updateDataTotal() {
    data_total_value = 0;
    departments.forEach((department) => {
      data_total_value += Number(department.getValue());
    });

    data_total.innerText = data_total_value;
  }

  static updateMap() {
    Map.updateDataTotal();
    departments.forEach((department) => {
      department.fillColor();
      department.updatePercentage();
    });
  }
}

class Department {
  constructor(svg) {
    this.title = svg.attributes.title.value;
    this.id = svg.attributes.class.value.replace("CO ", "");
    this.svg = svg;
    this.insertInDom();
    this.getValue();
  }

  insertInDom() {
    data_list.innerHTML += `
    <div class="root__left__options--data__form">
    <label>${this.title}</label>
    <input 
    id="${this.id}"
    type="number"
    min="0"
    value="${Math.floor(Math.random() * (10_000_000 - 200 + 1) + 200)}"
    onfocus="Department.onfocus(this)"
    onfocusout="Department.onfocusout(this)"/>
    <p class="center" id="percentage_${this.id}">0%</p>
    </div>
    `;
  }

  getValue() {
    return document.getElementById(this.id).value;
  }

  getPercentage() {
    const value = Number(this.getValue());
    return (value / data_total_value) * 100;
  }

  fillColor() {
    this.svg.style.fill = percentageToColor(this.getPercentage());
    this.svg.style.stroke = "#fff";
    this.svg.style.strokeWidth = "1px";
  }

  updatePercentage() {
    const percentage_tag = document.getElementById("percentage_" + this.id);
    const percentage = this.getPercentage();
    percentage_tag.style.color = percentageToColorText(percentage);
    percentage_tag.innerText = `${
      isNaN(percentage) ? 0 : Math.floor(percentage)
    }%`;
  }

  static onfocus(element) {
    if (element.value <= 0) {
      element.value = "";
    }
  }

  static onfocusout(element) {
    if (element.value == "") {
      element.value = 0;
    }

    Map.updateMap();
  }
}

function run() {
  const svg = document.getElementById("svg").contentDocument;
  const departments_raw = svg.getElementsByClassName("CO");

  for (let i in departments_raw) {
    if (isNaN(i)) continue;
    departments.push(new Department(departments_raw[i]));
  }

  Map.updateMap();
}

setTimeout(run, 100);

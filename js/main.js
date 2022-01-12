let departments = [];
const data_list = document.getElementById("data_list");
const data_total = document.getElementById("data_total");
const svgObject = document.getElementById("svg");
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

function numberWithCommas(x) {
  // From stackoverflow xd
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

  static download() {
    const loader = document.getElementById("loader");
    loader.style.display = "block";

    setTimeout(() => {
      const svg = svgObject.contentDocument.children[0];
      svgExport.downloadSvg(
        svg, // SVG DOM Element object to be exported. Alternatively, a string of the serialized SVG can be passed
        "svg", // chart title: file name of exported image
        { width: 1612, height: 1693 } // options (optional, please see below for a list of option properties)
      );
      loader.style.display = "none";
    }, 300);
  }
}

class Department {
  constructor(svg) {
    this.title = svg.attributes.title.value;
    this.id = svg.attributes.class.value.replace("CO ", "");
    this.locationy = Number(svg.attributes.locationy.value);
    this.locationx = Number(svg.attributes.locationx.value);
    this.sizeModifier = svg.attributes.sizemodifier
      ? Number(svg.attributes.sizemodifier.value)
      : 1;
    this.isTextOnScreen = false;
    this.svg = svg;
    this.svg.style.stroke = "#fff";
    this.svg.style.strokeWidth = "1px";
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
    value="0"
    onfocus="Department.onfocus(this)"
    onfocusout="Department.onfocusout(this)"
    />
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

  insertText() {
    if (this.isTextOnScreen) {
      this.titleText.remove();
      this.valueText.remove();
    }

    const titleText = Department.createSvgText(
      this.title,
      this.locationy,
      this.locationx,
      "title"
    );

    const valueText = Department.createSvgText(
      numberWithCommas(this.getValue()),
      this.locationy + 16 * this.sizeModifier,
      this.locationx,
      "value"
    );

    this.isTextOnScreen = true;
    this.titleText = titleText;
    this.valueText = valueText;
    this.svg.parentElement.appendChild(titleText);
    this.svg.parentElement.appendChild(valueText);
    titleText.style.fontSize = this.adjustFontSize(titleText);
    valueText.style.fontSize = this.adjustFontSize(valueText);
    this.fillText(titleText, valueText);
  }

  fillText(titleText, valueText) {
    const percentage = this.getPercentage();

    let fillColor = "#03045E";
    let borderColor = this.svg.style.fill;
    // let borderColor = "#bedfe6";

    if (percentage > 10) {
      fillColor = "#fff";
      // borderColor = "#03045E";
    }

    titleText.style.fill = fillColor;
    valueText.style.fill = fillColor;
    titleText.style.textShadow = Department.generateTextShadow(
      borderColor,
      0.5
    );
    valueText.style.textShadow = Department.generateTextShadow(
      borderColor,
      0.5
    );
  }

  static generateTextShadow(color, scale) {
    return `${2 * scale}px 0 0 ${color},
    ${-2 * scale}px 0 0 ${color},
    0 ${2 * scale}px 0 ${color},
    0 ${-2 * scale}px 0 ${color},
    ${1 * scale}px ${1 * scale}px ${color},
    ${-1 * scale}px ${-1 * scale}px 0 ${color},
    ${1 * scale}px ${-1 * scale}px 0 ${color},
    ${-1 * scale}px ${1 * scale}px 0 ${color}`;
  }

  static createSvgText(content, y, x, class_) {
    const svgText = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );

    svgText.setAttribute("y", y);
    svgText.setAttribute("x", x);
    svgText.setAttribute("class", class_);
    svgText.appendChild(document.createTextNode(content));
    return svgText;
  }

  adjustFontSize(element) {
    const fontSize = Number(
      window.getComputedStyle(element).fontSize.slice(0, -2)
    );
    return fontSize * this.sizeModifier;
  }

  fillColor() {
    this.svg.style.fill = percentageToColor(this.getPercentage());
    this.insertText();
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
  const svg = svgObject.contentDocument;
  const departments_raw = svg.getElementsByClassName("CO");

  for (let i in departments_raw) {
    if (isNaN(i)) continue;
    departments.push(new Department(departments_raw[i]));
  }

  Map.updateMap();
}

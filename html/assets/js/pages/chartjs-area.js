let bodyFont = getComputedStyle(document.body).fontFamily.trim(),
  BasiAreaChart = new CustomChartJs({
    selector: "#basic-area-chart",
    options: () => ({
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
        datasets: [
          {
            label: "User Signups",
            data: [120, 150, 180, 210, 190, 230, 250, 270, 300],
            backgroundColor: ins("chart-primary-rgb", 0.3),
            borderColor: ins("chart-primary"),
            fill: !0,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      },
      options: {
        interaction: { mode: "index", intersect: !1 },
        plugins: {
          legend: { display: !1 },
          tooltip: { enabled: !0, mode: "index", intersect: !1 },
        },
      },
    }),
  }),
  DiffDatasetAreaChart = new CustomChartJs({
    selector: "#different-dataset-area-chart",
    options: () => ({
      type: "line",
      data: {
        labels: ["0", "1", "2", "3", "4", "5", "6", "7"],
        datasets: [
          {
            label: "Current Month",
            data: [50, 42, 38, 35, 40, 50, 48, 47],
            fill: !0,
            borderColor: ins("chart-secondary"),
            backgroundColor: ins("chart-secondary-rgb", 0.2),
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 1,
          },
          {
            label: "Past Month",
            data: [60, 55, 50, 45, 50, 58, 55, 53],
            fill: !0,
            borderColor: ins("chart-gray"),
            backgroundColor: ins("chart-gray-rgb", 0.2),
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 1,
          },
        ],
      },
      options: {
        interaction: { mode: "index", intersect: !1 },
        plugins: {
          legend: {
            display: !0,
            position: "top",
            labels: {
              font: { family: bodyFont },
              color: ins("secondary-color"),
              usePointStyle: !0,
              pointStyle: "circle",
              boxWidth: 8,
              boxHeight: 8,
              padding: 15,
            },
          },
          tooltip: {
            enabled: !0,
            titleFont: { family: bodyFont },
            bodyFont: { family: bodyFont },
          },
        },
      },
    }),
  });
function randomSmoothData(a, o = 30, t = 100) {
  return Array.from(
    { length: a },
    () => Math.floor(Math.random() * (t - o + 1)) + o
  );
}
let StackedChart = new CustomChartJs({
    selector: "#stacked-area-chart",
    options: () => ({
      type: "line",
      data: {
        labels: ["0", "1", "2", "3", "4", "5", "6", "7"],
        datasets: [
          {
            label: "Wave A1",
            data: randomSmoothData(9, 60, 90),
            fill: !0,
            borderColor: ins("chart-gray"),
            backgroundColor: ins("chart-gray-rgb", 0.2),
            tension: 0.5,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: "Wave A2",
            data: randomSmoothData(9, 40, 65),
            fill: !0,
            borderColor: ins("chart-secondary"),
            backgroundColor: ins("chart-secondary-rgb", 0.1),
            tension: 0.5,
            pointRadius: 0,
            borderWidth: 1,
          },
          {
            label: "Wave B1",
            data: randomSmoothData(9, 30, 55),
            fill: !0,
            borderColor: ins("chart-primary"),
            backgroundColor: ins("chart-primary-rgb", 0.2),
            tension: 0.5,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: "Wave B2",
            data: randomSmoothData(9, 15, 35),
            fill: !0,
            borderColor: ins("chart-dark"),
            backgroundColor: ins("chart-dark-rgb", 0.1),
            tension: 0.5,
            pointRadius: 0,
            borderWidth: 1,
          },
        ],
      },
      options: {
        interaction: { mode: "index", intersect: !1 },
        plugins: {
          legend: {
            display: !0,
            position: "top",
            labels: {
              font: { family: bodyFont },
              color: ins("secondary-color"),
              usePointStyle: !0,
              pointStyle: "circle",
              boxWidth: 8,
              boxHeight: 8,
              padding: 15,
            },
          },
          tooltip: {
            enabled: !0,
            titleFont: { family: bodyFont },
            bodyFont: { family: bodyFont },
          },
        },
      },
    }),
  }),
  BoundariesChart = new CustomChartJs({
    selector: "#boundaries-area-chart",
    options: () => ({
      type: "line",
      data: {
        labels: ["Jan", "Feb", "March", "April", "May", "June"],
        datasets: [
          {
            label: "Fully Rounded",
            data: [12.5, -19.4, 14.3, -15, 10.8, -10.5],
            borderColor: ins("chart-primary"),
            fill: !1,
          },
        ],
      },
      options: {
        responsive: !0,
        maintainAspectRatio: !1,
        plugins: { legend: { display: !1 } },
      },
    }),
  }),
  DrawTimeAreaChart = new CustomChartJs({
    selector: "#draw-time-chart",
    options: () => ({
      type: "line",
      data: {
        labels: ["Jan", "Feb", "March", "April", "May", "June"],
        datasets: [
          {
            label: "Fully Rounded",
            data: [10, 20, 15, 35, 38, 24],
            borderColor: ins("chart-gray"),
            backgroundColor: ins("chart-gray-rgb", 0.3),
            fill: !0,
            borderWidth: 2,
          },
          {
            label: "Small Radius",
            data: [24, 38, 35, 15, 20, 10],
            borderColor: ins("chart-dark"),
            backgroundColor: ins("chart-dark-rgb", 0.3),
            borderWidth: 2,
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: !0,
        maintainAspectRatio: !1,
        plugins: { legend: { display: !1 } },
      },
    }),
  });

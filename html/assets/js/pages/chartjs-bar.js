let bodyFont = getComputedStyle(document.body).fontFamily.trim(),
  BasicBarChart = new CustomChartJs({
    selector: "#basic-bar-chart",
    options: () => ({
      type: "bar",
      data: {
        labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        datasets: [
          {
            data: [4, 4, 5, 6, 8, 5, 4, 6, 8, 5],
            backgroundColor: ins("chart-primary"),
            borderRadius: 4,
            borderSkipped: !1,
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
  BorderRadiusChart = new CustomChartJs({
    selector: "#border-radius-bar-chart",
    options: () => ({
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "March", "April", "May", "June"],
        datasets: [
          {
            label: "Fully Rounded",
            data: [12, -19, 14, -15, 12, -14],
            borderColor: ins("chart-gray"),
            backgroundColor: ins("chart-gray-rgb", 0.2),
            borderWidth: 2,
            borderRadius: Number.MAX_VALUE,
            borderSkipped: !1,
          },
          {
            label: "Small Radius",
            data: [-10, 19, -15, -8, 12, -7],
            borderColor: ins("chart-primary"),
            backgroundColor: ins("chart-primary-rgb", 0.2),
            borderWidth: 2,
            borderRadius: 5,
            borderSkipped: !1,
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
  FloatingBarChart = new CustomChartJs({
    selector: "#floating-bar-chart",
    options: () => ({
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "March", "April", "May", "June"],
        datasets: [
          {
            label: "Fully Rounded",
            data: [12, -19, 14, -15, 12, -14],
            backgroundColor: ins("chart-primary"),
          },
          {
            label: "Small Radius",
            data: [-10, 19, -15, -8, 12, -7],
            backgroundColor: ins("chart-gray"),
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
  HorizontalBarChart = new CustomChartJs({
    selector: "#horizontal-bar-chart",
    options: () => ({
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "March", "April"],
        datasets: [
          {
            label: "Fully Rounded",
            data: [12, -19, 14, -15],
            borderColor: ins("chart-gray"),
            backgroundColor: ins("chart-gray-rgb", 0.2),
            borderWidth: 1,
          },
          {
            label: "Small Radius",
            data: [-10, 19, -15, -8],
            borderColor: ins("chart-primary"),
            backgroundColor: ins("chart-primary-rgb", 0.2),
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y",
        elements: { bar: { borderWidth: 2 } },
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
  StackedBarChart = new CustomChartJs({
    selector: "#stacked-bar-chart",
    options: () => ({
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "March", "April", "May"],
        datasets: [
          {
            label: "Dataset 1",
            data: [12, -19, 14, -15, 8, 10],
            backgroundColor: ins("chart-gray"),
          },
          {
            label: "Dataset 2",
            data: [-10, 19, -15, -8, 12, 6],
            backgroundColor: ins("chart-secondary"),
          },
          {
            label: "Dataset 3",
            data: [-5, 14, -10, -12, 7, 4],
            backgroundColor: ins("chart-primary"),
          },
          {
            label: "Dataset 4",
            data: [8, -12, 10, -6, 15, -3],
            backgroundColor: ins("chart-dark"),
          },
        ],
      },
      options: {
        scales: {
          x: {
            stacked: !0,
            ticks: {
              font: { family: bodyFont },
              color: ins("secondary-color"),
              display: !0,
              drawTicks: !0,
            },
            grid: { display: !1, drawBorder: !1 },
            border: { display: !1 },
          },
          y: {
            stacked: !0,
            ticks: {
              font: { family: bodyFont },
              color: ins("secondary-color"),
            },
            grid: {
              display: !0,
              drawBorder: !1,
              color: ins("chart-border-color"),
              lineWidth: 1,
            },
            border: { display: !1, dash: [5, 5] },
          },
        },
        plugins: { legend: { display: !1 } },
      },
    }),
  }),
  StackedGroupsChart = new CustomChartJs({
    selector: "#stacked-groups-bar-chart",
    options: () => ({
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "March", "April"],
        datasets: [
          {
            label: "Dataset 1",
            data: [12, -19, 14, -15],
            backgroundColor: ins("chart-dark"),
            stack: "Stack 0",
          },
          {
            label: "Dataset 2",
            data: [-10, 19, -15, -8],
            backgroundColor: ins("chart-primary"),
            stack: "Stack 0",
          },
          {
            label: "Dataset 3",
            data: [-10, 19, -15, -8],
            backgroundColor: ins("chart-gray"),
            stack: "Stack 1",
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
  VerticalChart = new CustomChartJs({
    selector: "#vertical-bar-chart",
    options: () => ({
      type: "bar",
      data: {
        labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        datasets: [
          {
            label: "Dataset 1",
            data: [4, 4, 5, 6, 8, 5, 4, 6, 8, 5],
            backgroundColor: ins("chart-dark"),
            borderRadius: 4,
            barThickness: 8,
          },
          {
            label: "Dataset 2",
            data: [3, 5, 4, 7, 6, 5, 6, 7, 5, 4],
            backgroundColor: ins("chart-primary"),
            borderRadius: 4,
            barThickness: 8,
          },
          {
            label: "Dataset 3",
            data: [5, 3, 6, 4, 7, 6, 5, 4, 6, 7],
            backgroundColor: ins("chart-secondary"),
            borderRadius: 4,
            barThickness: 8,
          },
        ],
      },
    }),
  });

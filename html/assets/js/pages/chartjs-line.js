let bodyFont = getComputedStyle(document.body).fontFamily.trim(),
  BasicLineChart = new CustomChartJs({
    selector: "#basic-line-chart",
    options: () => ({
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Fully Rounded",
            data: [32, 42, 42, 62, 52, 75, 62],
            borderColor: ins("chart-gray"),
            backgroundColor: ins("chart-gray-rgb", 0.2),
            fill: !0,
            borderWidth: 2,
          },
          {
            label: "Small Radius",
            data: [42, 58, 66, 93, 82, 105, 92],
            fill: !0,
            borderColor: ins("chart-primary"),
            backgroundColor: ins("chart-gray-rgb", 0.2),
            borderDash: [5, 5],
            tension: 0.4,
            borderWidth: 3,
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
  InterpolationChart = new CustomChartJs({
    selector: "#interpolation-chart",
    options: () => ({
      type: "line",
      data: {
        labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        datasets: [
          {
            label: "Revenue Growth",
            data: [0, 10, 25, 40, 55, 70, NaN, 90, 80, 100, 85, 95, 110],
            borderColor: ins("chart-primary"),
            backgroundColor: ins("chart-primary-rgb", 0.2),
            fill: !1,
            tension: 0.4,
          },
          {
            label: "User Engagement",
            data: [5, 15, 30, 45, 50, 65, NaN, 75, 70, 95, 90, 85, 100],
            borderColor: ins("chart-dark"),
            backgroundColor: ins("chart-dark-rgb", 0.2),
            fill: !1,
            tension: 0.4,
          },
          {
            label: "Conversion Rate",
            data: [2, 8, 20, 30, 40, 55, NaN, 60, 55, 75, 70, 65, 80],
            borderColor: ins("chart-gray"),
            backgroundColor: ins("chart-gray-rgb", 0.2),
            fill: !1,
            tension: 0.4,
          },
        ],
      },
      options: { interaction: { mode: "index", intersect: !1 } },
    }),
  }),
  MultiAxisChart = new CustomChartJs({
    selector: "#multi-axes-chart",
    options: () => ({
      type: "line",
      data: {
        labels: ["Jan", "Feb", "March", "April", "May", "June", "July"],
        datasets: [
          {
            label: "Date One",
            data: [12, -19, 14, -15, 18, -14, -7],
            borderColor: ins("chart-dark"),
            backgroundColor: ins("chart-dark-rgb", 0.2),
            borderWidth: 1.5,
            yAxisID: "y",
            tension: 0.4,
          },
          {
            label: "Data Two",
            data: [-10, 19, -15, -8, -17, 12, 8],
            backgroundColor: ins("chart-gray-rgb", 0.2),
            borderColor: ins("chart-gray"),
            borderWidth: 1.5,
            yAxisID: "y1",
            tension: 0.4,
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
        scales: {
          x: {
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
            type: "linear",
            display: !0,
            position: "left",
            grid: {
              display: !0,
              drawBorder: !1,
              color: ins("chart-border-color"),
              lineWidth: 1,
            },
            border: { display: !1, dash: [5, 5] },
            ticks: {
              font: { family: bodyFont },
              color: ins("secondary-color"),
            },
          },
          y1: {
            type: "linear",
            display: !0,
            position: "right",
            grid: { drawOnChartArea: !1 },
            ticks: {
              font: { family: bodyFont },
              color: ins("secondary-color"),
            },
          },
        },
      },
    }),
  }),
  PointChart = new CustomChartJs({
    selector: "#point-styling-chart",
    options: () => ({
      type: "line",
      data: {
        labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"],
        datasets: [
          {
            label: "Dataset 1",
            data: [12, -19, 14, -15, 14, -8],
            borderColor: ins("chart-primary"),
            backgroundColor: ins("chart-primary-rgb", 0.2),
            pointStyle: "circle",
            pointRadius: 10,
            pointHoverRadius: 15,
          },
          {
            label: "Dataset 2",
            data: [-10, 15, -12, 18, -8, 10],
            borderColor: ins("chart-gray"),
            backgroundColor: ins("chart-gray-rgb", 0.2),
            pointStyle: "rectRounded",
            pointRadius: 8,
            pointHoverRadius: 12,
          },
          {
            label: "Dataset 3",
            data: [5, -5, 10, -10, 7, -3],
            borderColor: ins("chart-dark"),
            backgroundColor: ins("chart-dark-rgb", 0.2),
            pointStyle: "triangle",
            pointRadius: 9,
            pointHoverRadius: 13,
          },
        ],
      },
    }),
  }),
  skipped = (a, r) => (a.p0.skip || a.p1.skip ? r : void 0),
  down = (a, r) => (a.p0.parsed.y > a.p1.parsed.y ? r : void 0),
  LineSegmentChart = new CustomChartJs({
    selector: "#line-segment-chart",
    options: () => ({
      type: "line",
      data: {
        labels: ["Jan", "Feb", "March", "April", "May", "June", "July"],
        datasets: [
          {
            label: "Dataset 1",
            data: [65, 59, NaN, 48, 56, 57, 40],
            borderColor: ins("chart-dark"),
            backgroundColor: ins("chart-dark-rgb", 0.2),
            spanGaps: !0,
            segment: {
              borderColor: (a) =>
                skipped(a, ins("chart-dark-rgb", 0.2)) ||
                down(a, ins("danger")),
              borderDash: (a) => skipped(a, [3, 6]),
            },
          },
        ],
      },
    }),
  }),
  SteppedLineChart = new CustomChartJs({
    selector: "#stepped-line-chart",
    options: () => ({
      type: "line",
      data: {
        labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"],
        datasets: [
          {
            label: "Dataset 1",
            data: [12, -19, 14, -15, 14, -8],
            borderColor: ins("chart-primary"),
            backgroundColor: ins("chart-primary-rgb", 0.2),
            fill: !1,
            stepped: !0,
          },
        ],
      },
    }),
  });

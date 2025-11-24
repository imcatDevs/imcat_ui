let bodyFont = getComputedStyle(document.body).fontFamily.trim(),
  MultiPieChart = new CustomChartJs({
    selector: "#multi-pie-chart",
    options: () => ({
      type: "doughnut",
      data: {
        labels: [
          "Online Store",
          "Retail Stores",
          "B2B Revenue",
          "Marketplace Revenue",
        ],
        datasets: [
          {
            label: "2024",
            data: [300, 150, 100, 80],
            backgroundColor: [
              ins("chart-primary"),
              ins("chart-secondary"),
              ins("chart-dark"),
              ins("chart-gray"),
            ],
            borderColor: "transparent",
            borderWidth: 1,
            weight: 1,
            cutout: "30%",
            radius: "90%",
          },
          {
            label: "2023",
            data: [270, 135, 90, 72],
            backgroundColor: [
              ins("chart-primary-rgb", 0.3),
              ins("chart-secondary-rgb", 0.3),
              ins("chart-dark-rgb", 0.3),
              ins("chart-gray-rgb", 0.3),
            ],
            borderColor: "transparent",
            borderWidth: 3,
            weight: 0.8,
            cutout: "30%",
            radius: "60%",
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: "bottom",
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
            callbacks: {
              label: function (a) {
                return a.dataset.label + ` - ${a.label}: ` + a.parsed;
              },
            },
          },
        },
        scales: { x: { display: !1 }, y: { display: !1 } },
      },
    }),
  }),
  months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  generateRandomData = (a, r) =>
    Array.from(
      { length: 12 },
      () => Math.floor(Math.random() * (r - a + 1)) + a
    ),
  onlineSales = generateRandomData(1e3, 1250),
  inStoreSales = generateRandomData(800, 1250),
  totalSales = generateRandomData(2500, 3500),
  StackedBarLineChart = new CustomChartJs({
    selector: "#sales-analytics-chart",
    options: () => ({
      data: {
        labels: months,
        datasets: [
          {
            type: "bar",
            label: "Online Sales",
            data: onlineSales,
            borderColor: ins("chart-primary"),
            backgroundColor: ins("chart-primary"),
            stack: "sales",
            barThickness: 20,
            borderRadius: 6,
          },
          {
            type: "bar",
            label: "In-store Sales",
            data: inStoreSales,
            borderColor: ins("chart-gray"),
            backgroundColor: ins("chart-gray"),
            stack: "sales",
            barThickness: 20,
            borderRadius: 6,
          },
          {
            type: "line",
            label: "Projected Sales",
            data: totalSales,
            borderColor: ins("chart-dark"),
            backgroundColor: ins("chart-dark-rgb", 0.2),
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.4,
            fill: !1,
            yAxisID: "y",
          },
        ],
      },
    }),
  });

function generateRandomData(e, a, t) {
  return Array.from(
    { length: e },
    () => Math.floor(Math.random() * (t - a + 1)) + a
  );
}
function generateSessionAndPageViewData(e) {
  var e = generateRandomData(e, 250, 450),
    a = e.map((e) => Math.floor(e * (2 + 0.1 * Math.random())));
  return { sessions: e, pageViews: a };
}
let { sessions, pageViews } = generateSessionAndPageViewData(19);
function generateData(e, a, t) {
  let o = 0;
  for (var r = []; o < a; ) {
    var n = Math.floor(750 * Math.random()) + 1,
      s = Math.floor(Math.random() * (t.max - t.min + 1)) + t.min,
      i = Math.floor(61 * Math.random()) + 15;
    r.push([n, s, i]), o++;
  }
  return r;
}
new CustomApexChart({
  selector: "#project-overview-chart",
  options: () => ({
    chart: { height: 330, type: "area", toolbar: { show: !1 } },
    dataLabels: { enabled: !1 },
    stroke: { width: 2, curve: "smooth" },
    colors: [ins("chart-primary"), ins("secondary")],
    series: [
      { name: "Sessions", data: sessions },
      { name: "Page Views", data: pageViews },
    ],
    legend: { offsetY: 5 },
    xaxis: {
      categories: [
        "",
        "8 AM",
        "9 AM",
        "10 AM",
        "11 AM",
        "12 PM",
        "1 PM",
        "2 PM",
        "3 PM",
        "4 PM",
        "5 PM",
        "6 PM",
        "7 PM",
        "8 PM",
        "9 PM",
        "10 PM",
        "11 PM",
        "12 AM",
        "",
      ],
      axisBorder: { show: !1 },
      axisTicks: { show: !1 },
      tickAmount: 6,
      labels: { style: { fontSize: "12px" } },
    },
    tooltip: {
      shared: !0,
      y: {
        formatter: function (e, { seriesIndex: a }) {
          return 0 === a ? e + " Sessions" : 1 === a ? e + " Page Views" : e;
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.2,
        stops: [15, 120, 100],
      },
    },
    grid: { borderColor: [ins("border-color")], padding: { bottom: 0 } },
  }),
}),
  new CustomApexChart({
    selector: "#task-progress-chart",
    options: () => ({
      chart: { height: 330, type: "bubble", toolbar: { show: !1 } },
      dataLabels: { enabled: !1 },
      series: [
        {
          name: "Bubble 1",
          data: generateData(new Date("11 Feb 2017 GMT").getTime(), 10, {
            min: 10,
            max: 60,
          }),
        },
        {
          name: "Bubble 2",
          data: generateData(new Date("11 Feb 2017 GMT").getTime(), 10, {
            min: 10,
            max: 60,
          }),
        },
        {
          name: "Bubble 3",
          data: generateData(new Date("11 Feb 2017 GMT").getTime(), 10, {
            min: 10,
            max: 60,
          }),
        },
      ],
      fill: { opacity: 0.8, gradient: { enabled: !1 } },
      colors: [ins("chart-primary"), ins("secondary"), ins("danger")],
      xaxis: { tickAmount: 12, type: "category" },
      yaxis: { max: 70 },
      grid: {
        borderColor: [ins("border-color")],
        padding: { top: -20, right: 0, bottom: -5, left: 10 },
      },
      legend: { offsetY: 7 },
    }),
  }),
  document.addEventListener("DOMContentLoaded", function () {
    var e = document.querySelector("#chat-container");
    e && e.SimpleBar
      ? (e.SimpleBar.getScrollElement().scrollTop =
          e.SimpleBar.getScrollElement().scrollHeight)
      : (e = e.querySelector(".simplebar-content-wrapper")) &&
        (e.scrollTop = e.scrollHeight);
  });

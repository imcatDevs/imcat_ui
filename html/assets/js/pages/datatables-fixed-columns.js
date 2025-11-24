document.addEventListener("DOMContentLoaded", () => {
  var t = document.getElementById("fixed-columns");
  t &&
    new DataTable(t, {
      fixedColumns: { start: 1, end: 1 },
      paging: !1,
      scrollCollapse: !0,
      scrollX: !0,
      scrollY: 300,
      language: {
        paginate: {
          first: '<i class="ti ti-chevrons-left"></i>',
          previous: '<i class="ti ti-chevron-left"></i>',
          next: '<i class="ti ti-chevron-right"></i>',
          last: '<i class="ti ti-chevrons-right"></i>',
        },
      },
    });
});

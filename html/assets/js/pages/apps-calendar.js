class CalendarSchedule {
  constructor() {
    (this.body = document.body),
      (this.modal = new bootstrap.Modal(
        document.getElementById("event-modal"),
        { backdrop: "static" }
      )),
      (this.calendar = document.getElementById("calendar")),
      (this.formEvent = document.getElementById("forms-event")),
      (this.btnNewEvent = document.querySelectorAll(".btn-new-event")),
      (this.btnDeleteEvent = document.getElementById("btn-delete-event")),
      (this.btnSaveEvent = document.getElementById("btn-save-event")),
      (this.modalTitle = document.getElementById("modal-title")),
      (this.calendarObj = null),
      (this.selectedEvent = null),
      (this.newEventData = null);
  }
  onEventClick(e) {
    this.formEvent?.reset(),
      this.formEvent.classList.remove("was-validated"),
      (this.newEventData = null),
      (this.btnDeleteEvent.style.display = "block"),
      (this.modalTitle.text = "Edit Event"),
      this.modal.show(),
      (this.selectedEvent = e.event),
      (document.getElementById("event-title").value = this.selectedEvent.title);
    var t,
      e = document.getElementById("event-category");
    e &&
      ((t = this.selectedEvent.classNames),
      (e.value = Array.isArray(t) ? t.join(" ") : t || ""));
  }
  onSelect(e) {
    this.formEvent?.reset(),
      this.formEvent?.classList.remove("was-validated"),
      (this.selectedEvent = null),
      (this.newEventData = e),
      (this.btnDeleteEvent.style.display = "none"),
      (this.modalTitle.text = "Add New Event"),
      this.modal.show(),
      this.calendarObj.unselect();
  }
  init() {
    var e = new Date();
    let a = this;
    var t = document.getElementById("external-events"),
      t =
        (new FullCalendar.Draggable(t, {
          itemSelector: ".external-event",
          eventData: function (e) {
            return {
              title: e.innerText,
              classNames: e.getAttribute("data-class"),
            };
          },
        }),
        [
          {
            title: "Design Review",
            start: e,
            end: e,
            className: "bg-primary-subtle text-primary",
          },
          {
            title: "Marketing Strategy",
            start: new Date(Date.now() + 16e6),
            end: new Date(Date.now() + 2e7),
            className: "bg-secondary-subtle text-secondary",
          },
          {
            title: "Sales Demo",
            start: new Date(Date.now() + 4e7),
            end: new Date(Date.now() + 8e7),
            className: "bg-success-subtle text-success",
          },
          {
            title: "Deadline Submission",
            start: new Date(Date.now() + 12e7),
            end: new Date(Date.now() + 18e7),
            className: "bg-danger-subtle text-danger",
          },
          {
            title: "Training Session",
            start: new Date(Date.now() + 25e7),
            end: new Date(Date.now() + 29e7),
            className: "bg-info-subtle text-info",
          },
          {
            title: "Budget Review",
            start: new Date(Date.now() + 4e8),
            end: new Date(Date.now() + 45e7),
            className: "bg-warning-subtle text-warning",
          },
          {
            title: "Board Meeting",
            start: new Date(Date.now() + 6e8),
            end: new Date(Date.now() + 62e7),
            className: "bg-dark-subtle text-dark",
          },
        ]);
    (a.calendarObj = new FullCalendar.Calendar(a.calendar, {
      plugins: [],
      slotDuration: "00:30:00",
      slotMinTime: "07:00:00",
      slotMaxTime: "19:00:00",
      themeSystem: "bootstrap",
      bootstrapFontAwesome: !1,
      buttonText: {
        today: "Today",
        month: "Month",
        week: "Week",
        day: "Day",
        list: "List",
        prev: "Prev",
        next: "Next",
      },
      initialView: "dayGridMonth",
      handleWindowResize: !0,
      height: window.innerHeight - 240,
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
      },
      initialEvents: t,
      editable: !0,
      droppable: !0,
      selectable: !0,
      dateClick: function (e) {
        a.onSelect(e);
      },
      eventClick: function (e) {
        a.onEventClick(e);
      },
    })),
      a.calendarObj.render(),
      a.btnNewEvent.forEach(function (e) {
        e.addEventListener("click", function (e) {
          a.onSelect({ date: new Date(), allDay: !0 });
        });
      }),
      a.formEvent?.addEventListener("submit", function (e) {
        e.preventDefault();
        var t,
          n = a.formEvent;
        n.checkValidity()
          ? (a.selectedEvent
              ? (a.selectedEvent.setProp(
                  "title",
                  document.getElementById("event-title").value
                ),
                a.selectedEvent.setProp(
                  "classNames",
                  document.getElementById("event-category").value
                ))
              : ((t = {
                  title: document.getElementById("event-title").value,
                  start: a.newEventData.date,
                  allDay: a.newEventData.allDay,
                  className: document.getElementById("event-category").value,
                }),
                a.calendarObj.addEvent(t)),
            a.modal.hide())
          : (e.stopPropagation(), n.classList.add("was-validated"));
      }),
      a.btnDeleteEvent.addEventListener("click", function (e) {
        a.selectedEvent &&
          (a.selectedEvent.remove(), (a.selectedEvent = null), a.modal.hide());
      });
  }
}
document.addEventListener("DOMContentLoaded", function (e) {
  new CalendarSchedule().init();
});

"use client";

import { CalendarPlus } from "lucide-react";
import { buttonClasses } from "@/components/ui/primitives";

function icsDate(iso: string) {
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Downloads an .ics file so players can put the tournament in their own calendar. */
export function AddToCalendar({
  id,
  title,
  startsAt,
  durationHours,
  location,
  url,
}: {
  id: string;
  title: string;
  startsAt: string;
  durationHours: number;
  location: string;
  url: string;
}) {
  const onClick = () => {
    const end = new Date(new Date(startsAt).getTime() + durationHours * 3_600_000).toISOString();
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//The Eglinton//Tournament schedule//EN",
      "BEGIN:VEVENT",
      `UID:${id}@theeglinton.com`,
      `DTSTAMP:${icsDate(new Date().toISOString())}`,
      `DTSTART:${icsDate(startsAt)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${title.replace(/[,;]/g, "\\$&")}`,
      `LOCATION:${location.replace(/[,;]/g, "\\$&")}`,
      `URL:${url}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${id}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  return (
    <button type="button" onClick={onClick} className={buttonClasses("secondary", "md", "w-full")}>
      <CalendarPlus aria-hidden className="size-4" strokeWidth={1.75} />
      <span>Add to calendar</span>
    </button>
  );
}

from datetime import datetime

from dateutil.rrule import rrulestr


def task2events(tasks):
    events = []
    for task in tasks:
        start = datetime.fromisoformat(task["start_timestamptz"])
        end = datetime.fromisoformat(task["end_timestamptz"])
        duration = end - start
        rrule_str = task["recurrence"]
        rule = rrulestr(rrule_str, dtstart=start)

        for occurrence_start in rule:
            occurrence_end = occurrence_start + duration
            events.append(
                {
                    "task_id": task["id"],
                    "title": task["name"],
                    "start": occurrence_start.isoformat(),
                    "end": occurrence_end.isoformat(),
                    "isDone": False,
                }
            )

    return events

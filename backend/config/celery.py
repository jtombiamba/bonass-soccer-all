import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
app = Celery("config")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

# Monday 8:00 UTC: launch weekly poll for next Friday
app.conf.beat_schedule = {
    "launch-weekly-poll": {
        "task": "poll.tasks.launch_weekly_poll",
        "schedule": crontab(hour=8, minute=0, day_of_week=1),
    },
    "launch-monthly-evaluation": {
        "task": "poll.tasks.launch_monthly_evaluation_round",
        "schedule": crontab(hour=8, minute=0, day_of_month=1),
    },
    "friday-send-code": {
        "task": "poll.tasks.friday_send_distribution_code",
        "schedule": crontab(hour=8, minute=0, day_of_week=4),
    },
}

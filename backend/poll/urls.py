from django.urls import path
from . import views

urlpatterns = [
    path("", views.PollListView.as_view(), name="poll_list"),
    path("<int:poll_id>/answer/", views.AnswerPollView.as_view(), name="answer_poll"),
]

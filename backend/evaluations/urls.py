from django.urls import path
from . import views

urlpatterns = [
    path("evaluate/", views.EvaluateView.as_view(), name="evaluate"),
    path("rounds/", views.EvaluationRoundsListView.as_view(), name="rounds"),
    path("assignments/", views.AssignmentsView.as_view(), name="assignments"),
]

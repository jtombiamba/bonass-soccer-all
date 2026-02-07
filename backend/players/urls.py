from django.urls import path
from . import views

urlpatterns = [
    path("", views.PlayerListView.as_view(), name="player_list"),
    path("me/", views.PlayerMeView.as_view(), name="player_me"),
    path("create/", views.PlayerCreateView.as_view(), name="player_create"),
    path("physical-condition/", views.SubmitPhysicalConditionView.as_view(), name="submit_physical_condition"),
    path("games/", views.GetGamesView.as_view(), name="get_games"),
    path("games/<int:pk>/", views.GetGameDetailsView.as_view(), name="get_game_details"),
    path("games/<int:game_id>/score/", views.SubmitScoreView.as_view(), name="submit_score"),
    path("games/<int:game_id>/assign-teams/", views.AssignCodeAndTeamsView.as_view(), name="assign_code_and_teams"),
]

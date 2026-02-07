"""
Tests for email utilities.
"""
from django.core import mail
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from players.models import Player, Organization, Game
from poll.models import WeeklyPoll
from core.email import send_poll_scheduled_email
from core.email import send_evaluation_assignment_email
from evaluations.models import EvaluationRound, EvaluationAssignment
from unittest.mock import patch


User = get_user_model()


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class EmailTests(TestCase):
    def setUp(self):
        # Create organization
        self.org = Organization.objects.create(name="Test Org")
        # Create user with email
        self.user = User.objects.create_user(
            username="testplayer",
            email="player@example.com",
            password="testpass",
        )
        # Create player
        self.player = Player.objects.create(
            user=self.user,
            organization=self.org,
            pseudo="TestPseudo",
        )
        # Create another player for assignment
        self.other_user = User.objects.create_user(
            username="otherplayer",
            email="other@example.com",
            password="testpass",
        )
        self.other_player = Player.objects.create(
            user=self.other_user,
            organization=self.org,
            pseudo="OtherPseudo",
        )
        # Create game and poll
        self.game = Game.objects.create(
            organization=self.org,
            game_date="2026-02-13",  # a Friday
        )
        self.poll = WeeklyPoll.objects.create(game=self.game)
        # Create evaluation round for current month
        from django.utils import timezone
        now = timezone.now()
        self.eval_round = EvaluationRound.objects.create(year=now.year, month=now.month)
        # Create assignment
        self.assignment = EvaluationAssignment.objects.create(
            round=self.eval_round,
            evaluator=self.player,
            evaluated=self.other_player,
        )

    def test_send_poll_scheduled_email(self):
        """Email is sent successfully when player has email."""
        mail.outbox.clear()
        result = send_poll_scheduled_email(self.player, self.poll)
        self.assertTrue(result)
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertEqual(email.to, [self.user.email])
        self.assertIn(str(self.game.game_date), email.subject)
        self.assertIn(self.player.pseudo, email.body)
        self.assertIn("/polls", email.body)

    def test_send_poll_scheduled_email_no_email(self):
        """No email sent when player has no email address."""
        self.user.email = ""
        self.user.save()
        mail.outbox.clear()
        result = send_poll_scheduled_email(self.player, self.poll)
        self.assertFalse(result)
        self.assertEqual(len(mail.outbox), 0)

    def test_send_poll_scheduled_email_exception(self):
        """Return False if sending fails."""
        with patch('core.email.send_mail', side_effect=Exception("SMTP error")):
            result = send_poll_scheduled_email(self.player, self.poll)
            self.assertFalse(result)

    def test_send_evaluation_assignment_email(self):
        """Email is sent successfully when player has assignments."""
        mail.outbox.clear()
        result = send_evaluation_assignment_email(self.player, self.eval_round)
        self.assertTrue(result)
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertEqual(email.to, [self.user.email])
        self.assertIn("Monthly player evaluations are open", email.subject)
        self.assertIn(self.player.pseudo, email.body)
        self.assertIn("OtherPseudo", email.body)
        self.assertIn("/evaluations", email.body)


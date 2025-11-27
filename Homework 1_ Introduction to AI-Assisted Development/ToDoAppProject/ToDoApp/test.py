from django.test import TestCase
from django.urls import reverse
from .models import Task


class TaskTests(TestCase):
    def test_create_task_model(self):
        # Create a task and ensure it is stored correctly
        task = Task.objects.create(title="Test task")
        self.assertEqual(Task.objects.count(), 1)
        self.assertFalse(task.is_done)

    def test_task_list_view_get(self):
        # Ensure the task list page returns 200
        response = self.client.get(reverse("todo:task_list"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "ToDoApp/list.html")

    def test_task_create_via_post(self):
        # Creating a task via POST should increase count and redirect
        response = self.client.post(
            reverse("todo:task_list"),
            {"title": "New Task", "description": "", "is_done": False},
        )
        self.assertEqual(Task.objects.count(), 1)
        self.assertEqual(response.status_code, 302)  # redirect

    def test_toggle_done(self):
        task = Task.objects.create(title="Toggle me", is_done=False)
        url = reverse("todo:task_toggle_done", args=[task.pk])
        self.client.get(url)
        task.refresh_from_db()
        self.assertTrue(task.is_done)

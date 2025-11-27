from django.db import models
from django.db.models import F

class Task(models.Model):
    """Represents a single to-do item."""

    title = models.CharField(
        max_length=255,
        help_text="Short title of the task.",
    )
    description = models.TextField(
        blank=True,
        help_text="Optional longer description.",
    )
    is_done = models.BooleanField(
        default=False,
        help_text="Marks whether the task is completed.",
    )
    due_date = models.DateField(
        blank=True,
        null=True,
        help_text="Optional due date for the task.",
    )
    
    position = models.IntegerField(
        default=0,
        help_text="Position for manual ordering of tasks.",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the task was created.",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the task was last updated.",
    )

    class Meta:
        ordering = ["is_done", "position", F("due_date").asc(nulls_last=True), "-created_at"]
        verbose_name = "Task"
        verbose_name_plural = "Tasks"

    def __str__(self) -> str:
        # Human-readable representation (e.g. in admin)
        status = "✓" if self.is_done else "✗"
        return f"{status} {self.title}"

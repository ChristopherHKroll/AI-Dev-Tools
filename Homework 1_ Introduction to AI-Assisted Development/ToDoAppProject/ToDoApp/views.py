from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import Task
from .forms import TaskForm


def home(request):
    from django.db.models import F
    # Sort incomplete tasks by position, then by due_date (nulls last), then completed tasks
    tasks = Task.objects.all().order_by("is_done", "position", F("due_date").asc(nulls_last=True), "-created_at")

    if request.method == "POST":
        form = TaskForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("home")
    else:
        form = TaskForm()

    return render(request, "home.html", {"tasks": tasks, "form": form})


def task_list(request):
    from django.db.models import F
    # Sort incomplete tasks by due_date (nulls last), then completed tasks
    tasks = Task.objects.all().order_by("is_done", F("due_date").asc(nulls_last=True), "-created_at")

    if request.method == "POST":
        form = TaskForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("todo:task_list")
    else:
        form = TaskForm()

    return render(request, "ToDoApp/list.html", {"tasks": tasks, "form": form})


def task_edit(request, pk):
    task = get_object_or_404(Task, pk=pk)

    if request.method == "POST":
        form = TaskForm(request.POST, instance=task)
        if form.is_valid():
            form.save()
            return redirect("home")
    else:
        form = TaskForm(instance=task)

    return render(request, "ToDoApp/edit.html", {"task": task, "form": form})


def task_delete(request, pk):
    task = get_object_or_404(Task, pk=pk)

    if request.method == "POST":
        task.delete()
        return redirect("home")

    return render(request, "ToDoApp/delete.html", {"task": task})


def task_toggle_done(request, pk):
    task = get_object_or_404(Task, pk=pk)
    task.is_done = not task.is_done
    task.save()
    return redirect("home")


@require_POST
def task_reorder(request):
    """Handle AJAX requests to reorder tasks"""
    import json
    data = json.loads(request.body)
    task_orders = data.get('task_orders', [])
    
    for item in task_orders:
        task_id = item.get('id')
        position = item.get('position')
        if task_id and position is not None:
            Task.objects.filter(pk=task_id).update(position=position)
    
    return JsonResponse({'status': 'success'})

from django.urls import path

from . import views

app_name = "messaging"

urlpatterns = [
    path("", views.ThreadListView.as_view(), name="thread_list_create"),
    path("<int:thread_id>/", views.ThreadDetailView.as_view(), name="thread_detail"),
    path("<int:thread_id>/messages/", views.MessageListView.as_view(), name="message_list_create"),
    path("<int:thread_id>/read/", views.mark_thread_read, name="mark_thread_read"),
    path("<int:thread_id>/typing/", views.update_typing_status, name="update_typing_status"),
    path("<int:thread_id>/events/", views.thread_events, name="thread_events"),
]

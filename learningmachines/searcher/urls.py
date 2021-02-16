from django.urls import path
from . import views


urlpatterns = [
	path('', views.index, name='main'),
	path('home/', views.index, name='home'),
	path('search/', views.search_page, name='search_page'),
	path('process_search/', views.process_search, name='process_search'),
	path('get_doc/', views.get_doc, name="get_doc"),
	path('models/', views.show_models, name='show_models'),
	path('start_model_run/', views.start_model_run, name='update_filter'),
	
	path('delete_query/', views.delete_query, name='delete_task'),
	path('save_query/', views.save_query, name='save'),

	path('cancel_task/', views.cancel_task, name='cancel_task'),
	path('poll_tasks/', views.poll_tasks, name="poll_tasks"),	
	path('vis/', views.show_vis, name='show_vis'),
	path('load_formatted/', views.load_formatted, name='load_formatted'),
	path('proxy_static/', views.proxy_static, name='proxy_static')
]
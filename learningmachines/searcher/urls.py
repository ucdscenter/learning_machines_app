from django.urls import path
from . import views
from django.conf.urls import handler404

handler404 = views.index

urlpatterns = [
    path('', views.index, name='main'),
    path('home/', views.index, name='home'),
    path('search/', views.search_page, name='search_page'),
    path('process_search/', views.process_search, name='process_search'),
    path('get_doc/', views.get_doc, name="get_doc"),
    path('models/', views.show_models, name='show_models'),
    path('show_history/', views.show_history, name='show_history'),
    path('start_model_run/', views.start_model_run, name='update_filter'),
    path('delete_query/', views.delete_query, name='delete_task'),
    path('save_query/', views.save_query, name='save'),

    path('cancel_task/', views.cancel_task, name='cancel_task'),
    path('poll_tasks/', views.poll_tasks, name="poll_tasks"),
    path('vis/', views.show_vis, name='show_vis'),
    path('load_formatted/', views.load_formatted, name='load_formatted'),
    path('proxy_static/', views.proxy_static, name='proxy_static'),
    path('projects/', views.projects, name='projects'),
    path('wikiarts_method_vis/', views.wikiarts_method_vis, name='wikiarts_method_vis'),
    path('s3_image/', views.s3_image, name='s3_image'),
    path('upload_image/', views.upload_image, name='upload_image'),
    path('bert_method_vis/', views.bert_method_vis, name='bert_method_vis'),
    path('bert_method_vis/<str:dataset>',
         views.bert_method_vis, name='bert_method_vis'),
    path('vis/get_annotations/',views.get_annotations,name="get_annotations"),
	path('vis/save_annotations/',views.save_annotations,name="save_annotations"),
	path('vis/delete_annotation/',views.delete_annotation,name="delete_annotation")
]

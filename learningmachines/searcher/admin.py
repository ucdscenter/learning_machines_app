from django.contrib import admin
from .models import Annotation, Profile, Access, VisRequest, QueryRequest, DocFilter


# Register your models here.


class QueryRequestAdmin(admin.ModelAdmin):
    search_fields = ('created_time', 'keywords')
    list_filter = ('query_str', 'database', )
    readonly_fields = ('id',)


class VisRequestAdmin(admin.ModelAdmin):
    search_fields = ('created_time', 'model_name', 'query')
    list_filter = ('query', 'method')


class ProfileAdmin(admin.ModelAdmin):
    search_fields = ('user__email', 'first_name', 'last_name', 'department', 'institute')


class AnnotationAdmin(admin.ModelAdmin):
    search_fields = ('nodes_and_edges',
                     'label_position_x',
                     'label_position_y',
                     'label_text',
                     'label_color',
                     'note_id',
                     'vis_request',)

admin.site.register(Access)
admin.site.register(VisRequest, VisRequestAdmin)
admin.site.register(QueryRequest, QueryRequestAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(Annotation, AnnotationAdmin)

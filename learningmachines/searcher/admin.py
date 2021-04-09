from django.contrib import admin
from .models import Profile, Access, VisRequest, QueryRequest, DocFilter


# Register your models here.




class QueryRequestAdmin(admin.ModelAdmin):
    search_fields = ('created_time', 'keywords')
    list_filter = ('query_str', 'database')
    readonly_fields=('id',)



class VisRequestAdmin(admin.ModelAdmin):
    search_fields = ('created_time', 'model_name')
    list_filter = ('query', 'method')


class ProfileAdmin(admin.ModelAdmin):
    search_fields = ('user__email', 'department', 'institute')


admin.site.register(Access)
admin.site.register(VisRequest, VisRequestAdmin)
admin.site.register(QueryRequest, QueryRequestAdmin)
admin.site.register(Profile, ProfileAdmin)
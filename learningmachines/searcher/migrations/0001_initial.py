# Generated by Django 3.1 on 2021-06-07 20:43

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='DocFilter',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('method', models.CharField(choices=[('select', 'select'), ('unselect', 'unselect')], default='unselect', max_length=20)),
                ('docs', models.CharField(default='', max_length=200)),
                ('num_topics', models.CharField(default='20', max_length=10)),
                ('num_clusters', models.CharField(default='20', max_length=10)),
                ('min_occur', models.IntegerField(default=-1)),
                ('max_occur', models.IntegerField(default=-1)),
                ('stop_words', models.CharField(default='', max_length=500)),
                ('orig_start_year', models.CharField(default='year', max_length=12)),
                ('orig_end_year', models.CharField(default='year', max_length=12)),
                ('start_year', models.CharField(default='year', max_length=12)),
                ('end_year', models.CharField(default='year', max_length=12)),
                ('doc_number', models.CharField(default='', max_length=6)),
                ('phrases', models.CharField(default='', max_length=500)),
                ('remove_digits', models.BooleanField(default=False)),
                ('tfidf', models.BooleanField(default=False)),
                ('replacement', models.CharField(default='', max_length=1000)),
                ('level_select', models.CharField(default='', max_length=100)),
                ('para_filter_terms', models.CharField(default='', max_length=200)),
                ('passes', models.CharField(default='automatic', max_length=10)),
                ('max_hits', models.IntegerField(default=-1)),
                ('auth_s', models.CharField(default='', max_length=100)),
                ('ml_keywords', models.CharField(default='', max_length=100)),
                ('jurisdiction', models.CharField(default='', max_length=100)),
                ('journal', models.CharField(default='', max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='QueryRequest',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_time', models.DateTimeField(default=django.utils.timezone.now)),
                ('url', models.CharField(max_length=1000)),
                ('database', models.CharField(default='', max_length=20)),
                ('query_str', models.CharField(default='', max_length=1000)),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='VisRequest',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_time', models.DateTimeField(default=django.utils.timezone.now)),
                ('url', models.CharField(max_length=1000)),
                ('model_name', models.CharField(max_length=200)),
                ('method', models.CharField(choices=[('pyLDAvis', 'pyLDAvis'), ('DFR browser', 'DFR'), ('mlmom', 'mlmom'), ('doc2vec', 'd2v'), ('word2vec', 'w2v'), ('sentiment', 'sentiment')], max_length=20)),
                ('task_id', models.CharField(default='none', max_length=50)),
                ('status', models.CharField(default='Scheduled', max_length=100)),
                ('is_saved', models.BooleanField(default=False)),
                ('is_finished', models.BooleanField(default=False)),
                ('docfilter', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='searcher.docfilter')),
                ('query', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='searcher.queryrequest')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=200, null=True)),
                ('last_name', models.CharField(max_length=200, null=True)),
                ('institute', models.CharField(max_length=200, null=True)),
                ('department', models.CharField(max_length=200, null=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Access',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('endpoint', models.CharField(choices=[('pubmed', 'pubmed'), ('foster', 'foster'), ('med_apps', 'med_apps'), ('mayerson_transcripts', 'mayerson_transcripts'), ('all', 'all')], max_length=20, unique=True)),
                ('user', models.ManyToManyField(to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]

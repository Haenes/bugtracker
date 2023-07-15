# Generated by Django 4.2.1 on 2023-07-12 22:26

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bugtracker', '0004_alter_project_created_alter_project_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='issue',
            name='closed',
            field=models.DateTimeField(blank=True, default=None),
        ),
        migrations.AlterField(
            model_name='issue',
            name='description',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AlterField(
            model_name='issue',
            name='priority',
            field=models.CharField(choices=[('Lowest', 'Lowest'), ('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High'), ('Highest', 'Highest')], max_length=8),
        ),
        migrations.AlterField(
            model_name='issue',
            name='status',
            field=models.CharField(choices=[('To do', 'To do'), ('In progress', 'In progress'), ('Done', 'Done')], max_length=11),
        ),
        migrations.AlterField(
            model_name='issue',
            name='timespent',
            field=models.PositiveIntegerField(blank=True, default=0),
        ),
        migrations.AlterField(
            model_name='issue',
            name='type',
            field=models.CharField(choices=[('Bug', 'Bug'), ('Feature', 'Feature')], max_length=8),
        ),
        migrations.AlterField(
            model_name='project',
            name='created',
            field=models.DateTimeField(verbose_name=datetime.datetime(2023, 7, 12, 22, 26, 39, 875398, tzinfo=datetime.timezone.utc)),
        ),
        migrations.AlterField(
            model_name='project',
            name='type',
            field=models.CharField(choices=[('Fullstack software', 'Fullstack software'), ('Front-end software', 'Front-end software'), ('Back-end software', 'Back-end software')], max_length=18),
        ),
    ]
# Generated by Django 4.2.2 on 2024-01-22 04:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bugtracker', '0018_issue_key'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='type',
            field=models.CharField(choices=[('Fullstack', 'Fullstack'), ('Front-end', 'Front-end'), ('Back-end', 'Back-end')], max_length=18),
        ),
    ]

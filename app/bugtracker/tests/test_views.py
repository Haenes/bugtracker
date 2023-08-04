from django.test import TestCase
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from bugtracker.models import Project, Issue


class ProjectsTestCase(TestCase):


    def setUp(self):
        User.objects.create(first_name="Test", last_name="Test", username="testing", email="testemail@gmail.com", password="Password123#")
    

    def test_call_view_anonymous(self):      
        response = self.client.get("")
        self.assertRedirects(response, "/login/?next=/")


    def test_call_view_logged_in(self):
        user = User.objects.get(username="testing")     
        self.client.force_login(user)     

        response = self.client.get("")

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "projects.html")


class BoardsTestCase(TestCase):
    

    def setUp(self):
        user = User.objects.create(first_name="Test", last_name="Test", username="testing", email="testemail@gmail.com", password="Password123#")
        Project.objects.create(name="Testing1", key="TEST1", type="Fullstack software", author_id=user.id)


    def test_call_view_anonymous(self):      
        project = str(Project.objects.get(key="TEST1").id)
        response = self.client.get(f"/boards/{project}/")

        self.assertRedirects(response, f"/login/?next=/boards/{project}/")


    def test_call_view_logged_in(self):
        user = User.objects.get(username="testing")
        project = str(Project.objects.get(key="TEST1").id)     
        self.client.force_login(user)

        response = self.client.get(f"/boards/{project}/")

        self.assertTrue(response.status_code, 200)
        self.assertTemplateUsed(response, "boards.html")


class IssueDetailsTestCase(TestCase):
    

    def setUp(self):
        user = User.objects.create(first_name="Test", last_name="Test", username="testing", email="testemail@gmail.com", password="Password123#")
        project = Project.objects.create(name="Testing1", key="TEST1", type="Fullstack software", author_id=user.id)
        Issue.objects.create(
            project_id=project.id,
            title="Issue", 
            description="Big Socks Just Big Socks", 
            type="Feature",
            priority="Medium", 
            status="To do", 
            author_id=user.id)


    def test_call_view_anonymous(self):      
        project = str(Project.objects.get(key="TEST1").id)
        issue = str(Issue.objects.get(title="Issue").id)

        response = self.client.get(f"/boards/{project}/{issue}/issue-details/")

        self.assertRedirects(response, f"/login/?next=/boards/{project}/{issue}/issue-details/")


    def test_call_view_logged_in(self):
        user = User.objects.get(username="testing")
        project = str(Project.objects.get(key="TEST1").id)
        issue = str(Issue.objects.get(title="Issue").id)     
        self.client.force_login(user)

        response = self.client.get(f"/boards/{project}/{issue}/issue-details/")

        self.assertTrue(response.status_code, 200)
        self.assertTemplateUsed(response, "issue-details.html")


class ProjectSettingsTestCase(TestCase):
    

    def setUp(self):
        user = User.objects.create(first_name="Test", last_name="Test", username="testing", email="testemail@gmail.com", password="Password123#")
        Project.objects.create(name="Testing1", key="TEST1", type="Fullstack software", author_id=user.id)


    def test_call_view_anonymous(self):      
        project = str(Project.objects.get(key="TEST1").id)
        response = self.client.get(f"/boards/{project}/project-settings/")

        self.assertRedirects(response, f"/login/?next=/boards/{project}/project-settings/")


    def test_call_view_logged_in(self):
        user = User.objects.get(username="testing")
        project = str(Project.objects.get(key="TEST1").id)     
        self.client.force_login(user)

        response = self.client.get(f"/boards/{project}/project-settings/")

        self.assertTrue(response.status_code, 200)
        self.assertTemplateUsed(response, "project-settings.html")


class AccountsTestCase(TestCase):
    

    def setUp(self):
        User.objects.create(first_name="Test", last_name="Test", username="testing", email="testemail@gmail.com", password="Password123#")


    def test_call_view_anonymous(self):      
        user = str(User.objects.get(username="testing").id)
        response = self.client.get(f"/accounts/{user}/")

        self.assertRedirects(response, f"/login/?next=/accounts/{user}/")


    def test_call_view_logged_in(self):
        user = User.objects.get(username="testing")
        self.client.force_login(user)

        response = self.client.get(f"/accounts/{user.id}/")

        self.assertTrue(response.status_code, 200)
        self.assertTemplateUsed(response, "accounts.html")


class SearchTestCase(TestCase):
    

    def setUp(self):
        User.objects.create(first_name="Test", last_name="Test", username="testing", email="testemail@gmail.com", password="Password123#")


    def test_call_view_anonymous(self):      
        response = self.client.get(reverse("search"))
        self.assertRedirects(response, f"/login/?next=/search/")


    def test_call_view_logged_in(self):
        user = User.objects.get(username="testing")
        self.client.force_login(user)

        response = self.client.get(reverse("search"))
        
        self.assertTrue(response.status_code, 200)


class SearchResultsTestCase(TestCase):
    

    def setUp(self):
        User.objects.create(first_name="Test", last_name="Test", username="testing", email="testemail@gmail.com", password="Password123#")


    def test_call_view_anonymous(self):   
        q = "bug/"   
        response = self.client.get(f"/search-results/{q}")

        self.assertRedirects(response, f"/login/?next=/search-results/{q}")


    def test_call_view_logged_in(self):
        user = User.objects.get(username="testing")
        q = "bug/" 
        self.client.force_login(user)

        response = self.client.get(f"/search-results/{q}")
        
        self.assertTrue(response.status_code, 200)
        self.assertTemplateUsed(response, "search-results.html")


class LoginTestCase(TestCase):

  
    def test_call_view(self):
        response = self.client.get(reverse("login"))

        self.assertTrue(response.status_code, 200)
        self.assertTemplateUsed(response, "login.html")


class RegisterTestCase(TestCase):

  
    def test_call_view(self):
        response = self.client.get(reverse("register"))

        self.assertTrue(response.status_code, 200)
        self.assertTemplateUsed(response, "register.html")


class RegisterConfirmTestCase(TestCase):


    def setUp(self):
        User.objects.create(first_name="Test", last_name="Test", username="testing", email="testemail@gmail.com", password="Password123#")

  
    def test_call_view(self):
        user = User.objects.get(username="testing")
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        response = self.client.get(f"/register-confirm/{uid}/{token}/")

        self.assertTrue(response.status_code, 200)


class LogoutTestCase(TestCase):


    def setUp(self):
       User.objects.create(first_name="Test", last_name="Test", username="testing", email="testemail@gmail.com", password="Password123#")
  

    def test_call_view(self):
        user = User.objects.get(username="testing")
        self.client.force_login(user)

        response = self.client.get(reverse("logout"))

        self.assertTrue(response.status_code, 301)


class PasswordResetTestCase(TestCase):


    def test_call_view(self):
        response = self.client.get(reverse("password-reset"))
        
        self.assertTrue(response.status_code, 200)
        self.assertTemplateUsed(response, "password-reset.html")


class PasswordResetDoneTestCase(TestCase):


    def test_call_view(self):
        response = self.client.get(reverse("password-reset-done"))
        
        self.assertTrue(response.status_code, 200)
        self.assertTemplateUsed(response, "password-reset-done.html")


class PasswordResetConfirmTestCase(TestCase):
    def setUp(self):
        User.objects.create(first_name="Test", last_name="Test", username="testing", email="testemail@gmail.com", password="Password123#")
  
    def test_call_view(self):
        user = User.objects.get(username="testing")
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        response = self.client.get(f"/password-reset-confirm/{uid}/{token}/")
        
        self.assertTrue(response.status_code, 200)
        self.assertTemplateUsed(response, "password-reset-confirm.html")


class DeleteProjectTestCase(TestCase):


    def setUp(self):
        user = User.objects.create(first_name="Test", last_name="Test", username="testing", email="testemail@gmail.com", password="Password123#")
        Project.objects.create(name="Testing1", key="TEST1", type="Fullstack software", author_id=user.id)


    def test_call_view_anonymous(self):   
        project = str(Project.objects.get(key="TEST1").id)  
        response = self.client.get(f"/delete-project/{project}/")

        self.assertRedirects(response, f"/login/?next=/delete-project/{project}/")


    def test_call_view_logged_in(self):
        user = User.objects.get(username="testing")
        project = str(Project.objects.get(key="TEST1").id) 

        self.client.force_login(user)
        response = self.client.get(f"/delete-project/{project}/")
        
        self.assertTrue(response.status_code, 301)


class DeleteIssueTestCase(TestCase):

  
    def setUp(self):
        user = User.objects.create(first_name="Test", last_name="Test", username="testing", email="testemail@gmail.com", password="Password123#")
        project = Project.objects.create(name="Testing1", key="TEST1", type="Fullstack software", author_id=user.id)
        Issue.objects.create(
            project_id=project.id,
            title="Issue", 
            description="Big Socks Just Big Socks", 
            type="Feature",
            priority="Medium", 
            status="To do", 
            author_id=user.id)


    def test_call_view_anonymous(self):   
        project = str(Project.objects.get(key="TEST1").id)  
        issue = str(Issue.objects.get(title="Issue").id)

        response = self.client.get(f"/delete-issue/{project}/{issue}/")

        self.assertRedirects(response, f"/login/?next=/delete-issue/{project}/{issue}/")


    def test_call_view_logged_in(self):
        user = User.objects.get(username="testing")
        project = str(Project.objects.get(key="TEST1").id) 
        issue = str(Issue.objects.get(title="Issue").id)

        self.client.force_login(user)
        response = self.client.get(f"/delete-issue/{project}/{issue}/")
        
        self.assertTrue(response.status_code, 301)


class DeleteAccountTestCase(TestCase):


    def setUp(self):
        User.objects.create(first_name="Test", last_name="Test", username="testing", email="testemail@gmail.com", password="Password123#")


    def test_call_view_anonymous(self):   
        user = str(User.objects.get(username="testing").id)
        response = self.client.get(f"/delete-account/{user}")

        self.assertRedirects(response, f"/delete-account/{user}/", status_code=301, target_status_code=302)


    def test_call_view_logged_in(self):
        user = User.objects.get(username="testing")

        self.client.force_login(user)
        response = self.client.get(f"/delete-account/{user}")
        
        self.assertTrue(response.status_code, 301)
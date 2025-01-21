import httpx


async def test_pagination_zero_projects(user_client: httpx.AsyncClient):
    r = await user_client.get("projects")

    assert r.json()["results"] == "You don't have any project!"
    assert r.status_code == 200


async def test_create_projects(user_client: httpx.AsyncClient):
    r = await user_client.post("projects", json={
        "name": "test_name",
        "key": "test_key"
    })

    r2 = await user_client.post("projects", json={
        "name": "test_name2",
        "key": "test_key2"
    })

    assert r.status_code == 201
    assert r2.status_code == 201


async def test_create_project_exist_key(user_client: httpx.AsyncClient):
    r = await user_client.post("projects", json={
        "name": "test_name3",
        "key": "test_key2"
    })

    assert r.json()["detail"] == "Project with this key already exist!"
    assert r.status_code == 400


async def test_pagination_page_less_then_zero(user_client: httpx.AsyncClient):
    r = await user_client.get("projects?page=-1")
    results = r.json()["detail"]

    assert results == "The page and/or limit cannot be less than zero!"
    assert r.status_code == 400


async def test_pagination_limit_less_then_zero(user_client: httpx.AsyncClient):
    r = await user_client.get("projects?limit=-1")
    results = r.json()["detail"]

    assert results == "The page and/or limit cannot be less than zero!"
    assert r.status_code == 400


async def test_pagination_page_and_limit_less_then_zero(user_client: httpx.AsyncClient):
    r = await user_client.get("projects?page=-1&limit=-1")
    results = r.json()["detail"]

    assert results == "The page and/or limit cannot be less than zero!"
    assert r.status_code == 400


async def test_pagination_zero_issues(user_client: httpx.AsyncClient):
    r = await user_client.get("projects/1/issues")

    assert r.json()["results"] == "You don't have any issues for this project!"
    assert r.status_code == 200


async def test_projects_pagination_not_exist_page(user_client: httpx.AsyncClient):
    r = await user_client.get("projects?&page=999")

    assert r.json()["detail"] == "This page does not exist!"
    assert r.status_code == 404


async def test_get_projects(user_client: httpx.AsyncClient):
    r = await user_client.get("projects")
    assert r.status_code == 200


async def test_get_not_exist_project(user_client: httpx.AsyncClient):
    r = await user_client.get("projects/999")

    assert r.json()["detail"] == "Project not found!"
    assert r.status_code == 404


async def test_update_project(user_client: httpx.AsyncClient):
    r = await user_client.patch("projects/1", json={"favorite": True})
    assert r.status_code == 200


async def test_update_project_exist_key(user_client: httpx.AsyncClient):
    r = await user_client.patch("projects/2", json={"key": "test_key"})

    assert r.json()["detail"] == "Project with this key already exist!"
    assert r.status_code == 400


async def test_update_not_exist_project(user_client: httpx.AsyncClient):
    r = await user_client.patch("projects/999", json={"favorite": True})

    assert r.json()["detail"] == "The project for the update doesn't exist!"
    assert r.status_code == 400


async def test_create_issues(user_client: httpx.AsyncClient):
    r = await user_client.post("projects/1/issues", json={
        "title": "Test issue",
        "description": "Test",
        "type": "Bug",
        "priority": "Highest"
    })

    r2 = await user_client.post("projects/1/issues", json={
        "title": "Another test issue",
        "description": "Test searching",
        "type": "Bug"
    })

    assert r.status_code == 201
    assert r2.status_code == 201


async def test_create_issue_exist_title(user_client: httpx.AsyncClient):
    r = await user_client.post("projects/1/issues", json={
        "title": "Another test issue",
        "type": "Feature"
    })
    results = r.json()["detail"]

    assert results == "Issue with this title already exist!"
    assert r.status_code == 400


async def test_create_issue_for_not_exist_project(user_client: httpx.AsyncClient):
    r = await user_client.post("projects/999/issues", json={
        "title": "Wrong project",
        "type": "Bug"
    })
    results = r.json()["detail"]

    assert results == "You can't create an issue for a non-existent project!"
    assert r.status_code == 400


async def test_issues_pagination_not_exist_page(user_client: httpx.AsyncClient):
    r = await user_client.get("projects/1/issues?&page=999")

    assert r.json()["detail"] == "This page does not exist!"
    assert r.status_code == 404


async def test_get_issues(user_client: httpx.AsyncClient):
    r = await user_client.get("projects/1/issues")
    assert r.status_code == 200


async def test_get_issue(user_client: httpx.AsyncClient):
    r = await user_client.get("projects/1/issues/1")
    assert r.status_code == 200


async def test_get_not_exist_issue(user_client: httpx.AsyncClient):
    r = await user_client.get("projects/999/issues/999")
    res = r.json()["detail"]

    assert res == "Issue not found! Make sure that the correct data is passed."
    assert r.status_code == 404


async def test_update_issue(user_client: httpx.AsyncClient):
    r = await user_client.patch("projects/1/issues/1", json={"status": "Done"})
    assert r.status_code == 200


async def test_update_issue_exist_title(user_client: httpx.AsyncClient):
    r = await user_client.patch("projects/1/issues/2", json={"title": "Test issue"})

    assert r.json()["detail"] == "Issue with this title already exist!"
    assert r.status_code == 400


async def test_update_not_exist_issue(user_client: httpx.AsyncClient):
    r = await user_client.patch("projects/999/issues/999", json={"status": "Done"})

    assert r.json()["detail"] == "The issue for the update doesn't exist!"
    assert r.status_code == 400


async def test_search_no_results(user_client: httpx.AsyncClient):
    r = await user_client.get("search?q=hello")
    assert r.json()["detail"] == "No results"


async def test_search_projects(user_client: httpx.AsyncClient):
    r = await user_client.get("search?q=test_name")
    results = r.json()

    assert results["projects"] == [{"id": 1, "name": "test_name"}]
    assert results["issues"] == []


async def test_search_issues(user_client: httpx.AsyncClient):
    r = await user_client.get("search?q=Test issue")
    results = r.json()

    assert results["projects"] == []
    assert results["issues"] == [
        {"id": 1, "project_id": 1, "title": "Test issue"},
        {"id": 2, "project_id": 1, "title": "Another test issue"}
    ]


async def test_search_results(user_client: httpx.AsyncClient):
    r = await user_client.get("search?q=test")
    results = r.json()

    assert results["projects"] == [
        {"id": 1, "name": "test_name"},
        {"id": 2, "name": "test_name2"}
    ]
    assert results["issues"] == [
        {"id": 1, "project_id": 1, "title": "Test issue"},
        {"id": 2, "project_id": 1, "title": "Another test issue"}
    ]


async def test_delete_issue(user_client: httpx.AsyncClient):
    r = await user_client.delete("projects/1/issues/1")
    assert r.status_code == 200


async def test_delete_not_exist_issue(user_client: httpx.AsyncClient):
    r = await user_client.delete("projects/1/issues/1")

    assert r.json()["detail"] == "The issue to delete doesn't exist!"
    assert r.status_code == 400


async def test_delete_project(user_client: httpx.AsyncClient):
    r = await user_client.delete("projects/1")
    assert r.status_code == 200


async def test_delete_not_exist_project(user_client: httpx.AsyncClient):
    r = await user_client.delete("projects/1")

    assert r.json()["detail"] == "The project to delete doesn't exist!"
    assert r.status_code == 400

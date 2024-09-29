import httpx


async def test_pagination_zero_projects(user_client: httpx.AsyncClient):
    r = await user_client.get("projects/")

    assert r.json()["results"] == "You don't have any project!"
    assert r.status_code == 200


async def test_pagination_page_less_then_zero(user_client: httpx.AsyncClient):
    r = await user_client.get("projects/?page=-1")
    results = r.json()["detail"]

    assert results == "The page and/or limit cannot be less than zero!"
    assert r.status_code == 400


async def test_pagination_limit_less_then_zero(user_client: httpx.AsyncClient):
    r = await user_client.get("projects/?limit=-1")
    results = r.json()["detail"]

    assert results == "The page and/or limit cannot be less than zero!"
    assert r.status_code == 400


async def test_pagination_page_and_limit_less_then_zero(
        user_client: httpx.AsyncClient
        ):
    r = await user_client.get("projects/?limit=-1")
    results = r.json()["detail"]

    assert results == "The page and/or limit cannot be less than zero!"
    assert r.status_code == 400


async def test_create_project(user_client: httpx.AsyncClient):
    r = await user_client.post("projects/", json={
        "name": "test_name",
        "key": "test_key",
        "type": "Fullstack",
        })
    assert r.status_code == 201


async def test_pagination_zero_issues(user_client: httpx.AsyncClient):
    r = await user_client.get("projects/1/issues/")

    assert r.json()["results"] == "You don't have any issues for this project!"
    assert r.status_code == 200


async def test_get_projects(user_client: httpx.AsyncClient):
    r = await user_client.get("projects/")
    assert r.status_code == 200


async def test_get_not_exist_project(user_client: httpx.AsyncClient):
    r = await user_client.get("projects/999")

    assert r.json()["detail"] == "Project not found!"
    assert r.status_code == 404


async def test_update_project(user_client: httpx.AsyncClient):
    r = await user_client.patch("projects/1", json={"starred": True})
    assert r.status_code == 200


async def test_update_not_exist_project(user_client: httpx.AsyncClient):
    r = await user_client.patch("projects/999", json={"starred": True})

    assert r.json()["detail"] == "The project for the update doesn't exist!"
    assert r.status_code == 400


async def test_create_issue(user_client: httpx.AsyncClient):
    r = await user_client.post("projects/1/issues/", json={
        "title": "Test issue",
        "description": "Test",
        "type": "Bug",
        "priority": "Highest",
        })
    assert r.status_code == 201


async def test_create_another_issue(user_client: httpx.AsyncClient):
    r = await user_client.post("projects/1/issues/", json={
        "title": "Another test issue",
        "type": "Bug"
        })
    assert r.status_code == 201


async def test_create_issue_for_not_exist_project(
        user_client: httpx.AsyncClient
        ):
    r = await user_client.post("projects/999/issues/", json={
        "title": "Wrong project",
        "type": "Bug",
        })
    results = r.json()["detail"]

    assert results == "You can't create an issue for a non-existent project!"
    assert r.status_code == 400


async def test_get_issues(user_client: httpx.AsyncClient):
    r = await user_client.get("projects/1/issues/")
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


async def test_update_not_exist_issue(user_client: httpx.AsyncClient):
    r = await user_client.patch(
        "projects/999/issues/999",
        json={"status": "Done"}
        )

    assert r.json()["detail"] == "The issue for the update doesn't exist!"
    assert r.status_code == 400


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

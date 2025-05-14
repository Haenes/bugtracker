from httpx import AsyncClient

PROJECT_ID = None
PROJECT2_ID = None
TASK_ID = None
TASK2_ID = None
INCORRECT_ID = '1fbe7f08-79ff-4c60-9c68-267f5cce8f84'
INVITE_TOKEN = 't7qvFh8Fmqy0-d1eWNMdlw'
INCORRECT_INVITE_TOKEN = 'a0aaAa0Aaaa0-a1aAAAaaa'


async def test_pagination_zero_projects(user_client: AsyncClient):
    r = await user_client.get("projects")

    assert r.json()["results"] == "You don't have any project!"
    assert r.status_code == 200


async def test_create_projects(user_client: AsyncClient):
    global PROJECT_ID, PROJECT2_ID

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
    PROJECT_ID = r.json()['id']
    PROJECT2_ID = r2.json()['id']


async def test_join_to_project(user_client: AsyncClient):
    r = await user_client.post(f'projects/join-to/{INVITE_TOKEN}')
    assert r.json()['status'] == 'Success'


async def test_join_to_project_incorrect(user_client: AsyncClient):
    r = await user_client.post(f'projects/join-to/{INCORRECT_INVITE_TOKEN}')
    assert r.status_code == 400
    assert r.json()['detail'] == 'Incorrect invite token!'


async def test_create_project_exist_key(user_client: AsyncClient):
    r = await user_client.post("projects", json={
        "name": "test_name3",
        "key": "test_key2"
    })

    assert r.json()["detail"] == "Project with this key already exist!"
    assert r.status_code == 400


async def test_create_projects_forbidden_chars(user_client: AsyncClient):
    r1 = await user_client.post("projects", json={
        "name": "test_name/",
        "key": "test_key3"
    })
    r2 = await user_client.post("projects", json={
        "name": "test_name\\",
        "key": "test_key4"
    })
    r3 = await user_client.post("projects", json={
        "name": "test_name:",
        "key": "test_key5"
    })
    r4 = await user_client.post("projects", json={
        "name": "test_name?",
        "key": "test_key6"
    })
    r5 = await user_client.post("projects", json={
        "name": "test=name",
        "key": "test_key7"
    })

    assert r1.json()["detail"] == (
        "Slashes, ':', '?' and '=' not allowed in project name!"
    )
    assert r1.status_code == 400

    assert r2.json()["detail"] == (
        "Slashes, ':', '?' and '=' not allowed in project name!"
    )
    assert r2.status_code == 400

    assert r3.json()["detail"] == (
        "Slashes, ':', '?' and '=' not allowed in project name!"
    )
    assert r3.status_code == 400

    assert r4.json()["detail"] == (
        "Slashes, ':', '?' and '=' not allowed in project name!"
    )
    assert r4.status_code == 400

    assert r5.json()["detail"] == (
        "Slashes, ':', '?' and '=' not allowed in project name!"
    )
    assert r5.status_code == 400


async def test_pagination_page_less_then_zero(user_client: AsyncClient):
    r = await user_client.get("projects?page=-1")
    results = r.json()["detail"]

    assert results == "The page and/or limit cannot be less than zero!"
    assert r.status_code == 400


async def test_pagination_limit_less_then_zero(user_client: AsyncClient):
    r = await user_client.get("projects?limit=-1")
    results = r.json()["detail"]

    assert results == "The page and/or limit cannot be less than zero!"
    assert r.status_code == 400


async def test_pagination_page_and_limit_less_then_zero(user_client: AsyncClient):
    r = await user_client.get("projects?page=-1&limit=-1")
    results = r.json()["detail"]

    assert results == "The page and/or limit cannot be less than zero!"
    assert r.status_code == 400


async def test_pagination_zero_tasks(user_client: AsyncClient):
    r = await user_client.get(f"projects/{PROJECT_ID}/tasks")

    assert r.json()["results"] == "You don't have any tasks for this project!"
    assert r.status_code == 200


async def test_projects_pagination_not_exist_page(user_client: AsyncClient):
    r = await user_client.get("projects?page=999")

    assert r.json()["detail"] == "This page does not exist!"
    assert r.status_code == 404


async def test_get_projects(user_client: AsyncClient):
    r = await user_client.get("projects")
    assert r.status_code == 200


async def test_get_not_exist_project(user_client: AsyncClient):
    r = await user_client.get(f"projects/{INCORRECT_ID}")

    assert r.json()["detail"] == "Project not found!"
    assert r.status_code == 404


async def test_update_project(user_client: AsyncClient):
    r = await user_client.patch(
        url=f"projects/{PROJECT_ID}",
        json={"is_favorite": True}
    )
    assert r.status_code == 200


async def test_update_project_exist_key(user_client: AsyncClient):
    r = await user_client.patch(
        url=f"projects/{PROJECT2_ID}",
        json={"key": "test_key"}
    )

    assert r.json()["detail"] == "Project with this key already exist!"
    assert r.status_code == 400


async def test_update_project_forbidden_chars(user_client: AsyncClient):
    r1 = await user_client.patch(
        url=f"projects/{PROJECT_ID}",
        json={"name": "test_name/"}
    )
    r2 = await user_client.patch(
        url=f"projects/{PROJECT_ID}",
        json={"name": "test_name\\"}
    )
    r3 = await user_client.patch(
        url=f"projects/{PROJECT2_ID}",
        json={"name": "test_name:"}
    )
    r4 = await user_client.patch(
        url=f"projects/{PROJECT2_ID}",
        json={"name": "test_name?"}
    )

    assert r1.json()["detail"] == (
        "Slashes, ':', '?' and '=' not allowed in project name!"
    )
    assert r1.status_code == 400

    assert r2.json()["detail"] == (
        "Slashes, ':', '?' and '=' not allowed in project name!"
    )
    assert r2.status_code == 400

    assert r3.json()["detail"] == (
        "Slashes, ':', '?' and '=' not allowed in project name!"
    )
    assert r3.status_code == 400

    assert r4.json()["detail"] == (
        "Slashes, ':', '?' and '=' not allowed in project name!"
    )
    assert r4.status_code == 400


async def test_update_not_exist_project(user_client: AsyncClient):
    r = await user_client.patch(
        url="projects/1fbe7f08-79ff-4c60-9c68-267f5cce8f84",
        json={"favorite": True}
    )

    assert r.json()["detail"] == "The project for the update doesn't exist!"
    assert r.status_code == 400


async def test_create_tasks(user_client: AsyncClient):
    global TASK_ID, TASK2_ID

    r = await user_client.post(
        url=f"projects/{PROJECT_ID}/tasks",
        json={
            "name": "Test task",
            "description": "Test"
        }
    )

    r2 = await user_client.post(
        url=f"projects/{PROJECT_ID}/tasks",
        json={
            "name": "Another test task",
            "description": "Test searching",
        }
    )

    assert r.status_code == 201
    assert r2.status_code == 201
    TASK_ID = r.json()['id']
    TASK2_ID = r2.json()['id']


async def test_create_task_exist_name(user_client: AsyncClient):
    r = await user_client.post(
        url=f"projects/{PROJECT_ID}/tasks",
        json={"name": "Another test task"}
    )
    results = r.json()["detail"]

    assert results == "Task with this name already exist!"
    assert r.status_code == 400


async def test_create_task_for_not_exist_project(user_client: AsyncClient):
    r = await user_client.post(
        url=f"projects/{INCORRECT_ID}/tasks",
        json={"name": "Wrong project"}
    )
    results = r.json()["detail"]

    assert results == "You can't create an task for a non-existent project!"
    assert r.status_code == 400


async def test_tasks_pagination_not_exist_page(user_client: AsyncClient):
    r = await user_client.get(f"projects/{PROJECT_ID}/tasks?page=999")

    assert r.json()["detail"] == "This page does not exist!"
    assert r.status_code == 404


async def test_get_tasks(user_client: AsyncClient):
    r = await user_client.get(f"projects/{PROJECT_ID}/tasks")
    assert r.status_code == 200


async def test_get_task(user_client: AsyncClient):
    r = await user_client.get(f"projects/{PROJECT_ID}/tasks/{TASK_ID}")
    assert r.status_code == 200


async def test_get_not_exist_task(user_client: AsyncClient):
    r = await user_client.get(f"projects/{PROJECT_ID}/tasks/{INCORRECT_ID}")
    res = r.json()["detail"]

    assert res == "Task not found! Make sure that the correct data is passed."
    assert r.status_code == 404


async def test_update_task(user_client: AsyncClient):
    r = await user_client.patch(
        url=f"projects/{PROJECT_ID}/tasks/{TASK_ID}",
        json={"status": "Done"}
    )
    assert r.status_code == 200


async def test_update_task_exist_name(user_client: AsyncClient):
    r = await user_client.patch(
        url=f"projects/{PROJECT_ID}/tasks/{TASK2_ID}",
        json={"name": "Test task"}
    )

    assert r.json()["detail"] == "Task with this name already exist!"
    assert r.status_code == 400


async def test_update_not_exist_task(user_client: AsyncClient):
    r = await user_client.patch(
        url=f"projects/{INCORRECT_ID}/tasks/{INCORRECT_ID}",
        json={"status": 4}
    )

    assert r.json()["detail"] == "The task for the update doesn't exist!"
    assert r.status_code == 400


async def test_search_no_results(user_client: AsyncClient):
    r = await user_client.get("search?q=hello")
    assert r.json()["detail"] == "No results"


async def test_search_projects(user_client: AsyncClient):
    r = await user_client.get("search?q=test_name")
    results = r.json()

    assert results["projects"] == [{
        "id": PROJECT_ID,
        "name": "test_name",
        "key": "test_key"
    }]
    assert results["tasks"] == []


async def test_search_tasks(user_client: AsyncClient):
    r = await user_client.get("search?q=Test task")
    results = r.json()

    assert results["projects"] == []
    assert results["tasks"] == [
        {"id": TASK_ID, "project_id": PROJECT_ID, "name": "Test task"},
        {"id": TASK2_ID, "project_id": PROJECT_ID, "name": "Another test task"}
    ]


async def test_search_results(user_client: AsyncClient):
    r = await user_client.get("search?q=test")
    results = r.json()

    assert results["projects"] == [
        {"id": PROJECT_ID, "name": "test_name", "key": "test_key"},
        {"id": PROJECT2_ID, "name": "test_name2", "key": "test_key2"}
    ]
    assert results["tasks"] == [
        {"id": TASK_ID, "project_id": PROJECT_ID, "name": "Test task"},
        {"id": TASK2_ID, "project_id": PROJECT_ID, "name": "Another test task"}
    ]


async def test_delete_task(user_client: AsyncClient):
    r = await user_client.delete(f"projects/{PROJECT_ID}/tasks/{TASK_ID}")
    assert r.status_code == 200


async def test_delete_not_exist_task(user_client: AsyncClient):
    r = await user_client.delete(f"projects/{PROJECT_ID}/tasks/{INCORRECT_ID}")

    assert r.json()["detail"] == "The task to delete doesn't exist!"
    assert r.status_code == 400


async def test_delete_project(user_client: AsyncClient):
    r = await user_client.delete(f"projects/{PROJECT_ID}")
    assert r.status_code == 200


async def test_delete_not_exist_project(user_client: AsyncClient):
    r = await user_client.delete(f"projects/{INCORRECT_ID}")

    assert r.json()["detail"] == "The project to delete doesn't exist!"
    assert r.status_code == 400

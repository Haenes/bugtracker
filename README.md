# BugTracker

# The meaning of this branch
As part of this branch, I plan to redesign the database structure and related application details.
As a result, it will be changed/added:
1) Issue(s) will be changed to task(s), just for convenience;
2) Collaborate with other users - the ability to share access to your projects and, accordingly, their tasks;
3) Simple RBAC, without permissions, just roles;
4) A new status for tasks will be added, a la "Not assigned". Which means that no one is working on the task yet;
5) The ability to leave comments under tasks;
6) The ability to set a deadline for a task.
7) Along the way, various changes will be made here and there. For example, updating dependencies, deleting mail for API users.

# DB Schema's
Thank [drawdb](https://www.drawdb.app/) for the convenient service.
1) Old:![db_v1 0](https://github.com/user-attachments/assets/92495a3f-681c-4e52-a4ca-e825945ad6e8)
2) New:![db_v2 0](https://github.com/user-attachments/assets/1c3d4a6c-070f-4686-8b95-64564e69eff5)

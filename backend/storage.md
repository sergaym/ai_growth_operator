🔑 Access Logic
/global/public/: visible to all users in all workspaces.
/{workspaceId}/public/: visible to all users within that workspace.
/{workspaceId}/private/{userId}/: visible only to that user (or per access control).
/{workspaceId}/private/shared/: visible to a subset of users in the workspace.

💡DB Metadata Table (include fields like):
scope: global / workspace / private
workspace_id: null for global
visibility: public / restricted
allowed_users: optional (JSON/array)

/global/
├── public/
│   ├── videos/
│   ├── images/
│   └── audios/

/{workspaceId}/
├── public/
│   ├── videos/
│   ├── images/
│   └── audios/
├── private/
│   ├── {userId}/
│   │   ├── videos/
│   │   ├── images/
│   │   └── audios/
│   └── shared/
│       ├── videos/
│       ├── images/
│       └── audios/

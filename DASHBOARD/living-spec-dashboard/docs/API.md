# API Documentation

This document describes the REST API endpoints for the Living Spec Dashboard integrations.

## Base URL

```
http://localhost:3000/api
```

## Authentication

External integrations (GitHub, Jira) are authenticated using tokens configured in environment variables. No additional authentication is required for API endpoints.

## Rate Limits

All endpoints are rate limited per client IP:

- **GitHub endpoints**: 30 requests per minute
- **Jira endpoints**: 20 requests per minute  
- **Health endpoint**: 60 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1705123456789
Retry-After: 60
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "retryAfter": 60
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request
- `401` - Authentication Error
- `429` - Rate Limited
- `503` - Service Unavailable (integration disabled)
- `500` - Internal Server Error

## GitHub Endpoints

### GET /api/github/commits

Fetch repository commits with optional filtering.

#### Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `since` | string | ISO date to filter commits after | - |
| `until` | string | ISO date to filter commits before | - |
| `author` | string | Filter commits by author | - |
| `per_page` | integer | Number of results per page (1-100) | 30 |
| `page` | integer | Page number | 1 |

#### Example Request

```bash
curl "http://localhost:3000/api/github/commits?since=2024-01-01&per_page=10"
```

#### Example Response

```json
{
  "data": [
    {
      "id": "abc123def456",
      "message": "Fix authentication bug in login component",
      "author": {
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://avatars.githubusercontent.com/u/123456"
      },
      "timestamp": "2024-01-15T10:30:00Z",
      "url": "https://github.com/owner/repo/commit/abc123def456",
      "source": "github"
    }
  ],
  "meta": {
    "count": 1,
    "source": "github",
    "cached": true
  }
}
```

### GET /api/github/releases

Fetch repository releases.

#### Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `per_page` | integer | Number of results per page (1-100) | 30 |
| `page` | integer | Page number | 1 |

#### Example Request

```bash
curl "http://localhost:3000/api/github/releases?per_page=5"
```

#### Example Response

```json
{
  "data": [
    {
      "id": "123456",
      "version": "v1.2.0",
      "name": "Major Feature Release",
      "description": "Added new dashboard components and improved performance",
      "isDraft": false,
      "isPrerelease": false,
      "createdAt": "2024-01-10T09:00:00Z",
      "publishedAt": "2024-01-15T14:00:00Z",
      "author": {
        "name": "release-bot",
        "avatar": "https://avatars.githubusercontent.com/u/123456"
      },
      "url": "https://github.com/owner/repo/releases/tag/v1.2.0",
      "source": "github"
    }
  ],
  "meta": {
    "count": 1,
    "source": "github",
    "cached": true
  }
}
```

### GET /api/github/milestones

Fetch repository milestones.

#### Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `state` | string | Filter by state: `open`, `closed`, `all` | `open` |
| `sort` | string | Sort by: `due_on`, `completeness` | `due_on` |
| `direction` | string | Sort direction: `asc`, `desc` | `asc` |
| `per_page` | integer | Number of results per page (1-100) | 30 |
| `page` | integer | Page number | 1 |

#### Example Request

```bash
curl "http://localhost:3000/api/github/milestones?state=open&sort=completeness&direction=desc"
```

#### Example Response

```json
{
  "data": [
    {
      "id": "789012",
      "title": "Version 2.0 Release",
      "description": "Major version with breaking changes",
      "state": "open",
      "progress": {
        "open": 5,
        "closed": 15,
        "total": 20,
        "percentage": 75
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "dueDate": "2024-03-01T00:00:00Z",
      "url": "https://github.com/owner/repo/milestone/1",
      "source": "github"
    }
  ],
  "meta": {
    "count": 1,
    "source": "github",
    "cached": true
  }
}
```

## Jira Endpoints

### GET /api/jira/issues

Fetch project issues with optional filtering.

#### Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `filter` | string | Predefined filter: `active`, `completed`, `high-priority` | - |
| `jql` | string | Custom JQL query | - |
| `startAt` | integer | Starting index for pagination | 0 |
| `maxResults` | integer | Maximum number of results (1-100) | 50 |
| `days` | integer | Number of days for `completed` filter | 30 |

#### Example Requests

```bash
# Get active issues
curl "http://localhost:3000/api/jira/issues?filter=active&maxResults=10"

# Get high priority issues
curl "http://localhost:3000/api/jira/issues?filter=high-priority"

# Get completed issues from last 7 days
curl "http://localhost:3000/api/jira/issues?filter=completed&days=7"

# Custom JQL query
curl "http://localhost:3000/api/jira/issues?jql=assignee=currentUser()%20AND%20status=Open"
```

#### Example Response

```json
{
  "data": [
    {
      "id": "10001",
      "key": "PROJ-123",
      "title": "Implement user authentication system",
      "description": "Add OAuth2 integration with GitHub and Google providers",
      "status": {
        "name": "In Progress",
        "category": "inprogress"
      },
      "priority": {
        "name": "High",
        "level": "high",
        "icon": "https://example.atlassian.net/images/icons/priorities/high.svg"
      },
      "assignee": {
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "avatar": "https://avatar.url"
      },
      "reporter": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "avatar": "https://avatar.url"
      },
      "createdAt": "2024-01-10T09:00:00.000Z",
      "updatedAt": "2024-01-15T14:30:00.000Z",
      "resolvedAt": null,
      "labels": ["authentication", "security", "oauth"],
      "components": ["Backend", "Security"],
      "url": "https://example.atlassian.net/browse/PROJ-123",
      "source": "jira"
    }
  ],
  "meta": {
    "count": 1,
    "source": "jira",
    "filter": "active",
    "cached": true
  }
}
```

### POST /api/jira/issues

Execute custom JQL search.

#### Request Body

```json
{
  "jql": "project = PROJ AND status = Open ORDER BY priority DESC",
  "startAt": 0,
  "maxResults": 25,
  "fields": ["summary", "status", "priority", "assignee"]
}
```

#### Example Request

```bash
curl -X POST "http://localhost:3000/api/jira/issues" \
  -H "Content-Type: application/json" \
  -d '{
    "jql": "project = PROJ AND assignee = currentUser()",
    "maxResults": 10
  }'
```

#### Example Response

```json
{
  "data": [
    {
      "id": "10002",
      "key": "PROJ-124",
      "title": "Update API documentation",
      "status": {
        "name": "To Do",
        "category": "todo"
      },
      "priority": {
        "name": "Medium",
        "level": "medium"
      },
      "assignee": {
        "name": "Current User",
        "email": "user@example.com",
        "avatar": "https://avatar.url"
      },
      "url": "https://example.atlassian.net/browse/PROJ-124",
      "source": "jira"
    }
  ],
  "meta": {
    "count": 1,
    "total": 5,
    "startAt": 0,
    "maxResults": 10,
    "source": "jira",
    "cached": false
  }
}
```

### GET /api/jira/project

Fetch project information.

#### Example Request

```bash
curl "http://localhost:3000/api/jira/project"
```

#### Example Response

```json
{
  "data": {
    "id": "10000",
    "key": "PROJ",
    "name": "Demo Project",
    "description": "A demonstration project for the Living Spec Dashboard",
    "lead": {
      "name": "Project Lead",
      "email": "lead@example.com"
    },
    "issueTypes": [
      {
        "id": "1",
        "name": "Epic",
        "description": "A large body of work that can be broken down into smaller stories",
        "icon": "https://example.atlassian.net/images/icons/issuetypes/epic.svg"
      },
      {
        "id": "2",
        "name": "Story",
        "description": "A user story or feature request",
        "icon": "https://example.atlassian.net/images/icons/issuetypes/story.svg"
      },
      {
        "id": "3",
        "name": "Bug",
        "description": "A problem or error in the system",
        "icon": "https://example.atlassian.net/images/icons/issuetypes/bug.svg"
      }
    ],
    "url": "https://example.atlassian.net/projects/PROJ",
    "source": "jira"
  },
  "meta": {
    "source": "jira",
    "cached": true
  }
}
```

## Health Check Endpoint

### GET /api/integrations/health

Check the health and status of all configured integrations.

#### Example Request

```bash
curl "http://localhost:3000/api/integrations/health"
```

#### Example Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T15:30:00.000Z",
  "integrations": [
    {
      "name": "github",
      "enabled": true,
      "healthy": true,
      "lastCheck": "2024-01-15T15:30:00.000Z",
      "nextCheck": "2024-01-15T15:35:00.000Z",
      "errorCount": 0,
      "rateLimit": {
        "remaining": 4500,
        "resetTime": "2024-01-15T16:00:00.000Z"
      }
    },
    {
      "name": "jira",
      "enabled": true,
      "healthy": true,
      "lastCheck": "2024-01-15T15:30:00.000Z",
      "nextCheck": "2024-01-15T15:35:00.000Z",
      "errorCount": 0
    }
  ],
  "summary": {
    "total": 2,
    "enabled": 2,
    "healthy": 2,
    "degraded": 0
  }
}
```

#### Status Values

- `healthy` - All enabled integrations are working
- `degraded` - Some integrations are failing
- `unhealthy` - All enabled integrations are failing
- `no-integrations` - No integrations are enabled
- `error` - Health check system error

## Data Types

### Common Types

#### Author/User
```typescript
{
  name: string;
  email: string;
  avatar?: string;
}
```

#### Meta Information
```typescript
{
  count: number;
  source: 'github' | 'jira';
  cached: boolean;
  total?: number;        // For paginated results
  startAt?: number;      // For paginated results
  maxResults?: number;   // For paginated results
  filter?: string;       // For filtered results
}
```

### GitHub Types

#### Commit
```typescript
{
  id: string;
  message: string;
  author: Author;
  timestamp: string;     // ISO date
  url: string;
  source: 'github';
}
```

#### Release
```typescript
{
  id: string;
  version: string;
  name: string;
  description: string;
  isDraft: boolean;
  isPrerelease: boolean;
  createdAt: string;     // ISO date
  publishedAt: string;   // ISO date
  author: Author;
  url: string;
  source: 'github';
}
```

#### Milestone
```typescript
{
  id: string;
  title: string;
  description: string;
  state: 'open' | 'closed';
  progress: {
    open: number;
    closed: number;
    total: number;
    percentage: number;
  };
  createdAt: string;     // ISO date
  updatedAt: string;     // ISO date
  dueDate?: string;      // ISO date
  url: string;
  source: 'github';
}
```

### Jira Types

#### Issue
```typescript
{
  id: string;
  key: string;
  title: string;
  description?: string;
  status: {
    name: string;
    category: 'todo' | 'inprogress' | 'done';
  };
  priority: {
    name: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    icon?: string;
  };
  assignee?: User;
  reporter: User;
  createdAt: string;     // ISO date
  updatedAt: string;     // ISO date
  resolvedAt?: string;   // ISO date
  labels: string[];
  components: string[];
  url: string;
  source: 'jira';
}
```

#### Project
```typescript
{
  id: string;
  key: string;
  name: string;
  description?: string;
  lead: User;
  issueTypes: Array<{
    id: string;
    name: string;
    description: string;
    icon?: string;
  }>;
  url: string;
  source: 'jira';
}
```

## Example Usage

### React Hook for API Integration

```typescript
import { useState, useEffect } from 'react';

function useGitHubCommits() {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const response = await fetch('/api/github/commits?per_page=10');
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        setCommits(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, []);

  return { commits, loading, error };
}
```

### Error Handling Example

```javascript
async function fetchWithErrorHandling(url) {
  try {
    const response = await fetch(url);
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
    }
    
    if (response.status === 503) {
      throw new Error('Integration not available');
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```
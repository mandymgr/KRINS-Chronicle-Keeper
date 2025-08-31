# Integration Setup Guide

This guide explains how to configure and use the GitHub and Jira integrations in the Living Spec Dashboard.

## Overview

The dashboard supports read-only integrations with:
- **GitHub** - Fetch commits, releases, and milestones
- **Jira** - Retrieve issues, projects, and statistics

All integrations are optional and controlled by feature flags. The dashboard gracefully degrades when integrations are disabled or unavailable.

## Environment Configuration

### 1. Copy Environment Template

```bash
cp .env.example .env.local
```

### 2. Integration Feature Flags

Enable/disable integrations using these flags:

```env
# Integration toggles
INTEGRATION_GITHUB=off  # or 'on' to enable
INTEGRATION_JIRA=off    # or 'on' to enable

# Environment
NODE_ENV=development
```

### 3. GitHub Configuration

To enable GitHub integration, you need:

1. **GitHub Personal Access Token** with these permissions:
   - `repo:status` - Access commit status
   - `public_repo` - Access public repository metadata
   - `read:org` - Read organization data (if using organization repos)

2. **Repository Information**:

```env
INTEGRATION_GITHUB=on
GITHUB_OWNER=your-username-or-org
GITHUB_REPO=your-repository-name
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Creating a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Set expiration and select required scopes
4. Copy the token and add it to your `.env.local`

### 4. Jira Configuration

To enable Jira integration, you need:

1. **Jira API Token**:
   - Go to Atlassian Account Settings → Security → API tokens
   - Create a new API token

2. **Project Information**:

```env
INTEGRATION_JIRA=on
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token-here
JIRA_PROJECT_KEY=YOUR-PROJECT-KEY
```

#### Finding Your Jira Project Key

1. Go to your Jira project
2. The project key is shown in the project sidebar or URL
3. Example: `DEMO` for project "Demo Project"

## API Endpoints

### GitHub Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/github/commits` | GET | Fetch repository commits | `since`, `until`, `author`, `per_page`, `page` |
| `/api/github/releases` | GET | Fetch repository releases | `per_page`, `page` |
| `/api/github/milestones` | GET | Fetch repository milestones | `state`, `sort`, `direction`, `per_page`, `page` |

### Jira Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/jira/issues` | GET | Fetch project issues | `filter`, `jql`, `startAt`, `maxResults` |
| `/api/jira/issues` | POST | Custom JQL search | Body: `jql`, `startAt`, `maxResults`, `fields` |
| `/api/jira/project` | GET | Fetch project information | - |

### Health Check

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/integrations/health` | GET | Check integration status and health |

## Rate Limiting

The dashboard implements comprehensive rate limiting:

### Default Limits

- **GitHub Integration**: 5000 requests/hour (matches GitHub's limit)
- **Jira Integration**: 100 requests/minute (conservative)
- **API Routes**: 30 requests/minute per client

### Rate Limit Headers

API responses include rate limit information:

```
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1705123456789
Retry-After: 60
```

## Caching Strategy

### Cache Duration

- **GitHub Commits**: 5 minutes
- **GitHub Releases**: 10 minutes
- **GitHub Milestones**: 5 minutes
- **Jira Issues**: 3 minutes
- **Jira Project**: 30 minutes

### Cache Keys

The system uses structured cache keys:
- `github:commits:owner/repo`
- `github:releases:owner/repo`
- `jira:issues:PROJECT-KEY`
- `jira:project:PROJECT-KEY`

## Security Considerations

### Token Security

- **Never commit tokens to version control**
- Use environment variables only
- Rotate tokens regularly
- Use minimum required permissions

### API Access

- All external API calls use HTTPS
- Tokens are validated on startup
- Failed authentication is logged but tokens are never logged
- Rate limiting prevents abuse

### Error Handling

- Graceful degradation when integrations fail
- No sensitive information in error messages
- Proper HTTP status codes
- Comprehensive logging for debugging

## Troubleshooting

### Common Issues

#### GitHub Integration Not Working

1. **Check environment variables**:
   ```bash
   echo $INTEGRATION_GITHUB
   echo $GITHUB_OWNER
   echo $GITHUB_REPO
   ```

2. **Validate token permissions**:
   - Test with curl:
   ```bash
   curl -H "Authorization: Bearer $GITHUB_TOKEN" \
        https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO
   ```

3. **Check rate limits**:
   ```bash
   curl -H "Authorization: Bearer $GITHUB_TOKEN" \
        https://api.github.com/rate_limit
   ```

#### Jira Integration Not Working

1. **Verify credentials**:
   ```bash
   curl -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
        "$JIRA_BASE_URL/rest/api/3/myself"
   ```

2. **Test project access**:
   ```bash
   curl -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
        "$JIRA_BASE_URL/rest/api/3/project/$JIRA_PROJECT_KEY"
   ```

3. **Check permissions**:
   - Ensure you have "Browse Projects" permission
   - Verify project key is correct

### Debug Mode

Enable debug logging:

```env
NODE_ENV=development
```

Check logs for detailed error information:

```bash
bun run dev
```

### Health Check Endpoint

Monitor integration health:

```bash
curl http://localhost:3000/api/integrations/health
```

Response example:
```json
{
  "status": "healthy",
  "integrations": [
    {
      "name": "github",
      "enabled": true,
      "healthy": true,
      "rateLimit": {
        "remaining": 4500,
        "resetTime": "2024-01-15T11:00:00Z"
      }
    }
  ]
}
```

## Development

### Running Tests

```bash
# Run all tests
bun test

# Run integration tests
bun test __tests__/lib/

# Run API tests
bun test __tests__/api/

# Run component tests
bun test __tests__/components/
```

### Adding New Integrations

1. Create integration module in `/lib/integrations/`
2. Add mapper functions in `/lib/mappers.ts`
3. Create API routes in `/app/api/`
4. Add environment validation in `/lib/env.ts`
5. Update UI components
6. Write tests

### Local Development

For local development without real integrations:

```env
INTEGRATION_GITHUB=off
INTEGRATION_JIRA=off
```

The dashboard will use static data and show integration status as disabled.

## Deployment

### Production Environment

1. Set up environment variables in your hosting provider
2. Ensure tokens have appropriate production permissions
3. Monitor rate limits and adjust cache durations
4. Set up health check monitoring
5. Enable logging and error tracking

### Environment Variables Checklist

- [ ] `NODE_ENV=production`
- [ ] `INTEGRATION_GITHUB=on` (if using)
- [ ] `GITHUB_TOKEN` (secure, with minimal permissions)
- [ ] `GITHUB_OWNER` and `GITHUB_REPO`
- [ ] `INTEGRATION_JIRA=on` (if using)
- [ ] `JIRA_API_TOKEN` (secure)
- [ ] `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_PROJECT_KEY`

### Health Monitoring

Set up monitoring for:
- `/api/integrations/health` endpoint
- Rate limit approaching warnings
- Integration error rates
- Cache hit/miss ratios

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the logs in development mode
3. Test individual API endpoints
4. Verify environment configuration
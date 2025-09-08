# Advanced Search API Documentation

## Overview

The Advanced Search API of the Survivor project allows searching across different entity types (projects, events, news) with relevance scoring, filtering, and pagination. This API unifies the search across multiple data models, enabling users to quickly find relevant information in the application.

## Endpoint

```http
GET /api/search/
```

## Authentication

The API requires JWT token authentication. The token must be included in the request header:

```http
Authorization: Bearer <jwt_token>
```

## Input Parameters

The API accepts the following parameters in the query string:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | String | No | Global search term applied to all entity types |
| `sector` | String | No | Filter projects by business sector |
| `maturity` | String | No | Filter projects by maturity level |
| `location` | String | No | Filter by location (address or city) |
| `type` | String | No | Filter by result type (`project`, `event`, `news`) |
| `page` | Integer | No | Page number for pagination (starts at 1) |
| `page_size` | Integer | No | Number of results per page (maximum 50) |

## Input Formats

### Search and Filtering Parameters

Search parameters are transmitted via URL as query parameters. Here are some examples:

- Simple search:

  ```http
  /api/search/?search=artificial%20intelligence
  ```

- Search with filters:

  ```http
  /api/search/?search=pitch&sector=tech&location=Paris
  ```

- Search limited to one entity type:

  ```http
  /api/search/?search=funding&type=event&page=2&page_size=20
  ```

## Output Format

The response is in JSON format and includes a paginated structure containing search results. Each result includes basic information common to all entity types, as well as data specific to the type.

### Response Structure

```json
{
  "count": 42,            // Total number of results
  "next": "http://example.com/api/search/?page=2&search=ai",  // URL for next page (null if last page)
  "previous": null,       // URL for previous page (null if first page)
  "results": [            // List of results for current page
    {
      "id": 123,          // Entity ID
      "title": "Result title",   // Normalized title (name or title depending on entity)
      "description": "Result description",  // Text description
      "type": "project",  // Entity type ("project", "event", "news")
      "score": 5.5,       // Relevance score (higher = more relevant)
      "entity": {         // Complete data specific to entity type
        // Fields vary by entity type
      }
    },
    // ... other results
  ]
}
```

### Entity Details by Type

#### Projects (`type: "project"`)

The `entity` object for projects (StartupDetail) contains the following fields:

```json
{
  "id": 123,
  "name": "Project name",
  "description": "Detailed project description",
  "sector": "tech",
  "maturity": "seed",
  "address": "123 Startup Street, Paris",
  "website_url": "https://example.com",
  "project_status": "active",
  "founders": [
    {
      "id": 456,
      "name": "Founder name"
    }
  ],
  "result_type": "project"
}
```

#### Events (`type: "event"`)

The `entity` object for events (Event) contains the following fields:

```json
{
  "id": 789,
  "name": "Event name",
  "description": "Detailed event description",
  "event_type": "conference",
  "location": "Paris Expo Porte de Versailles",
  "dates": "2025-09-15T10:00:00Z",
  "result_type": "event"
}
```

#### News (`type: "news"`)

The `entity` object for news (NewsDetail) contains the following fields:

```json
{
  "id": 456,
  "title": "News title",
  "description": "Detailed news content",
  "category": "funding",
  "location": "Lyon",
  "news_date": "2025-08-20T14:30:00Z",
  "result_type": "news"
}
```

## Relevance Algorithm

Results are sorted according to a relevance score calculated using a simplified algorithm inspired by BM25. This score is determined by:

1. The presence of search terms in different fields of the entity
2. The weight assigned to each field (e.g., title has a higher weight than description)
3. The type of match (exact or partial)

Exact matches (whole words) receive a higher score than partial matches.

The field weights are:

- `name`, `title`: 2.0
- `sector`, `event_type`, `category`: 1.5
- `description`, `needs`: 1.0

For projects associated with founders matching the search terms, a score bonus (2.0) is added.

## Pagination

Results are paginated with the following parameters:

- Default page size: 10 results
- Maximum page size: 50 results
- Page size parameter: `page_size`
- Page number parameter: `page`

## Request Examples

### Searching for Projects in the Technology Sector

```bash
curl -X GET "http://localhost:8000/api/search/?search=artificial%20intelligence&sector=tech" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Searching for Events in Paris

```bash
curl -X GET "http://localhost:8000/api/search/?search=pitch&location=Paris&type=event" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Searching for News in the Funding Category

```bash
curl -X GET "http://localhost:8000/api/search/?search=series&category=funding&type=news" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Custom Pagination

```bash
curl -X GET "http://localhost:8000/api/search/?search=innovation&page=2&page_size=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## HTTP Status Codes

- `200 OK`: The request was successful, results are returned
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: The user does not have the necessary permissions
- `500 Internal Server Error`: Internal server error

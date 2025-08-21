# Notion API References

## 🔗 Notion API Tools

### Notion API - Create a Comment
**URL**: [Notion API - Create a comment](https://developers.notion.com/reference/post-comments)
**Category**: API
**Date Found**: 2025-08-21
**Last Verified**: 2025-08-21
**Status**: Active
**Priority**: High

**Description**: Official Notion API documentation for creating comments

**Key Information**:
- POST /v1/comments endpoint
- Required parameters: parent object and rich_text content
- Supports mentions and annotations
- Rate limiting considerations

**Relevance**: Essential for implementing comment functionality in Ultima-Orb

**Implementation Notes**:
- Use POST request to /v1/comments
- Include Authorization header with Bearer token
- Parent can be page_id or block_id
- Rich text content is required

**Tags**: [notion, api, comments, documentation]
**Dependencies**: Notion API access, authentication setup

---

### Notion API - Create a Database
**URL**: [Notion API - Create a database](https://developers.notion.com/reference/post-databases)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: High

**Description**: Official Notion API documentation for creating databases

**Key Information**:
- POST /v1/databases endpoint
- Required parameters: parent page_id and properties
- Supports various property types
- Icon and cover customization

**Relevance**: Essential for creating structured data storage in Notion

**Implementation Notes**:
- Use POST request to /v1/databases
- Include Authorization header with Bearer token
- Parent must be a page_id
- Properties define database structure

**Tags**: [notion, api, databases, documentation]
**Dependencies**: Notion API access, page permissions

---

### Notion API - Delete a Block
**URL**: [Notion API - Delete a block](https://developers.notion.com/reference/delete-a-block)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: High

**Description**: Official Notion API documentation for deleting blocks

**Key Information**:
- DELETE /v1/blocks/{block_id} endpoint
- Requires block_id parameter
- Cannot be undone
- Affects all child blocks

**Relevance**: Essential for content management and cleanup

**Implementation Notes**:
- Use DELETE request to /v1/blocks/{block_id}
- Include Authorization header with Bearer token
- Operation is permanent
- Consider user confirmation

**Tags**: [notion, api, blocks, delete, documentation]
**Dependencies**: Notion API access, block permissions

---

### Notion API - Get Block Children
**URL**: [Notion API - Retrieve block children](https://developers.notion.com/reference/get-block-children)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: High

**Description**: Official Notion API documentation for retrieving block children

**Key Information**:
- GET /v1/blocks/{block_id}/children endpoint
- Supports pagination with start_cursor and page_size
- Returns array of block objects
- Includes various block types

**Relevance**: Essential for reading and traversing Notion content

**Implementation Notes**:
- Use GET request to /v1/blocks/{block_id}/children
- Include Authorization header with Bearer token
- Handle pagination for large blocks
- Process different block types appropriately

**Tags**: [notion, api, blocks, read, documentation]
**Dependencies**: Notion API access, block permissions

---

### Notion API - Get Self
**URL**: [Notion API - Retrieve your token's bot user](https://developers.notion.com/reference/get-self)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: Medium

**Description**: Official Notion API documentation for retrieving bot user information

**Key Information**:
- GET /v1/users/me endpoint
- Returns bot user object
- Includes bot workspace information
- No parameters required

**Relevance**: Useful for authentication verification and bot setup

**Implementation Notes**:
- Use GET request to /v1/users/me
- Include Authorization header with Bearer token
- Verify bot permissions and workspace access
- Handle authentication errors

**Tags**: [notion, api, authentication, bot, documentation]
**Dependencies**: Valid Notion API token

---

### Notion API - Get User
**URL**: [Notion API - Retrieve a user](https://developers.notion.com/reference/get-user)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: Medium

**Description**: Official Notion API documentation for retrieving user information

**Key Information**:
- GET /v1/users/{user_id} endpoint
- Returns user object with profile information
- Supports both person and bot users
- Limited to accessible users

**Relevance**: Useful for user management and collaboration features

**Implementation Notes**:
- Use GET request to /v1/users/{user_id}
- Include Authorization header with Bearer token
- Handle different user types (person vs bot)
- Respect privacy and access limitations

**Tags**: [notion, api, users, documentation]
**Dependencies**: Notion API access, user permissions

---

### Notion API - Get Users
**URL**: [Notion API - List all users](https://developers.notion.com/reference/get-users)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: Medium

**Description**: Official Notion API documentation for listing all users

**Key Information**:
- GET /v1/users endpoint
- Supports pagination with start_cursor and page_size
- Returns array of user objects
- Limited to workspace users

**Relevance**: Useful for user management and collaboration features

**Implementation Notes**:
- Use GET request to /v1/users
- Include Authorization header with Bearer token
- Handle pagination for large workspaces
- Filter users by type if needed

**Tags**: [notion, api, users, list, documentation]
**Dependencies**: Notion API access, workspace permissions

---

### Notion API - Patch Block Children
**URL**: [Notion API - Append block children](https://developers.notion.com/reference/patch-block-children)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: High

**Description**: Official Notion API documentation for appending block children

**Key Information**:
- PATCH /v1/blocks/{block_id}/children endpoint
- Appends blocks to existing block
- Supports multiple block types
- Maintains block order

**Relevance**: Essential for dynamic content creation and updates

**Implementation Notes**:
- Use PATCH request to /v1/blocks/{block_id}/children
- Include Authorization header with Bearer token
- Provide array of block objects
- Consider block type compatibility

**Tags**: [notion, api, blocks, append, documentation]
**Dependencies**: Notion API access, block permissions

---

### Notion API - Patch Page
**URL**: [Notion API - Update page properties](https://developers.notion.com/reference/patch-page)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: High

**Description**: Official Notion API documentation for updating page properties

**Key Information**:
- PATCH /v1/pages/{page_id} endpoint
- Updates page properties and metadata
- Supports partial updates
- Includes icon and cover updates

**Relevance**: Essential for page management and content updates

**Implementation Notes**:
- Use PATCH request to /v1/pages/{page_id}
- Include Authorization header with Bearer token
- Provide only properties to update
- Handle property type validation

**Tags**: [notion, api, pages, update, documentation]
**Dependencies**: Notion API access, page permissions

---

### Notion API - Post Database Query
**URL**: [Notion API - Query a database](https://developers.notion.com/reference/post-database-query)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: High

**Description**: Official Notion API documentation for querying databases

**Key Information**:
- POST /v1/databases/{database_id}/query endpoint
- Supports complex filtering and sorting
- Returns paginated results
- Includes page objects

**Relevance**: Essential for data retrieval and analysis

**Implementation Notes**:
- Use POST request to /v1/databases/{database_id}/query
- Include Authorization header with Bearer token
- Handle complex filter and sort parameters
- Implement pagination for large datasets

**Tags**: [notion, api, databases, query, documentation]
**Dependencies**: Notion API access, database permissions

---

### Notion API - Post Page
**URL**: [Notion API - Create a page](https://developers.notion.com/reference/post-page)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: High

**Description**: Official Notion API documentation for creating pages

**Key Information**:
- POST /v1/pages endpoint
- Creates pages in databases or as children of other pages
- Supports rich content and properties
- Includes icon and cover customization

**Relevance**: Essential for content creation and management

**Implementation Notes**:
- Use POST request to /v1/pages
- Include Authorization header with Bearer token
- Provide parent (database_id or page_id)
- Include properties and content as needed

**Tags**: [notion, api, pages, create, documentation]
**Dependencies**: Notion API access, parent permissions

---

### Notion API - Post Search
**URL**: [Notion API - Search by title](https://developers.notion.com/reference/post-search)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: High

**Description**: Official Notion API documentation for searching content

**Key Information**:
- POST /v1/search endpoint
- Searches across pages and databases
- Supports filtering by object type
- Returns paginated results

**Relevance**: Essential for content discovery and navigation

**Implementation Notes**:
- Use POST request to /v1/search
- Include Authorization header with Bearer token
- Provide query string and filters
- Handle pagination for large result sets

**Tags**: [notion, api, search, documentation]
**Dependencies**: Notion API access, search permissions

---

### Notion API - Retrieve a Block
**URL**: [Notion API - Retrieve a block](https://developers.notion.com/reference/retrieve-a-block)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: High

**Description**: Official Notion API documentation for retrieving blocks

**Key Information**:
- GET /v1/blocks/{block_id} endpoint
- Returns block object with content
- Supports all block types
- Includes child block information

**Relevance**: Essential for reading and processing Notion content

**Implementation Notes**:
- Use GET request to /v1/blocks/{block_id}
- Include Authorization header with Bearer token
- Handle different block types appropriately
- Process child blocks if needed

**Tags**: [notion, api, blocks, retrieve, documentation]
**Dependencies**: Notion API access, block permissions

---

### Notion API - Retrieve a Comment
**URL**: [Notion API - Retrieve comments](https://developers.notion.com/reference/retrieve-a-comment)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: Medium

**Description**: Official Notion API documentation for retrieving comments

**Key Information**:
- GET /v1/comments/{comment_id} endpoint
- Returns comment object with content
- Includes author and timestamp information
- Supports rich text content

**Relevance**: Useful for comment management and moderation

**Implementation Notes**:
- Use GET request to /v1/comments/{comment_id}
- Include Authorization header with Bearer token
- Handle rich text content formatting
- Process author and timestamp information

**Tags**: [notion, api, comments, retrieve, documentation]
**Dependencies**: Notion API access, comment permissions

---

### Notion API - Retrieve a Database
**URL**: [Notion API - Retrieve a database](https://developers.notion.com/reference/retrieve-a-database)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: High

**Description**: Official Notion API documentation for retrieving databases

**Key Information**:
- GET /v1/databases/{database_id} endpoint
- Returns database object with properties
- Includes title, description, and icon
- Contains property definitions

**Relevance**: Essential for database structure analysis and management

**Implementation Notes**:
- Use GET request to /v1/databases/{database_id}
- Include Authorization header with Bearer token
- Process property definitions for UI generation
- Handle database metadata (title, description, icon)

**Tags**: [notion, api, databases, retrieve, documentation]
**Dependencies**: Notion API access, database permissions

---

### Notion API - Retrieve a Page
**URL**: [Notion API - Retrieve a page](https://developers.notion.com/reference/retrieve-a-page)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: High

**Description**: Official Notion API documentation for retrieving pages

**Key Information**:
- GET /v1/pages/{page_id} endpoint
- Returns page object with properties
- Includes content and metadata
- Supports different page types

**Relevance**: Essential for page reading and content processing

**Implementation Notes**:
- Use GET request to /v1/pages/{page_id}
- Include Authorization header with Bearer token
- Process page properties and content
- Handle different page types appropriately

**Tags**: [notion, api, pages, retrieve, documentation]
**Dependencies**: Notion API access, page permissions

---

### Notion API - Retrieve a Page Property
**URL**: [Notion API - Retrieve a page property item](https://developers.notion.com/reference/retrieve-a-page-property)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: Medium

**Description**: Official Notion API documentation for retrieving page properties

**Key Information**:
- GET /v1/pages/{page_id}/properties/{property_id} endpoint
- Returns specific property value
- Supports all property types
- More efficient than retrieving entire page

**Relevance**: Useful for efficient property access and updates

**Implementation Notes**:
- Use GET request to /v1/pages/{page_id}/properties/{property_id}
- Include Authorization header with Bearer token
- Handle different property types appropriately
- Consider efficiency vs. full page retrieval

**Tags**: [notion, api, pages, properties, retrieve, documentation]
**Dependencies**: Notion API access, page permissions

---

### Notion API - Update a Block
**URL**: [Notion API - Update a block](https://developers.notion.com/reference/update-a-block)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: High

**Description**: Official Notion API documentation for updating blocks

**Key Information**:
- PATCH /v1/blocks/{block_id} endpoint
- Updates block content and properties
- Supports partial updates
- Maintains block structure

**Relevance**: Essential for content editing and updates

**Implementation Notes**:
- Use PATCH request to /v1/blocks/{block_id}
- Include Authorization header with Bearer token
- Provide only properties to update
- Handle block type-specific updates

**Tags**: [notion, api, blocks, update, documentation]
**Dependencies**: Notion API access, block permissions

---

### Notion API - Update a Database
**URL**: [Notion API - Update a database](https://developers.notion.com/reference/update-a-database)
**Category**: API
**Date Found**: 2024-01-15
**Last Verified**: 2024-01-15
**Status**: Active
**Priority**: High

**Description**: Official Notion API documentation for updating databases

**Key Information**:
- PATCH /v1/databases/{database_id} endpoint
- Updates database properties and structure
- Supports property additions and modifications
- Includes title and description updates

**Relevance**: Essential for database management and schema evolution

**Implementation Notes**:
- Use PATCH request to /v1/databases/{database_id}
- Include Authorization header with Bearer token
- Provide only properties to update
- Handle property type changes carefully

**Tags**: [notion, api, databases, update, documentation]
**Dependencies**: Notion API access, database permissions

---

## 📊 Statistics
- **Total URLs**: 19
- **Active URLs**: 19
- **Broken URLs**: 0
- **Last Updated**: 2025-08-21

## 🔍 Quick Search
- `/url notion api` - Show all Notion API documentation
- `/url notion create` - Show creation endpoints
- `/url notion retrieve` - Show retrieval endpoints
- `/url notion update` - Show update endpoints
- `/url notion delete` - Show deletion endpoints

## 🎯 Implementation Priority
1. **High Priority**: Create, Retrieve, Update, Query operations
2. **Medium Priority**: Search, User management, Comments
3. **Low Priority**: Self information, Property-specific operations

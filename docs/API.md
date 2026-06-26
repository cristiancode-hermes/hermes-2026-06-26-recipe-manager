# API Reference

Base URL: `http://localhost:3000/api`

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "User Name",
  "password": "securepassword"
}
```

**Response 201:**
```json
{
  "user": { "id": 1, "email": "user@example.com", "name": "User Name" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response 200:**
```json
{
  "user": { "id": 1, "email": "user@example.com", "name": "User Name" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "user": { "id": 1, "email": "user@example.com", "name": "User Name" }
}
```

## Recipes

### List Recipes
```http
GET /recipes?search=chicken&difficulty=easy&sort=title
```

**Query Parameters:**
- `search` — Full-text search on title (LIKE %query%)
- `difficulty` — Filter by `easy`, `medium`, or `hard`
- `sort` — `title`, `newest` (default), `oldest`

**Response 200:**
```json
[
  {
    "id": 1,
    "title": "Classic Chicken Stir-fry",
    "description": "A quick and easy chicken stir-fry...",
    "prepTime": 15,
    "cookTime": 20,
    "difficulty": "easy",
    "servings": 4,
    "instructions": "[\"Dice chicken...\", \"Heat oil...\"]",
    "createdAt": "2026-06-26T...",
    "ingredients": [
      {
        "id": 1,
        "quantity": 2,
        "unit": "pieces",
        "notes": "diced",
        "ingredient": { "id": 1, "name": "Chicken Breast", "category": "meat" }
      }
    ]
  }
]
```

### Get Recipe
```http
GET /recipes/1
```

**Response 200:**
Same structure as above (single object). Returns 404 if not found.

### Create Recipe (Auth Required)
```http
POST /recipes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Recipe",
  "description": "Description text",
  "prepTime": 15,
  "cookTime": 30,
  "difficulty": "easy",
  "servings": 4,
  "instructions": ["Step 1", "Step 2"],
  "ingredients": [
    { "ingredientId": 1, "quantity": 2, "unit": "cups", "notes": "chopped" }
  ]
}
```

### Update Recipe (Auth Required)
```http
PATCH /recipes/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "ingredients": [
    { "ingredientId": 1, "quantity": 3, "unit": "cups" }
  ]
}
```

### Delete Recipe (Auth Required)
```http
DELETE /recipes/1
Authorization: Bearer <token>
```

**Response 200:**
```json
{ "deleted": true, "id": 1 }
```

## Ingredients

### List Ingredients
```http
GET /ingredients
```

### Create Ingredient (Auth Required)
```http
POST /ingredients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Ingredient",
  "category": "produce"
}
```

**Category values:** `produce`, `dairy`, `meat`, `pantry`, `grain`, `spice`, `other`

## Meal Plans

### List Meal Plans
```http
GET /meal-plans?start=2026-06-22&end=2026-06-28
```

**Response 200:**
```json
[
  {
    "id": 1,
    "date": "2026-06-26",
    "mealType": "dinner",
    "notes": null,
    "recipe": { "id": 1, "title": "...", ... }
  }
]
```

### Add Meal Plan (Auth Required)
```http
POST /meal-plans
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipeId": 1,
  "date": "2026-06-26",
  "mealType": "dinner",
  "notes": "optional notes"
}
```

**MealType values:** `breakfast`, `lunch`, `dinner`, `snack`

### Delete Meal Plan (Auth Required)
```http
DELETE /meal-plans/1
Authorization: Bearer <token>
```

## Shopping List

### Generate Shopping List
```http
GET /shopping-list?start=2026-06-22&end=2026-06-28
```

**Response 200:**
```json
{
  "startDate": "2026-06-22",
  "endDate": "2026-06-28",
  "items": [
    {
      "id": 1,
      "ingredientName": "Chicken Breast",
      "category": "meat",
      "quantity": 2,
      "unit": "pieces",
      "acquired": false
    },
    {
      "id": 2,
      "ingredientName": "Garlic",
      "category": "produce",
      "quantity": 9,
      "unit": "cloves",
      "acquired": false
    }
  ]
}
```

Items are consolidated by ingredient name — quantities are summed across all recipes in the date range. Grouped by ingredient category in the response.

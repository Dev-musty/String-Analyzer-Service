# String-Analyzer-Service
An API service that analyzes strings and stores their computed properties.

### Features
- Analyze and store string properties
- filter results by string inputed
- filtering by pre configured natural language queries (strings longer than 10 characters,palindromic strings that contain the first vowel,strings containing the letter z,all single word palindromic strings)
- deletion by string inputed

## Prerequisites
- Node.js 18+ (includes built-in `fetch`)
- npm 8+

## Setup
1. Dependencies
    -"body-parser": "^2.2.0",
    -"cors": "^2.8.5",
    -"dotenv": "^17.2.3",
    -"express": "^5.1.0",
    -"express-rate-limit": "^7.5.1",
    -"nodemon": "^3.1.10"
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file in the project root and set the port:
```bash
PORT=8000
```

## Run
- Development:
```bash
npm run dev
```
- Production:
```bash
npm start
```

The server will start on `http://localhost:<PORT>`.

## API
### API TEST -> `Swagger UI link`

### POST `/strings`
Returns a JSON payload containing the string properties.
#### Response Structure
```json
{
  "id": "sha256_hash_value",
  "value": "string to analyze",
  "properties": {
    "length": 16,
    "is_palindrome": false,
    "unique_characters": 12,
    "word_count": 3,
    "sha256_hash": "abc123...",
    "character_frequency_map": {
      "s": 2,
      "t": 3,
      "r": 2,
      // ... etc
    }
  },
  "created_at": "2025-08-27T10:00:00Z"
}
```


#### Request (JSON body or query string)
```json
{
  "value": "Zebra joe"
}
```

#### Response `201 Created`
```json
{
    "id": "8a4825382684dec43dcf97eb0a1ab8026c3ef05a37501528f4d22771b93cd4a6",
    "value": "Zebra joe",
    "properties": {
        "length": 9,
        "is_palindrome": false,
        "unique_characters": 6,
        "word_count": 2,
        "sha256_hash": "8a4825382684dec43dcf97eb0a1ab8026c3ef05a37501528f4d22771b93cd4a6",
        "character_frequency_map": {
            "z": 1,
            "e": 2,
            "b": 1,
            "r": 1,
            "a": 1,
            "j": 1,
            "o": 1
        }
    },
    "created_at": "2025-10-21T09:50:03.267Z"
}
```
#### Error response
- `409 Conflict`: String already exists in the system
- `400 Bad Request`: Invalid request body or missing "value" field
- `422 Unprocessable Entity`: Invalid data type for "value" (must be string)

### GET `/strings/filter-by-natural-language?query=strings containing the letter z`
Returns a JSON payload containing the result that match the natral laguage query.
#### Response Structure
```json
{
  "data": [ /* array of matching strings */ ],
  "count": 3,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": {
      "word_count": 1,
      "is_palindrome": true
    }
  }
}
```


#### Request (query string)
##### Queries to Support:

- "all single word palindromic strings" → word_count=1, is_palindrome=true
- "strings longer than 10 characters" → min_length=11
- "palindromic strings that contain the first vowel" → is_palindrome=true, contains_character=a (or similar heuristic)
- "strings containing the letter z" → contains_character=z

#### Response `200 OK`
```json
{
    "data": [
        {
            "id": "8a4825382684dec43dcf97eb0a1ab8026c3ef05a37501528f4d22771b93cd4a6",
            "value": "Zebra joe",
            "properties": {
                "length": 9,
                "is_palindrome": false,
                "unique_characters": 6,
                "word_count": 2,
                "sha256_hash": "8a4825382684dec43dcf97eb0a1ab8026c3ef05a37501528f4d22771b93cd4a6",
                "character_frequency_map": {
                    "z": 1,
                    "e": 2,
                    "b": 1,
                    "r": 1,
                    "a": 1,
                    "j": 1,
                    "o": 1
                }
            },
            "created_at": "2025-10-21T09:45:59.329Z"
        }
    ],
    "count": 1,
    "interpreted_query": {
        "original": "strings containing the letter z",
        "parsed_filters": {
            "character": true
        }
    }
}
```
#### Error responses
- `400 Bad Request` : Unable to parse natural language query
- `422 Unprocessable Entity` :Query parsed but resulted in conflicting filters

### GET `/strings?is_palindrome=false&min_length=5&max_length=10&word_count=2&contains_character=n`
Returns a JSON payload containing the string that match the filter querys.
#### Response Structure
```json
{
  "data": [
    {
      "id": "hash1",
      "value": "string1",
      "properties": { /* ... */ },
      "created_at": "2025-08-27T10:00:00Z"
    },
    // ... more strings
  ],
  "count": 15,
  "filters_applied": {
    "is_palindrome": true,
    "min_length": 5,
    "max_length": 20,
    "word_count": 2,
    "contains_character": "a"
  }
}
```


#### Request (query string)
##### Query parameters:
- is_palindrome: boolean (true/false)
- min_length: integer (minimum string length)
- max_length: integer (maximum string length)
- word_count: integer (exact word count)
- contains_character: string (single character to search for)

#### Response `200 OK`
```json
{
    "data": [
        {
            "id": "2f7e2089add0288a309abd71ffcc3b3567e2d4215e20e6ed3b74d6042f7ef8e5",
            "value": "my string",
            "properties": {
                "length": 9,
                "is_palindrome": false,
                "unique_characters": 8,
                "word_count": 2,
                "sha256_hash": "2f7e2089add0288a309abd71ffcc3b3567e2d4215e20e6ed3b74d6042f7ef8e5",
                "character_frequency_map": {
                    "m": 1,
                    "y": 1,
                    "s": 1,
                    "t": 1,
                    "r": 1,
                    "i": 1,
                    "n": 1,
                    "g": 1
                }
            },
            "created_at": "2025-10-21T08:30:52.877Z"
        },
        {
            "id": "94890005f3b2117a353da7260259531878cae4f541bf59998511887d1f0221a5",
            "value": "john doe",
            "properties": {
                "length": 8,
                "is_palindrome": false,
                "unique_characters": 5,
                "word_count": 2,
                "sha256_hash": "94890005f3b2117a353da7260259531878cae4f541bf59998511887d1f0221a5",
                "character_frequency_map": {
                    "j": 1,
                    "o": 2,
                    "h": 1,
                    "n": 1,
                    "d": 1,
                    "e": 1
                }
            },
            "created_at": "2025-10-21T08:31:01.589Z"
        }
    ],
    "count": 2,
    "filters_applied": {
        "is_palindrome": "false",
        "min_length": "5",
        "max_length": "10",
        "word_count": "2",
        "contains_character": "n"
    }
}
```
#### Error response
- `400 Bad Request`: Invalid query parameter values or types

### GET `/strings/:string_value`
Returns a JSON payload containing the properties of the specified string in the path parameter.
#### Response Structure
```json
{
  "id": "sha256_hash_value",
  "value": "requested string",
  "properties": { /* same as above */ },
  "created_at": "2025-08-27T10:00:00Z"
}
```


#### Request (JSON body or query string)
##### path parameter
- string_value = "hello world"

#### Response `200 OK`
```json
{
    "id": "64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c",
    "value": "Hello world",
    "properties": {
        "length": 11,
        "is_palindrome": false,
        "unique_characters": 5,
        "word_count": 2,
        "sha256_hash": "64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c",
        "character_frequency_map": {
            "H": 1,
            "e": 1,
            "l": 3,
            "o": 2,
            "w": 1,
            "r": 1,
            "d": 1
        }
    },
    "created_at": "2025-10-21T05:52:05.176Z"
}
```
#### Error response
- `404 Not Found`: String does not exist in the system

### DELETE `/strings/:string_value`
Returns a JSON payload an empty response body.
#### Response Structure
```json
{}
```


#### Request (JSON body or query string)
##### path parameter
- string_value = "hello world"

#### Response `204 No Content`
```json
{}
```
#### Error response
- `404 Not Found`: String does not exist in the system


## References
- Javascript Map constructor: https://www.w3schools.com/js/js_map_methods.asp
- sha256 : https://cryptojs.gitbook.io/docs/
- Word count: https://www.techbaz.org/scripts/js-strings-count.php

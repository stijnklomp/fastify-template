# Schemas directory

Schemas are responsible for validating incoming data in API requests. Schemas enforce data integrity rules and ensure that data submitted to the API meets the application's requirements. They get called by **routes** to validate incoming data. They may also be called by files that need type definitions for the validated data.
The schemas are used to generate an OpenAPI specification.

*Only put route (validation) schemas in this directory. Unrelated validation code should be placed elsewhere.*
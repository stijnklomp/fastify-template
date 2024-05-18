# Validators folder

Validators define schemas responsible for validating incoming data in API requests. Validators enforce data integrity rules and ensure that data submitted to the API meets the application's requirements. They get called by **routes** to validate incoming data. They may also be called by files that need type definitions for the validated data.
Together with the **serializers**, the validator schemas are used to generate an OpenAPI specification.

*Only put route validation schemas in this folder. Unrelated validation code should be placed elsewhere.*
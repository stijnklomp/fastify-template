# Validators folder

Validators define schemas responsible for validating incoming data in API requests. Validators enforce data integrity rules and ensure that data submitted to the API meets the application's requirements. They get called by **routes** to validate incoming data.
Together with the **serializers**, the validator schemas are used to generate an OpenAPI specification.
# API directory

Handles HTTP request/response lifecycle. The API process is I/O-bound and responsible for receiving requests, validating input, and delegating to services. It publishes CPU-intensive tasks to the message queue for the Worker process.


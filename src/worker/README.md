# Worker directory

Processes CPU-intensive or background tasks consumed from the message queue. The Worker process is CPU-bound and responsible for handling long-running operations that would block the API's event loop. It acknowledges messages upon successful completion.


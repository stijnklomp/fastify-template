# Routes directory

Routes define the endpoints/REST interface. They call on **controllers** to handle the HTTP requests.
*Note that routes are automatically imported and available.*

In this directory you should define all the routes that define the endpoints of your API.
Each service is a [Fastify plugin](https://fastify.dev/docs/latest/Reference/Plugins/), it is encapsulated (it can have its own independent plugins) and it is typically stored in a file; be careful to group your routes logically, e.g. all `/users` routes go to the `users.js` file. A `root.js` file exists accessible through '/'.

If a single file become too large, create an appropriately named directory and add an `index.js` file there: this file must be a Fastify plugin and it will be loaded automatically by the application. You can now add as many files as you want inside that directory.
In this way you can create complex routes within a single monolith, and eventually extract them.

If you need to share functionality between routes, place that functionality into the `plugins` directory, and share it via [decorators](https://fastify.dev/docs/latest/Reference/Decorators/).
# Middleware directory

Includes custom Fastify middlewares for authentication, authorization, logging, and other request/response transformations. These middlewares can be applied globally or to specific routes to extend Fastify’s core functionality.

Files in this directory are typically defined through the [`fastify-plugin`](https://github.com/fastify/fastify-plugin) module, making them non-encapsulated. They can define decorators and set hooks that will then be used in the rest of your application.

Check out:
* [The hitchhiker's guide to plugins](https://fastify.dev/docs/latest/Guides/Plugins-Guide/)
* [Fastify decorators](https://fastify.dev/docs/latest/Reference/Decorators/)
* [Fastify lifecycle](https://fastify.dev/docs/latest/Reference/Lifecycle/)
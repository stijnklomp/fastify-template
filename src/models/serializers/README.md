# Serializers folder

Serializers provide the mechanism for translating data between the internal Typescript data models and formats such as JSON that can be sent over the network in API responses. They mostly get called by **routes** to serialize outgoing data.
Together with the **validators**, the serializer schemas are used to generate an OpenAPI specification.
# sra-taxii2-server

Taxii2 server based on https://docs.google.com/document/d/1Jv9ICjUNZrOnwUXtenB1QcnBLO35RnjQcJLsa1mGSkI/pub#h.1fg89uogyma3

Uses Node.js with MongoDB backend.

Designed to be a full implementation of the spec with a separate manager application for easier integration into other projects or standalone use.

## Installation ##

Use the sra-taxii2-bundle project, not this project.

Get source for that, run docker-compose up

## Usage ##

``nodemon index.js``

## Features ##

Full Taxii 2.0 spec minus POST, Status, and complete error-handling related to content types and other scenarios

Tests
=======

To be implemented

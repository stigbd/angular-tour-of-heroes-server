# angular-tour-of-heroes-server

A small experimental project to investigate
-   jwt authentication
-   express server

The server acts as a back-end to my implementation of [the angular-tour-of-heros tutorial](https://github.com/stigbd/angular-tour-of-heroes.git).
## Requirements

### Node
A convenient way to install node is to install the excellent tool  [nvm](https://github.com/creationix/nvm)

And then:
```
$ nvm install node
```
### Docker (optional)
Install docker/docker-compose your preferred way. Very well documented here:
<https://docs.docker.com/engine/installation/>
<https://docs.docker.com/compose/install/>
### mongoDB
In a docker-scenario do:
```
docker run -p 127.0.0.1:27017:27017 --name heroes-database -d mongo
```
## Usage
```
$ git clone https://github.com/stigbd/angular-tour-of-heroes-server.git
$ cd angular-tour-of-heroes-server
$ npm install
$ npm start
```
Alternatively with Docker-compose:
```
$ docker-compose build
$ docker-compose up
```
## Test
Start the server in test-mode:
```
$ npm run start_test
```
In another terminal (shell):
```
$ npm test
```

## Credits
This project is based on the server part of <https://github.com/auth0-blog/angular2-tour-of-heroes>

For a nice and easy way of generating valid jwts, check <https://jwt.io/>

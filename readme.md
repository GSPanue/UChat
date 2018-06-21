<img align="left" src="https://raw.githubusercontent.com/gspanue/uchat/master/public/img/logo.png">

# UChat
An instant group messaging application built with [NodeJS](https://nodejs.org), [React](https://reactjs.org/), [Firebase](https://firebase.google.com/), and [Material-UI](https://www.material-ui.com).

## Live Demo
Click [here](https://uchat-demo.herokuapp.com) to view the demo.

## Installation
1. Clone the repository
2. Run ```npm install```

## Commands
```npm run build``` - Builds the project for production

```npm run start``` - Initialises a local server for development

```npm run test``` - Runs all of the tests located in the ```tests``` folder

## Firebase
You can use your own Firebase project by changing the ```config``` variable found in ```database/database.js``` with your Firebase project initialisation code. See [https://firebase.google.com/docs/web/setup](https://firebase.google.com/docs/web/setup) for more information.

```
const config = {
    // Your Firebase initialisation code here.
}
```

## Version
1.0

## Authors
Gurdev S. Panue
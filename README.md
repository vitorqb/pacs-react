## Personal ACcounting System - React Frontend ##

This is a react frontend to the `Pacs` project, hosted at
https://github.com/vitorqb/pacs . It connects to a server backend.

It was created with https://github.com/facebook/create-react-app and
ejected, even though most of it's features are untouched.


### Installing ###

You should be fine by running:

```shell
npm run install
```


### SettingUp ###

You will need to add a `src/secrets.json` file with the token to connect to the 
backend and the url to the backend:

```js
// - file src/secrets.json -
{
  "pacsAuthToken": "SOME VERY WEIRD TOKEN VALUE HERE",
  "urlServer": "http://my-pacs-server.com"
}
```


### Developing ###

You can start a tern server for js completion with
```
npm run tern
```

You can run the test suit (made with jest/enzyme) with
```
npm run test
```

You can run the development server (webpack-server0 with
```
npm run start
```

Build: !!!! TODO


### Deploying ###
!!!! TODO

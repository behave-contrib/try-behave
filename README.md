# Try Behave!

A website for trying out Python [Behave](https://behave.readthedocs.io/en/stable/) in the browser using [Pyodide](https://pyodide.org).

## Screenshot

![Behave-Gui screenshot](screenshot.png)

## Try it!

Try out `Try Behave!` live [here](https://fallwest.github.io/trybehave/).

## Local installation

You need [Node.js](https://nodejs.org) to build `Try Behave!`. To build and run `Try Behave!` locally, clone this repo, `cd` into the repository folder and run `npm install`. To start at the application at http://localhost:3000/trybehave, run `npm start`.

## Acknowledgements

The example features, feature step implementations and model classes are Copyright (c) their respective owners. The relevant copyright notices and license information are included at the top of each source file.

This repository redistributes [r1chardj0n3s/parse](https://github.com/r1chardj0n3s/parse) in binary form. This is needed because the aforementioned project does not distribute a pure Python `py3-none-any.whl` on [pypi](https://pypi.org/) as required for use with Pyodide. The package `r1chardj0n3s/parse` is licensed under the MIT License and Copyright (c) 2012-2019 Richard Jones <richard@python.org>.

`Try Behave`is largely based on my project [behave-gui](https://github.com/behave-contrib/behave-gui) which is Copyright (c) 2021-present Tomra Systems ASA. The `behave-gui` project is licensed under the MIT License. Copyright notices have been retained at the top of all related files.

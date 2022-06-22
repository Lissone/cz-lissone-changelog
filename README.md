## Installing the command line tool

Commitizen is currently tested against Node.js 12, 14, & 16, although it may work in
older versions of Node.js. You should also have npm 6 or greater.

Installation is as simple as running the following command (if you see `EACCES` error, reading [fixing npm permissions](https://docs.npmjs.com/getting-started/fixing-npm-permissions) may help):

```sh
npm install -g commitizen
```

## Adding Commitizen to your repo

There are two ways to use it in your repo.

### Simply and locally

Simply use `git cz` or just `cz` instead of `git commit` when committing. You can also use `git-cz`, which is an alias for `cz`.

_Alternatively_, if you are using **npm 5.2+** you can [use `npx`](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) instead of installing globally:

```sh
npx cz
```

or as an npm script:

```json
  ...
  "scripts": {
    "commit": "cz"
  }
```

When you're working in a Commitizen-friendly repository, you'll be prompted to fill in any required fields, and your commit messages will be formatted according to the standards defined by project maintainers.

### Making your repo Commitizen friendly

For this example, we'll be setting up our repo to use this adapter (cz-lissone-changelog).
First, install the Commitizen CLI tools:

```sh
npm install commitizen -g
```

Next, initialize your project to use the cz-lissone-changelog adapter by typing:

```sh
commitizen init cz-lissone-changelog --save-dev --save-exact
```

Or if you are using Yarn:

```sh
commitizen init cz-lissone-changelog --yarn --dev --exact
```

Note that if you want to force install over the top of an old adapter, you can apply the `--force` argument. For more information on this, just run `commitizen help`.

The above command does three things for you:

1. Installs the cz-lissone-changelog adapter npm module
2. Saves it to `package.json`'s `devDependencies`
3. Adds the `config.commitizen` key to the root of your `package.json` file as shown here:

```json
...
  "config": {
    "commitizen": {
      "path": "cz-lissone-changelog"
    }
  }
```

Alternatively, Commitizen configs may be added to a `.czrc` file:

```json
{
  "path": "cz-lissone-changelog"
}
```

This just tells Commitizen which adapter we actually want our contributors to use when they try to commit to this repo.

`commitizen.path` is resolved via [require.resolve](https://nodejs.org/api/globals.html#globals_require_resolve) and supports:

- npm modules
- directories relative to `process.cwd()` containing an `index.js` file
- file base names relative to `process.cwd()` with `.js` extension
- full relative file names
- absolute paths

Please note that in the previous version of Commitizen we used czConfig. **czConfig has been deprecated**, and you should migrate to the new format before Commitizen 3.0.0.

## Conventional commit messages as a Global utility

Install `commitizen` globally, if you have not already.

```sh
npm install -g commitizen
```

Install your preferred `commitizen` adapter globally.

```sh
npm install -g cz-lissone-changelog
```

Create a `.czrc` file in your `home` directory, with `path` referring to the preferred, globally-installed, `commitizen` adapter.

```sh
echo '{ "path": "cz-lissone-changelog" }' > ~/.czrc
```

You are all set! Now `cd` into any `git` repository and use `git cz` instead of `git commit`, and you will find the `commitizen` prompt.

Pro tip: You can use all the `git commit` `options` with `git cz`. For example: `git cz -a`.

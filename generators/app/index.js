const Generator = require('yeoman-generator')
const Dependencies = require('./dependencies')

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts)

    this.argument('appname', { type: String, required: false })

    this.outputFolder = 'app/'

    this.isValidUrl = url => {
      try {
        URL(url)
        return true
      } catch (err) {
        return false
      }
    }
  }

  async prompting() {
    const { appname } = this.options

    this.installOptions = {
      installNow: 'Install newest dependencies now',
      generateJson: 'Generate package.json without installation'
    }

    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'name',
        message: `Project's name`,
        default: appname || this.appname
      },
      {
        type: 'input',
        name: `description`,
        message: `Description`,
        default: ''
      },
      {
        type: 'input',
        name: `repository`,
        message: `Repository (url)`,
        validate: input =>
          input === '' || this.isValidUrl(input) ? true : `${input} is not a valid URL`,
        default: ''
      },
      {
        type: 'input',
        name: `author`,
        message: `Author`
      },
      {
        type: 'rawlist',
        name: `install`,
        message: `Install dependencies now?`,
        choices: Object.values(this.installOptions),
        default: this.installOptions.generateJson
      }
    ])
  }

  writing() {
    const packageInit = {
      name: this.answers.name,
      version: '1.0.0',
      description: this.answers.description,
      main: 'index.js',
      scripts: {
        start: 'webpack-dev-server --open --hot --mode development',
        build: 'webpack --mode production',
        test: 'jest'
      },
      license: 'ISC',
      ...(this.isValidUrl(this.answers.repository) && {
        repository: { url: this.answers.repository },
        bugs: {
          url: `${this.answers.repository}/issues`
        },
        homepage: `${this.answers.repository}#readme`
      }),
      ...(this.answers.author && { author: this.answers.author })
    }

    if (this.installOptions.generateJson === this.answers.install) {
      const packageJson = { ...Dependencies.versioned, ...packageInit }

      this.fs.extendJSON(this.destinationPath(`${this.outputFolder}package.json`), packageJson)
    }
  }

  install() {
    if (this.installOptions.installNow === this.answers.install) {
      this.packageManager(Dependencies.main)
      this.packageManager(Dependencies.dev, { dev: true })
    }
  }

  end() {
    this.log('Enjoy the React Boilerplate!')
  }
}

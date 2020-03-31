const Generator = require('yeoman-generator')
const Dependencies = require('./dependencies.json')

const packageManagers = {
  yarn: 'yarnInstall',
  npm: 'npmInstall'
}

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts)

    this.argument('appname', { type: String, required: false })

    this.outputFolder = this.destinationRoot()

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
      },
      {
        type: 'rawlist',
        name: `packageManager`,
        message: `Which package manager you use?`,
        choices: Object.keys(packageManagers),
        when: answers => answers.install === this.installOptions.installNow
      }
    ])
  }

  writing() {
    const { name, description, repository, author } = this.answers

    const packageInit = {
      name,
      version: '1.0.0',
      description,
      main: 'index.js',
      scripts: {
        start: 'webpack-dev-server --open --hot --mode development',
        build: 'webpack --mode production',
        test: 'jest'
      },
      license: 'ISC',
      ...(this.isValidUrl(repository) && {
        repository: { url: repository },
        bugs: {
          url: `${repository}/issues`
        },
        homepage: `${repository}#readme`
      }),
      ...(author && { author })
    }

    if (this.installOptions.generateJson === this.answers.install) {
      const packageJson = { ...Dependencies, ...packageInit }

      this.fs.extendJSON(this.destinationPath('package.json'), packageJson)
    }

    const filesToCopy = [
      '.babelrc',
      '.eslintrc',
      '.gitignore',
      '.prettierrc',
      '.stylelintrc',
      'tsconfig.json',
      'webpack.config.js',
      'src/index.js',
      'src/app/index.jsx',
      'src/app/index.css'
    ]

    this.fs.copyTpl(this.templatePath('README.md'), this.destinationPath('README.md'), {
      name,
      description
    })

    this.fs.copyTpl(
      this.templatePath('src/template.html'),
      this.destinationPath('src/template.html'),
      {
        name,
        description
      }
    )

    filesToCopy.forEach(file => this.fs.copy(this.templatePath(file), this.destinationPath(file)))
  }

  install() {
    if (this.installOptions.installNow === this.answers.install) {
      const packageManager = this[packageManagers[this.answers.packageManager]]
      packageManager(Object.keys(Dependencies.dependencies))
      packageManager(Object.keys(Dependencies.devDependencies), { dev: true })
    }
  }

  end() {
    this.log(`Welcome to the React friends' community!`)
  }
}

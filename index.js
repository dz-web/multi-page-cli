#!/usr/bin/env node
const process = require('process');
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { trimEnd } = require('lodash');
const { renderFile, render } = require('ejs');
const { pascalCase } = require('change-case');

const config = require(path.join(process.cwd(), '.mpcli.config.js'));
const cwd = process.cwd();

  const argv = require('yargs')
    .usage('$0 <cmd> [args]')
    .command('page [name]', 'welcome ter yargs!', (yargs) => {
    }, function (argv) {
      inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'name of new html page, eg. index, my-info, share-to-wechat:',
          validate: (name) => {
            const f = /^[\w-]+$/.test(name);
            if (!f) {
              console.log(chalk.red('\nformat error, you should use kebab case, eg.\n      my-info, share-to-wechat'));
            }
            return f;
          }
        },
        {
          type: 'input',
          name: 'title',
          message: 'title of new html page:',
          default: '默认网页标题'
        },
        {
          type: 'input',
          name: 'entry',
          message: 'entry path',
          default: function(answers) {
            return `${config.entries.directory}/${answers.name}/${answers.name}.jsx`;
          }
        },
        {
          type: 'input',
          name: 'view',
          message: 'views path',
          default: function(answers) {
            return `${config.views.directory}/${answers.name}/${answers.name}.jsx`;
          }
        },
        {
          type: 'list',
          name: 'template',
          message: 'which html template would you want to use ?',
          choices: config.templates
        }
      ]).then(function(answers) {
        // append entry config
        appendEntry(answers.name, answers.title, answers.entry, answers.template)
        // create entry
        createComponent(answers.entry, answers.name, config.entries.template)
        // create views
        createComponent(answers.view, answers.name, config.views.template, true)
      });
    })
    .help()
    .alias('help', 'h')
    .argv

function appendEntry(...args) {
  let rawConfigText = fs.readFileSync(path.join(cwd, config.file), 'utf-8');
  
  fs.writeFileSync(config.file, generate.apply(rawConfigText, args));
}

function generate(name, title, entry, template) {
  return this.replace(/html:\s*\[((?:.|[\r\n])*)\]/, (match, entriesText) => {
    const temp = `html: [${trimEnd(entriesText)}
    // ${title}
    {
      name: '${name}',
      title: '${title}',
      entry: '${entry}',
      template: '${template}',
    },
  ]`;

    return temp;
  });
}

function createComponent(location, name, templateFile, scss) {
  const dir = path.dirname(location);
  if (fs.existsSync(dir)) {
    const message = `directory ${dir} already exists`;
    console.log(chalk.red(message));
    throw new Error(message);
  }
  fs.mkdirSync(dir);
  renderFile(path.join(cwd, templateFile), {
    pascal: pascalCase(name),
    kebab: name
  }, function(err, str) {
    if (err) throw err;

    fs.writeFileSync(location, str);
  });

  // 创建样式文件
  if (scss) {
    const stylesheet = render(
`.<%- kebab %> {
  background: lightcoral;
}
`,
    {
      pascal: pascalCase(name),
      kebab: name
    });
    
    fs.writeFileSync(`${dir}/${name}.scss`, stylesheet);
  }
}
#!/usr/bin/env node
const process = require('process');
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { trimEnd } = require('lodash');

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
            return `${config.entriesPath}/${answers.name}/${answers.name}`;
          }
        },
        {
          type: 'list',
          name: 'template',
          message: 'which html template would you want to use ?',
          choices: config.templates
        }
      ]).then(function(answers) {
        appendEntry(answers.name, answers.title, answers.entry, answers.template)
      });
    })
    .help()
    .alias('help', 'h')
    .argv

function appendEntry(...args) {
  let rawConfigText = fs.readFileSync(path.join(cwd, config.file), 'utf-8');
  
  // 发布时，修改为输出至文件
  console.log(generate.apply(rawConfigText, args));
}

function generate(name, title, entry, template) {
  return this.replace(/html:\s*\[((?:.|[\r\n])*)\]/, (match, entriesText) => {
    const temp = `html: [${trimEnd(entriesText)}
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
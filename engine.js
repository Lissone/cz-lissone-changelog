'format cjs';

var wrap = require('word-wrap');
var map = require('lodash.map');
var longest = require('longest');
var chalk = require('chalk');

var filter = function(array) {
  return array.filter(function(x) {
    return x;
  });
};

var headerLength = function(answers) {
  return (
    answers.type.length + 2 + (answers.scope ? answers.scope.length + 2 : 0)
  );
};

var maxSummaryLength = function(options, answers) {
  return options.maxHeaderWidth - headerLength(answers);
};

var filterSubject = function(subject, disableSubjectLowerCase) {
  subject = subject.trim();
  if (!disableSubjectLowerCase && subject.charAt(0).toLowerCase() !== subject.charAt(0)) {
    subject =
      subject.charAt(0).toLowerCase() + subject.slice(1, subject.length);
  }
  while (subject.endsWith('.')) {
    subject = subject.slice(0, subject.length - 1);
  }
  return subject;
};

// This can be any kind of SystemJS compatible module.
// We use Commonjs here, but ES6 or AMD would do just
// fine.
module.exports = function(options) {
  var types = options.types;

  var length = longest(Object.keys(types)).length + 1;
  var choices = map(types, function(type, key) {
    return {
      name: (key + ':').padEnd(length) + ' ' + type.description,
      value: key
    };
  });

  return {
    // When a user runs `git cz`, prompter will
    // be executed. We pass you cz, which currently
    // is just an instance of inquirer.js. Using
    // this you can ask questions and get answers.
    //
    // The commit callback should be executed when
    // you're ready to send back a commit template
    // to git.
    //
    // By default, we'll de-indent your commit
    // template and will keep empty lines.
    prompter: function(cz, commit) {
      // Let's ask some questions of the user
      // so that we can populate our commit
      // template.
      //
      // See inquirer.js docs for specifics.
      // You can also opt to use another input
      // collection library if you prefer.
      cz.prompt([
        {
          type: 'list',
          name: 'type',
          message: 'Selecione o tipo de mudança que você está commitando: ',
          choices: [
            { value: 'feat', name: 'feat:     Uma nova feature' },
            { value: 'fix', name: 'fix:      Um conserto de bug' },
            { value: 'refactor', name: 'refactor: Uma alteração de código que não corrige um bug nem adiciona um recurso'},
            { value: 'docs', name: 'docs:     Apenas mudanças em documentação' },
            { value: 'chore', name: 'chore:     Alterações no processo de compilação ou ferramentas auxiliares e bibliotecas' },
          ],
        },
        {
          type: 'input',
          name: 'scope',
          message: 'Qual é o ESCOPO desta mudança: (opcional) ',
          default: options.defaultScope,
          filter: function(value) {
            return options.disableScopeLowerCase
              ? value.trim()
              : value.trim().toLowerCase();
          }
        },
        {
          type: 'input',
          name: 'subject',
          message: function(answers) {
            return (
              'Escreva uma descrição breve e sucinta das mudanças: (max ' +
              maxSummaryLength(options, answers) +
              ' caracteres):\n'
            );
          },
          default: options.defaultSubject,
          validate: function(subject, answers) {
            var filteredSubject = filterSubject(subject, options.disableSubjectLowerCase);
            return filteredSubject.length == 0
              ? 'A descrição é obrigatória'
              : filteredSubject.length <= maxSummaryLength(options, answers)
              ? true
              : 'O comprimento da descrição deve ser menor ou igual a ' +
                maxSummaryLength(options, answers) +
                ' caracteres. O comprimento atual é ' +
                filteredSubject.length +
                ' caracteres.';
          },
          transformer: function(subject, answers) {
            var filteredSubject = filterSubject(subject, options.disableSubjectLowerCase);
            var color =
              filteredSubject.length <= maxSummaryLength(options, answers)
                ? chalk.green
                : chalk.red;
            return color('(' + filteredSubject.length + ') ' + subject);
          },
          filter: function(subject) {
            return filterSubject(subject, options.disableSubjectLowerCase);
          }
        },
        {
          type: 'input',
          name: 'body',
          message:
            'Forneça uma descrição mais detalhada da mudança: (opcional) \n',
          default: options.defaultBody
        },
        {
          type: 'confirm',
          name: 'isBreaking',
          message: 'Existe BREAKING CHANGES? (opcional)',
          default: false
        },
        {
          type: 'input',
          name: 'breakingBody',
          default: '-',
          message:
            'Um commit de BREAKING CHANGE requer uma descrição detalhada. Por favor, insira com mais detalhes as mudanças de BREAKING CHANGES:\n',
          when: function(answers) {
            return answers.isBreaking && !answers.body;
          },
          validate: function(breakingBody, answers) {
            return (
              breakingBody.trim().length > 0 ||
              'A descrição detalhada de BREAKING CHANGE é obrigatória.'
            );
          }
        },
        {
          type: 'input',
          name: 'breaking',
          message: 'Descreva de forma breve e imperativa o BREAKING CHANGE:\n',
          when: function(answers) {
            return answers.isBreaking;
          }
        },

        {
          type: 'confirm',
          name: 'isIssueAffected',
          message: 'Essa mudança afeta alguma issue? (opcional)',
          default: options.defaultIssues ? true : false
        },
        {
          type: 'input',
          name: 'issuesBody',
          default: '-',
          message:
            'Se a issue for fechada, o commit requer uma descrição detalhada. Por favor, insira uma descrição mais longa do próprio commit:\n',
          when: function(answers) {
            return (
              answers.isIssueAffected && !answers.body && !answers.breakingBody
            );
          }
        },
        {
          type: 'input',
          name: 'issues',
          message: 'Adicione a referência da issue (e.g. "fix #123", "re #123".):\n',
          when: function(answers) {
            return answers.isIssueAffected;
          },
          default: options.defaultIssues ? options.defaultIssues : undefined
        }
      ]).then(function(answers) {
        var wrapOptions = {
          trim: true,
          cut: false,
          newline: '\n',
          indent: '',
          width: options.maxLineWidth
        };

        // parentheses are only needed when a scope is present
        var scope = answers.scope ? '[' + answers.scope + ']' : '';

        // Hard limit this line in the validate
        var head = answers.type + ':' + scope + ' ' + answers.subject;

        // Wrap these lines at options.maxLineWidth characters
        var body = answers.body ? wrap(answers.body, wrapOptions) : false;

        // Apply breaking change prefix, removing it if already present
        var breaking = answers.breaking ? answers.breaking.trim() : '';
        breaking = breaking
          ? 'BREAKING CHANGE: ' + breaking.replace(/^BREAKING CHANGE: /, '')
          : '';
        breaking = breaking ? wrap(breaking, wrapOptions) : false;

        var issues = answers.issues ? wrap(answers.issues, wrapOptions) : false;

        commit(filter([head, body, breaking, issues]).join('\n\n'));
      });
    }
  };
};

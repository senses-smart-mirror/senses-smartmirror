import { IWidgetConfig } from 'src/lib/types/WidgetConfig';

const TodosConfig: IWidgetConfig = {
  name: 'todos',
  icon: 'fad fa-clipboard-list-check',
  speech: [{
    text: 'clear todos, clear to do, clear todo list, clear to do list, clear to-do items, clear to-do list',
    functionName: 'clearTodos'
  }, {
    text: 'add todo, addtodo, add to-do item, add todo item, a to-do item, add to do item',
    functionName: 'addTodo'
  }, {
    text: 'complete item, complete to do item, complete to-do item',
    functionName: 'completeTodoItem'
  }],
  helper: true,
  settings: [{
    name: 'title',
    displayOnly: true,
    label: 'Start',
    order: 1,
    type: 'text',
    description: 'This widget will display all todos.'
  },
  {
    name: 'header',
    label: 'Header Title',
    value: 'Todos list',
    type: 'input',
    description: 'The header title of the widget.'
  },
  {
    name: 'todos',
    label: 'Todo Items',
    type: 'multivalue',
    value: [],
    items: [{
      name: "todo",
      placeholder: "todo item",
      label: "Todo item"
    }],
    buttonLabel: "Add Todo",
    listLabel: "Todos",
    description: 'Add your todos here.'
  },
  {
    name: 'showIcon',
    label: 'Icons',
    type: 'bool',
    value: false,
    description: 'Show or hide icons.'
  },
  ]
};

module.exports = TodosConfig;
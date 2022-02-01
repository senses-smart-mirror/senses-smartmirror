import { IWidget } from "src/lib/types";

const NUMBERS: { [key: string]: number } = {
  'one': 1,
  'two': 2,
  'three': 3,
  'four': 4,
  'five': 5,
  'six': 6,
  'seven': 7,
  'eight': 8,
  'nine': 9,
  'ten': 10
};

export class Todos extends WidgetHelper {
  constructor(data: IWidget) {
    super(data);

    this.addSocketListener();

    this.addSpeechListeners({ functionName: 'clearTodos', function: this.clearTodos.bind(this) });
    this.addSpeechListeners({ functionName: 'addTodo', function: this.addTodo.bind(this) });
    this.addSpeechListeners({ functionName: 'completeTodoItem', function: this.completeTodoItem.bind(this) });
  }

  /*
  *
  */
  clearTodos(): void {
    this.saveTodos([]);
  }

  /*
  * completeTodoItem
  */
  completeTodoItem(speechValue: any): void {
    const todos = this.getSettingValue('todos');

    if (!speechValue || !todos) return;

    if (speechValue === 'to') speechValue = 'two';
    if (speechValue === 'for') speechValue = 'four';

    todos.map((todo: any, key: number) => {
      if (key + 1 == NUMBERS[speechValue] || key + 1 == speechValue) todo.complete = true;
      return todo;
    });

    this.saveTodos(todos);
  }

  /*
  * saves todos
  */
  saveTodos(todos: string[]): void {
    this.updateSetting({ name: 'todos', value: todos });
    this.save();
    this.addEmitter("BROADCAST_TODOS", { todos: this.getSettingValue('todos') });
  }

  /*
  *
  */
  addTodo(speechValue: any): void {
    const todos = this.getSettingValue('todos');

    if (!speechValue || !todos) return;

    todos.push({ todo: speechValue, complete: false });
    this.saveTodos(todos);
  }

  /*
   *
   */
  afterStart(data: IWidget): void {
    this.settings = data.settings;
  }

  /*
   *
   */
  afterReload() {
    this.addSocketListener();
  }

  /*
   *
   */
  private addSocketListener() {
    super.addSocketListener("REQUEST_TODOS", this.handleListener.bind(this));
  }

  /*
   *
   */
  private handleListener() {
    if ( ! this.getSettingValue('show') ) return;
    
    this._todoHandler();
    clearInterval(this.interval);
    this.interval = setInterval(
      this._todoHandler.bind(this),
      10000
    );
  }

  private _todoHandler() {
    const todos = this.getSettingValue('todos');
    this.addEmitter("BROADCAST_TODOS", { todos });
  }


}

module.exports = Todos;

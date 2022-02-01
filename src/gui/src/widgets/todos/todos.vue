<template>
  <transition name="fade">
    <div
      class="component todos"
      v-bind:class="[{ 'animate-out': animateOut }, componentDesign]"
      v-bind:style="styles"
      v-if="module.settings.show"
    >
      <header>
        <h4 v-show="module.settings.header">
          <i v-show="showHeaderIcon" class="header-icon" v-bind:class="module.icon"></i>
          {{ module.settings.header }}
        </h4>
      </header>

      <section v-if="!isLoading">
        <ul class="todos-list">
          <li class="todo-item text-bright" v-bind:class="{'is-complete': item.complete}" v-for="(item, key) in todos" :key="key">
            <i v-show="module.settings.showIcon" class="fad fa-check-circle text-muted"></i>
            <p>
              <strong>{{item.todo}}</strong>
            </p>
          </li>
        </ul>
        <p v-if="!todos.length">
          No todo items found.
        </p>
      </section>

      <section v-if="isLoading">
        <loader></loader>
      </section>
    </div>
  </transition>
</template>

<script>
export default {
  name: "todos",

  props: ["module"],

  data() {
    return {
      todos: [],
      isLoading: true
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.isLoading = true;
        this.emit("REQUEST_TODOS");
      }
    }
  },

  computed: {
    styles() {
      if (this.animateOut && this.todos) {
        return {
          animationDelay:
            0.25 * (this.todos.items ? this.todos.items.length : 1) + "s",
          width: this.module.settings.widget_width + "px"
        };
      } else {
        return {
          width: this.module.settings.widget_width + "px"
        };
      }
    }
  },

  methods: {
    handler(data) {
      this.todos = data.todos;

      if (this.todos.length) {
        this.pushMinimalWidgetData({
          header: "Todos",
          text: this.todos.length,
          footer: "Today",
        });
      }

      this.isLoading = false;
    }
  },

  created() {
    this.subscribe("BROADCAST_TODOS", this.handler);
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last {
  p {
    text-align: right;
  }

  .todo-item {
    > i {
      margin: 0 0 0 10px;
    }

    flex-direction: row-reverse;
  }
}

.todos-list {
  .todo-item {
    display: flex;
    align-items: center;
    margin-bottom: $normal-spacing;

    strong {
      display: inline-block;

      &:first-letter {
        text-transform: uppercase;
      }
    }

    &.is-complete strong {
      text-decoration: line-through;
    }
  }

  p {
    margin: 0
  }

  i {
    margin-top: 2px;
    margin-right: $normal-spacing;
    font-size: 20px;
  }
}
</style>

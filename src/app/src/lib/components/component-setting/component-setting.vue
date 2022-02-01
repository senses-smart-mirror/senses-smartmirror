<template>
  <section class="component-setting" v-if="!setting.hide">
    <label class="setting-label" :for="setting.label">{{ setting.label }}</label>

    <p v-if="setting.description" class="setting-description" v-html="setting.description"></p>

    <!-- button (external call used for oauth) -->
    <a
      v-if="setting.type === 'button'"
      class="btn btn-secondary btn-centered btn-link"
      target="_blank"
      :href="formatLink(setting.link)"
    >{{ setting.value }}</a>

    <!-- button post link -->
    <div class="form" v-if="setting.type === 'button_post'">
      <button class="btn btn-secondary btn-centered" @click="doSomething()">
        <span v-if="!setting.isLoading">{{ setting.value }}</span>
        <span v-if="setting.isLoading" class="small-loader">
          <span class="lds-dual-ring"></span>
        </span>
      </button>
    </div>

    <!-- html editor -->
    <div class="html-editor" v-if="setting.type === 'html_editor'">
      <div class="button-list" v-if="editor">
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
        >
          <i class="fad fa-bold"></i>
        </button>
        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
        >
          <i class="fad fa-italic"></i>
        </button>
        <button
          @click="editor.chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor.isActive('strike') }"
        >
          <i class="fad fa-strikethrough"></i>
        </button>
        <button
          @click="editor.chain().focus().toggleCode().run()"
          :class="{ 'is-active': editor.isActive('code') }"
        >
          <i class="fad fa-code"></i>
        </button>
        <button
          @click="editor.chain().focus().setParagraph().run()"
          :class="{ 'is-active': editor.isActive('paragraph') }"
        >
          <i class="fad fa-paragraph"></i>
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        >
          <i class="fad fa-h1"></i>
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        >
          <i class="fad fa-h2"></i>
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        >
          <i class="fad fa-h3"></i>
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
        >
          <i class="fad fa-h4"></i>
        </button>
        <button
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'is-active': editor.isActive('bulletList') }"
        >
          <i class="fad fa-list-ul"></i>
        </button>
        <button
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="{ 'is-active': editor.isActive('orderedList') }"
        >
          <i class="fad fa-list-ol"></i>
        </button>
        <button
          @click="editor.chain().focus().toggleBlockquote().run()"
          :class="{ 'is-active': editor.isActive('blockquote') }"
        >
          <i class="fad fa-quote-right"></i>
        </button>
        <button @click="editor.chain().focus().setHardBreak().run()">
          <i class="fad fa-level-down-alt"></i>
        </button>
        <button @click="editor.chain().focus().setHorizontalRule().run()">
          <i class="fad fa-horizontal-rule"></i>
        </button>
        <button @click="editor.chain().focus().undo().run()">
          <i class="fad fa-undo"></i>
        </button>
        <button @click="editor.chain().focus().redo().run()">
          <i class="fad fa-redo"></i>
        </button>

        <button>
          <i class="fad fa-brackets-curly" @click="showShortcodeList = !showShortcodeList"></i>
        </button>

        <div class="shortcode-list" v-if="showShortcodeList">
          <strong>Add Widget to editor:</strong>
          <ul>
            <li @click="setEditorContent('calendar')">Calendar</li>
            <li @click="setEditorContent('travel-time')">Travel Time</li>
            <li @click="setEditorContent('mercedes')">Mercedes</li>
            <li @click="setEditorContent('hue')">Hue</li>
            <li @click="setEditorContent('nest')">Nest</li>
            <li @click="setEditorContent('rain-radar')">Rain Radar</li>
            <li @click="setEditorContent('reminders')">Reminders</li>
            <li @click="setEditorContent('speed-cameras')">Speed Cameras</li>
            <li @click="setEditorContent('spotify')">Spotify</li>
            <li @click="setEditorContent('weather')">Weather</li>
          </ul>
        </div>
      </div>
      <editor-content :editor="editor" />
    </div>

    <!-- multiadd - multivalue -->
    <div class="multi-add-value" v-if="setting.type === 'multivalue'">
      <header>
        <div v-for="(item, key) in setting.items" :key="key">
          <label class="multi-add-label" for="#">{{ item.label }}</label>
          <div class="input-form">
            <input type="text" :placeholder="item.placeholder" v-model="item.value" />
            <button v-if="item.date" class="btn btn-small" @click="addDateNow(item.date, item)">Now</button>
          </div>
        </div>
        <button
          class="btn btn-secondary"
          @click="addField()"
          :class="{ 'is-disabled': !isValid() }"
        >{{ setting.buttonLabel }}</button>
      </header>
      <section>
        <label class="multi-add-list-label" for="#">
          <strong>{{ setting.listLabel }}</strong>
        </label>
        <ul class="multi-add-list" v-if="setting.valueItems.length">
          <li class="multi-line" v-for="(item, key) in setting.valueItems" :key="key">
            <ul>
              <li v-for="(prop, key) in item" :key="key">
                <span class="multi-add-title">
                  <strong>{{ key }}:</strong>
                </span>
                {{ prop }}
              </li>
            </ul>
            <span class="multi-add-controls" @click="remove(key)">
              <i class="fas fa-minus-circle"></i>
            </span>
          </li>
        </ul>
        <span v-if="!setting.valueItems.length">
          <p>
            <em>No items yet.</em>
          </p>
        </span>
      </section>
    </div>

    <!-- multiadd -->
    <div class="multi-add" v-if="setting.type === 'multiadd'">
      <div class="input-form">
        <input
          type="text"
          :placeholder="setting.placeholder"
          v-model="newLine"
          @keyup.enter="addLine(setting.value)"
        />
        <button @click="addLine(setting.value)" class="btn">Add</button>
      </div>

      <ul class="multi-add-list">
        <li v-for="(item, key) in setting.value" :key="key">
          <span class="multi-add-title">{{ item }}</span>
          <span class="multi-add-controls" @click="removeOneItem(key)">
            <i class="fas fa-minus-circle"></i>
          </span>
        </li>
      </ul>
    </div>

    <div class="slider" v-if="setting.type === 'slider'">
      <vue-slider
        :tooltip="'active'"
        v-bind:min="setting.min"
        v-bind:max="setting.max"
        v-model="setting.value"
      >
        <template v-slot:dot>
          <span class="vue-slider-custom-dot"></span>
        </template>
      </vue-slider>
      <input type="text" v-on:input="checkValue()" v-model="setting.value" />
      <span
        class="error"
        v-if="setting.error"
      >Value must be between {{ setting.min }} and {{ setting.max }}.</span>
    </div>

    <!-- dropdown + search -->
    <div class="form-group" v-if="setting.type === 'dropdown_search'">
      <section v-if="setting.isLoading" class="small-loader">
        <div class="lds-dual-ring"></div>
      </section>
      <section v-else>
        <div v-if="setting.error">
          <p>
            <em>{{ setting.error }}</em>
          </p>
        </div>
        <div v-else class="dropdown">
          <input
            type="text"
            v-model="setting.searchText"
            v-on:keyup="searchForItem()"
            :placeholder="setting.placeholder"
          />
          <div
            v-if="
              setting.searchText.length > 2 &&
              setting.filterOptions.length <= 10 &&
              setting.isDropdownActive
            "
            class="dropdown-menu"
            id="dropdown-menu"
            role="menu"
          >
            <ul>
              <li v-bind:key="key" v-for="(option, key) in setting.filteredOptions">
                <a
                  href="#"
                  @click="setSelectedValue(option.namen.lang, option.code)"
                >{{ option.namen.lang }}</a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>

    <!-- multi checkbox -->
    <div class="form-multi-checkbox" v-if="setting.type === 'multi-checkbox'">
      <div class="multi-checkbox-row" v-bind:key="key" v-for="(item, key) in setting.items">
        <label :for="'setting_' + key" class="switch">
          <input
            :id="'setting_' + key"
            v-model="item.selected"
            type="checkbox"
            @change="updateValues($event)"
          />
          <span class="switch-slider"></span>
        </label>
        <span>{{ item.label }}</span>
      </div>
    </div>

    <!-- input with option to send value -->
    <div class="form-group" v-if="setting.type === 'input_push'">
      <input class="input-margin-bottom" v-model="settingValue" type="text" />
      <button class="btn btn-small" v-on:click="sendValue()">Send Video To Smart Mirror</button>
    </div>

    <!-- input -->
    <div class="form-group" v-if="setting.type === 'input'">
      <input
        v-model="settingValue"
        type="text"
        :class="{
          'is-disabled': setting.disabled,
          'input-error': setting.error,
        }"
        :disabled="setting.disabled"
        @keyup="!setting.validation || verifySetting()"
      />
      <div v-if="setting.error">
        <template id="error-template"></template>
      </div>
    </div>

    <template id="error-template" v-if="setting.validation">
      <p class="error-msg" v-show="setting.error && setting.error.type === 'min'">
        For this setting a minimal value of {{ setting.validation.min }} is
        required.
      </p>
      <p class="error-msg" v-show="setting.error && setting.error.type === 'max'">
        For this setting a value of {{ setting.validation.max }} is maximum as
        valid.
      </p>
    </template>

    <!-- playbar -->
    <div class="playbar" v-if="setting.type === 'playbar'">
      <ul class="playbar-list">
        <li>
          <a v-on:click="reverseVideo()">
            <i class="fad fa-backward"></i>
          </a>
        </li>
        <li>
          <a v-on:click="stopVideo()">
            <i class="fad fa-stop"></i>
          </a>
        </li>
        <li>
          <a v-on:click="playVideo()">
            <i class="fad fa-play"></i>
          </a>
        </li>
        <li>
          <a v-on:click="pauseVideo()">
            <i class="fad fa-pause"></i>
          </a>
        </li>
        <li>
          <a v-on:click="forwardVideo()">
            <i class="fad fa-forward"></i>
          </a>
        </li>
      </ul>

      <ul class="playbar-list">
        <li>
          <a v-on:click="volumeMute()">
            <i class="fad fa-volume-mute"></i>
          </a>
        </li>
        <li>
          <a v-on:click="volumeDown()">
            <i class="fad fa-volume-down"></i>
          </a>
        </li>
        <li>
          <a v-on:click="volumeUp()">
            <i class="fad fa-volume-down"></i>
          </a>
        </li>
      </ul>

      <div class="input-form">
        <p>
          Specify a timestamp in
          <strong>seconds</strong> or format like:
          <strong>mm:ss</strong>. Example: use
          <strong>01:15</strong> for 1
          minute and 15 seconds.
        </p>
        <input class="small-input" type="text" :placeholder="''" v-model="setting.value" />
        <button class="btn btn-small" v-on:click="updateVideoTimestamp()">Update</button>
      </div>
    </div>

    <!-- dropdown -->
    <div v-if="setting.type === 'dropdown'" v-on-clickaway="away" class="dropdown">
      <span @click="toggleDropdown()">
        {{
          setting.showValue || "Please select"
        }}
      </span>
      <div class="dropdown-trigger" :class="{ 'is-active': setting.isDropdownActive }">
        <a href="#">
          <i class="fas fa-chevron-down"></i>
        </a>
      </div>

      <div v-show="setting.isDropdownActive" class="dropdown-menu" id="dropdown-menu" role="menu">
        <ul>
          <li v-bind:key="key" v-for="(option, key) in setting.options">
            <a href="#" @click="setSelectedOption(option)">{{ option.name }}</a>
          </li>
        </ul>
      </div>
    </div>

    <!-- boolean -->
    <div v-if="setting.type === 'bool'">
      <label :for="'setting_' + setting.id" class="switch">
        <input :id="'setting_' + setting.id" v-model="setting.value" type="checkbox" />
        <span class="switch-slider"></span>
      </label>
    </div>
  </section>
</template>

<script>
import { mixin as clickaway } from "vue-clickaway";
import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/default.css";
import api from "../../helpers/api";

import { Editor, EditorContent } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import HorizontalRule from '@tiptap/extension-horizontal-rule'

export default {
  mixins: [clickaway],

  name: "component-settings",

  components: { VueSlider, EditorContent },

  props: ["_setting"],

  data() {
    return {
      setting: this._setting,
      newLine: "",
      editor: null,
      editor_value: '',
      showShortcodeList: false
    };
  },

  mounted() {
    if (this.setting.type === 'html_editor') {
      this.editor_value = this.setting.value;

      this.editor = new Editor({
        content: this.editor_value,
        extensions: [StarterKit, HorizontalRule],
        onUpdate: () => {
          this.setting.value = this.editor.getHTML();
        },
      });
    }
  },

  beforeDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }
  },

  computed: {
    settingValue: {
      get() {
        return this.setting.scramble || this.setting.value;
      },
      set(newValue) {
        this.setting.value = newValue;
        return newValue;
      },
    },
  },

  created() {
    if (this.setting.type === "dropdown") {
      this.$set(this.setting, "isDropdownActive", false);
      this.setting.options.forEach((s) => {
        if (s.value === this.setting.value) {
          this.$set(this.setting, "showValue", s.name);
        }
      });
    }

    if (this.setting.type === "multivalue") {
      this.setting.valueItems = this.setting.value || [];
    }

    if (this.setting.type === "multi-checkbox" && this.setting.value.length) {
      this.setting.items.forEach((item) => {
        item.selected =
          this.setting.value.indexOf(item.value) >= 0 ? true : false;
      });
    }

    if (this.setting.scramble) {
      this.setting.scramble = "Not able to show.";
    }

    this.setting.id = Math.random();

    if (this.setting.type === "dropdown_search") {
      this.$set(this.setting, "isDropdownActive", false);

      this.setting.searchText = this.setting.value
        ? this.setting.value.label
        : false || this.setting.value || "";
      this.setting.filterOptions = [];
      this.setting.isLoading = true;

      if (this.setting.dependsOn) {
        this.sockets.subscribe(this.setting.socketInfo.subscribe, (data) => {
          if (data.error || !data || !data.stations.length) {
            this.setting.error =
              "Couldn't get data. This field is depending on the: " +
              this.setting.dependsOn +
              ". Please save the widget first.";
          } else {
            this.setting.options = data.stations;
          }

          this.setting.isLoading = false;
          this.$forceUpdate();
        });

        if (this.setting.socketInfo) {
          setTimeout(() => {
            this.$socket.emit(this.setting.socketInfo.emitter);
          }, 500);
        }
      }
    }
  },

  methods: {
    setEditorContent(which) {
      const elem = `{{${which}}}`
      let editorHtml = this.editor.getHTML();
      editorHtml += elem
      this.editor.commands.setContent(editorHtml);
      this.setting.value = this.editor.getHTML();
    },
    sendValue() {
      this.$socket.emit("VIDEO_PLAYER_UPDATE_VIDEO", this.setting.value);
    },
    updateVideoTimestamp() {
      this.$socket.emit("VIDEO_PLAYER_TIMESTAMP", this.setting.value);
    },
    playVideo() {
      this.$socket.emit("VIDEO_PLAYER_PLAY");
    },
    stopVideo() {
      this.$socket.emit("VIDEO_PLAYER_STOP");
    },
    pauseVideo() {
      this.$socket.emit("VIDEO_PLAYER_PAUSE");
    },
    forwardVideo() {
      this.$socket.emit("VIDEO_PLAYER_FORWARD");
    },
    volumeMute() {
      this.$socket.emit("VIDEO_PLAYER_MUTE");
    },
    volumeDown() {
      this.$socket.emit("VIDEO_PLAYER_VOLUME_DOWN");
    },
    volumeUp() {
      this.$socket.emit("VIDEO_PLAYER_VOLUME_UP");
    },
    reverseVideo() {
      this.$socket.emit("VIDEO_PLAYER_REVERSE");
    },
    updateValues() {
      this.setting.value = [];
      this.setting.items.map((item) => {
        if (item.selected) this.setting.value.push(item.value);
      });
    },
    searchForItem() {
      const searchText = this.setting.searchText;
      if (!searchText.length) return;

      let prop1, prop2;

      // check if a special property is set.
      if (this.setting.optionsProperty) {
        prop1 = this.setting.optionsProperty[0];
        prop2 = this.setting.optionsProperty[1];
      }

      this.setting.filteredOptions = this.setting.options.filter((option) => {
        if (prop1 && prop2) {
          return option[prop1][prop2]
            .toLowerCase()
            .includes(searchText.toLowerCase());
        }

        if (prop1) {
          return option[prop1].toLowerCase().includes(searchText.toLowerCase());
        }

        return option.toLowerCase().includes(searchText.toLowerCase());
      });

      this.setting.isDropdownActive = true;
      this.$forceUpdate();
    },
    verifySetting() {
      const validations = Object.keys(this.setting.validation);
      this.setting.error = false;
      if (validations.length) {
        validations.forEach((validationType) => {
          this.preformValidation(
            validationType,
            this.setting.validation[validationType],
            this.setting
          );
        });

        this.$forceUpdate();
        this.$emit("validateForm", this.setting.error);
      }
    },
    setSelectedValue(valueText, value) {
      this.setting.searchText = valueText;
      this.setting.value = { value: value, label: valueText };
      this.setting.isDropdownActive = false;
      this.$forceUpdate();
    },
    preformValidation(validationType, validationValue, setting) {
      switch (validationType) {
        case "min":
          {
            if (setting.value < validationValue) {
              setting.error = { type: "min", validationValue };
            }
          }
          break;
        case "max": {
          if (setting.value > validationValue) {
            setting.error = { type: "max", validationValue };
          }
        }
      }
    },
    addDateNow(type, model) {
      const date = new Date();
      let inputValue;

      if (type === "time") {
        let mins;
        const currentMinutes = date.getMinutes();

        // format minutes to include base "0"
        if (currentMinutes < 60) {
          mins = currentMinutes + 5 < 10 ? "0" + (currentMinutes + 5) : currentMinutes + 5;
        } else {
          mins = currentMinutes;
        }

        // format minutes to not go over 60.
        if (mins >= 60) {
          mins = "0" + (parseInt(currentMinutes) - 60 + 10);
        }

        inputValue = `${date.getHours()}:${mins}`;
      } else {
        inputValue = `${date.getDate()}/${date.getMonth() + 1}`;
      }

      model.value = inputValue;
      this.$forceUpdate();
    },
    doSomething() {
      if (this.setting.link) {
        this.$set(this.setting, "isLoading", true);
        const url = this.setting.link;
        api.axios.post(url).finally(() => {
          setTimeout(() => {
            this.$set(this.setting, "isLoading", false);
          }, 1000);
        });
      }
    },
    checkValue() {
      if (
        this.setting.value < this.setting.min ||
        this.setting.value > this.setting.max
      ) {
        this.setting.error = true;
      } else {
        this.setting.error = false;
      }
    },
    formatLink(link) {
      if (!link) return;

      if (link.indexOf("login") > -1) {
        link = `http://${window.location.hostname}:7011/${link}`;
      }

      return link;
    },
    addField() {
      let obj = {};
      this.setting.items.forEach((item) => {
        obj[item.name] = item.value;
        item.value = "";
      });

      this.$set(this.setting, "valueItems", [...this.setting.valueItems, obj]);

      this.setting.value = this.setting.valueItems;
      this.$forceUpdate();
    },
    isValid() {
      return true;
    },
    removeOneItem(index) {
      this.setting.value.splice(index, 1);
    },
    addLine(list) {
      if (this.newLine.length === 0) return;
      list.splice(0, 0, this.newLine);
      this.newLine = "";
    },
    remove(key) {
      this.$delete(this.setting.valueItems, key);
      this.$set(this.setting, "valueItems", [...this.setting.valueItems]);
      this.setting.value = this.setting.valueItems;
      this.$forceUpdate();
    },
    away() {
      this.setting.isDropdownActive = false;
    },
    setSelectedOption(option) {
      this.setting.value = option.value;
      this.setting.showValue = option.name;
      this.setting.isDropdownActive = false;
    },
    toggleDropdown() {
      this.$set(
        this.setting,
        "isDropdownActive",
        !this.setting.isDropdownActive
      );
    },
  },
};
</script>

<style lang="scss">
@import "../../../styles/vars";

.shortcode-list {
  margin: 10px 0;

  ul {
    margin: 10px 0;
    display: flex;
    flex-wrap: wrap;

    li {
      border-radius: 3px;
      margin: 5px 5px 0;
      background-color: #1f2328;
      border: 1px solid #373f48;
      padding: 10px;
    }
  }
}

.component-setting {
  display: flex;
  flex-direction: column;
  flex: 0 0 100%;
  margin-bottom: 30px;

  &-description {
    margin: 10px 0;
    color: #777;
  }

  .multi-add,
  .multi-add-value {
    .input-form {
      display: flex;
      margin-bottom: 20px;

      input {
        margin: 0 10px 0 0;
      }
    }

    input {
      box-sizing: border-box;
      width: 100%;
      margin-bottom: 20px;
    }

    .multi-add-list-label {
      display: inline-block;
      font-size: 16px;
      margin-bottom: 10px;
    }

    > header {
      margin-bottom: 10px;
    }

    .multi-add-label {
      display: inline-block;
      font-weight: 700;
      margin-bottom: 5px;
    }

    > section > ul > li {
      border-bottom: 1px solid #333;
      padding: 5px 0 10px 0;
    }

    ul {
      li {
        border: none;
        margin: 0;

        &.multi-line {
          width: 100%;
          position: relative;
          display: inline-block;
        }
      }

      .multi-add-controls {
        position: absolute;
        right: 0;
        width: auto;
        top: 0;
      }
    }

    &-title {
      padding-right: 10px;
    }
  }

  label.setting-label {
    color: #aebfc6;
    font-weight: 500;
    font-size: 16px;
    margin-bottom: 10px;
  }

  input,
  .dropdown span {
    background-color: #1f2328;
    border: 1px solid #373f48;
    padding: 15px 10px;
    color: #d3d3d3;
    font-size: 1em;

    -webkit-box-shadow: inset 0 0 3px #222;
    -moz-box-shadow: inset 0 0 3px #222;
    box-shadow: inset 0 0 3px #222;

    &:focus {
      outline: none;
    }
  }
}

/* Multi Checkbox */
.form-multi-checkbox {
  .multi-checkbox-row {
    display: flex;
    align-items: center;
    margin-bottom: $normal-spacing;

    &:last-child {
      margin: 0;
    }

    label {
      margin-right: $normal-spacing;
    }
  }
}

/* html editor */
.html-editor {
  .ProseMirror {
    background-color: #1f2328;
    border: 1px solid #373f48;
    padding: 15px 10px;
    color: #d3d3d3;
    font-size: 1em;
    -webkit-box-shadow: inset 0 0 3px #222;
    box-shadow: inset 0 0 3px #222;
    min-height: 200px;
    border-radius: 3px;

    &:focus {
      outline: none;
    }
  }

  .button-list {
    button {
      background-color: #1f2328;
      border: 1px solid #373f48;
      color: #d3d3d3;
      padding: 8px;
      min-width: 40px;
      text-align: center;
      border-radius: 2px;
      margin: 0 10px 10px 0;
    }
  }
}

/* Playbar */
.playbar {
  ul.playbar-list {
    display: flex;
    margin-bottom: $normal-spacing;

    li {
      margin-right: 5px;
      border-radius: 6px;
      background-color: #1f2328;
      border: 1px solid #373f48;

      i {
        font-size: 20px;
      }

      a {
        display: inline-block;
        padding: 16px;
        color: #c7c7c7;
      }
    }
  }

  input {
    margin: 0 $medium-spacing 0 0;
  }
}

.input-margin-bottom {
  margin-bottom: $medium-spacing;
}

/* Multi Add */
.multi-add {
  ul.multi-add-list {
    li {
      border-bottom: 1px solid #444;
      padding-bottom: 10px;
      position: relative;
      display: flex;
      width: 100%;
      margin: 5px 0 10px 0;
    }
  }
}

/* slider */
.slider {
  .error {
    color: #f1614c;
  }
  input {
    margin: 20px 0 10px;
    width: 100%;
    box-sizing: border-box;
  }

  span {
    margin-left: 0 !important;
  }
}

p.error-msg {
  margin-top: 5px;
  color: #871212;
}

.form-group {
  input {
    width: 100%;
    box-sizing: border-box;

    &.input-error {
      border-color: #d40000;
    }
  }
}

.vue-slider {
  height: 6px !important;
}

.vue-slider-dot-tooltip-top {
  left: 100%;
  top: -10px;
}

.vue-slider-dot-tooltip-inner {
  background-color: #3a7eb2;
}

.vue-slider-dot {
  margin-left: -5px;
}

.vue-slider-custom-dot {
  position: relative;
  display: inline-block;
  top: -6px;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background-color: white;
  border: 7px solid #3a7eb2;
}

/* dropdown */
.dropdown {
  position: relative;

  span {
    cursor: pointer;
    box-sizing: border-box;
    display: inline-block;
    width: 100%;
  }

  .dropdown-menu {
    background-color: #1f2328;
    border: 1px solid #373f48;
    border-width: 0 1px;

    li {
      border-bottom: 1px solid #373f48;

      a {
        width: 100%;
        display: inline-block;
        padding: 20px 15px;
        color: #fff;
        text-decoration: none;
      }
    }
  }

  &-trigger {
    &.is-active a {
      transform: rotate(180deg);
    }

    a {
      position: absolute;
      right: 20px;
      top: 16px;
      color: #fff;
      font-size: 16px;
    }
  }
}

/* switch styling */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;

  &:focus,
  &:click,
  &:hover,
  .switch-slider:focus,
  input:focus {
    outline: none;
    box-shadow: none;
  }

  .switch-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #1f2328;
    border: 1px solid rgba(255, 255, 255, 0.05);
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 6px;
      top: 4px;
      bottom: 6px;
      background-color: white;
      -webkit-transition: 0.4s;
      transition: 0.4s;
      border-radius: 50%;
    }
  }

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .switch-slider {
      background-color: #3a7eb2;
    }

    &:focus + .switch-slider {
      box-shadow: 0 0 1px #3a7eb2;
    }

    &:checked + .switch-slider:before {
      -webkit-transform: translateX(26px);
      -ms-transform: translateX(26px);
      transform: translateX(26px);
    }
  }
}
</style>

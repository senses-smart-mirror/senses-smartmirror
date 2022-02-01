<template>
  <div
    class="component nest"
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
    <section v-show="!error && !isLoading" class="">
      <article>
        <content class="nest-radius">
          <div ref="myther" id="thermostat"></div>
          <span class="text-bright">{{ nestThermostat.name }}</span>
        </content>
      </article>
    </section>

    <section v-show="error.length">
      <p class="error-msg" v-if="error === 'missing_ids'">
        The Client ID and Client Secret are not provided in the Senses - Senses - App. Please go to the app and follow the instructions.
      </p>
      <p class="error-msg" v-if="error === 'missing_tokens'">
        The Access Token is not set correctly. Please use the Senses - App
        to setup the access token.
      </p>
      <p class="error-msg" v-if="error === 'missing_project_id'">
        The Project ID is not set correctly. Please use the Senses - Senses - App to provide the project ID.
      </p>
      <p v-if="error === 'no_data'">
        Cannot display Nest information at this time.
      </p>
    </section>

    <section v-show="isLoading">
      <loader></loader>
    </section>
  </div>
</template>
<script>
var thermostatDial = (function () {
  function createSVGElement(tag, attributes, appendTo) {
    var element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    attr(element, attributes);
    if (appendTo) {
      appendTo.appendChild(element);
    }
    return element;
  }

  // Set attributes for an element
  function attr(element, attrs) {
    for (var i in attrs) {
      element.setAttribute(i, attrs[i]);
    }
  }

  // Rotate a cartesian point about given origin by X degrees
  function rotatePoint(point, angle, origin) {
    var radians = (angle * Math.PI) / 180;
    var x = point[0] - origin[0];
    var y = point[1] - origin[1];
    var x1 = x * Math.cos(radians) - y * Math.sin(radians) + origin[0];
    var y1 = x * Math.sin(radians) + y * Math.cos(radians) + origin[1];
    return [x1, y1];
  }

  // Rotate an array of cartesian points about a given origin by X degrees
  function rotatePoints(points, angle, origin) {
    return points.map(function (point) {
      return rotatePoint(point, angle, origin);
    });
  }

  // Given an array of points, return an SVG path string representing the shape they define
  function pointsToPath(points) {
    return (
      points
        .map(function (point, iPoint) {
          return (iPoint > 0 ? "L" : "M") + point[0] + " " + point[1];
        })
        .join(" ") + "Z"
    );
  }

  // Restrict a number to a min + max range
  function restrictToRange(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
  }

  // Round a number to the nearest 0.5
  function roundHalf(num) {
    return Math.round(num * 2) / 2;
  }

  function setClass(el, className, state) {
    el.classList[state ? "add" : "remove"](className);
  }

  /*
   * The "MEAT"
   */

  return function (targetElement, options) {
    var self = this;

    /*
     * Options
     */
    options = options || {};
    options = {
      diameter: options.diameter || 400,
      minValue: options.minValue || 10, // Minimum value for target temperature
      maxValue: options.maxValue || 30, // Maximum value for target temperature
      numTicks: options.numTicks || 120, // Number of tick lines to display around the dial
      onSetTargetTemperature: options.onSetTargetTemperature || function () {}, // Function called when new target temperature set by the dial
    };

    /*
     * Properties - calculated from options in many cases
     */
    var properties = {
      tickDegrees: 260, //  Degrees of the dial that should be covered in tick lines
      rangeValue: options.maxValue - options.minValue,
      radius: options.diameter / 2,
      ticksOuterRadius: options.diameter / 30,
      ticksInnerRadius: options.diameter / 8,
      hvac_states: ["off", "heating", "cooling"],
      dragLockAxisDistance: 15,
    };
    properties.lblAmbientPosition = [
      properties.radius,
      properties.ticksOuterRadius -
        (properties.ticksOuterRadius - properties.ticksInnerRadius) / 2,
    ];
    properties.offsetDegrees = 180 - (360 - properties.tickDegrees) / 2;

    /*
     * Object state
     */
    var state = {
      target_temperature: options.minValue,
      ambient_temperature: options.minValue,
      hvac_state: properties.hvac_states[0],
      has_leaf: false,
      away: false,
    };

    /*
     * Property getter / setters
     */
    Object.defineProperty(this, "target_temperature", {
      get: function () {
        return state.target_temperature;
      },
      set: function (val) {
        state.target_temperature = restrictTargetTemperature(+val);
        render();
      },
    });
    Object.defineProperty(this, "ambient_temperature", {
      get: function () {
        return state.ambient_temperature;
      },
      set: function (val) {
        state.ambient_temperature = roundHalf(+val);
        render();
      },
    });
    Object.defineProperty(this, "hvac_state", {
      get: function () {
        return state.hvac_state;
      },
      set: function (val) {
        if (properties.hvac_states.indexOf(val) >= 0) {
          state.hvac_state = val;
          render();
        }
      },
    });
    Object.defineProperty(this, "has_leaf", {
      get: function () {
        return state.has_leaf;
      },
      set: function (val) {
        state.has_leaf = !!val;
        render();
      },
    });
    Object.defineProperty(this, "away", {
      get: function () {
        return state.away;
      },
      set: function (val) {
        state.away = !!val;
        render();
      },
    });

    /*
     * SVG
     */
    var svg = createSVGElement(
      "svg",
      {
        width: "100%", //options.diameter+'px',
        height: "100%", //options.diameter+'px',
        viewBox: "0 0 " + options.diameter + " " + options.diameter,
        class: "dial",
      },
      targetElement
    );

    /*
     * Ticks
     */
    var ticks = createSVGElement(
      "g",
      {
        class: "dial__ticks",
      },
      svg
    );
    var tickPoints = [
      [properties.radius - 1, properties.ticksOuterRadius],
      [properties.radius + 1, properties.ticksOuterRadius],
      [properties.radius + 1, properties.ticksInnerRadius],
      [properties.radius - 1, properties.ticksInnerRadius],
    ];
    var tickPointsLarge = [
      [properties.radius - 1.5, properties.ticksOuterRadius],
      [properties.radius + 1.5, properties.ticksOuterRadius],
      [properties.radius + 1.5, properties.ticksInnerRadius + 20],
      [properties.radius - 1.5, properties.ticksInnerRadius + 20],
    ];
    var theta = properties.tickDegrees / options.numTicks;
    var tickArray = [];
    for (var iTick = 0; iTick < options.numTicks; iTick++) {
      tickArray.push(
        createSVGElement("path", { d: pointsToPath(tickPoints) }, ticks)
      );
    }

    /*
     * Labels
     */
    var lblTarget = createSVGElement(
      "text",
      {
        x: properties.radius,
        y: properties.radius,
        class: "dial__lbl dial__lbl--target",
      },
      svg
    );
    var lblTarget_text = document.createTextNode("");
    lblTarget.appendChild(lblTarget_text);
    //
    var lblTargetHalf = createSVGElement(
      "text",
      {
        x: properties.radius + properties.radius / 2.5,
        y: properties.radius - properties.radius / 8,
        class: "dial__lbl dial__lbl--target--half",
      },
      svg
    );
    var lblTargetHalf_text = document.createTextNode("5");
    lblTargetHalf.appendChild(lblTargetHalf_text);
    //
    var lblAmbient = createSVGElement(
      "text",
      {
        class: "dial__lbl dial__lbl--ambient",
      },
      svg
    );
    var lblAmbient_text = document.createTextNode("");
    lblAmbient.appendChild(lblAmbient_text);
    //
    var lblAway = createSVGElement(
      "text",
      {
        x: properties.radius,
        y: properties.radius,
        class: "dial__lbl dial__lbl--away",
      },
      svg
    );
    var lblAway_text = document.createTextNode("AWAY");
    lblAway.appendChild(lblAway_text);

    /*
     * RENDER
     */
    function render() {
      renderAway();
      renderHvacState();
      renderTicks();
      renderTargetTemperature();
      renderAmbientTemperature();
      renderLeaf();
    }
    render();

    /*
     * RENDER - ticks
     */
    function renderTicks() {
      var vMin, vMax;
      if (self.away) {
        vMin = self.ambient_temperature;
        vMax = vMin;
      } else {
        vMin = Math.min(self.ambient_temperature, self.target_temperature);
        vMax = Math.max(self.ambient_temperature, self.target_temperature);
      }
      var min = restrictToRange(
        Math.round(
          ((vMin - options.minValue) / properties.rangeValue) * options.numTicks
        ),
        0,
        options.numTicks - 1
      );
      var max = restrictToRange(
        Math.round(
          ((vMax - options.minValue) / properties.rangeValue) * options.numTicks
        ),
        0,
        options.numTicks - 1
      );

      tickArray.forEach(function (tick, iTick) {
        var isLarge = iTick == min || iTick == max;
        var isActive = iTick >= min && iTick <= max;
        attr(tick, {
          d: pointsToPath(
            rotatePoints(
              isLarge ? tickPointsLarge : tickPoints,
              iTick * theta - properties.offsetDegrees,
              [properties.radius, properties.radius]
            )
          ),
          class: isActive ? "active" : "",
        });
      });
    }

    /*
     * RENDER - ambient temperature
     */
    function renderAmbientTemperature() {
      lblAmbient_text.nodeValue = Math.floor(self.ambient_temperature);
      if (self.ambient_temperature % 1 != 0) {
        lblAmbient_text.nodeValue += "⁵";
      }
      var peggedValue = restrictToRange(
        self.ambient_temperature,
        options.minValue,
        options.maxValue
      );
      var degs =
        (properties.tickDegrees * (peggedValue - options.minValue)) /
          properties.rangeValue -
        properties.offsetDegrees;
      if (peggedValue > self.target_temperature) {
        degs += 8;
      } else {
        degs -= 8;
      }
      var pos = rotatePoint(properties.lblAmbientPosition, degs, [
        properties.radius,
        properties.radius,
      ]);
      attr(lblAmbient, {
        x: pos[0],
        y: pos[1],
      });
    }

    /*
     * RENDER - target temperature
     */
    function renderTargetTemperature() {
      lblTarget_text.nodeValue = Math.floor(self.target_temperature);
      setClass(lblTargetHalf, "shown", self.target_temperature % 1 != 0);
    }

    /*
     * RENDER - leaf
     */
    function renderLeaf() {
      setClass(svg, "has-leaf", self.has_leaf);
    }

    /*
     * RENDER - HVAC state
     */
    function renderHvacState() {
      Array.prototype.slice.call(svg.classList).forEach(function (c) {
        if (c.match(/^dial--state--/)) {
          svg.classList.remove(c);
        }
      });
      svg.classList.add("dial--state--" + self.hvac_state);
    }

    /*
     * RENDER - awau
     */
    function renderAway() {
      svg.classList[self.away ? "add" : "remove"]("away");
    }

    /*
     * Helper functions
     */
    function restrictTargetTemperature(t) {
      return restrictToRange(roundHalf(t), options.minValue, options.maxValue);
    }
  };
})();

export default {
  name: "nest",

  props: ["module"],

  data() {
    return {
      isLoading: true,
      error: false,
      nest: [],
      nestThermostat: {},
      nestAlarm: {},
      nestCamara: {},
      nestElement: {},
    };
  },

  created() {
    this.subscribe("BROADCAST_NEST_DATA", this.handler);
  },

  mounted() {
    this.nestElement = null;
    this.nestElement = new thermostatDial(this.$refs.myther, {
      temperature_scale: "C",
    });
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.isLoading = true;
        this.emit("REQUEST_NEST_DATA");
      },
    },
  },

  methods: {
    updateNest() {
      this.nestElement.has_leaf = this.nestThermostat.has_leaf;
      this.nestElement.target_temperature = this.nestThermostat.traits[
        "sdm.devices.traits.ThermostatTemperatureSetpoint"
      ].heatCelsius;
      this.nestElement.ambient_temperature = this.nestThermostat.traits[
        "sdm.devices.traits.Temperature"
      ].ambientTemperatureCelsius;
      this.nestElement.hvac_state = this.nestThermostat.traits[
        "sdm.devices.traits.ThermostatHvac"
      ].status;
    },

    handler(data) {
      if (data.error) {
        this.error = data.error;
        this.isLoading = false;
      } else {
        this.error = false;
        this.nest = data.devices;

        data.devices.forEach((device) => {
          if (device.type === "sdm.devices.types.THERMOSTAT") {
            this.nestThermostat = device;
            this.nestThermostat.name = device.parentRelations[0].displayName;
          }
        });

        if (!this.nestThermostat) {
          this.error = "no_data";
        } else {
          this.updateNest();
        }

        const temp = this.nestThermostat.traits["sdm.devices.traits.Temperature"].ambientTemperatureCelsius;

        this.storeWidgetText({
          text: `Current tempature inside is <strong>${Math.round(temp)}&#x2103;</strong> while the target is set to <strong>${this.nestElement.target_temperature}&#x2103;</strong>.`
        });

        this.pushMinimalWidgetData({
          header: "Nest",
          text: Math.round(temp) + '<span class="text-small text-pull-up">&#8451;</span>',
          footer: this.nestThermostat.name,
        });

        this.isLoading = false;
      }
    },
  },
  computed: {
    styles() {
      return {
        width: this.module.settings.widget_width + "px",
      };
    },
  },
};
</script>

<style lang="scss">
@import "../../styles/vars";

.last .nest-radius {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
}

#thermostat {
  width: 200px;
  height: 200px;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

.dial {
  user-select: none;
  &.away {
    .dial {
      &__ico__leaf {
        visibility: hidden;
      }
      &__lbl--target {
        visibility: hidden;
        &--half {
          visibility: hidden;
        }
      }
      &__lbl--away {
        opacity: 1;
      }
    }
  }
  .dial__shape {
    transition: fill 0.5s;
  }
  &__ico__leaf {
    fill: #13eb13;
    opacity: 0;
    transition: opacity 0.5s;
    pointer-events: none;
  }
  &.has-leaf {
    .dial__ico__leaf {
      display: block;
      opacity: 1;
      pointer-events: initial;
    }
  }
  &__editableIndicator {
    fill: white;
    fill-rule: evenodd;
    opacity: 0;
    transition: opacity 0.5s;
  }
  &--edit {
    .dial__editableIndicator {
      opacity: 1;
    }
  }
  &--state {
    &--off {
      .dial__shape {
        fill: #111;
      }
    }
    &--heating {
      .dial__shape {
        fill: #232323;
      }
    }
    &--cooling {
      .dial__shape {
        fill: #007af1;
      }
    }
  }
  &__ticks {
    path {
      fill: rgba(255, 255, 255, 0.3);
      &.active {
        fill: rgba(255, 255, 255, 0.8);
      }
    }
  }
  text {
    fill: white;
    text-anchor: middle;
    alignment-baseline: central;
  }
  &__lbl {
    &--target {
      font-size: 120px;
      font-weight: bold;
      color: white;
      &--half {
        font-size: 40px;
        font-weight: bold;
        opacity: 0;
        transition: opacity 0.1s;
        &.shown {
          opacity: 1;
          transition: opacity 0s;
        }
      }
    }
    &--ambient {
      font-size: 22px;
      font-weight: bold;
    }
    &--away {
      font-size: 72px;
      font-weight: bold;
      opacity: 0;
      pointer-events: none;
    }
  }
}
</style>

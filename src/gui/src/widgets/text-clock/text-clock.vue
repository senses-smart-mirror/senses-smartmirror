<template>
  <div class="component text-clock" v-bind:class="[componentDesign]">
    <link href='http://fonts.googleapis.com/css?family=Droid+Sans+Mono' rel='stylesheet' type='text/css'>

    <header>
        <h4 v-show="module.settings.header">
          <i v-show="showHeaderIcon" class="header-icon" v-bind:class="module.icon"></i>
          {{ module.settings.header }}
        </h4>
      </header>

    <div class="clock" ref="input" v-bind:style="{ fontSize: fontSize + 'px', width: clockWidth + 'px', lineHeight: fontSize*2 + 'px' }">
      a<span class="it active">it</span>l<span class="is active">is</span>bfampm
      x<span class="a" :class="{'active': getActive('a')}">a</span>c<span class="quarter" :class="{'active': getActive('quarter')}">quarter</span>dc
      <span class="twenty" :class="{'active': getActive('twenty')}">twenty</span>q<span class="five1" :class="{'active': getActive('five_past')}">five</span>x
      b<span class="half" :class="{'active': getActive('half')}">half</span>b<span class="ten1" :class="{'active': getActive('ten_past')}">ten</span>f<span class="to" :class="{'active': getActive('to')}">to</span>
      <span class="past" :class="{'active': getActive('past')}">past</span>meru<span class="nine 9" :class="{'active': getActive('nine')}">nine</span>
      q<span class="one 1" :class="{'active': getActive('one')}">one</span><span class="six 6" :class="{'active': getActive('six')}">six</span><span class="three" :class="{'active': getActive('three')}">three</span>
      i<span class="four 4" :class="{'active': getActive('four')}">four</span><span class="five 5" :class="{'active': getActive('five')}">five</span><span class="two 2" :class="{'active': getActive('two')}">two</span>
      p<span class="eight 8" :class="{'active': getActive('eight')}">eight</span><span class="eleven 11" :class="{'active': getActive('eleven')}">eleven</span>
      y<span class="seven 7" :class="{'active': getActive('seven')}">seven</span><span class="twelve 12" :class="{'active': getActive('twelve')}">twelve</span>
      <span class="ten 10" :class="{'active': getActive('ten')}">ten</span>lse<span class="o-clock" :class="{'active': getActive('oclock')}">oclock</span>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {

  name: 'text-clock',

  props: ['module'],

  data () {
    return {
      now: moment(),
      interval: null,
      clock: {},
      fontSize: 16,
      clockWidth: 300,
      vars: [{
        text: 'a'
      },
      {
        text: 'to'
      },
      {
        text: 'quarter'
      },
      {
        text: 'twenty'
      },
      {
        text: 'half'
      },
      {
        text: 'past'
      },
      {
        text: 'oclock'
      },
      {
        text: 'ten_past'
      },
      {
        text: 'five_past'
      },
      {
        text: 'eleven',
        hour: 11,
      },
      {
        text: 'twelve',
        hour: 12,
      },
      {
        text: 'ten',
        hour: 10,
      },
      {
        text: 'nine',
        hour: 9,
      },
      {
        text: 'eight',
        hour: 8,
      },
      {
        text: 'seven',
        hour: 7,
      },
      {
        text: 'six',
        hour: 6,
      },
      {
        text: 'five',
        hour: 5,
      },
      {
        text: 'four',
        hour: 4,
      },
      {
        text: 'three',
        hour: 3,
      },
      {
        text: 'two',
        hour: 2,
      },
      {
        text: 'one',
        hour: 1,
      }
      ],
    }
  },

  created() {
    this.vars.forEach(item => {
      item.active = false;
    });
    this.updateClock();
  },

  methods: {
    getActive(item) {
      var filter = this.vars.filter(i => i.text === item);
      return filter.length ? filter[0].active : false;
    },
    resetAll() {
      this.vars.forEach(item => {
        item.active = false;
      });
      this.$forceUpdate();
    },
    setupInterval() {
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        this.updateClock();
      }, 10000);
    },
    updateClockValue(which, value) {
      this.clock[which] = value;
    },
    setActive(input, override) {
      this.vars.forEach(item => {
        if ( input == item.hour || input == item.text ) {
          item.active = override ? false : true;
        }
      });
    },
    updateClock() {
      this.resetAll();
      setTimeout(() => {
        let now = moment(), minute = now.format('mm'), hour = parseInt(now.format('h'));

        switch(true) {
          case minute >= 5 && minute < 30:
            this.setActive('past');
            if (minute > 5 && minute < 10 ) {
              this.setActive('five_past');
            } else if ( minute < 15 ) {
              this.setActive('ten_past')
            } else if ( minute < 20 ) {
              this.setActive('quarter');
              this.setActive('a');
            } else if (minute < 25 ) {
              this.setActive('twenty');
            } else {
              this.setActive('twenty');
              this.setActive('five_past');
            }
          break;
          case minute == 30:
            this.setActive('half');
            this.setActive('past');
          break;
          case minute < 5:
            this.setActive('oclock');
          break;
          case minute >= 30 && minute <= 60:
            this.setActive('to');
          if (minute >= 35 && minute < 40 ) {
              this.setActive('twenty');
              this.setActive('five_past');
            } else if ( minute >= 40 && minute < 45 ) {
              this.setActive('twenty')
            } else if ( minute >= 45 && minute < 50 ) {
              this.setActive('quarter');
              this.setActive('a');
            } else if (minute >= 50 && minute < 55 ) {
              this.setActive('ten_past');
            } else {
              this.setActive('half');
              this.setActive('past');
              this.setActive('to', true);
            }
          break;
        }

        // decide which hour to highlight
        hour = minute >= 35 ? (hour+1)==13 ? 1 : hour+1 : hour;
        this.setActive(hour);

        // force update dom
        this.$forceUpdate();
      }, 1000);
    }
  },

   watch: {
    module: {
      immediate: true,
      handler (newVal) {
        this.setupInterval();

        // update settings used by the clock
        const settings = newVal.settings;
        if ( settings.fontsize ) { this.fontSize = settings.fontsize; }
        if ( settings.width ) { this.clockWidth = settings.width; }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/vars";

.last {
  .clock {
    text-align: right;
  }
}

.overlay {
  .text-clock {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.clock {
  font-family: 'Droid Sans Mono', sans-serif;
  letter-spacing: 13px;
  line-height: 30px;
  text-align: center;
  word-wrap: break-word;
  color: rgba(255,255,255,.5);
  text-transform: uppercase;
}

span.active {
  color: #fff;
  font-weight: 700;
}

span {
  display: inline-block;
  transition: all 1s ease-in-out;
  -moz-transition: all 1s ease-in-out; /* FF 4 */
  -webkit-transition: all 1s ease-in-out; /* Safari & Chrome */
  -o-transition: all 1s ease-in-out; /* Opera */
}
</style>

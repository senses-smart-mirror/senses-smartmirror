import { Line, mixins } from "vue-chartjs";

export default {
  extends: Line,
  mixins: [mixins.reactiveProp],
  props: ["chartData"],

  data() {
    return {
      options: {
        tooltips: {
          enabled: false
        },
        scales: {
          yAxes: [
            {
              gridLines: {
                display: false,
                color: "#444"
              },
              ticks: {
                beginAtZero: true,
                suggestedMax: 0.8,
                display: false
              }
            }
          ],
          xAxes: [
            {
              offset: true,
              gridLines: {
                display: false,
                color: "#444"
              },
              ticks: {
                fontStyle: "300",
                fontSize: 12,
                fontColor: "white",
                fontFamily: "Ubuntu"
              }
            }
          ]
        },
        legend: {
          display: false
        }
      }
    };
  },

  mounted() {
    // Overwriting base render method with actual data.
    this.renderChart(this.chartData, this.options);
  }
};

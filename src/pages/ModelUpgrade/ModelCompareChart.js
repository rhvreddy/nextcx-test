import React from 'react';
import ReactApexChart from 'react-apexcharts';
import PropTypes from 'prop-types';

class ModelCompareChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      series: props.series || [],
      options: {
        chart: {
          height: 350,
          type: 'bar',
        },
        title: {
          text: 'Model Performance Metrics',
          align: 'left',
        },
        xaxis: {
          categories: props.models,
          title: {
            text: 'Metric',
          },
        },
        yaxis: {
          title: {
            text: 'Score',
          },
          min: 0,
          max: 3,
        },
        colors: ['#FF6F7D', '#00F0AB', '#339CFF', '#9A7FFF', '#FFC652'],
        dataLabels: {
          enabled: false,
        },
        grid: {
          borderColor: '#e7e7e7',
          row: {
            colors: ['#f3f3f3', 'transparent'],
            opacity: 0.5,
          },
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
          floating: true,
          offsetY: -25,
          offsetX: -5,
        },
      },
    };
  }

  render() {
    const customStyles = () => {
      return (
        <style>
          {`
       .MuiDialogTitle-root+.css-ypiqx9-MuiDialogContent-root {
          padding-top:10px;
        }
      `}
          {`
          .apexcharts-toolbar{
            top:-12px !important;
            gap:6px;
         }
        `}
        </style>
      )
    }
    return (
      <div>
        <ReactApexChart options={this.state.options} series={this.state.series} type="bar" height={350}/>
        {customStyles()}
      </div>
    );
  }
}

ModelCompareChart.propTypes = {
  series: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ModelCompareChart;

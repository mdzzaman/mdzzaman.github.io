import {Directive, ElementRef, Input, OnInit} from 'angular2/core';
import { ChartObjService } from './chart.obj.service';
declare var d3: any;

@Directive({
    selector: '[chartBar]'
})

export class BarDirective implements OnInit {
    private _el: HTMLElement;
    private barChart: any;

    @Input('chartBar') barChartOption: any;
    constructor(el: ElementRef) {
        this._el = el.nativeElement;
    }

    ngOnInit() {
        this.barChartOption.dataBind = this.dataBind;
        this.barChartOption._el = this._el;
    }

    dataBind(data: any[], chartObj: any) {
        this.barChart = new ChartObjService().getObj();
        var barChart = this.barChart;
        chartObj.chartObj = barChart;
        var numberOfSamples = chartObj.numberOfSamples,
            layers = data,
            margin = chartObj.margin,
            width = chartObj.width - margin.left - margin.right;

        barChart.numberOfLayers = chartObj.numberOfLayers;
        barChart.height = chartObj.height - margin.top - margin.bottom;

        barChart.yStackMax = d3.max(layers, function (layer) { return d3.max(layer, function (d) { return d.y0 + d.y; }); });
        barChart.yGroupMax = d3.max(layers, function (layer) { return d3.max(layer, function (d) { return d.y; }); });

        barChart.x = d3.scale.ordinal()
            .domain(d3.range(numberOfSamples))
            .rangeRoundBands([0, width], .08);

        barChart.y = d3.scale.linear()
            .domain([0, barChart.yStackMax])
            .range([barChart.height, 0]);

        var color = d3.scale.linear()
            .domain([0, barChart.numberOfLayers - 1])
            .range(["#aad", "#556"]);

        var xAxis = d3.svg.axis()
            .scale(barChart.x)
            .tickSize(0)
            .tickPadding(6)
            .orient("bottom");

        var svg = d3.select(chartObj._el).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", barChart.height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var layer = svg.selectAll(".layer")
            .data(layers)
            .enter().append("g")
            .attr("class", "layer")
            .style("fill", function (d, i) { return color(i); });

        barChart.rect = layer.selectAll("rect")
            .data(function (d) { return d; })
            .enter().append("rect")
            .attr("x", function (d) { return barChart.x(d.x); })
            .attr("y", barChart.height)
            .attr("width", barChart.x.rangeBand())
            .attr("height", 0);

        barChart.rect.transition()
            .delay(function (d, i) { return i * 10; })
            .attr("y", function (d) { return barChart.y(d.y0 + d.y); })
            .attr("height", function (d) { return barChart.y(d.y0) - barChart.y(d.y0 + d.y); });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + barChart.height + ")")
            .call(xAxis);
    }
    
}
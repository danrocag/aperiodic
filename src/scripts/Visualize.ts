import * as d3 from 'd3';
import {Delaunay} from "d3-delaunay";
import {Settings} from "./Settings";

export interface Visualization<Input> {
    compute(input : Input) : void;
}

export interface Point2DPlus {
    x: number;
    y: number;
    label: string;
    color: number;
}

export class VoronoiVisualization implements Visualization<Point2DPlus[]> {
    constructor(private _container : any, private _settings : Settings, points : Point2DPlus[]) {
        this.compute_init(points);
    }

    private _svg? : any;
    _cell : any;
    _mesh : any;
    _circle : any;
    compute_init(points: Point2DPlus[]): void {
        this._svg = this._container
            .append("svg")
            .attr("viewBox", [-1, -1, 2, 2].map(x => 0.9*x*this.settings.L))

        let voronoi = Delaunay
            .from(points, d => d.x, d => d.y)
            .voronoi([-1,-1,1,1].map(x => 0.9*x*this.settings.L));

        this._cell = this._svg.append("g")
            .attr("fill", "none")
            .selectAll("path")
            .data(points.map((d, i) => ({path: voronoi.renderCell(i), color: d.color})))
            .join("path")
            .attr("d", (d: { path: any; }) => d.path)
            .attr("fill", (d: { color: any}) => d3.schemeCategory10[d.color])

        this._mesh = this._svg.append("path")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 0.01)
            .attr("d", voronoi.render());

        this._circle = this._svg.append("g")
            .selectAll("circle")
            .data(points)
            .join("circle")
            .attr("cx", (d: { x: number; }) => d.x)
            .attr("cy", (d: { y: number; }) => d.y)
            .attr("r", 0.1)

        this._circle
            .append("svg:title")
            .text((d:any) => d.label);

    }

    compute(points: Point2DPlus[]) {
        let voronoi = Delaunay
            .from(points, d => d.x, d => d.y)
            .voronoi([-1,-1,1,1].map(x => x*this.settings.L));

        this._cell.data(points.map((d, i) => ({path: voronoi.renderCell(i), color: d.color})));
        this._circle.data(points);
        this._mesh.attr("d", voronoi.render())
    }



    get settings(): Settings {
        return this._settings;
    }

    set settings(settings : Settings){
        this._settings = settings;
    }

}
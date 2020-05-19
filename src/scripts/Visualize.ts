import * as d3 from 'd3';
import {Delaunay} from "d3-delaunay";
import set = Reflect.set;


export interface Point2D {
    x: number,
    y: number,
}

export interface Window2DSettings {
    physicalScale: number
    elementSize: Point2D,
    physicalOrigin : Point2D;
}

function viewBox(settings: Window2DSettings) : [number, number, number, number] {
    console.log(settings)
    let pWidth = settings.physicalScale;
    let pHeight = pWidth*settings.elementSize.y/settings.elementSize.x
    return [
        settings.physicalOrigin.x-pWidth/2,
        settings.physicalOrigin.y-pHeight/2,
        pWidth,
        pHeight]
}

function voronoiBox(settings: Window2DSettings) : [number, number, number, number] {
    let pWidth = settings.physicalScale;
    let pHeight = pWidth*settings.elementSize.y/settings.elementSize.x
    return [
        settings.physicalOrigin.x-pWidth/2,
        settings.physicalOrigin.y-pHeight/2,
        settings.physicalOrigin.x+pWidth/2,
        settings.physicalOrigin.y+pHeight/2]
}

function inBounds(settings: Window2DSettings, point: Point2D) : boolean {
    let pWidth = settings.physicalScale;
    let pHeight = pWidth*settings.elementSize.y/settings.elementSize.x
    return Math.abs(point.x - settings.physicalOrigin.x) <= pWidth && Math.abs(point.y - settings.physicalOrigin.y) <= pHeight
}

export interface Point2DPlus extends Point2D{
    label: string;
    color: number;
}

export class VoronoiVisualization {
    private _points: Point2DPlus[];
    constructor(private _container : any, private settings : Window2DSettings, points : Point2DPlus[]) {
        this._points = points;
        this.compute_init(points);
    }

    private _svg? : any;
    _cell : any;
    _mesh : any;
    _circle : any;
    compute_init(points: Point2DPlus[]): void {
        this._svg = this._container
            .append("svg")
            .attr("viewBox", viewBox(this.settings))
            .attr("width", this.settings.elementSize.x)
            .attr("height", this.settings.elementSize.y)

        let voronoi = Delaunay
            .from(this._points,
                    d => d.x, d => d.y)
            .voronoi(voronoiBox(this.settings));

        this._cell = this._svg.append("g")
            .attr("fill", "none")
            .selectAll("path")
            .data(this._points.map((d, i) => ({path: voronoi.renderCell(i), color: d.color})))
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
            .data(this._points)
            .join("circle")
            .attr("cx", (d: { x: number; }) => d.x)
            .attr("cy", (d: { y: number; }) => d.y)
            .attr("r", 0.1)

        this._circle
            .append("svg:title")
            .text((d:any) => d.label);

        let vThis = this
        let drag = d3.drag()
            .on("drag", function (e) {
                let dx = d3.event.dx/vThis.settings.elementSize.x*vThis.settings.physicalScale
                let dy = d3.event.dy/vThis.settings.elementSize.x*vThis.settings.physicalScale
                vThis.changeSettings({
                    physicalOrigin: {
                        x: vThis.settings.physicalOrigin.x - dx,
                        y: vThis.settings.physicalOrigin.y - dy,
                    }
                })
            })
        this._container.call(drag)
    }

    changeSettings(new_settings: Partial<Window2DSettings>) {
        console.log(this.settings)
        this.settings = {...this.settings, ...new_settings}
        this._svg
            .attr("viewBox", viewBox(this.settings))
            .attr("width", this.settings.elementSize.x)
            .attr("height", this.settings.elementSize.y)
        let voronoi = Delaunay
            .from(this._points,
                d => d.x, d => d.y)
            .voronoi(voronoiBox(this.settings));
        console.log(voronoiBox(this.settings))
        this._cell
            .data(this._points.map((d, i) => ({path: voronoi.renderCell(i), color: d.color})))
            .attr("d", (d: { path: any; }) => d.path)
        this._mesh.attr("d", voronoi.render());
    }
}
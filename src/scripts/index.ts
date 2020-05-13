import * as d3 from 'd3';
import {Point2DPlus, VoronoiVisualization} from "./Visualize";
import {mat, ones, vec, Vector} from "@josh-brown/vector";
import {ModelSetRn} from "./Compute";
import 'bootstrap/dist/css/bootstrap'
import * as bs from "bootstrap"
import {extractSettings, Settings} from "./Settings";
import $ from 'jquery';


let TAU = 2*3.141592;
const L = 5;
// Aamann-Beenker tiling as constructed in https://arxiv.org/pdf/1906.10392.pdf
let k: number = 2;
const G = mat([0,1,2,3]
    .map(k => k * TAU/8)
    .map(theta => [Math.cos(theta), Math.sin(theta)]))
    .transpose()
const H = mat([0,3,6,9]
    .map(k => k * TAU/8)
    .map(theta => [Math.cos(theta), Math.sin(theta)]))
    .transpose()
function W(x: Vector) : boolean {
    let r = 1/(2* Math.tan(TAU/16)); // radius of octagon with unit side length
    return G.transpose().apply(x).toArray().every(c => -r < c && c < r);
}

let model_set = new ModelSetRn(k, G, H, W, L, Math.ceil(L*1.3))
let points = model_set.computePoints()

const container = d3.select("#container")

function vec_color(x : Vector<number>) : number {
    return ((x.innerProduct(vec([2,-2,1,-1]))%8)+8)%8;
}
let points2d: Point2DPlus[] = points
    .map(point => ({
        x: G.apply(point).getEntry(0),
        y: G.apply(point).getEntry(1),
        label: point.toArray().toString(),
        color: vec_color(point)}))


let voronoi = new VoronoiVisualization(container, {L: L}, points2d);
$("#compute").on('click', e => {
    let extracted_settings = extractSettings();
    if (extracted_settings != null){
        voronoi.settings = extracted_settings;
        voronoi.compute(points2d);
    } else {
        console.log("Not implemented")
    }
})
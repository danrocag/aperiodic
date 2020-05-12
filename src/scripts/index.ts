import * as d3 from 'd3';
import {displayVoronoi} from "./Visualize";
import {mat, Vector} from "@josh-brown/vector";
import {ModelSetRn} from "./Compute";

let TAU = 2*3.141592;
const L = 5;
// Aamann-Beenker tiling as constructed in https://arxiv.org/pdf/1906.10392.pdf
const k : number = 2;
const G = mat([0,1,2,3]
    .map(k => k * TAU/8)
    .map(theta => [Math.cos(theta), Math.sin(theta)]))
    .transpose()
const H = mat([0,3,6,9]
    .map(k => k * TAU/8)
    .map(theta => [Math.cos(theta), Math.sin(theta)]))
    .transpose()
function W(x : Vector) : boolean {
    let r = Math.sqrt(1/(2 * (1 - Math.cos(TAU/8))))-0.02; // radius of octagon with unit side length
    return G.transpose().apply(x).toArray().every(c => -r < c && c < r);
}

let model_set = new ModelSetRn(k, G, H, W, L, Math.ceil(L*1.3))
let points = model_set.computePoints()

const container = d3.select("#container")

console.log(points.length)
let points2d = points
    .map(point => ({
        x: G.apply(point).getEntry(0),
        y: G.apply(point).getEntry(1),
        label: point.toArray().toString()}))
displayVoronoi(container, points2d, L);